import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth, checkAdmin } from "@/lib/server/auth";
import { AdminLessonSchema } from "@/lib/schemas/courses";

export const POST = withLogging(async (req: NextRequest) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
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

  // Check unique order constraint in module
  const existingOrder = await prisma.lesson.findFirst({
    where: { moduleId, order },
  });

  if (existingOrder) {
    return Response.json(
      { error: "Lesson order position already exists in this module" },
      { status: 409 }
    );
  }

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      content,
      durationMin,
      order,
      isFreePreview,
    },
  });

  return Response.json(lesson, { status: 201 });
});
