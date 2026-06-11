import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth } from "@/lib/server/auth";
import { cacheLife } from "next/cache";

// Cached helper function for fetching single course details
async function getCourseCached(slug: string) {
  "use cache";
  cacheLife("hours");

  const course = await prisma.course.findUnique({
    where: { slug },
  });

  if (!course) {
    return null;
  }

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    category: course.category,
    priceCents: course.priceCents,
    weeks: course.weeks,
    rating: course.rating,
    ratingCount: course.ratingCount,
    instructor: course.instructor,
    published: course.published,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

export const GET = withLogging(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;

  if (!slug) {
    return Response.json({ error: "Slug parameter is required" }, { status: 400 });
  }

  const course = await getCourseCached(slug);

  if (!course) {
    return Response.json({ error: "Course not found" }, { status: 404 });
  }

  // Intersect with user session to check enrollment
  const session = await auth();
  let isEnrolled = false;

  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  return Response.json({
    ...course,
    isEnrolled,
  });
});
