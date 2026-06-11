import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth, checkAdmin } from "@/lib/server/auth";
import { AdminCourseSchema } from "@/lib/schemas/courses";

export const GET = withLogging(async (req: NextRequest) => {
  const authCheck = await checkAdmin();
  if (authCheck.error) {
    return Response.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { modules: true },
      },
    },
  });

  return Response.json(courses);
});

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

  const validationResult = AdminCourseSchema.safeParse(body);
  if (!validationResult.success) {
    return Response.json(
      { error: "Validation failed", details: validationResult.error.flatten() },
      { status: 400 }
    );
  }

  const course = await prisma.course.create({
    data: validationResult.data,
  });

  return Response.json(course, { status: 201 });
});
