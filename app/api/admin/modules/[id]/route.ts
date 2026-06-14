import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { checkAdmin } from "@/lib/server/auth";
import { AdminModuleSchema } from "@/lib/schemas/courses";

export const GET = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { id } = await ctx.params;

  const moduleObj = await prisma.module.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!moduleObj) {
    return Response.json({ error: "Module not found" }, { status: 404 });
  }

  return Response.json(moduleObj);
});

export const PUT = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { id } = await ctx.params;

  const moduleExists = await prisma.module.findUnique({
    where: { id },
  });

  if (!moduleExists) {
    return Response.json({ error: "Module not found" }, { status: 404 });
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

  // Check unique order constraint (except current module itself)
  const existingOrder = await prisma.module.findFirst({
    where: {
      courseId,
      order,
      NOT: { id },
    },
  });

  if (existingOrder) {
    return Response.json(
      { error: "Module order position already exists in this course" },
      { status: 409 }
    );
  }

  const updatedModule = await prisma.module.update({
    where: { id },
    data: {
      courseId,
      title,
      order,
    },
  });

  return Response.json(updatedModule);
});

export const DELETE = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { id } = await ctx.params;

  const moduleExists = await prisma.module.findUnique({
    where: { id },
  });

  if (!moduleExists) {
    return Response.json({ error: "Module not found" }, { status: 404 });
  }

  await prisma.module.delete({
    where: { id },
  });

  return Response.json({ success: true, message: "Module deleted successfully" });
});
