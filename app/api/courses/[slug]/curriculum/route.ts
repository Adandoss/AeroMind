import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth } from "@/lib/server/auth";
import { cacheLife } from "next/cache";

// Cached helper function to fetch structure of course curriculum
async function getCourseCurriculumCached(slug: string) {
  "use cache";
  cacheLife("hours");

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              durationMin: true,
              order: true,
              isFreePreview: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  return {
    courseId: course.id,
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        durationMin: l.durationMin,
        order: l.order,
        isFreePreview: l.isFreePreview,
      })),
    })),
  };
}

export const GET = withLogging(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;

  if (!slug) {
    return Response.json({ error: "Slug parameter is required" }, { status: 400 });
  }

  const curriculum = await getCourseCurriculumCached(slug);

  if (!curriculum) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  let isEnrolled = false;
  const completedLessonIds = new Set<string>();

  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: curriculum.courseId,
        },
      },
      include: {
        lessonProgress: {
          select: { lessonId: true },
        },
      },
    });

    if (enrollment) {
      isEnrolled = true;
      enrollment.lessonProgress.forEach((p) => completedLessonIds.add(p.lessonId));
    }
  }

  const hasAccess = isEnrolled || isAdmin;

  const modulesWithStatus = curriculum.modules.map((m) => ({
    id: m.id,
    title: m.title,
    order: m.order,
    lessons: m.lessons.map((l) => ({
      ...l,
      isCompleted: completedLessonIds.has(l.id),
      isLocked: !l.isFreePreview && !hasAccess,
    })),
  }));

  return Response.json({
    courseId: curriculum.courseId,
    modules: modulesWithStatus,
  });
});
