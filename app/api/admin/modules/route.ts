import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { checkAdmin } from "@/lib/server/auth";
import { AdminModuleSchema } from "@/lib/schemas/courses";

export const POST = withLogging(async (req: NextRequest) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validationResult = AdminModuleSchema.safeParse(body);
  if (!validationResult.success) {
    return Response.json(
      { error: "Validation failed", details: validationResult.error.flatten() },
      { status: 400 }
    );
  }

  const { courseId, title, order } = validationResult.data;

  // Verify course exists
  const courseExists = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!courseExists) {
    return Response.json({ error: "Associated Course not found" }, { status: 404 });
  }

  // Check unique constraint for order in course
  const existingOrder = await prisma.module.findFirst({
    where: { courseId, order },
  });

  if (existingOrder) {
    return Response.json(
      { error: "Module order position already exists in this course" },
      { status: 409 }
    );
  }

  const moduleObj = await prisma.module.create({
    data: {
      courseId,
      title,
      order,
    },
  });

  return Response.json(moduleObj, { status: 201 });
});
