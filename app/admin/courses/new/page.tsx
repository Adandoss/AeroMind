"use client";

import { CourseForm } from "@/components/admin/CourseForm";
import { useCreateCourse } from "@/lib/hooks/useAdmin";
import { AdminCourseInput } from "@/lib/schemas/courses";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCoursePage() {
  const router = useRouter();
  const createMutation = useCreateCourse();
  const [error, setError] = useState("");

  const handleSubmit = async (data: AdminCourseInput) => {
    setError("");
    try {
      await createMutation.mutateAsync(data);
      router.push("/admin/courses");
    } catch (err: any) {
      setError(err.message || "Failed to create course. Please try again.");
    }
  };

  return (
    <CourseForm
      title="Create New Course"
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      error={error}
    />
  );
}
