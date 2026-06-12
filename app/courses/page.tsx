import { CatalogClient } from "@/components/courses/CatalogClient";
import { Suspense } from "react";

export const metadata = {
  title: "Courses - AeroMind",
  description: "Browse our structured curriculum of professional design and engineering courses.",
};

interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function CatalogWrapper({ searchParams }: SearchParamsProps) {
  const resolvedParams = await searchParams;

  const filters = {
    q: typeof resolvedParams.q === "string" ? resolvedParams.q : undefined,
    category: typeof resolvedParams.category === "string" ? resolvedParams.category : undefined,
    price: typeof resolvedParams.price === "string" ? resolvedParams.price : undefined,
    rating: typeof resolvedParams.rating === "string" ? Number(resolvedParams.rating) : undefined,
    page: typeof resolvedParams.page === "string" ? Number(resolvedParams.page) : undefined,
  };

  return <CatalogClient initialFilters={filters} />;
}

export default function CatalogPage({ searchParams }: SearchParamsProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-6 py-12 flex-1 animate-pulse">
          <div className="h-8 bg-zinc-100 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-zinc-100 rounded w-2/4 mb-8"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 h-96 bg-zinc-100 rounded"></div>
            <div className="flex-1 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-64 bg-zinc-100 rounded border border-zinc-200"></div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CatalogWrapper searchParams={searchParams} />
    </Suspense>
  );
}
