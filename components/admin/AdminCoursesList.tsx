"use client";

import { useAdminCourses, useDeleteCourse } from "@/lib/hooks/useAdmin";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useState } from "react";

export function AdminCoursesList() {
  const { data: courses, isLoading, isError } = useAdminCourses();
  const deleteMutation = useDeleteCourse();
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course "${title}"? This action cannot be undone.`)) {
      return;
    }
    setDeleteError("");
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete course");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-12 animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 bg-zinc-100 rounded w-1/4"></div>
          <div className="h-10 bg-zinc-100 rounded w-32"></div>
        </div>
        <div className="border border-zinc-200 rounded h-64 bg-zinc-50"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-12 text-center">
        <h2 className="text-lg font-bold text-red-600">Error Loading Courses</h2>
        <p className="text-zinc-500 mt-2 text-sm">Please verify your administrator access status.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Admin: Course Management</h1>
          <p className="text-xs text-zinc-400 mt-1">Configure syllabus contents, publishing parameters, and modules.</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Create Course
        </Link>
      </div>

      {deleteError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3">
          {deleteError}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="border border-zinc-200 bg-zinc-50/50 p-12 text-center">
          <p className="text-sm text-zinc-500 mb-4">No courses exist in the system yet.</p>
          <Link
            href="/admin/courses/new"
            className="inline-block px-4 py-2 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800"
          >
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 uppercase tracking-widest font-bold font-mono">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {courses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4.5 font-bold text-zinc-900">
                      {course.title}
                      <span className="block text-[10px] text-zinc-400 font-mono mt-0.5 font-normal">
                        /{course.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-zinc-600">{course.category}</td>
                    <td className="px-6 py-4.5 font-semibold text-zinc-600">{formatPrice(course.priceCents)}</td>
                    <td className="px-6 py-4.5 text-zinc-500 font-mono">{course.weeks} wks</td>
                    <td className="px-6 py-4.5">
                      {course.published ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                          Published
                        </span>
                      ) : (
                        <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right flex items-center justify-end gap-3.5">
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="text-zinc-600 hover:text-zinc-900 font-semibold underline"
                      >
                        Edit Details
                      </Link>
                      <Link
                        href={`/admin/courses/${course.id}/modules`}
                        className="text-primary hover:text-primary-dark font-semibold underline"
                      >
                        Modules
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800 font-semibold underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
