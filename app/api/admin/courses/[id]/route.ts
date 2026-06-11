import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth, checkAdmin } from "@/lib/server/auth";
import { AdminCourseSchema } from "@/lib/schemas/courses";

export const GET = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { id } = await ctx.params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  return Response.json(course);
});

export const PUT = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { id } = await ctx.params;

  const courseExists = await prisma.course.findUnique({
    where: { id },
  });

  if (!courseExists) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validationResult = AdminCourseSchema.safeParse(body);
  if (!validationResult.success) {
    return Response.json(
      { error: "Validation failed", details: validationResult.error.flatten() },
      { status: 400 }
    );
  }

  const updatedCourse = await prisma.course.update({
    where: { id },
    data: validationResult.data,
  });

  return Response.json(updatedCourse);
});

export const DELETE = withLogging(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { id } = await ctx.params;

  const courseExists = await prisma.course.findUnique({
    where: { id },
  });

  if (!courseExists) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  await prisma.course.delete({
    where: { id },
  });

  return Response.json({ success: true, message: "Course deleted successfully" });
});
