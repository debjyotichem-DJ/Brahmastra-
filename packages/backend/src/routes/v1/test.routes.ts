import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { roleGuard } from "../../middleware/role-guard";
import { validate } from "../../middleware/validate";
import { Role, createTestSchema, submitTestSchema, createQuestionSchema, bulkCreateQuestionsSchema } from "@d-chemistry/shared";
import { sendSuccess, sendNotFound, sendError } from "../../utils/response";
import { getPagination, buildPaginationMeta } from "../../utils/pagination";

const router = Router();

// GET /tests — list tests
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { type, batchId } = req.query;

    const where: Record<string, unknown> = { isPublished: true };
    if (type) where.type = type;
    if (batchId) where.batchId = batchId;

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          sections: { include: { _count: { select: { questions: true } } } },
          _count: { select: { attempts: true } },
        },
      }),
      prisma.test.count({ where }),
    ]);

    const formatted = tests.map((t) => ({
      ...t,
      questionCount: t.sections.reduce((acc, s) => acc + s._count.questions, 0),
      attemptCount: t._count.attempts,
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
});

// GET /tests/:id — get test details (for taking)
router.get("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: {
                question: {
                  select: {
                    id: true,
                    text: true,
                    options: true,
                    type: true,
                    difficulty: true,
                    imageUrl: true,
                    // Don't expose correct answer/explanation during test
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!test) {
      sendNotFound(res, "Test");
      return;
    }

    // Check if user already has an active attempt
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        userId: req.user!.id,
        testId: test.id,
        submittedAt: null,
      },
    });

    sendSuccess(res, { test, existingAttempt });
  } catch (error) {
    next(error);
  }
});

// POST /tests/:id/start — start a test attempt
router.post("/:id/start", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const test = await prisma.test.findUnique({ where: { id: req.params.id } });
    if (!test) {
      sendNotFound(res, "Test");
      return;
    }

    // Check for existing unsubmitted attempt
    const existing = await prisma.testAttempt.findFirst({
      where: {
        userId: req.user!.id,
        testId: test.id,
        submittedAt: null,
      },
    });

    if (existing) {
      sendSuccess(res, existing, "Resuming existing attempt");
      return;
    }

    const attempt = await prisma.testAttempt.create({
      data: {
        userId: req.user!.id,
        testId: test.id,
        totalMarks: test.totalMarks,
      },
    });

    sendSuccess(res, attempt, "Test started", 201);
  } catch (error) {
    next(error);
  }
});

