import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { roleGuard } from "../../middleware/role-guard";
import { validate } from "../../middleware/validate";
import { Role, createAnnouncementSchema } from "@d-chemistry/shared";
import { sendSuccess } from "../../utils/response";
import { sendPushToMultiple } from "../../config/firebase";

const router = Router();

// GET /announcements — list announcements
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Get user's batch IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { batchId: true },
    });
    const batchIds = enrollments.map((e) => e.batchId);

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { batchId: null }, // Global announcements
          { batchId: { in: batchIds } },
        ],
      },
      include: {
        creator: { select: { profile: { select: { name: true } } } },
        batch: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    sendSuccess(res, announcements);
  } catch (error) {
    next(error);
  }
});

// POST /announcements — create announcement (Admin)
router.post(
  "/",
  authenticate,
  roleGuard(Role.ADMIN),
  validate(createAnnouncementSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const announcement = await prisma.announcement.create({
        data: {
          ...req.body,
          createdBy: req.user!.id,
        },
      });

      // Send push notifications
      const targetUsers = req.body.batchId
        ? await prisma.enrollment.findMany({
            where: { batchId: req.body.batchId, status: "ACTIVE" },
            include: { user: { select: { id: true, fcmToken: true } } },
          })
        : await prisma.user.findMany({
            where: { isActive: true, role: "STUDENT" },
            select: { id: true, fcmToken: true },
          });

      const fcmTokens = (
        "user" in (targetUsers[0] ?? {})
          ? (targetUsers as Array<{ user: { id: string; fcmToken: string | null } }>).map((e) => e.user.fcmToken)
          : (targetUsers as Array<{ id: string; fcmToken: string | null }>).map((u) => u.fcmToken)
      ).filter((t): t is string => !!t);

      if (fcmTokens.length > 0) {
        await sendPushToMultiple(fcmTokens, req.body.title, req.body.body);
      }

      // Create in-app notifications
      const userIds = (
        "user" in (targetUsers[0] ?? {})
          ? (targetUsers as Array<{ user: { id: string } }>).map((e) => e.user.id)
          : (targetUsers as Array<{ id: string }>).map((u) => u.id)
      );

      await prisma.notification.createMany({
        data: userIds.map((uid) => ({
          userId: uid,
          title: req.body.title,
          body: req.body.body,
          type: "ANNOUNCEMENT" as const,
          data: { announcementId: announcement.id },
        })),
      });

      sendSuccess(res, announcement, "Announcement broadcast", 201);
    } catch (error) {
      next(error);
    }
  }
);

export { router as announcementRoutes };
