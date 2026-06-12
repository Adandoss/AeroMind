import { AdminCourseInput, AdminModuleInput, AdminLessonInput } from "@/lib/schemas/courses";

// Course Actions
export async function adminFetchCourses() {
  const res = await fetch("/api/courses?limit=100");
  if (!res.ok) throw new Error("Failed to fetch admin courses");
  const data = await res.json();
  return data.courses || [];
}

export async function adminFetchCourse(id: string) {
  const res = await fetch(`/api/admin/courses/${id}`);
  if (!res.ok) throw new Error("Failed to fetch course detail");
  return res.json();
}

export async function adminCreateCourse(data: AdminCourseInput) {
  const res = await fetch("/api/admin/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create course");
  }
  return res.json();
}

export async function adminUpdateCourse(id: string, data: AdminCourseInput) {
  const res = await fetch(`/api/admin/courses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update course");
  }
  return res.json();
}

export async function adminDeleteCourse(id: string) {
  const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete course");
  }
  return res.json();
}

// Module Actions
export async function adminCreateModule(data: AdminModuleInput) {
  const res = await fetch("/api/admin/modules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create module");
  }
  return res.json();
}

export async function adminUpdateModule(id: string, data: Omit<AdminModuleInput, "courseId">) {
  const res = await fetch(`/api/admin/modules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update module");
  }
  return res.json();
}

export async function adminDeleteModule(id: string) {
  const res = await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete module");
  }
  return res.json();
}

// Lesson Actions
export async function adminCreateLesson(data: AdminLessonInput) {
  const res = await fetch("/api/admin/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create lesson");
  }
  return res.json();
}

export async function adminUpdateLesson(id: string, data: Omit<AdminLessonInput, "moduleId">) {
  const res = await fetch(`/api/admin/lessons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update lesson");
  }
  return res.json();
}

export async function adminDeleteLesson(id: string) {
  const res = await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete lesson");
  }
  return res.json();
}
