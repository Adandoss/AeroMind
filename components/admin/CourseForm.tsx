"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminCourseSchema, AdminCourseInput } from "@/lib/schemas/courses";
import { Category } from "@/lib/types/enums";
import Link from "next/link";
import { useEffect } from "react";

interface CourseFormProps {
  initialData?: Partial<AdminCourseInput>;
  onSubmit: (data: AdminCourseInput) => void;
  isSubmitting: boolean;
  error?: string;
  title: string;
}

export function CourseForm({ initialData, onSubmit, isSubmitting, error, title }: CourseFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AdminCourseSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      category: Category.DESIGN,
      priceCents: 0,
      weeks: 1,
      instructor: "",
      published: false,
      ...initialData,
    },
  });

  const watchTitle = useWatch({ control, name: "title" });

  // Suggest slug from title for new courses
  useEffect(() => {
    if (!initialData && watchTitle) {
      const suggestedSlug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", suggestedSlug, { shouldValidate: true });
    }
  }, [watchTitle, initialData, setValue]);

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12 flex-1 flex flex-col gap-6">
      <div className="border-b border-zinc-100 pb-5">
        <Link href="/admin/courses" className="text-xs font-bold text-primary hover:underline block mb-2">
          &larr; Back to Course List
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 border border-zinc-200 bg-white p-8">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Course Title
          </label>
          <input
            type="text"
            placeholder="e.g. Advanced Typography"
            {...register("title")}
            className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Slug (URL identifier)
          </label>
          <input
            type="text"
            placeholder="e.g. advanced-typography"
            {...register("slug")}
            className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          {errors.slug && (
            <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Provide a comprehensive course description..."
            {...register("description")}
            className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              {...register("category")}
              className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none bg-white"
            >
              <option value="DESIGN">Design</option>
              <option value="INTERFACE">Interface</option>
              <option value="ENGINEERING">Engineering</option>
              <option value="MARKETING">Marketing</option>
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Price (in cents)
            </label>
            <input
              type="number"
              placeholder="e.g. 4900 for $49.00"
              {...register("priceCents")}
              className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            {errors.priceCents && (
              <p className="text-xs text-red-500 mt-1">{errors.priceCents.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Duration (in weeks)
            </label>
            <input
              type="number"
              placeholder="e.g. 6"
              {...register("weeks")}
              className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            {errors.weeks && (
              <p className="text-xs text-red-500 mt-1">{errors.weeks.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Instructor Name
            </label>
            <input
              type="text"
              placeholder="e.g. Josef Müller"
              {...register("instructor")}
              className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            {errors.instructor && (
              <p className="text-xs text-red-500 mt-1">{errors.instructor.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            id="published"
            {...register("published")}
            className="h-4 w-4 border-zinc-300 text-primary focus:ring-primary"
          />
          <label htmlFor="published" className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer">
            Publish this course immediately (Draft mode if unchecked)
          </label>
        </div>

        <div className="flex gap-3 border-t border-zinc-100 pt-6 mt-2">
          <Link
            href="/admin/courses"
            className="flex-1 py-3 border border-zinc-200 text-center text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-primary text-white text-center text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
