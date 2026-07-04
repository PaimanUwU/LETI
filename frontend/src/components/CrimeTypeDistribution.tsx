import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { api } from "../lib/api";
import type { Distribution } from "../lib/api";

const chartConfig = {
  crimes: {
    label: "Total Crimes",
    color: "hsl(var(--chart-1))",
  },
};

const capitalizeWords = (str: string) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function CrimeTypeDistribution() {
  const [categoryData, setCategoryData] = useState<Distribution[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catResult, districtResult] = await Promise.all([
          api.dashboard.getCrimeCountsByCategory(10),
          api.dashboard.getTopDistricts(4),
        ]);

        const parsedCategory =
          typeof catResult === "string" ? JSON.parse(catResult) : catResult;
        const parsedDistrict =
          typeof districtResult === "string"
            ? JSON.parse(districtResult)
            : districtResult;

        const filteredDistricts = parsedDistrict
          .filter((item: any) => item.district?.toLowerCase() !== "all")
          .slice(0, 10);

        setCategoryData(parsedCategory);
        setDistrictData(filteredDistricts);
      } catch (error) {
        console.error("Failed to load crime distribution data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-full max-w-2xl flex items-center justify-center">
        <CardContent className="text-center text-sm text-muted-foreground">
          Loading chart data...
        </CardContent>
      </Card>
    );
  }

  return (
    /* 1. Added 'flex flex-col' to the main Card container */
    <Card className="w-full h-full max-w-2xl flex flex-col">
      <CardHeader>
        <CardTitle>Crime Distribution</CardTitle>
      </CardHeader>

      {/* 2. Added 'flex-1 min-h-0' to let content fill the card and contain the chart cleanly */}
      <CardContent className="flex-1 min-h-0 pb-6">
        {/* 3. Added 'h-full flex flex-col' to the Tabs container */}
        <Tabs
          defaultValue="category"
          className="h-full flex flex-col space-y-4"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="district">By District</TabsTrigger>
            </TabsList>
          </div>

          {/* Category View */}
          {/* 4. Added 'flex-1 min-h-0' to let the tab panes expand fully */}
          <TabsContent
            value="category"
            className="flex-1 min-h-0 mt-0 space-y-4"
          >
            {/* 5. Replaced 'min-h-[300px]' with 'h-full w-full' to let the svg canvas scale */}
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={categoryData}
                margin={{ left: 12, right: 12, bottom: 12 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={capitalizeWords}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="crimes" fill="var(--color-crimes)" radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          {/* District View */}
          {/* 4. Added 'flex-1 min-h-0' here as well */}
          <TabsContent
            value="district"
            className="flex-1 min-h-0 mt-0 space-y-4"
          >
            {/* 5. Set 'h-full w-full' */}
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={districtData}
                margin={{ left: 12, right: 12, bottom: 12 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="district"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={capitalizeWords}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="crimes" fill="var(--color-crimes)" radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
