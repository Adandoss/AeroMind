import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminApi from "@/lib/api/admin";
import { AdminCourseInput, AdminModuleInput, AdminLessonInput } from "@/lib/schemas/courses";

// Course Hooks & Mutations
export function useAdminCourses() {
  return useQuery({
    queryKey: ["admin", "courses"],
    queryFn: adminApi.adminFetchCourses,
  });
}

export function useAdminCourse(id: string) {
  return useQuery({
    queryKey: ["admin", "course", id],
    queryFn: () => adminApi.adminFetchCourse(id),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminCourseInput) => adminApi.adminCreateCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminCourseInput) => adminApi.adminUpdateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "course", id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.adminDeleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

// Module Mutations
export function useCreateModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminModuleInput) => adminApi.adminCreateModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
    },
  });
}

export function useUpdateModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<AdminModuleInput, "courseId"> }) =>
      adminApi.adminUpdateModule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
    },
  });
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.adminDeleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
    },
  });
}

// Lesson Mutations
export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminLessonInput) => adminApi.adminCreateLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
    },
  });
}

export function useUpdateLesson(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<AdminLessonInput, "moduleId"> }) =>
      adminApi.adminUpdateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      queryClient.invalidateQueries({ queryKey: ["lesson"] });
    },
  });
}

export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.adminDeleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["curriculum"] });
      queryClient.invalidateQueries({ queryKey: ["lesson"] });
    },
  });
}
