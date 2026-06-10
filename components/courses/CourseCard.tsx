import Link from "next/link";
import { formatPrice } from "@/lib/format";

type CourseCardProps = {
  slug: string;
  title: string;
  category: string;
  priceCents: number;
  rating: number | null;
};

function ImagePlaceholder() {
  return (
    <div className="flex aspect-[5/4] items-center justify-center bg-lavender">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-lavender-deep">
        <svg
          className="h-5 w-5 text-lavender-deep"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m5 19 5.5-5.5 3 3L17 13l4 4" />
        </svg>
      </span>
    </div>
  );
}

export function CourseCard({
  slug,
  title,
  category,
  priceCents,
  rating,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${slug}`}
      className="group block border border-zinc-200 bg-white transition-shadow hover:shadow-md"
    >
      <ImagePlaceholder />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="border border-zinc-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
            {category}
          </span>
          {rating !== null && (
            <span className="flex items-center gap-1 text-xs text-zinc-700">
              <svg
                className="h-3.5 w-3.5 text-amber-500"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2.5 15 9l7 .6-5.3 4.6 1.6 6.9L12 17.4 5.7 21l1.6-6.9L2 9.5 9 9z" />
              </svg>
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="mt-3 font-semibold leading-snug tracking-tight group-hover:underline">
          {title}
        </h3>
        <p className="mt-2 text-sm font-semibold text-primary">
          {formatPrice(priceCents)}
        </p>
      </div>
    </Link>
  );
}
