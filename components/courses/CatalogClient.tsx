"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CourseCard } from "./CourseCard";
import { useCourses } from "@/lib/hooks/useCourses";
import { Category } from "@/lib/types/enums";

interface CatalogClientProps {
  initialFilters: {
    q?: string;
    category?: string;
    price?: string;
    rating?: number;
    page?: number;
  };
}

export function CatalogClient({ initialFilters }: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State management
  const [q, setQ] = useState(initialFilters.q || "");
  const [debouncedQ, setDebouncedQ] = useState(initialFilters.q || "");
  const [category, setCategory] = useState(initialFilters.category || "all");
  const [price, setPrice] = useState(initialFilters.price || "all");
  const [rating, setRating] = useState(initialFilters.rating || 0);
  const [page, setPage] = useState(initialFilters.page || 1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  // Sync state changes back to the URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (category !== "all") params.set("category", category);
    if (price !== "all") params.set("price", price);
    if (rating > 0) params.set("rating", String(rating));
    if (page > 1) params.set("page", String(page));

    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedQ, category, price, rating, page, router, pathname]);

  // Query data using React Query hook
  const { data, isLoading, isError } = useCourses({
    q: debouncedQ,
    category: category !== "all" ? (category as Category) : undefined,
    price: price as "all" | "free" | "paid",
    rating: rating > 0 ? rating : undefined,
    page,
    limit: 6,
  });

  const courses = data?.courses || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const categories = [
    { value: "all", label: "All Courses" },
    { value: "DESIGN", label: "Design" },
    { value: "INTERFACE", label: "Interface" },
    { value: "ENGINEERING", label: "Engineering" },
    { value: "MARKETING", label: "Marketing" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 flex-1">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <div className="border border-zinc-200 bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4">
              Categories
            </h2>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategory(cat.value);
                    setPage(1);
                  }}
                  className={`text-left px-3 py-2 text-sm transition-colors border ${
                    category === cat.value
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-zinc-200 bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4">
              Price Range
            </h2>
            <div className="flex flex-col gap-2">
              {[
                { value: "all", label: "All Prices" },
                { value: "free", label: "Free" },
                { value: "paid", label: "Paid" },
              ].map((p) => (
                <label
                  key={p.value}
                  className="flex items-center gap-2.5 text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="price"
                    value={p.value}
                    checked={price === p.value}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setPage(1);
                    }}
                    className="h-4 w-4 border-zinc-300 text-primary focus:ring-primary"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border border-zinc-200 bg-white p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4">
              Rating
            </h2>
            <div className="flex flex-col gap-2">
              {[
                { value: 0, label: "Any Rating" },
                { value: 4.5, label: "4.5 & Up" },
                { value: 4.0, label: "4.0 & Up" },
              ].map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-2.5 text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={r.value}
                    checked={rating === r.value}
                    onChange={(e) => {
                      setRating(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-4 w-4 border-zinc-300 text-primary focus:ring-primary"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Main Grid */}
        <main className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Courses
              </h1>
              <p className="text-sm text-zinc-500">
                Refined blueprints for professional craft.
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search courses..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full border border-zinc-200 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Loading / Error States */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="border border-zinc-200 bg-white p-4 animate-pulse">
                  <div className="aspect-[5/4] bg-zinc-100 mb-4"></div>
                  <div className="h-4 bg-zinc-100 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-zinc-100 rounded w-3/4 mb-3"></div>
                  <div className="h-5 bg-zinc-100 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="border border-red-200 bg-red-50/50 p-6 text-center text-sm text-red-600">
              Error fetching courses. Please refresh or try again.
            </div>
          ) : courses.length === 0 ? (
            <div className="border border-zinc-200 bg-zinc-50/50 p-12 text-center text-sm text-zinc-500">
              No courses found matching the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: any) => (
                <CourseCard
                  key={course.id}
                  slug={course.slug}
                  title={course.title}
                  category={course.category}
                  priceCents={course.priceCents}
                  rating={course.rating}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-2 mt-8 border-t border-zinc-100 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-zinc-200 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`px-3 py-1.5 border text-sm font-semibold ${
                        page === pNum
                          ? "border-primary bg-primary text-white"
                          : "border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-zinc-200 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
