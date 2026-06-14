"use client";

import { useAdminCourse, useCreateLesson, useUpdateLesson, useDeleteLesson } from "@/lib/hooks/useAdmin";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminLessonSchema, AdminLessonInput } from "@/lib/schemas/courses";
import { getErrorMessage, type AdminLesson, type AdminModule } from "@/lib/types/api";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";

interface AdminLessonsListProps {
  courseId: string;
  moduleId: string;
}

type AdminLessonFormInput = z.input<typeof AdminLessonSchema>;

export function AdminLessonsList({ courseId, moduleId }: AdminLessonsListProps) {
  const { data: course, isLoading, isError } = useAdminCourse(courseId);
  const createLessonMutation = useCreateLesson(courseId);
  const updateLessonMutation = useUpdateLesson(courseId);
  const deleteLessonMutation = useDeleteLesson(courseId);

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const targetModule = course?.modules?.find((m: AdminModule) => m.id === moduleId);
  const lessons = targetModule?.lessons || [];
  const editingLesson = editingLessonId
    ? lessons.find((lesson: AdminLesson) => lesson.id === editingLessonId)
    : null;

  // Sync edit mode fields
  const handleStartEdit = (lesson: AdminLesson) => {
    setEditingLessonId(lesson.id);
    setActionError("");
  };

  const handleCancelEdit = () => {
    setEditingLessonId(null);
  };

  const onSubmit = async (data: AdminLessonInput) => {
    setActionError("");
    try {
      if (editingLessonId) {
        // Update mode
        await updateLessonMutation.mutateAsync({
          id: editingLessonId,
          data,
        });
        handleCancelEdit();
      } else {
        // Create mode
        await createLessonMutation.mutateAsync(data);
      }
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, "Failed to save lesson"));
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete lesson "${title}"?`)) {
      return;
    }
    setActionError("");
    try {
      await deleteLessonMutation.mutateAsync(id);
      if (editingLessonId === id) {
        handleCancelEdit();
      }
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, "Failed to delete lesson"));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 animate-pulse">
        <div className="h-6 bg-zinc-100 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-zinc-100 rounded w-3/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-64 bg-zinc-50 rounded"></div>
          <div className="h-48 bg-zinc-50 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !course || !targetModule) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 text-center">
        <h2 className="text-lg font-bold text-red-600">Module/Course Not Found</h2>
        <p className="text-zinc-500 mt-2 text-sm">Failed to retrieve module curriculum details.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1 flex flex-col gap-8">
      <div className="border-b border-zinc-100 pb-5">
        <Link href={`/admin/courses/${courseId}/modules`} className="text-xs font-bold text-primary hover:underline block mb-2">
          &larr; Back to Modules
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Module Lessons: {targetModule.title}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Course: <span className="font-semibold text-zinc-700">{course.title}</span>
        </p>
      </div>

      {actionError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Lessons List (Left columns) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950">Lessons</h2>
          {lessons.length === 0 ? (
            <div className="border border-zinc-200 bg-zinc-50/50 p-8 text-center text-xs text-zinc-500">
              No lessons created for this module yet. Use the sidebar to add one.
            </div>
          ) : (
            <div className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col divide-y divide-zinc-100">
                {lessons.map((lesson: AdminLesson) => {
                  const isEditingThis = editingLessonId === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors ${
                        isEditingThis ? "bg-zinc-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-400 font-semibold bg-zinc-50 px-1.5 py-0.5 border border-zinc-200">
                            Order {lesson.order}
                          </span>
                          <h3 className="font-bold text-zinc-900 truncate text-sm">
                            {lesson.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-400 font-mono">
                          <span>{lesson.durationMin} minutes</span>
                          <span>&bull;</span>
                          {lesson.isFreePreview ? (
                            <span className="bg-lavender text-primary font-bold px-1 uppercase tracking-wide">
                              Preview
                            </span>
                          ) : (
                            <span className="text-zinc-500">Premium Locked</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 shrink-0">
                        <button
                          onClick={() => handleStartEdit(lesson)}
                          className={`text-zinc-600 hover:text-zinc-900 font-semibold underline ${
                            isEditingThis ? "font-bold text-primary" : ""
                          }`}
                        >
                          {isEditingThis ? "Editing..." : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id, lesson.title)}
                          disabled={deleteLessonMutation.isPending}
                          className="text-red-600 hover:text-red-800 font-semibold underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Lesson Form Sidebar */}
        <LessonEditorForm
          key={editingLesson?.id ?? `new-${lessons.length}`}
          mode={editingLesson ? "edit" : "create"}
          initialValues={
            editingLesson
              ? {
                  moduleId,
                  title: editingLesson.title ?? "",
                  content: editingLesson.content ?? "",
                  durationMin: editingLesson.durationMin,
                  order: editingLesson.order,
                  isFreePreview: editingLesson.isFreePreview,
                }
              : {
                  moduleId,
                  title: "",
                  content: "",
                  durationMin: 10,
                  order: lessons.length + 1,
                  isFreePreview: false,
                }
          }
          isSubmitting={createLessonMutation.isPending || updateLessonMutation.isPending}
          onCancel={handleCancelEdit}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

function LessonEditorForm({
  mode,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialValues: AdminLessonInput;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (data: AdminLessonInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLessonFormInput, unknown, AdminLessonInput>({
    resolver: zodResolver(AdminLessonSchema),
    defaultValues: initialValues,
  });

  return (
    <aside className="border border-zinc-200 bg-white p-6 sticky top-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 mb-4">
        {mode === "edit" ? "Edit Lesson" : "Add Lesson"}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input type="hidden" {...register("moduleId")} />

        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            Lesson Title
          </label>
          <input
            type="text"
            placeholder="e.g. Setting up your Workspace"
            {...register("title")}
            className="w-full border border-zinc-200 px-3 py-2 text-xs focus:border-primary focus:outline-none"
          />
          {errors.title && (
            <p className="text-[10px] text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Order Value
            </label>
            <input
              type="number"
              placeholder="e.g. 1"
              {...register("order")}
              className="w-full border border-zinc-200 px-3 py-2 text-xs focus:border-primary focus:outline-none"
            />
            {errors.order && (
              <p className="text-[10px] text-red-500 mt-1">{errors.order.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Duration (min)
            </label>
            <input
              type="number"
              placeholder="e.g. 10"
              {...register("durationMin")}
              className="w-full border border-zinc-200 px-3 py-2 text-xs focus:border-primary focus:outline-none"
            />
            {errors.durationMin && (
              <p className="text-[10px] text-red-500 mt-1">{errors.durationMin.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            Lesson Content (Markdown Supported)
          </label>
          <textarea
            rows={6}
            placeholder="Write lesson text or paste markdown content..."
            {...register("content")}
            className="w-full border border-zinc-200 px-3 py-2 text-xs focus:border-primary focus:outline-none font-mono"
          />
          {errors.content && (
            <p className="text-[10px] text-red-500 mt-1">{errors.content.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            id="isFreePreview"
            {...register("isFreePreview")}
            className="h-3.5 w-3.5 border-zinc-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="isFreePreview"
            className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer"
          >
            Enable free lesson preview
          </label>
        </div>

        <div className="flex gap-2 mt-2">
          {mode === "edit" && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 border border-zinc-200 text-center text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : mode === "edit" ? "Save Edit" : "Add Lesson"}
          </button>
        </div>
      </form>
    </aside>
  );
}
