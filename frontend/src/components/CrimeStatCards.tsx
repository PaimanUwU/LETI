import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, TrendingUp, MapPin, Shield } from "lucide-react";
import { getDashboardStats, type DashboardStats } from "../lib/api";

export function CrimeStatCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  const cards = [
    {
      title: "Total Cases",
      value: stats ? stats.total_cases.toLocaleString() : "...",
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Monthly Trend",
      value: stats
        ? `${stats.monthly_trend_pct > 0 ? "+" : ""}${stats.monthly_trend_pct}%`
        : "...",
      icon: TrendingUp,
      color: "text-orange-500",
    },
    {
      title: "Affected Areas",
      value: stats ? String(stats.affected_areas) : "...",
      icon: MapPin,
      color: "text-blue-500",
    },
    {
      title: "Resolved Cases",
      value: stats ? stats.resolved_cases.toLocaleString() : "...",
      icon: Shield,
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {error ? "N/A" : stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
