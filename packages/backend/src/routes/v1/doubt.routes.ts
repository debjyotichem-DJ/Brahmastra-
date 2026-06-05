import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { roleGuard } from "../../middleware/role-guard";
import { validate } from "../../middleware/validate";
import { Role, createDoubtSchema, createDoubtReplySchema } from "@d-chemistry/shared";
import { sendSuccess, sendNotFound } from "../../utils/response";
import { getPagination, buildPaginationMeta } from "../../utils/pagination";
import { sendPushNotification } from "../../config/firebase";

const router = Router();

// GET /doubts — list doubts
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { status } = req.query;
    const userId = req.user!.id;
    const isTeacherOrAdmin = req.user!.role !== "STUDENT";

    const where: Record<string, unknown> = isTeacherOrAdmin ? {} : { userId };
    if (status) where.status = status;

    const [doubts, total] = await Promise.all([
      prisma.doubt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
          replies: {
            include: {
              user: { select: { id: true, role: true, profile: { select: { name: true, avatar: true } } } },
            },
            orderBy: { createdAt: "asc" },
          },
          lesson: { select: { id: true, title: true } },
        },
      }),
      prisma.doubt.count({ where }),
    ]);

    res.json({
      success: true,
      data: doubts,
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
});

// POST /doubts — create doubt
router.post(
  "/",
  authenticate,
  validate(createDoubtSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doubt = await prisma.doubt.create({
        data: {
          userId: req.user!.id,
          ...req.body,
        },
        include: {
          user: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
        },
      });
      sendSuccess(res, doubt, "Doubt submitted", 201);
    } catch (error) {
      next(error);
    }
  }
);

// GET /doubts/:id — get doubt with replies
router.get("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doubt = await prisma.doubt.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
        replies: {
          include: {
            user: { select: { id: true, role: true, profile: { select: { name: true, avatar: true } } } },
          },
          orderBy: { createdAt: "asc" },
        },
        lesson: { select: { id: true, title: true } },
      },
    });

    if (!doubt) {
      sendNotFound(res, "Doubt");
      return;
    }

    sendSuccess(res, doubt);
  } catch (error) {
    next(error);
  }
});

// POST /doubts/:id/reply — reply to a doubt
router.post(
  "/:id/reply",
  authenticate,
  validate(createDoubtReplySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doubt = await prisma.doubt.findUnique({
        where: { id: req.params.id },
        include: { user: { select: { id: true, fcmToken: true } } },
      });

      if (!doubt) {
        sendNotFound(res, "Doubt");
        return;
      }

      const reply = await prisma.doubtReply.create({
        data: {
          doubtId: req.params.id,
          userId: req.user!.id,
          ...req.body,
        },
        include: {
          user: { select: { id: true, role: true, profile: { select: { name: true, avatar: true } } } },
        },
      });

      // Update status if teacher/admin replied
      if (req.user!.role !== "STUDENT") {
        await prisma.doubt.update({
          where: { id: req.params.id },
          data: { status: "ANSWERED" },
        });
      }

      // Send push notification to doubt creator
      if (doubt.user.fcmToken && doubt.user.id !== req.user!.id) {
        await sendPushNotification(
          doubt.user.fcmToken,
          "Doubt Reply",
          "Your doubt has been answered!",
          { doubtId: doubt.id }
        );

        await prisma.notification.create({
          data: {
            userId: doubt.user.id,
            title: "Doubt Reply",
            body: "Your doubt has been answered!",
            type: "DOUBT_REPLY",
            data: { doubtId: doubt.id },
          },
        });
      }

      sendSuccess(res, reply, "Reply posted", 201);
    } catch (error) {
      next(error);
    }
  }
);

export { router as doubtRoutes };
