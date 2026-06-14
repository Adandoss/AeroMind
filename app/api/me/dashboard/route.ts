import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth } from "@/lib/server/auth";
import {
  aggregateProgressIntoDailyActivity,
  buildDailyActivityBuckets,
  computeCourseProgressPercent,
} from "@/lib/dashboard-logic";

export const GET = withLogging(async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  // 1. Fetch user basics
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) {
    return Response.json({ error: "User not found in database" }, { status: 401 });
  }

  // 2. Fetch active subscription
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch enrollments & course counts to compute overall stats
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          category: true,
          instructor: true,
          priceCents: true,
          weeks: true,
          modules: {
            select: {
              _count: {
                select: { lessons: true },
              },
            },
          },
        },
      },
      _count: {
        select: { lessonProgress: true },
      },
    },
  });

  const enrolledCourses = enrollments.map((e) => {
    const totalLessons = e.course.modules.reduce(
      (sum, m) => sum + m._count.lessons,
      0
    );
    const completedLessons = e._count.lessonProgress;

    return {
      id: e.id,
      courseId: e.course.id,
      slug: e.course.slug,
      title: e.course.title,
      description: e.course.description,
      category: e.course.category,
      instructor: e.course.instructor,
      completedLessons,
      totalLessons,
      progressPercent: computeCourseProgressPercent(completedLessons, totalLessons),
    };
  });

  // 4. Calculate weekly learning aggregates (last 7 days including today)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentProgress = await prisma.lessonProgress.findMany({
    where: {
      enrollment: { userId },
      completedAt: { gte: sevenDaysAgo },
    },
    include: {
      lesson: {
        select: { durationMin: true },
      },
    },
  });

  const dailyActivity = buildDailyActivityBuckets();

  const aggregatedActivity = aggregateProgressIntoDailyActivity(
    dailyActivity,
    recentProgress.map((p) => ({
      completedAt: p.completedAt,
      durationMin: p.lesson.durationMin,
    })),
  );

  // Calculate totals
  const totalCompletedLessonsAllTime = enrollments.reduce((sum, e) => sum + e._count.lessonProgress, 0);
  const totalMinutesStudiedAllTime = await prisma.lessonProgress.findMany({
    where: { enrollment: { userId } },
    include: { lesson: { select: { durationMin: true } } },
  }).then((progressItems) => progressItems.reduce((sum, p) => sum + p.lesson.durationMin, 0));

  return Response.json({
    user: {
      name: user.name,
      email: user.email,
    },
    subscription: subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        }
      : null,
    enrolledCourses,
    dailyActivity: aggregatedActivity,
    stats: {
      totalCompletedLessonsAllTime,
      totalHoursStudiedAllTime: Math.round((totalMinutesStudiedAllTime / 60) * 10) / 10,
    },
  });
});
