import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { roleGuard } from "../../middleware/role-guard";
import { validate } from "../../middleware/validate";
import { Role, createLessonSchema, updateLessonSchema, saveProgressSchema, reorderLessonsSchema } from "@d-chemistry/shared";
import { sendSuccess, sendNotFound } from "../../utils/response";

const router = Router();

// GET /lessons/:id — get lesson details
router.get("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        topic: {
          include: {
            chapter: {
              include: { subject: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      sendNotFound(res, "Lesson");
      return;
    }

    // Get video progress if exists
    const progress = await prisma.videoProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: req.user!.id,
          lessonId: lesson.id,
        },
      },
    });

    sendSuccess(res, { ...lesson, progress });
  } catch (error) {
    next(error);
  }
});

// POST /lessons — create lesson (Teacher/Admin)
router.post(
  "/",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(createLessonSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lesson = await prisma.lesson.create({
        data: req.body,
      });
      sendSuccess(res, lesson, "Lesson created", 201);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /lessons/:id — update lesson (Teacher/Admin)
router.patch(
  "/:id",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(updateLessonSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lesson = await prisma.lesson.update({
        where: { id: req.params.id },
        data: req.body,
      });
      sendSuccess(res, lesson, "Lesson updated");
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /lessons/:id — delete lesson (Admin)
router.delete(
  "/:id",
  authenticate,
  roleGuard(Role.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.lesson.delete({
        where: { id: req.params.id },
      });
      sendSuccess(res, null, "Lesson deleted");
    } catch (error) {
      next(error);
    }
  }
);

// POST /lessons/:id/progress — save video progress
router.post(
  "/:id/progress",
  authenticate,
  validate(saveProgressSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { position, duration, completed } = req.body;

      const progress = await prisma.videoProgress.upsert({
        where: {
          userId_lessonId: {
            userId: req.user!.id,
            lessonId: req.params.id,
          },
        },
        update: {
          position,
          duration,
          completed: completed ?? position >= duration * 0.9,
          lastWatchedAt: new Date(),
        },
        create: {
          userId: req.user!.id,
          lessonId: req.params.id,
          position,
          duration,
          completed: completed ?? false,
        },
      });

      // Update streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const profile = await prisma.profile.findUnique({
        where: { userId: req.user!.id },
        select: { lastActiveDate: true, streak: true },
      });

      if (profile) {
        const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
        if (lastActive) {
          lastActive.setHours(0, 0, 0, 0);
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak = profile.streak;

        if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
          newStreak = 1;
        } else if (lastActive.getTime() === yesterday.getTime()) {
          newStreak = profile.streak + 1;
        }

        await prisma.profile.update({
          where: { userId: req.user!.id },
          data: {
            streak: newStreak,
            lastActiveDate: new Date(),
          },
        });
      }

      sendSuccess(res, progress, "Progress saved");
    } catch (error) {
      next(error);
    }
  }
);

// POST /lessons/reorder — reorder lessons (Teacher/Admin)
router.post(
  "/reorder",
  authenticate,
  roleGuard(Role.ADMIN, Role.TEACHER),
  validate(reorderLessonsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lessonOrders } = req.body;

      await prisma.$transaction(
        lessonOrders.map((item: { id: string; order: number }) =>
          prisma.lesson.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );

      sendSuccess(res, null, "Lessons reordered");
    } catch (error) {
      next(error);
    }
  }
);

export { router as lessonRoutes };
