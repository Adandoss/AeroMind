import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth } from "@/lib/server/auth";

export const GET = withLogging(async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

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
          weeks: true,
          priceCents: true,
          rating: true,
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
    orderBy: { enrolledAt: "desc" },
  });

  // Map and format progress counts
  const result = enrollments.map((e) => {
    // Sum lessons across all modules
    const totalLessons = e.course.modules.reduce(
      (sum, m) => sum + m._count.lessons,
      0
    );
    const completedLessons = e._count.lessonProgress;

    return {
      id: e.id,
      enrolledAt: e.enrolledAt.toISOString(),
      completedAt: e.completedAt ? e.completedAt.toISOString() : null,
      course: {
        id: e.course.id,
        slug: e.course.slug,
        title: e.course.title,
        description: e.course.description,
        category: e.course.category,
        instructor: e.course.instructor,
        weeks: e.course.weeks,
        priceCents: e.course.priceCents,
        rating: e.course.rating,
        totalLessons,
        completedLessons,
        progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      },
    };
  });

  return Response.json(result);
});
