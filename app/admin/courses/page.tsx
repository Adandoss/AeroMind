import { AdminCoursesList } from "@/components/admin/AdminCoursesList";

export const metadata = {
  title: "Admin: Courses - AeroMind",
  description: "Administrative interface for course management.",
};

export default function AdminCoursesPage() {
  return <AdminCoursesList />;
}
