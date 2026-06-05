import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";
import { sendSuccess } from "../../utils/response";

const router = Router();

// GET /dashboard — get student dashboard data
router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    // Get enrolled batch IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { batchId: true },
    });
    const batchIds = enrollments.map((e) => e.batchId);

    const [
      profile,
      subjectProgress,
      upcomingClasses,
      recentAttempts,
      weakTopicData,
    ] = await Promise.all([
      // Profile + streak
      prisma.profile.findUnique({
        where: { userId },
        select: { streak: true, lastActiveDate: true, language: true },
      }),

      // Subject-wise progress
      prisma.subject.findMany({
        include: {
          chapters: {
            include: {
              topics: {
                include: {
                  lessons: {
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      }).then(async (subjects) => {
        const completed = await prisma.videoProgress.findMany({
          where: { userId, completed: true },
          select: { lessonId: true },
        });
        const completedSet = new Set(completed.map((c) => c.lessonId));

        return subjects.map((s) => {
          const allLessons = s.chapters.flatMap((ch) =>
            ch.topics.flatMap((t) => t.lessons.map((l) => l.id))
          );
          const total = allLessons.length;
          const done = allLessons.filter((id) => completedSet.has(id)).length;

          return {
            subjectId: s.id,
            subjectName: s.name,
            completedLessons: done,
            totalLessons: total,
            percentage: total > 0 ? Math.round((done / total) * 100) : 0,
          };
        });
      }),

      // Upcoming live classes
      prisma.liveClass.findMany({
        where: {
          batchId: { in: batchIds },
          scheduledAt: { gte: now },
          isActive: true,
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
        include: { batch: { select: { name: true } } },
      }),

      // Recent test scores
      prisma.testAttempt.findMany({
        where: { userId, submittedAt: { not: null } },
        orderBy: { submittedAt: "desc" },
        take: 10,
        include: { test: { select: { title: true, totalMarks: true } } },
      }),

      // Weak topics (accuracy < 50%)
      prisma.testResponse.groupBy({
        by: ["questionId"],
        where: {
          attempt: { userId },
        },
        _count: { isCorrect: true },
      }),
    ]);

    // Calculate weak topics from response data
    const questionIds = weakTopicData.map((w) => w.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { topic: { include: { chapter: true } } },
    });

    const topicAccuracyMap = new Map<string, { correct: number; total: number; name: string; chapter: string }>();

    for (const resp of weakTopicData) {
      const question = questions.find((q) => q.id === resp.questionId);
      if (!question) continue;

      const existing = topicAccuracyMap.get(question.topicId) ?? {
        correct: 0,
        total: 0,
        name: question.topic.name,
        chapter: question.topic.chapter.name,
      };

      const responses = await prisma.testResponse.findMany({
        where: { questionId: resp.questionId, attempt: { userId } },
      });

      for (const r of responses) {
        existing.total++;
        if (r.isCorrect) existing.correct++;
      }

      topicAccuracyMap.set(question.topicId, existing);
    }

    const weakTopics = Array.from(topicAccuracyMap.entries())
      .map(([topicId, data]) => ({
        topicId,
        topicName: data.name,
        chapterName: data.chapter,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        attemptCount: data.total,
      }))
      .filter((t) => t.accuracy < 50 && t.attemptCount >= 3)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Motivational quotes
    const quotesEn = [
      "Chemistry is the study of matter, but I prefer to see it as the study of change.",
      "The beauty of chemistry is that it describes the entire world around us.",
      "Every expert was once a beginner. Keep pushing forward!",
      "Success is the sum of small efforts, repeated day in and day out.",
      "In chemistry, every reaction needs activation energy. Your effort is that energy!",
    ];
    const quotesBn = [
      "রসায়ন হল পরিবর্তনের বিজ্ঞান — আজ থেকে পরিবর্তন শুরু করো!",
      "প্রতিটি বিশেষজ্ঞ একসময় নতুন ছিল। এগিয়ে চলো!",
      "সাফল্য হল ছোট ছোট প্রচেষ্টার যোগফল।",
      "রসায়নে প্রতিটি বিক্রিয়ার সক্রিয়করণ শক্তি দরকার — তোমার প্রচেষ্টাই সেই শক্তি!",
      "জ্ঞানই শক্তি — প্রতিদিন নতুন কিছু শেখো!",
    ];

    const quotes = profile?.language === "BN" ? quotesBn : quotesEn;
    const quoteOfTheDay = quotes[new Date().getDate() % quotes.length]!;

    sendSuccess(res, {
      streak: profile?.streak ?? 0,
      subjectProgress,
      upcomingClasses,
      upcomingTests: [],
      recentScores: recentAttempts.map((a) => ({
        testId: a.testId,
        testTitle: a.test.title,
        score: a.score,
        totalMarks: a.test.totalMarks,
        date: a.submittedAt?.toISOString() ?? a.startedAt.toISOString(),
      })),
      weakTopics,
      quoteOfTheDay,
    });
  } catch (error) {
    next(error);
  }
});

export { router as dashboardRoutes };
