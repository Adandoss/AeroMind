export async function fetchDashboardData() {
  const res = await fetch("/api/me/dashboard", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return res.json();
}
