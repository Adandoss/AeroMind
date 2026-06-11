import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { CoursesQuerySchema } from "@/lib/schemas/courses";
import { auth } from "@/lib/server/auth";
import { cacheLife } from "next/cache";

// Helper function with 'use cache' directive for catalog data caching
async function getCoursesCached(params: {
  q?: string;
  category?: any;
  price?: string;
  rating?: number;
  page: number;
  limit: number;
}) {
  "use cache";
  cacheLife("minutes");

  const { q, category, price, rating, page, limit } = params;
  const skip = (page - 1) * limit;

  const where: any = { published: true };
  
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }
  
  if (category) {
    where.category = category;
  }
  
  if (price === "free") {
    where.priceCents = 0;
  } else if (price === "paid") {
    where.priceCents = { gt: 0 };
  }
  
  if (rating) {
    where.rating = { gte: rating };
  }

  const [courses, totalCount] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses: courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      category: c.category,
      priceCents: c.priceCents,
      weeks: c.weeks,
      rating: c.rating,
      ratingCount: c.ratingCount,
      instructor: c.instructor,
      published: c.published,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    totalCount,
    pagesCount: Math.ceil(totalCount / limit),
  };
}

export const GET = withLogging(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  
  const queryParams = {
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    price: searchParams.get("price") || undefined,
    rating: searchParams.get("rating") || undefined,
    page: searchParams.get("page") || undefined,
    limit: searchParams.get("limit") || undefined,
  };

  const validationResult = CoursesQuerySchema.safeParse(queryParams);
  if (!validationResult.success) {
    return Response.json(
      { error: "Invalid query parameters", details: validationResult.error.flatten() },
      { status: 400 }
    );
  }

  const validatedData = validationResult.data;

  // Retrieve cached courses list
  const cachedData = await getCoursesCached(validatedData);

  // Intersect with user session to resolve enrollment state
  const session = await auth();
  let enrolledCourseIds = new Set<string>();

  if (session?.user?.id) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true },
    });
    enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  }

  const coursesWithEnrollment = cachedData.courses.map((course) => ({
    ...course,
    isEnrolled: enrolledCourseIds.has(course.id),
  }));

  return Response.json({
    courses: coursesWithEnrollment,
    totalCount: cachedData.totalCount,
    pagesCount: cachedData.pagesCount,
    page: validatedData.page,
    limit: validatedData.limit,
  });
});
