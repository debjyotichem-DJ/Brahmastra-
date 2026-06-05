import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { updateNotificationPreferenceSchema } from "@d-chemistry/shared";
import { sendSuccess } from "../../utils/response";
import { getPagination, buildPaginationMeta } from "../../utils/pagination";

const router = Router();

// GET /notifications — list user's notifications
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId: req.user!.id } }),
      prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /notifications/:id/read — mark as read
router.patch("/:id/read", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    sendSuccess(res, null, "Notification marked as read");
  } catch (error) {
    next(error);
  }
});

// PATCH /notifications/read-all — mark all as read
router.patch("/read-all", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    sendSuccess(res, null, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
});

// GET /notifications/preferences — get notification preferences
router.get("/preferences", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: req.user!.id },
    });

    if (!prefs) {
      const created = await prisma.notificationPreference.create({
        data: { userId: req.user!.id },
      });
      sendSuccess(res, created);
      return;
    }

    sendSuccess(res, prefs);
  } catch (error) {
    next(error);
  }
});

// PATCH /notifications/preferences — update preferences
router.patch(
  "/preferences",
  authenticate,
  validate(updateNotificationPreferenceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const prefs = await prisma.notificationPreference.upsert({
        where: { userId: req.user!.id },
        update: req.body,
        create: { userId: req.user!.id, ...req.body },
      });
      sendSuccess(res, prefs, "Preferences updated");
    } catch (error) {
      next(error);
    }
  }
);

export { router as notificationRoutes };
