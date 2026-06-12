import { EditCourseClient } from "@/components/admin/EditCourseClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Admin: Edit Course - AeroMind",
  description: "Administrative interface for editing a course.",
};

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;

  return <EditCourseClient id={id} />;
}
