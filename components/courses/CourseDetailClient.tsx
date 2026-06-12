"use client";

import { useCourse, useEnroll } from "@/lib/hooks/useCourses";
import { useCurriculum } from "@/lib/hooks/useCurriculum";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CourseDetailClientProps {
  slug: string;
}

export function CourseDetailClient({ slug }: CourseDetailClientProps) {
  const router = useRouter();
  const [enrollError, setEnrollError] = useState("");

  const { data: course, isLoading: courseLoading, isError: courseError } = useCourse(slug);
  const { data: curriculum, isLoading: curriculumLoading } = useCurriculum(slug);
  const enrollMutation = useEnroll(slug);

  if (courseLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 animate-pulse">
        <div className="h-4 bg-zinc-100 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-zinc-100 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-zinc-100 rounded w-2/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-zinc-100 rounded"></div>
          <div className="h-64 bg-zinc-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-zinc-900 mb-2">Course Not Found</h1>
        <p className="text-zinc-500 mb-4">The course you are looking for does not exist or has been removed.</p>
        <Link href="/courses" className="text-primary hover:underline font-semibold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Find first lesson ID to direct user
  let firstLessonId = "";
  if (curriculum?.modules) {
    for (const mod of curriculum.modules) {
      if (mod.lessons && mod.lessons.length > 0) {
        firstLessonId = mod.lessons[0].id;
        break;
      }
    }
  }

  const handleEnroll = async () => {
    setEnrollError("");
    try {
      const res = await enrollMutation.mutateAsync(course.id);
      if (res.success && firstLessonId) {
        router.push(`/learn/${slug}/${firstLessonId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setEnrollError(err.message || "Enrollment failed. Please check your active subscription.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1">
      {/* Breadcrumbs */}
      <nav className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
        <Link href="/courses" className="hover:text-zinc-900 transition-colors">
          Catalog
        </Link>
        <span className="mx-2 text-zinc-300">/</span>
        <span className="text-zinc-900">{course.category}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left main content */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
              {course.title}
            </h1>
            <p className="mt-4 text-zinc-600 leading-relaxed text-base md:text-lg">
              {course.description}
            </p>
          </div>

          {/* Curriculum display */}
          <div className="border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 mb-6">
              Course Syllabus
            </h2>
            {curriculumLoading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-6 bg-zinc-100 rounded w-1/3"></div>
                <div className="h-4 bg-zinc-100 rounded w-2/3"></div>
                <div className="h-4 bg-zinc-100 rounded w-1/2"></div>
              </div>
            ) : !curriculum?.modules || curriculum.modules.length === 0 ? (
              <p className="text-sm text-zinc-500">No modules added yet for this course.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {curriculum.modules.map((mod: any, mIdx: number) => (
                  <div key={mod.id} className="border-b border-zinc-100 last:border-0 pb-6 last:pb-0">
                    <h3 className="text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider">
                      Module {mIdx + 1}: {mod.title}
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {mod.lessons.map((lesson: any, lIdx: number) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between text-sm py-1.5"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.isLocked ? (
                              <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span className={lesson.isLocked ? "text-zinc-400" : "text-zinc-700"}>
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {lesson.isFreePreview && (
                              <span className="text-[10px] font-bold bg-lavender text-primary-dark px-1.5 py-0.5 uppercase tracking-wide">
                                Preview
                              </span>
                            )}
                            <span className="text-xs text-zinc-400 shrink-0">
                              {lesson.durationMin} min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right card sidebar */}
        <aside className="border border-zinc-200 bg-white p-6 sticky top-6">
          <div className="aspect-[5/4] bg-lavender flex items-center justify-center mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-lavender-deep">
              <svg className="h-6 w-6 text-lavender-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Instructor</p>
              <p className="text-sm font-semibold text-zinc-900">{course.instructor}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Duration</p>
              <p className="text-sm font-semibold text-zinc-900">{course.weeks} Weeks</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</p>
              <p className="text-lg font-bold text-primary">{formatPrice(course.priceCents)}</p>
            </div>

            <div className="border-t border-zinc-100 pt-4 mt-2">
              {course.isEnrolled ? (
                firstLessonId ? (
                  <Link
                    href={`/learn/${slug}/${firstLessonId}`}
                    className="block w-full py-3 bg-zinc-900 text-white text-center text-sm font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Go to Course
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 bg-zinc-100 text-zinc-400 text-center text-sm font-semibold"
                  >
                    No lessons available
                  </button>
                )
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                  className="w-full py-3 bg-primary text-white text-center text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {enrollMutation.isPending ? "Enrolling..." : "Enroll in Course"}
                </button>
              )}

              {enrollError && (
                <div className="mt-3 text-xs text-red-600 bg-red-50 p-3 border border-red-100">
                  {enrollError}
                  <div className="mt-1">
                    <Link href="/pricing" className="text-primary font-semibold hover:underline">
                      View Pricing Plans &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
