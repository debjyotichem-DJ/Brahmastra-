import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { sendSuccess } from "../../utils/response";

const router = Router();

// GET /formula-sheets — list formula sheets by chapter
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterId } = req.query;
    const where: Record<string, unknown> = {};
    if (chapterId) where.chapterId = chapterId;

    const sheets = await prisma.formulaSheet.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        chapter: { select: { name: true, subject: { select: { name: true } } } },
      },
    });

    sendSuccess(res, sheets);
  } catch (error) {
    next(error);
  }
});

export { router as formulaSheetRoutes };
