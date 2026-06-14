"use client";

import { useDashboard } from "@/lib/hooks/useDashboard";
import type { DailyActivity, EnrolledCourseSummary } from "@/lib/types/api";
import Link from "next/link";
import { useState } from "react";

export function DashboardClient() {
  const { data: dashboard, isLoading, isError } = useDashboard();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 animate-pulse flex-1">
        <div className="h-8 bg-zinc-100 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-zinc-100 rounded w-2/4 mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="h-28 bg-zinc-100 rounded"></div>
          <div className="h-28 bg-zinc-100 rounded"></div>
          <div className="h-28 bg-zinc-100 rounded"></div>
        </div>
        <div className="h-64 bg-zinc-100 rounded mb-8"></div>
        <div className="h-48 bg-zinc-100 rounded"></div>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 text-center flex-1">
        <h1 className="text-xl font-semibold text-zinc-900 mb-2">Failed to Load Dashboard</h1>
        <p className="text-zinc-500 mb-4">There was an issue fetching your learning data. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  const { user, subscription, enrolledCourses, dailyActivity, stats } = dashboard;

  // SVG Chart aggregation
  const maxMinutes = Math.max(...dailyActivity.map((d: DailyActivity) => d.minutesStudied), 30);
  const chartHeight = 120;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const graphHeight = chartHeight - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - 20;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1 flex flex-col gap-8">
      {/* Greetings */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Welcome back, {user.name}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Continue your precision learning path.
        </p>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Membership Status</p>
          {subscription ? (
            <div className="mt-2.5">
              <span className="text-base font-bold text-zinc-900 uppercase">
                {subscription.plan}
              </span>
              <span className="ml-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                {subscription.status}
              </span>
              <p className="text-[10px] text-zinc-400 mt-1.5">
                Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="mt-2.5">
              <span className="text-sm font-bold text-zinc-900 uppercase">Free Tier</span>
              <p className="text-[10px] text-zinc-400 mt-1.5">
                No active membership.
              </p>
              <Link
                href="/pricing"
                className="mt-2 text-xs font-semibold text-primary hover:underline block"
              >
                Upgrade to Premium &rarr;
              </Link>
            </div>
          )}
        </div>

        <div className="border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lessons Completed</p>
          <p className="text-3xl font-extrabold text-zinc-900 mt-2">{stats.totalCompletedLessonsAllTime}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Across all enrolled curriculum</p>
        </div>

        <div className="border border-zinc-200 bg-white p-6">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Hours Studied</p>
          <p className="text-3xl font-extrabold text-zinc-900 mt-2">{stats.totalHoursStudiedAllTime}h</p>
          <p className="text-[10px] text-zinc-400 mt-1">Precision aggregate active study</p>
        </div>
      </div>

      {/* SVG Chart Section */}
      <div className="border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              Weekly Learning Hours
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Study duration in minutes over the last 7 days</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="h-2 w-2 bg-primary rounded-full"></span>
            <span>Study Minutes</span>
          </div>
        </div>

        {/* Responsive SVG Container */}
        <div className="relative w-full aspect-[5/2] max-h-[220px]">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid Y Lines & Labels */}
            {Array.from({ length: 4 }).map((_, idx) => {
              const val = Math.round((maxMinutes / 3) * idx);
              const yPos = chartHeight - paddingBottom - (graphHeight / 3) * idx;
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={chartWidth - 20}
                    y2={yPos}
                    stroke="#F3F4F6"
                    strokeWidth={1}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={yPos + 4}
                    textAnchor="end"
                    className="text-[9px] fill-zinc-400 font-semibold font-mono"
                  >
                    {val}m
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {dailyActivity.map((day: DailyActivity, idx: number) => {
              const barWidth = 24;
              const spacing = graphWidth / 7;
              const xPos = paddingLeft + idx * spacing + (spacing - barWidth) / 2;
              const barValHeight = (day.minutesStudied / maxMinutes) * graphHeight;
              const yPos = chartHeight - paddingBottom - barValHeight;

              return (
                <g key={day.date}>
                  {/* Interactive Bar */}
                  <rect
                    x={xPos}
                    y={yPos}
                    width={barWidth}
                    height={Math.max(barValHeight, 2)}
                    className="fill-primary/90 hover:fill-primary cursor-pointer transition-colors duration-150"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />

                  {/* Day Label */}
                  <text
                    x={xPos + barWidth / 2}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-zinc-500 uppercase tracking-wide"
                  >
                    {day.dayName}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {hoveredBar !== null && (
            <div
              className="absolute bg-zinc-900 text-white text-[10px] p-2 border border-zinc-800 pointer-events-none rounded shadow"
              style={{
                left: `${
                  (paddingLeft +
                    hoveredBar * (graphWidth / 7) +
                    graphWidth / 14) *
                  (100 / chartWidth)
                }%`,
                bottom: `${
                  ((dailyActivity[hoveredBar].minutesStudied / maxMinutes) *
                    graphHeight +
                    paddingBottom +
                    10) *
                  (100 / chartHeight)
                }%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="font-bold">{dailyActivity[hoveredBar].dayName}</div>
              <div>Duration: {dailyActivity[hoveredBar].minutesStudied} min</div>
              <div>Completed: {dailyActivity[hoveredBar].lessonsCompleted} lessons</div>
            </div>
          )}
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-6">
          Your Enrolled Courses
        </h2>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 mb-4">You are not enrolled in any courses yet.</p>
            <Link
              href="/courses"
              className="inline-block px-4 py-2 border border-zinc-900 text-zinc-900 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {enrolledCourses.map((c: EnrolledCourseSummary) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 last:border-0 pb-5 last:pb-0 gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="border border-zinc-200 text-zinc-500 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                      {c.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">By {c.instructor}</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 truncate hover:underline">
                    <Link href={`/courses/${c.slug}`}>{c.title}</Link>
                  </h3>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 mt-3 max-w-md">
                    <div className="h-1.5 bg-zinc-100 flex-1 relative rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${c.progressPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 font-mono shrink-0">
                      {c.progressPercent}% ({c.completedLessons}/{c.totalLessons})
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  <Link
                    href={`/courses/${c.slug}`}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors text-center block w-full sm:w-auto"
                  >
                    Resume Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
