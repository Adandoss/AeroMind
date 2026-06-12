import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourses, fetchCourseBySlug, FetchCoursesQuery } from "@/lib/api/courses";
import { enrollInCourse } from "@/lib/api/enrollments";

export function useCourses(filters: FetchCoursesQuery) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => fetchCourses(filters),
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: () => fetchCourseBySlug(slug),
    enabled: !!slug,
  });
}

export function useEnroll(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => enrollInCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", slug] });
      queryClient.invalidateQueries({ queryKey: ["curriculum", slug] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
