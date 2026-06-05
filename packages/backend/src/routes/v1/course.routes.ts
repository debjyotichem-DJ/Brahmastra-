import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { roleGuard } from "../../middleware/role-guard";
import { validate } from "../../middleware/validate";
import { Role } from "@d-chemistry/shared";
import { createSubjectSchema, createChapterSchema, createTopicSchema } from "@d-chemistry/shared";
import { sendSuccess, sendError, sendNotFound } from "../../utils/response";

const router = Router();

// ── Subjects ────────────────────────────────────────────────

// GET /courses/subjects — list all subjects
router.get("/subjects", authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { chapters: true } },
      },
    });

    const formatted = subjects.map((s) => ({
      ...s,
      chapterCount: s._count.chapters,
      _count: undefined,
    }));

    sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
});

// POST /courses/subjects — create subject (Admin)
router.post(
  "/subjects",
  authenticate,
  roleGuard(Role.ADMIN),
  validate(createSubjectSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subject = await prisma.subject.create({
        data: req.body,
      });
      sendSuccess(res, subject, "Subject created", 201);
    } catch (error) {
      next(error);
    }
  }
);

// ── Chapters ────────────────────────────────────────────────

// GET /courses/subjects/:subjectId/chapters
router.get("/subjects/:subjectId/chapters", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectId } = req.params;

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      sendNotFound(res, "Subject");
      return;
    }

    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { topics: true } },
      },
    });

    const formatted = chapters.map((c) => ({
      ...c,
      topicCount: c._count.topics,
      _count: undefined,
    }));

    sendSuccess(res, { subject, chapters: formatted });
  } catch (error) {
    next(error);
  }
});

// POST /courses/chapters — create chapter (Admin)
router.post(
  "/chapters",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(createChapterSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chapter = await prisma.chapter.create({
        data: req.body,
      });
      sendSuccess(res, chapter, "Chapter created", 201);
    } catch (error) {
      next(error);
    }
  }
);

// ── Topics ──────────────────────────────────────────────────

// GET /courses/chapters/:chapterId/topics
router.get("/chapters/:chapterId/topics", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterId } = req.params;

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true },
    });
    if (!chapter) {
      sendNotFound(res, "Chapter");
      return;
    }

    const topics = await prisma.topic.findMany({
      where: { chapterId },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            type: true,
            title: true,
            duration: true,
            isFree: true,
            order: true,
            thumbnailUrl: true,
          },
        },
        _count: { select: { lessons: true } },
      },
    });

    sendSuccess(res, { chapter, topics });
  } catch (error) {
    next(error);
  }
});

// POST /courses/topics — create topic (Admin/Teacher)
router.post(
  "/topics",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(createTopicSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topic = await prisma.topic.create({
        data: req.body,
      });
      sendSuccess(res, topic, "Topic created", 201);
    } catch (error) {
      next(error);
    }
  }
);

export { router as courseRoutes };
