"use client";

import { useAdminCourse, useCreateModule, useUpdateModule, useDeleteModule } from "@/lib/hooks/useAdmin";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminModuleSchema, AdminModuleInput } from "@/lib/schemas/courses";
import { getErrorMessage, type AdminModule } from "@/lib/types/api";
import { useState } from "react";
import Link from "next/link";

interface AdminModulesListProps {
  courseId: string;
}

export function AdminModulesList({ courseId }: AdminModulesListProps) {
  const { data: course, isLoading, isError } = useAdminCourse(courseId);
  const createModuleMutation = useCreateModule(courseId);
  const updateModuleMutation = useUpdateModule(courseId);
  const deleteModuleMutation = useDeleteModule(courseId);

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editOrder, setEditOrder] = useState<number>(1);
  const [actionError, setActionError] = useState("");

  // Create Form React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AdminModuleSchema),
    defaultValues: {
      courseId,
      title: "",
      order: 1,
    },
  });

  const handleCreate = async (data: AdminModuleInput) => {
    setActionError("");
    try {
      await createModuleMutation.mutateAsync(data);
      reset({
        courseId,
        title: "",
        order: (course?.modules?.length || 0) + 2, // Suggest next order
      });
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, "Failed to create module"));
    }
  };

  const handleStartEdit = (mod: AdminModule) => {
    setEditingModuleId(mod.id);
    setEditTitle(mod.title);
    setEditOrder(mod.order);
    setActionError("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      setActionError("Module title cannot be empty");
      return;
    }
    setActionError("");
    try {
      await updateModuleMutation.mutateAsync({
        id,
        data: {
          courseId,
          title: editTitle,
          order: editOrder,
        },
      });
      setEditingModuleId(null);
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, "Failed to update module"));
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete module "${title}"? All its lessons will be permanently deleted.`)) {
      return;
    }
    setActionError("");
    try {
      await deleteModuleMutation.mutateAsync(id);
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, "Failed to delete module"));
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

  if (isError || !course) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-12 text-center">
        <h2 className="text-lg font-bold text-red-600">Course Not Found</h2>
        <p className="text-zinc-500 mt-2 text-sm">Could not retrieve modules for the specified course.</p>
      </div>
    );
  }

  const modules = course.modules || [];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1 flex flex-col gap-8">
      <div className="border-b border-zinc-100 pb-5">
        <Link href="/admin/courses" className="text-xs font-bold text-primary hover:underline block mb-2">
          &larr; Back to Course List
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Syllabus Modules: {course.title}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Add, update, or remove modular sections of this course.</p>
      </div>

      {actionError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Modules List (Left columns) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950">Modules</h2>
          {modules.length === 0 ? (
            <div className="border border-zinc-200 bg-zinc-50/50 p-8 text-center text-xs text-zinc-500">
              No modules created for this course yet. Use the form to add one.
            </div>
          ) : (
            <div className="border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col divide-y divide-zinc-100">
                {modules.map((mod: AdminModule) => (
                  <div
                    key={mod.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    {editingModuleId === mod.id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="number"
                          value={editOrder}
                          onChange={(e) => setEditOrder(Number(e.target.value))}
                          className="w-16 border border-zinc-200 px-2.5 py-1.5 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 border border-zinc-200 px-2.5 py-1.5 focus:border-primary focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-400 font-semibold bg-zinc-50 px-1.5 py-0.5 border border-zinc-200">
                            Order {mod.order}
                          </span>
                          <h3 className="font-bold text-zinc-900 truncate text-sm">
                            {mod.title}
                          </h3>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                          Contains {mod.lessons?.length || 0} lessons
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 shrink-0">
                      {editingModuleId === mod.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(mod.id)}
                            disabled={updateModuleMutation.isPending}
                            className="text-emerald-600 hover:text-emerald-800 font-bold underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingModuleId(null)}
                            className="text-zinc-500 hover:text-zinc-700 font-semibold underline"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(mod)}
                            className="text-zinc-600 hover:text-zinc-900 font-semibold underline"
                          >
                            Edit
                          </button>
                          <Link
                            href={`/admin/courses/${courseId}/modules/${mod.id}/lessons`}
                            className="text-primary hover:text-primary-dark font-bold underline"
                          >
                            Lessons ({mod.lessons?.length || 0})
                          </Link>
                          <button
                            onClick={() => handleDelete(mod.id, mod.title)}
                            disabled={deleteModuleMutation.isPending}
                            className="text-red-600 hover:text-red-800 font-semibold underline disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Module Sidebar Form (Right column) */}
        <aside className="border border-zinc-200 bg-white p-6 sticky top-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 mb-4">Add Module</h2>
          <form onSubmit={handleSubmit(handleCreate)} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Module Title
              </label>
              <input
                type="text"
                placeholder="e.g. Design Fundamentals"
                {...register("title")}
                className="w-full border border-zinc-200 px-3 py-2 text-xs focus:border-primary focus:outline-none"
              />
              {errors.title && (
                <p className="text-[10px] text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

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

            <button
              type="submit"
              disabled={createModuleMutation.isPending}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 mt-2"
            >
              {createModuleMutation.isPending ? "Adding..." : "Add Module"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
