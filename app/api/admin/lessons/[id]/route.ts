import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { checkAdmin } from "@/lib/server/auth";
import { AdminLessonSchema } from "@/lib/schemas/courses";

export const GET = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { id } = await ctx.params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
  });

  if (!lesson) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }

  return Response.json(lesson);
});

export const PUT = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { id } = await ctx.params;

  const lessonExists = await prisma.lesson.findUnique({
    where: { id },
  });

  if (!lessonExists) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validationResult = AdminLessonSchema.safeParse(body);
  if (!validationResult.success) {
    return Response.json(
      { error: "Validation failed", details: validationResult.error.flatten() },
      { status: 400 }
    );
  }

  const { moduleId, title, content, durationMin, order, isFreePreview } = validationResult.data;

  // Verify module exists
  const moduleExists = await prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!moduleExists) {
    return Response.json({ error: "Associated Module not found" }, { status: 404 });
  }

  // Check unique order constraint (except current lesson itself)
  const existingOrder = await prisma.lesson.findFirst({
    where: {
      moduleId,
      order,
      NOT: { id },
    },
  });

  if (existingOrder) {
    return Response.json(
      { error: "Lesson order position already exists in this module" },
      { status: 409 }
    );
  }

  const updatedLesson = await prisma.lesson.update({
    where: { id },
    data: {
      moduleId,
      title,
      content,
      durationMin,
      order,
      isFreePreview,
    },
  });

  return Response.json(updatedLesson);
});

export const DELETE = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { id } = await ctx.params;

  const lessonExists = await prisma.lesson.findUnique({
    where: { id },
  });

  if (!lessonExists) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }

  await prisma.lesson.delete({
    where: { id },
  });

  return Response.json({ success: true, message: "Lesson deleted successfully" });
});
