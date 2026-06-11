import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth } from "@/lib/server/auth";

export const POST = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;

  if (!id) {
    return Response.json({ error: "Lesson ID is required" }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  // Fetch lesson and verify its existence
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

  // Find user enrollment
  let enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.module.courseId,
      },
    },
  });

  // If admin is doing the request and has no enrollment, create one to allow completion progress logging
  if (!enrollment && isAdmin) {
    enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: lesson.module.courseId,
      },
    });
  }

  if (!enrollment) {
    return Response.json(
      { error: "Access denied. You must be enrolled in this course to mark it complete" },
      { status: 403 }
    );
  }

  // Create progress entry (idempotent upsert)
  const progress = await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
      },
    },
    update: {},
    create: {
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
      completedAt: new Date(),
    },
  });

  return Response.json({
    success: true,
    progressId: progress.id,
    completedAt: progress.completedAt.toISOString(),
  });
});
