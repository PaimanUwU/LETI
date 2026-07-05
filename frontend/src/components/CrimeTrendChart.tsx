import { useState, useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "./ui/chart";
import { api } from "../lib/api";

import { TrendingUpDown } from "lucide-react";

const chartConfig = {
  property: {
    label: "Property Crime",
    color: "#3b82f6",
  },
  assault: {
    label: "Assault",
    color: "#ef4444",
  },
};

// TODO: fix endpoint for trend by district

export function CrimeTrendChart() {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrendData() {
      try {
        // 1. Fetch historical rows for the chosen district views (or "all" for general summary)
        const result = await api.dashboard.getMonthlyTrends("all");
        const rawRows =
          typeof result === "string" ? JSON.parse(result) : result;

        // 2. Map & accumulate individual row snapshots into matched unified milestones
        const timelineMap: {
          [key: string]: { date: string; property: number; assault: number };
        } = {};

        if (Array.isArray(rawRows)) {
          rawRows.forEach((row: any) => {
            // Extracts year slice or formatted string (e.g., "2023-01-01" -> "2023")
            const dateKey = row.date
              ? row.date.split("-")[0]
              : row.month || "Unknown";

            // Initialize baseline tracking keys if missing on this specific year index
            if (!timelineMap[dateKey]) {
              timelineMap[dateKey] = {
                date: dateKey,
                property: 0,
                assault: 0,
              };
            }

            // Dynamically combine crimes matching category rows
            const category = row.category?.toLowerCase();
            if (category === "property") {
              timelineMap[dateKey].property += Number(row.crimes || 0);
            } else if (category === "assault") {
              timelineMap[dateKey].assault += Number(row.crimes || 0);
            }
          });
        }

        // 3. Convert grouped map object back into an ordered, graphable list
        const formattedTimeline = Object.values(timelineMap).sort((a, b) =>
          a.date.localeCompare(b.date),
        );

        setTrendData(formattedTimeline);
      } catch (error) {
        console.error("Failed to parse and structure timeline trends:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTrendData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <CardContent className="text-center text-sm text-muted-foreground">
          Loading trend metrics...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUpDown className="h-5 w-5 text-blue-600" />
          Crime Trends Over Time
        </CardTitle>
        <CardDescription>
          Historical comparison of property and assault counts
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pb-6">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            data={trendData}
            margin={{ left: 12, right: 12, bottom: 24, top: 12 }}
          >
            <CartesianGrid
              vertical={true}
              horizontal={true}
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="date" // Uses the unified parsed date key from your mapping iteration
              tickLine={true}
              axisLine={true}
              tickMargin={12}
              angle={-45}
              textAnchor="end"
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} className="pt-4" />

            {/* Property Line */}
            <Line
              type="monotone"
              dataKey="property"
              stroke="var(--color-property)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
            />

            {/* Assault Line */}
            <Line
              type="monotone"
              dataKey="assault"
              stroke="var(--color-assault)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
