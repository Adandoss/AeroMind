import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourseCurriculum } from "@/lib/api/courses";
import { fetchLesson, completeLesson } from "@/lib/api/lessons";

export function useCurriculum(slug: string) {
  return useQuery({
    queryKey: ["curriculum", slug],
    queryFn: () => fetchCourseCurriculum(slug),
    enabled: !!slug,
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: () => fetchLesson(id),
    enabled: !!id,
  });
}

export function useCompleteLesson(slug: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => completeLesson(id),
    onSuccess: (data, id) => {
      // Invalidate curriculum and current lesson queries
      queryClient.invalidateQueries({ queryKey: ["curriculum", slug] });
      queryClient.invalidateQueries({ queryKey: ["lesson", id] });
      // Also invalidate dashboard data so minutes studied / stats update immediately
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
