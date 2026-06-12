import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard - AeroMind",
  description: "Track your learning hours, complete lessons, and view enrolled course progress.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
