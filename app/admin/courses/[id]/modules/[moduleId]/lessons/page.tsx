import { AdminLessonsList } from "@/components/admin/AdminLessonsList";

interface PageProps {
  params: Promise<{ id: string; moduleId: string }>;
}

export const metadata = {
  title: "Admin: Lessons - AeroMind",
  description: "Configure lessons inside a course module.",
};

export default async function AdminLessonsPage({ params }: PageProps) {
  const { id, moduleId } = await params;

  return <AdminLessonsList courseId={id} moduleId={moduleId} />;
}
