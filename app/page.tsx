import Link from "next/link";
import { prisma } from "@/lib/server/db";
import { CourseCard } from "@/components/courses/CourseCard";

// Rendered per request: course data lives in the database, and the Docker
// image build has no database to prerender against.
export const dynamic = "force-dynamic";

// "Curated Selection": editorial choice, not an algorithm.
const FEATURED_SLUGS = [
  "advanced-swiss-typography",
  "interaction-design-systems",
  "frontend-precision-for-designers",
];

const features = [
  {
    title: "Expert Instructors",
    text: "Learn from industry veterans who bring years of practical experience and Swiss-level detail to every lesson.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden>
        <path d="m12 4 10 5-10 5L2 9z" />
        <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      </svg>
    ),
  },
  {
    title: "Lifetime Access",
    text: "Your education never expires. Access all course materials and updates at your convenience, forever.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden>
        <path d="M8.5 8.5c-2 0-3.5 1.6-3.5 3.5s1.5 3.5 3.5 3.5c3.5 0 3.5-7 7-7 2 0 3.5 1.6 3.5 3.5s-1.5 3.5-3.5 3.5c-3.5 0-3.5-7-7-7Z" />
      </svg>
    ),
  },
  {
    title: "Interactive Projects",
    text: "Put theory into practice with curated assignments that challenge your creative problem-solving skills.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden>
        <path d="M14 4h6v6" />
        <path d="M20 4 4 20" />
        <path d="M4 10V4h6" />
        <path d="m4 4 6.5 6.5" />
        <path d="M20 14v6h-6" />
        <path d="m20 20-6.5-6.5" />
      </svg>
    ),
  },
];

export default async function Home() {
  const featured = await prisma.course.findMany({
    where: { slug: { in: FEATURED_SLUGS }, published: true },
    select: {
      slug: true,
      title: true,
      category: true,
      priceCents: true,
      rating: true,
    },
  });
  const featuredOrdered = FEATURED_SLUGS.map((slug) =>
    featured.find((c) => c.slug === slug),
  ).filter((c) => c !== undefined);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Master New Skills at Your Own Pace
          </h1>
          <p className="mt-5 max-w-sm text-zinc-600">
            Structured learning for creative professionals. High-fidelity
            education designed with Swiss precision and intellectual rigor.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/courses"
              className="rounded bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Explore Courses
            </Link>
            <Link
              href="#features"
              className="rounded border border-zinc-300 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50"
            >
              How It Works
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-lavender">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-lavender-deep">
              <svg
                className="h-7 w-7 text-lavender-deep"
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
          <div
            className="absolute -bottom-4 -right-4 hidden h-20 w-20 rounded-lg border-2 border-primary bg-white md:block"
            aria-hidden
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-zinc-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <div className="text-primary">{f.icon}</div>
              <h2 className="mt-4 font-semibold tracking-tight">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Curated Selection
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Featured Courses
            </h2>
          </div>
          <Link
            href="/courses"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredOrdered.map((course) => (
            <CourseCard key={course.slug} {...course} />
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-5xl font-bold text-lavender-deep" aria-hidden>
          &ldquo;
        </p>
        <blockquote className="mt-2 text-lg font-medium italic leading-relaxed">
          &ldquo;The most refined learning experience I have encountered. The
          quality of content matches the quality of the interface. AeroMind
          understands that clarity is the foundation of education.&rdquo;
        </blockquote>
        <p className="mt-6 text-sm font-semibold">Elena Rossi</p>
        <p className="text-xs text-zinc-500">Senior Designer, Zurich</p>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg bg-primary px-8 py-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              Start your journey today.
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              Join 10,000+ professionals elevating their technical craft.
            </p>
          </div>
          <form className="flex w-full gap-2 md:w-auto" action="/register">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full rounded border border-blue-300 bg-primary-dark px-3 py-2 text-sm text-white placeholder-blue-200 outline-none focus:border-white md:w-56"
            />
            <button
              type="submit"
              className="shrink-0 rounded bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-blue-50"
            >
              Join Now
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
