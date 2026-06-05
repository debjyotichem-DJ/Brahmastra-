import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { roleGuard } from "../../middleware/role-guard";
import { validate } from "../../middleware/validate";
import { Role, createBatchSchema, updateBatchSchema, enrollBatchSchema } from "@d-chemistry/shared";
import { sendSuccess, sendNotFound, sendError } from "../../utils/response";
import { getPagination, buildPaginationMeta } from "../../utils/pagination";
import crypto from "crypto";

const router = Router();

// GET /batches — list batches
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.batch.count({ where: { isActive: true } }),
    ]);

    const formatted = batches.map((b) => ({
      ...b,
      studentCount: b._count.enrollments,
      _count: undefined,
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

// GET /batches/:id — get batch details
router.get("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: req.params.id },
      include: {
        subjects: { include: { subject: true } },
        _count: { select: { enrollments: true, tests: true, liveClasses: true } },
      },
    });

    if (!batch) {
      sendNotFound(res, "Batch");
      return;
    }

    // Check if current user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_batchId: {
          userId: req.user!.id,
          batchId: batch.id,
        },
      },
    });

    sendSuccess(res, {
      ...batch,
      isEnrolled: !!enrollment,
      enrollmentStatus: enrollment?.status,
      studentCount: batch._count.enrollments,
    });
  } catch (error) {
    next(error);
  }
});

// POST /batches/:id/enroll — enroll in a batch
router.post(
  "/:id/enroll",
  authenticate,
  validate(enrollBatchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { inviteCode } = req.body;
      const batchId = req.params.id;

      const batch = await prisma.batch.findUnique({ where: { id: batchId } });
      if (!batch || !batch.isActive) {
        sendNotFound(res, "Batch");
        return;
      }

      // Check already enrolled
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_batchId: { userId: req.user!.id, batchId },
        },
      });

      if (existing) {
        sendError(res, "Already enrolled in this batch", 409);
        return;
      }

      if (batch.isFree) {
        // Free batch — check invite code if required
        if (batch.inviteCode && batch.inviteCode !== inviteCode) {
          sendError(res, "Invalid invite code", 400);
          return;
        }

        const enrollment = await prisma.enrollment.create({
          data: {
            userId: req.user!.id,
            batchId,
            status: "ACTIVE",
          },
        });

        sendSuccess(res, enrollment, "Enrolled successfully", 201);
      } else {
        // Paid batch — enrollment happens after payment verification
        sendError(res, "This is a paid batch. Please complete payment first.", 402);
      }
    } catch (error) {
      next(error);
    }
  }
);

// GET /batches/my — get user's enrolled batches
router.get("/my/enrolled", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user!.id, status: "ACTIVE" },
      include: {
        batch: {
          include: {
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    sendSuccess(res, enrollments);
  } catch (error) {
    next(error);
  }
});

// ── Admin routes ────────────────────────────────────────────

// POST /batches — create batch (Admin)
router.post(
  "/",
  authenticate,
  roleGuard(Role.ADMIN),
  validate(createBatchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classMap: Record<string, "CLASS_10" | "CLASS_11" | "CLASS_12"> = {
        "10": "CLASS_10",
        "11": "CLASS_11",
        "12": "CLASS_12",
      };

      const batch = await prisma.batch.create({
        data: {
          ...req.body,
          class: classMap[req.body.class] ?? "CLASS_11",
          inviteCode: req.body.isFree ? crypto.randomBytes(4).toString("hex").toUpperCase() : null,
        },
      });

      sendSuccess(res, batch, "Batch created", 201);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /batches/:id — update batch (Admin)
router.patch(
  "/:id",
  authenticate,
  roleGuard(Role.ADMIN),
  validate(updateBatchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const batch = await prisma.batch.update({
        where: { id: req.params.id },
        data: req.body,
      });
      sendSuccess(res, batch, "Batch updated");
    } catch (error) {
      next(error);
    }
  }
);

export { router as batchRoutes };
