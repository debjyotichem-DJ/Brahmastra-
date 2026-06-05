import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { roleGuard } from "../../middleware/role-guard";
import { Role } from "@d-chemistry/shared";
import { sendSuccess, sendError } from "../../utils/response";
import { getPagination, buildPaginationMeta } from "../../utils/pagination";

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, roleGuard(Role.ADMIN));

// GET /admin/users — list all users
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { role, search, batchId } = req.query;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: "insensitive" } },
        { profile: { name: { contains: search as string, mode: "insensitive" } } },
      ];
    }

    if (batchId) {
      where.enrollments = { some: { batchId: batchId as string } };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          profile: { select: { name: true, avatar: true, class: true, board: true } },
          _count: { select: { enrollments: true, testAttempts: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /admin/users/:id/role — change user role
router.patch("/users/:id/role", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!["STUDENT", "TEACHER", "ADMIN"].includes(role)) {
      sendError(res, "Invalid role", 400);
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    sendSuccess(res, user, "Role updated");
  } catch (error) {
    next(error);
  }
});

// PATCH /admin/users/:id/ban — ban/unban user
router.patch("/users/:id/ban", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: isActive ?? false },
      select: { id: true, email: true, isActive: true },
    });

    sendSuccess(res, user, user.isActive ? "User unbanned" : "User banned");
  } catch (error) {
    next(error);
  }
});

// GET /admin/analytics — platform analytics
router.get("/analytics", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      totalBatches,
      totalRevenue,
      todayActiveUsers,
      testCompletionData,
      topStudents,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({
        where: {
          role: "STUDENT",
          profile: { lastActiveDate: { gte: thirtyDaysAgo } },
        },
      }),
      prisma.batch.count({ where: { isActive: true } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.profile.count({
        where: { lastActiveDate: { gte: today } },
      }),
      prisma.testAttempt.aggregate({
        where: { submittedAt: { not: null } },
        _count: true,
      }),
      prisma.testAttempt.groupBy({
        by: ["userId"],
        where: { submittedAt: { not: null } },
        _avg: { score: true },
        _count: true,
        orderBy: { _avg: { score: "desc" } },
        take: 10,
      }),
    ]);

    // Get top student details
    const topStudentIds = topStudents.map((s) => s.userId);
    const topStudentProfiles = await prisma.profile.findMany({
      where: { userId: { in: topStudentIds } },
      select: { userId: true, name: true, avatar: true },
    });

    const formattedTopStudents = topStudents.map((s) => {
      const profile = topStudentProfiles.find((p) => p.userId === s.userId);
      return {
        userId: s.userId,
        name: profile?.name ?? "Unknown",
        avatar: profile?.avatar,
        averageScore: s._avg.score ?? 0,
        testsCompleted: s._count,
      };
    });

    sendSuccess(res, {
      totalUsers,
      activeUsers,
      totalBatches,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      dau: todayActiveUsers,
      testCompletionRate: testCompletionData._count,
      topStudents: formattedTopStudents,
    });
  } catch (error) {
    next(error);
  }
});

// GET /admin/revenue — revenue analytics
router.get("/revenue", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: "SUCCESS" },
      include: { batch: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Monthly breakdown
    const monthlyMap = new Map<string, { amount: number; count: number }>();
    const batchMap = new Map<string, { batchName: string; amount: number; count: number }>();

    for (const p of payments) {
      const month = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthlyMap.get(month) ?? { amount: 0, count: 0 };
      existing.amount += p.amount;
      existing.count += 1;
      monthlyMap.set(month, existing);

      const batchExisting = batchMap.get(p.batchId) ?? { batchName: p.batch.name, amount: 0, count: 0 };
      batchExisting.amount += p.amount;
      batchExisting.count += 1;
      batchMap.set(p.batchId, batchExisting);
    }

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    sendSuccess(res, {
      totalRevenue,
      monthlyRevenue: Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        ...data,
      })),
      batchRevenue: Array.from(batchMap.entries()).map(([batchId, data]) => ({
        batchId,
        ...data,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export { router as adminRoutes };
