import { AdminModulesList } from "@/components/admin/AdminModulesList";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Admin: Modules - AeroMind",
  description: "Configure syllabus modules for a course.",
};

export default async function AdminModulesPage({ params }: PageProps) {
  const { id } = await params;

  return <AdminModulesList courseId={id} />;
}
