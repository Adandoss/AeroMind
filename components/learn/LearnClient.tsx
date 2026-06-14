"use client";

import { useCurriculum, useLesson, useCompleteLesson } from "@/lib/hooks/useCurriculum";
import Link from "next/link";
import { marked } from "marked";
import { stripModuleNumberPrefix } from "@/lib/format";
import type { CurriculumLesson, CurriculumModule } from "@/lib/types/api";

function parseLessonMarkdown(content: string): string {
  const parsed = marked.parse(content);
  return typeof parsed === "string" ? parsed : "";
}

interface LearnClientProps {
  slug: string;
  lessonId: string;
}

export function LearnClient({ slug, lessonId }: LearnClientProps) {
  const { data: curriculum, isLoading: curriculumLoading, isError: curriculumError } = useCurriculum(slug);
  const { data: lesson, isLoading: lessonLoading, isError: lessonError } = useLesson(lessonId);
  const completeMutation = useCompleteLesson(slug);

  const htmlContent = lesson?.content ? parseLessonMarkdown(lesson.content) : "";

  if (curriculumLoading || lessonLoading) {
    return (
      <div className="flex-1 flex min-h-screen bg-zinc-50 animate-pulse">
        <aside className="w-80 border-r border-zinc-200 bg-white p-6 shrink-0 hidden md:block"></aside>
        <main className="flex-1 p-8 md:p-12">
          <div className="h-4 bg-zinc-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-zinc-200 rounded w-2/4 mb-8"></div>
          <div className="h-96 bg-zinc-200 rounded"></div>
        </main>
      </div>
    );
  }

  if (curriculumError || lessonError || !curriculum) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-24 text-center">
        <h1 className="text-lg font-bold text-zinc-900 mb-2">Lesson Player Error</h1>
        <p className="text-zinc-500 mb-6 text-sm">
          Failed to load curriculum or lesson content. Please verify your access status.
        </p>
        <Link
          href="/courses"
          className="inline-block px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary-dark"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  // Flatten curriculum lessons for navigation
  const flatLessons = curriculum?.modules?.flatMap((m: CurriculumModule) => m.lessons) || [];
  const currentIdx = flatLessons.findIndex((l: CurriculumLesson) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? flatLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx !== -1 && currentIdx < flatLessons.length - 1 ? flatLessons[currentIdx + 1] : null;

  // Active lesson details from the curriculum to get lock/completed status
  const activeCurriculumLesson = flatLessons.find((l: CurriculumLesson) => l.id === lessonId);
  const isLocked = activeCurriculumLesson?.isLocked ?? false;
  const isCompleted = activeCurriculumLesson?.isCompleted ?? false;

  const handleToggleComplete = async () => {
    try {
      await completeMutation.mutateAsync(lessonId);
    } catch (err) {
      console.error("Failed to update complete status", err);
    }
  };

  return (
    <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-zinc-200 bg-white shrink-0 hidden md:flex flex-col select-none">
        <div className="p-6 border-b border-zinc-100 shrink-0">
          <Link
            href={`/courses/${slug}`}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mb-2"
          >
            &larr; Back to Course Detail
          </Link>
          <h2 className="text-sm font-bold text-zinc-900 truncate">
            {curriculum.title}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {curriculum.modules.map((mod: CurriculumModule, mIdx: number) => (
            <div key={mod.id}>
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                M{mIdx + 1}: {stripModuleNumberPrefix(mod.title)}
              </h3>
              <div className="flex flex-col gap-1.5">
                {mod.lessons.map((l: CurriculumLesson) => {
                  const isActive = l.id === lessonId;
                  return (
                    <Link
                      key={l.id}
                      href={l.isLocked ? `/courses/${slug}` : `/learn/${slug}/${l.id}`}
                      className={`flex items-center justify-between text-xs px-3 py-2 border transition-all ${
                        isActive
                          ? "border-primary bg-primary/5 text-primary font-semibold"
                          : l.isLocked
                          ? "border-transparent text-zinc-400 cursor-not-allowed"
                          : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      <span className="truncate mr-2">{l.title}</span>
                      <span className="shrink-0 flex items-center">
                        {l.isCompleted ? (
                          <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : l.isLocked ? (
                          <svg className="h-3.5 w-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <span className="text-[9px] font-mono text-zinc-400">{l.durationMin}m</span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 bg-zinc-50/50 flex flex-col p-6 sm:p-8 md:p-12 overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-between">
          <div className="flex-1">
            {/* Top row */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-6 mb-8 gap-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Active Lesson
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
                  {lesson.title}
                </h1>
              </div>

              {/* Complete toggler */}
              {!isLocked && (
                <button
                  onClick={handleToggleComplete}
                  disabled={completeMutation.isPending}
                  className={`px-4 py-2 border text-xs font-bold uppercase tracking-wider transition-colors shrink-0 ${
                    isCompleted
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {completeMutation.isPending ? (
                    "Updating..."
                  ) : isCompleted ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  ) : (
                    "Mark Complete"
                  )}
                </button>
              )}
            </div>

            {/* Content Display */}
            {isLocked ? (
              <div className="border border-zinc-200 bg-white p-8 text-center my-12 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-zinc-900">Premium Lesson</h3>
                <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto leading-relaxed">
                  This lesson is part of our professional curriculum. Please purchase a membership to unlock access.
                </p>
                <div className="mt-6">
                  <Link
                    href="/pricing"
                    className="inline-block px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    View Pricing Plans
                  </Link>
                </div>
              </div>
            ) : (
              <div className="border border-zinc-200 bg-white p-8 md:p-10 shadow-sm leading-relaxed text-zinc-700 text-sm">
                <article
                  className="markdown-body"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Markdown Custom Styling */}
                <style jsx global>{`
                  .markdown-body h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #18181b;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    border-bottom: 1px solid #f4f4f5;
                    padding-bottom: 0.5rem;
                  }
                  .markdown-body h3 {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #18181b;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                  }
                  .markdown-body p {
                    margin-bottom: 1.25rem;
                    line-height: 1.75;
                  }
                  .markdown-body ul, .markdown-body ol {
                    margin-bottom: 1.25rem;
                    padding-left: 1.25rem;
                  }
                  .markdown-body ul {
                    list-style-type: disc;
                  }
                  .markdown-body ol {
                    list-style-type: decimal;
                  }
                  .markdown-body li {
                    margin-bottom: 0.4rem;
                  }
                  .markdown-body code {
                    background-color: #f4f4f5;
                    padding: 0.2rem 0.4rem;
                    font-family: var(--font-geist-mono), monospace;
                    font-size: 0.85em;
                    border: 1px solid #e4e4e7;
                  }
                  .markdown-body pre {
                    background-color: #18181b;
                    color: #f4f4f5;
                    padding: 1.25rem;
                    overflow-x: auto;
                    margin-bottom: 1.25rem;
                    font-family: var(--font-geist-mono), monospace;
                    font-size: 0.85em;
                  }
                  .markdown-body pre code {
                    background-color: transparent;
                    padding: 0;
                    border: 0;
                    color: inherit;
                    font-size: inherit;
                  }
                  .markdown-body blockquote {
                    border-left: 3px solid #18181b;
                    padding-left: 1rem;
                    color: #52525b;
                    font-style: italic;
                    margin-bottom: 1.25rem;
                  }
                `}</style>
              </div>
            )}
          </div>

          {/* Prev/Next navigation bar */}
          <div className="flex justify-between items-center border-t border-zinc-200 pt-8 mt-12 gap-4">
            {prevLesson ? (
              <Link
                href={`/learn/${slug}/${prevLesson.id}`}
                className="px-4 py-2.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                &larr; Prev
              </Link>
            ) : (
              <button
                disabled
                className="px-4 py-2.5 border border-zinc-100 bg-white text-zinc-300 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
              >
                &larr; Prev
              </button>
            )}

            {nextLesson ? (
              <Link
                href={nextLesson.isLocked ? `/courses/${slug}` : `/learn/${slug}/${nextLesson.id}`}
                className="px-4 py-2.5 border border-zinc-900 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                Next &rarr;
              </Link>
            ) : (
              <button
                disabled
                className="px-4 py-2.5 border border-zinc-100 bg-white text-zinc-300 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
              >
                End &rarr;
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
