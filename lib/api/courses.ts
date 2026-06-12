export interface FetchCoursesQuery {
  q?: string;
  category?: string;
  price?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

export async function fetchCourses(query: FetchCoursesQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category && query.category !== "all") params.set("category", query.category);
  if (query.price && query.price !== "all") params.set("price", query.price);
  if (query.rating !== undefined && query.rating > 0) params.set("rating", String(query.rating));
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const res = await fetch(`/api/courses?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }
  return res.json();
}

export async function fetchCourseBySlug(slug: string) {
  const res = await fetch(`/api/courses/${slug}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch course details");
  }
  return res.json();
}

export async function fetchCourseCurriculum(slug: string) {
  const res = await fetch(`/api/courses/${slug}/curriculum`);
  if (!res.ok) {
    throw new Error("Failed to fetch curriculum");
  }
  return res.json();
}
