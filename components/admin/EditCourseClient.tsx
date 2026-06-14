"use client";

import { CourseForm } from "@/components/admin/CourseForm";
import { useAdminCourse, useUpdateCourse } from "@/lib/hooks/useAdmin";
import { AdminCourseInput } from "@/lib/schemas/courses";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/types/api";
import { useState } from "react";

interface EditCourseClientProps {
  id: string;
}

export function EditCourseClient({ id }: EditCourseClientProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const { data: course, isLoading, isError } = useAdminCourse(id);
  const updateMutation = useUpdateCourse(id);

  const handleSubmit = async (data: AdminCourseInput) => {
    setError("");
    try {
      await updateMutation.mutateAsync(data);
      router.push("/admin/courses");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update course. Please try again."));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-12 animate-pulse">
        <div className="h-6 bg-zinc-100 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-zinc-100 rounded w-2/4 mb-8"></div>
        <div className="h-96 bg-zinc-50 rounded"></div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-12 text-center">
        <h2 className="text-lg font-bold text-red-600">Course Not Found</h2>
        <p className="text-zinc-500 mt-2 text-sm">Failed to load course details for editing.</p>
      </div>
    );
  }

  const initialData = {
    title: course.title,
    slug: course.slug,
    description: course.description,
    category: course.category,
    priceCents: course.priceCents,
    weeks: course.weeks,
    instructor: course.instructor,
    published: course.published,
  };

  return (
    <CourseForm
      title={`Edit Course: ${course.title}`}
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={updateMutation.isPending}
      error={error}
    />
  );
}
