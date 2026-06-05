import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { updateProfileSchema } from "@d-chemistry/shared";
import { sendSuccess, sendError } from "../../utils/response";

const router = Router();

// GET /users/me — get current user profile
router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { profile: true, notificationPreference: true },
    });

    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    const { passwordHash, ...safeUser } = user;
    sendSuccess(res, safeUser);
  } catch (error) {
    next(error);
  }
});

// PATCH /users/me — update current user profile
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classMap: Record<string, "CLASS_10" | "CLASS_11" | "CLASS_12"> = {
        "10": "CLASS_10",
        "11": "CLASS_11",
        "12": "CLASS_12",
      };

      const updateData: Record<string, unknown> = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.bio !== undefined) updateData.bio = req.body.bio;
      if (req.body.class) updateData.class = classMap[req.body.class];
      if (req.body.board) updateData.board = req.body.board;
      if (req.body.language) updateData.language = req.body.language === "bn" ? "BN" : "EN";

      const profile = await prisma.profile.update({
        where: { userId: req.user!.id },
        data: updateData,
      });

      sendSuccess(res, profile, "Profile updated");
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /users/me/avatar — update avatar URL
router.patch("/me/avatar", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      sendError(res, "Avatar URL is required", 400);
      return;
    }

    const profile = await prisma.profile.update({
      where: { userId: req.user!.id },
      data: { avatar: avatarUrl },
    });

    sendSuccess(res, profile, "Avatar updated");
  } catch (error) {
    next(error);
  }
});

// PATCH /users/me/fcm-token — update FCM push token
router.patch("/me/fcm-token", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fcmToken } = req.body;
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { fcmToken },
    });

    sendSuccess(res, null, "FCM token updated");
  } catch (error) {
    next(error);
  }
});

// GET /users/me/progress — get learning progress
router.get("/me/progress", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [completedLessons, totalAttempts, streak] = await Promise.all([
      prisma.videoProgress.count({
        where: { userId, completed: true },
      }),
      prisma.testAttempt.count({
        where: { userId, submittedAt: { not: null } },
      }),
      prisma.profile.findUnique({
        where: { userId },
        select: { streak: true, lastActiveDate: true },
      }),
    ]);

    sendSuccess(res, {
      completedLessons,
      totalAttempts,
      streak: streak?.streak ?? 0,
      lastActiveDate: streak?.lastActiveDate,
    });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
