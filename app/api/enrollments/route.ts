import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth } from "@/lib/server/auth";
import { EnrollmentCreateSchema } from "@/lib/schemas/enrollments";
import { canStudentEnroll } from "@/lib/enrollment-logic";

export const POST = withLogging(async (req: NextRequest) => {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  // Parse request body
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const validationResult = EnrollmentCreateSchema.safeParse(body);
  if (!validationResult.success) {
    return Response.json(
      { error: "Validation failed", details: validationResult.error.flatten() },
      { status: 400 }
    );
  }

  const { courseId } = validationResult.data;

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    return Response.json({
      success: true,
      message: "Already enrolled in this course",
      enrollmentId: existingEnrollment.id,
    });
  }

  // Verify active subscription if student
  if (!isAdmin) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        currentPeriodEnd: { gte: new Date() },
      },
    });

    const enrollmentCheck = canStudentEnroll({
      isAdmin,
      activeSubscription,
    });

    if (!enrollmentCheck.allowed) {
      return Response.json({ error: enrollmentCheck.reason }, { status: 403 });
    }
  }

  // Create enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
    },
  });

  return Response.json({
    success: true,
    message: "Enrolled successfully",
    enrollmentId: enrollment.id,
  });
});
