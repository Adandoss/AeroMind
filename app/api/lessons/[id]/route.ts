import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth } from "@/lib/server/auth";

export const GET = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;

  if (!id) {
    return Response.json({ error: "Lesson ID is required" }, { status: 400 });
  }

  // Fetch the lesson and get the associated course ID
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        select: {
          courseId: true,
        },
      },
    },
  });

  if (!lesson) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Check if it's a free preview
  if (lesson.isFreePreview) {
    return Response.json(lesson);
  }

  // Otherwise, user must be authenticated
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  if (!userId) {
    return Response.json({ error: "Authentication required to access this lesson" }, { status: 401 });
  }

  if (isAdmin) {
    return Response.json(lesson);
  }

  // Check if the student is enrolled in the course containing this lesson
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.module.courseId,
      },
    },
  });

  if (!enrollment) {
    return Response.json(
      { error: "Access denied. You must be enrolled in the course to view this lesson" },
      { status: 403 }
    );
  }

  return Response.json(lesson);
});
