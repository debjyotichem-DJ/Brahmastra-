import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { sendSuccess } from "../../utils/response";

const router = Router();

// GET /flashcards — list flashcards by topic
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topicId } = req.query;
    const where: Record<string, unknown> = {};
    if (topicId) where.topicId = topicId;

    const flashcards = await prisma.flashCard.findMany({
      where,
      orderBy: { order: "asc" },
    });

    sendSuccess(res, flashcards);
  } catch (error) {
    next(error);
  }
});

export { router as flashcardRoutes };
