const BASE_URL = "http://localhost:8000";

export async function getDashboardStats() {
  const res = await fetch(`${BASE_URL}/api/dashboard/stats`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json() as Promise<DashboardStats>;
}

export interface DashboardStats {
  total_cases: number;
  monthly_trend_pct: number;
  affected_areas: number;
  resolved_cases: number;
}
