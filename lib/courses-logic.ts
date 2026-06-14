import type { Category } from "@/lib/types/enums";
import type { CourseWhereFilter } from "@/lib/types/api";

export interface CourseFilterParams {
  q?: string;
  category?: Category;
  price?: string;
  rating?: number;
}

export function buildCourseWhereFilter(params: CourseFilterParams): CourseWhereFilter {
  const { q, category, price, rating } = params;
  const where: CourseWhereFilter = { published: true };

  if (q) {
    where.OR = [{ title: { contains: q } }, { description: { contains: q } }];
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

  return where;
}
