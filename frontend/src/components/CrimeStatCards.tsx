import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, TrendingUp, Users, Shield } from "lucide-react";

export function CrimeStatCards() {
  const stats = [
    // temporarry data
    { title: "Total Cases", value: "1,234", icon: AlertTriangle, color: "text-red-500" },
    { title: "Monthly Trend", value: "+5.2%", icon: TrendingUp, color: "text-orange-500" },
    { title: "Affected Areas", value: "42", icon: Users, color: "text-blue-500" },
    { title: "Resolved Cases", value: "856", icon: Shield, color: "text-green-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
