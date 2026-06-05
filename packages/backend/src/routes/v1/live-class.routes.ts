import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { roleGuard } from "../../middleware/role-guard";
import { validate } from "../../middleware/validate";
import { Role, createLiveClassSchema, updateLiveClassSchema } from "@d-chemistry/shared";
import { sendSuccess, sendNotFound } from "../../utils/response";

const router = Router();

// GET /live-classes — list upcoming live classes
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Get user's enrolled batch IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { batchId: true },
    });
    const batchIds = enrollments.map((e) => e.batchId);

    const classes = await prisma.liveClass.findMany({
      where: {
        batchId: { in: batchIds },
        isActive: true,
      },
      include: { batch: { select: { id: true, name: true } } },
      orderBy: { scheduledAt: "asc" },
    });

    sendSuccess(res, classes);
  } catch (error) {
    next(error);
  }
});

// GET /live-classes/:id — get live class details
router.get("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const liveClass = await prisma.liveClass.findUnique({
      where: { id: req.params.id },
      include: {
        batch: { select: { id: true, name: true } },
        recordingLesson: { select: { id: true, title: true, videoUrl: true } },
      },
    });

    if (!liveClass) {
      sendNotFound(res, "Live class");
      return;
    }

    sendSuccess(res, liveClass);
  } catch (error) {
    next(error);
  }
});

// POST /live-classes — create live class (Admin/Teacher)
router.post(
  "/",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(createLiveClassSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const liveClass = await prisma.liveClass.create({
        data: req.body,
      });
      sendSuccess(res, liveClass, "Live class created", 201);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /live-classes/:id — update live class
router.patch(
  "/:id",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(updateLiveClassSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const liveClass = await prisma.liveClass.update({
        where: { id: req.params.id },
        data: req.body,
      });
      sendSuccess(res, liveClass, "Live class updated");
    } catch (error) {
      next(error);
    }
  }
);

export { router as liveClassRoutes };