// POST /tests/:id/submit — submit test answers
router.post(
  "/:id/submit",
  authenticate,
  validate(submitTestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { responses } = req.body;
      const testId = req.params.id;
      const userId = req.user!.id;

      const attempt = await prisma.testAttempt.findFirst({
        where: { userId, testId, submittedAt: null },
      });

      if (!attempt) {
        sendError(res, "No active attempt found for this test", 400);
        return;
      }

      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          sections: {
            include: {
              questions: {
                include: { question: true },
              },
            },
          },
        },
      });

      if (!test) {
        sendNotFound(res, "Test");
        return;
      }

      // Build question map with marks info
      const questionMap = new Map<string, { correctIndex: number; marksPerQuestion: number; negativeMarks: number }>();
      for (const section of test.sections) {
        for (const sq of section.questions) {
          questionMap.set(sq.question.id, {
            correctIndex: sq.question.correctIndex,
            marksPerQuestion: section.marksPerQuestion,
            negativeMarks: section.negativeMarks,
          });
        }
      }

      let score = 0;
      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0;

      const responseData = responses.map((r: { questionId: string; selectedOption: number | null; integerAnswer: number | null; timeSpent: number; isMarkedForReview: boolean }) => {
        const qInfo = questionMap.get(r.questionId);
        let isCorrect = false;

        if (r.selectedOption === null && r.integerAnswer === null) {
          unattemptedCount++;
        } else if (qInfo) {
          isCorrect = r.selectedOption === qInfo.correctIndex;
          if (isCorrect) {
            score += qInfo.marksPerQuestion;
            correctCount++;
          } else {
            score -= qInfo.negativeMarks;
            incorrectCount++;
          }
        }

        return {
          attemptId: attempt.id,
          questionId: r.questionId,
          selectedOption: r.selectedOption,
          integerAnswer: r.integerAnswer,
          isCorrect,
          isMarkedForReview: r.isMarkedForReview,
          timeSpent: r.timeSpent,
        };
      });

      // Save responses and update attempt
      await prisma.$transaction([
        prisma.testResponse.createMany({ data: responseData }),
        prisma.testAttempt.update({
          where: { id: attempt.id },
          data: {
            score: Math.max(0, score),
            correctCount,
            incorrectCount,
            unattemptedCount,
            submittedAt: new Date(),
            timeTaken: Math.floor(
              (Date.now() - attempt.startedAt.getTime()) / 1000
            ),
          },
        }),
      ]);

      // Calculate rank and percentile
      const allAttempts = await prisma.testAttempt.findMany({
        where: { testId, submittedAt: { not: null } },
        orderBy: { score: "desc" },
        select: { id: true, score: true },
      });

      const rank = allAttempts.findIndex((a) => a.id === attempt.id) + 1;
      const percentile =
        allAttempts.length > 1
          ? ((allAttempts.length - rank) / (allAttempts.length - 1)) * 100
          : 100;

      await prisma.testAttempt.update({
        where: { id: attempt.id },
        data: { rank, percentile },
      });

      const updatedAttempt = await prisma.testAttempt.findUnique({
        where: { id: attempt.id },
        include: { responses: true },
      });

      sendSuccess(res, updatedAttempt, "Test submitted successfully");
    } catch (error) {
      next(error);
    }
  }
);

// GET /tests/attempts/:id — get attempt result
router.get("/attempts/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: req.params.id },
      include: {
        test: {
          include: {
            sections: {
              include: {
                questions: {
                  include: {
                    question: true, // Include correct answer + explanation for review
                  },
                },
              },
            },
          },
        },
        responses: true,
      },
    });

    if (!attempt) {
      sendNotFound(res, "Test attempt");
      return;
    }

    if (attempt.userId !== req.user!.id && req.user!.role === "STUDENT") {
      sendError(res, "Access denied", 403);
      return;
    }

    sendSuccess(res, attempt);
  } catch (error) {
    next(error);
  }
});

// ── Admin: Create test + questions ──────────────────────────

// POST /tests — create test (Admin/Teacher)
router.post(
  "/",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(createTestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sections, ...testData } = req.body;

      const test = await prisma.test.create({
        data: {
          ...testData,
          sections: {
            create: sections.map((s: { name: string; questionIds: string[]; marksPerQuestion: number; negativeMarks: number; order: number }) => ({
              name: s.name,
              marksPerQuestion: s.marksPerQuestion,
              negativeMarks: s.negativeMarks ?? 1,
              order: s.order,
              questions: {
                create: s.questionIds.map((qId: string, idx: number) => ({
                  questionId: qId,
                  order: idx,
                })),
              },
            })),
          },
        },
        include: { sections: true },
      });

      sendSuccess(res, test, "Test created", 201);
    } catch (error) {
      next(error);
    }
  }
);

// POST /tests/questions — create question (Admin/Teacher)
router.post(
  "/questions",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(createQuestionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const question = await prisma.question.create({
        data: req.body,
      });
      sendSuccess(res, question, "Question created", 201);
    } catch (error) {
      next(error);
    }
  }
);

// POST /tests/questions/bulk — bulk import questions (Admin/Teacher)
router.post(
  "/questions/bulk",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(bulkCreateQuestionsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questions } = req.body;
      const created = await prisma.question.createMany({
        data: questions,
      });
      sendSuccess(res, { count: created.count }, `${created.count} questions created`, 201);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /tests/:id/publish — publish/unpublish test
router.patch(
  "/:id/publish",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const test = await prisma.test.update({
        where: { id: req.params.id },
        data: { isPublished: true },
      });
      sendSuccess(res, test, "Test published");
    } catch (error) {
      next(error);
    }
  }
);

export { router as testRoutes };
