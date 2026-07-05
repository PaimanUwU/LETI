import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { api } from "../lib/api";
import {
  MapPin,
  Clock,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  ChartBarBig,
} from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────

function capitalize(str: string) {
  return str
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Distinct palette for bar charts
const DISTRICT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#6366f1",
  "#14b8a6",
];

// Crime type severity weights (higher = more severe)
const SEVERITY_WEIGHT: Record<string, number> = {
  murder: 10,
  rape: 9,
  robbery_gang_armed: 8,
  robbery_solo_armed: 7,
  robbery_gang_unarmed: 6,
  robbery_solo_unarmed: 5,
  causing_injury: 5,
  break_in: 4,
  theft_vehicle_motorcar: 3,
  theft_vehicle_lorry: 3,
  theft_vehicle_motorcycle: 2,
  theft_other: 1,
};

// Severity category labels
function getSeverityBand(weight: number): { label: string; color: string } {
  if (weight >= 8) return { label: "Critical", color: "#ef4444" };
  if (weight >= 6) return { label: "High", color: "#f97316" };
  if (weight >= 4) return { label: "Medium", color: "#f59e0b" };
  return { label: "Low", color: "#10b981" };
}

// ── Sub-components ───────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground text-sm">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading data…
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
      <ShieldAlert className="h-8 w-8 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── By District Tab ──────────────────────────────────────────

function ByDistrict() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setLoading(true);
    api.dashboard
      .getTopDistricts(20)
      .then((res) => {
        const rows = (Array.isArray(res) ? res : [])
          .filter((r: any) => r.district?.toLowerCase() !== "all")
          .slice(0, 20);
        setData(rows);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayed = data.slice(0, limit);
  const maxCrimes = displayed[0]?.crimes ?? 1;

  if (loading) return <LoadingState />;
  if (!data.length) return <EmptyState message="No district data available." />;

  return (
    <div className="space-y-5">
      {/* Bar Chart */}
      <div className="h-64">
        <ChartContainer
          config={{ crimes: { label: "Total Crimes", color: "#3b82f6" } }}
          className="h-full w-full"
        >
          <BarChart
            data={displayed}
            margin={{ left: 0, right: 8, bottom: 40, top: 8 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="district"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-40}
              textAnchor="end"
              className="text-xs"
              tickFormatter={(v) => capitalize(v).split(" ")[0]}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
              width={48}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(val: any) => [Number(val).toLocaleString(), "Crimes"]}
            />
            <Bar dataKey="crimes" radius={[4, 4, 0, 0]}>
              {displayed.map((_: any, i: number) => (
                <Cell
                  key={i}
                  fill={DISTRICT_COLORS[i % DISTRICT_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Ranked List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Top Districts by Crime Volume
          </p>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="text-xs border border-border rounded-md px-2 py-1 bg-background"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
        {displayed.map((row: any, i: number) => {
          const pct = Math.round((row.crimes / maxCrimes) * 100);
          return (
            <div key={row.district} className="flex items-center gap-3 group">
              <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {capitalize(row.district)}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {Number(row.crimes).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      backgroundColor:
                        DISTRICT_COLORS[i % DISTRICT_COLORS.length],
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── By Time Tab ──────────────────────────────────────────────

function ByTime() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard
      .getMonthlyTrends()
      .then((res) => {
        const rows = Array.isArray(res) ? res : [];
        setRawData(rows);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!rawData.length)
    return <EmptyState message="No time-based data available." />;

  // Build year-keyed buckets with property & assault
  const yearMap: Record<
    string,
    { year: string; property: number; assault: number; total: number }
  > = {};
  rawData.forEach((row: any) => {
    const year = row.date
      ? String(row.date).split("-")[0]
      : String(row.year ?? "Unknown");
    if (!yearMap[year])
      yearMap[year] = { year, property: 0, assault: 0, total: 0 };
    const cat = (row.category ?? "").toLowerCase();
    const count = Number(row.crimes ?? 0);
    if (cat === "property") yearMap[year].property += count;
    else if (cat === "assault") yearMap[year].assault += count;
    yearMap[year].total += count;
  });

  const yearlyData = Object.values(yearMap).sort((a, b) =>
    a.year.localeCompare(b.year),
  );

  // Build month-keyed buckets
  const monthMap: Record<number, { month: string; crimes: number }> = {};
  rawData.forEach((row: any) => {
    const m = Number(row.month ?? 0);
    if (m < 1 || m > 12) return;
    if (!monthMap[m]) monthMap[m] = { month: MONTH_NAMES[m - 1], crimes: 0 };
    monthMap[m].crimes += Number(row.crimes ?? 0);
  });
  const monthlyData = Object.values(monthMap).sort((_, b) =>
    MONTH_NAMES.indexOf(b.month) > -1 ? -1 : 1,
  );

  // YoY change
  const latestYear = yearlyData[yearlyData.length - 1];
  const prevYear = yearlyData[yearlyData.length - 2];
  const yoyChange =
    prevYear && prevYear.total > 0
      ? (((latestYear.total - prevYear.total) / prevYear.total) * 100).toFixed(
          1,
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Year-over-year summary chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Latest Year",
            value: latestYear?.year ?? "—",
            sub: `${Number(latestYear?.total ?? 0).toLocaleString()} crimes`,
          },
          {
            label: "YoY Change",
            value:
              yoyChange !== null
                ? `${Number(yoyChange) > 0 ? "+" : ""}${yoyChange}%`
                : "—",
            sub: prevYear ? `vs ${prevYear.year}` : "Insufficient data",
            trend:
              yoyChange !== null
                ? Number(yoyChange) > 0
                  ? "up"
                  : Number(yoyChange) < 0
                    ? "down"
                    : "flat"
                : null,
          },
          {
            label: "Peak Month",
            value:
              monthlyData.sort((a, b) => b.crimes - a.crimes)[0]?.month ?? "—",
            sub: "Highest crime volume",
          },
        ].map((chip) => (
          <div
            key={chip.label}
            className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1"
          >
            <p className="text-xs text-muted-foreground">{chip.label}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-bold text-foreground">{chip.value}</p>
              {chip.trend === "up" && (
                <TrendingUp className="h-4 w-4 text-red-500" />
              )}
              {chip.trend === "down" && (
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              )}
              {chip.trend === "flat" && (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{chip.sub}</p>
          </div>
        ))}
      </div>

      {/* Annual trend stacked chart */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Annual Crime Volume by Category
        </p>
        <div className="h-52">
          <ChartContainer
            config={{
              property: { label: "Property", color: "#3b82f6" },
              assault: { label: "Assault", color: "#ef4444" },
            }}
            className="h-full w-full"
          >
            <BarChart
              data={yearlyData}
              margin={{ left: 0, right: 8, bottom: 8, top: 8 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-xs"
                width={52}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey="property"
                stackId="a"
                fill="#3b82f6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="assault"
                stackId="a"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Month pattern */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Crime Volume by Month (All Years Combined)
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {MONTH_NAMES.map((name) => {
            const entry = monthlyData.find((m) => m.month === name);
            const max = Math.max(...monthlyData.map((m) => m.crimes), 1);
            const intensity = entry ? entry.crimes / max : 0;
            return (
              <div
                key={name}
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className="w-full rounded-md transition-all duration-500"
                  style={{
                    height: "40px",
                    backgroundColor: `rgba(59,130,246,${0.1 + intensity * 0.85})`,
                  }}
                  title={`${name}: ${Number(entry?.crimes ?? 0).toLocaleString()}`}
                />
                <span className="text-xs text-muted-foreground">{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── By Severity Tab ──────────────────────────────────────────

function BySeverity() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Severity data is static/computed — simulate brief load
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingState />;

  // Build severity data from known crime types using the mock static structure
  // (real severity breakdown by type isn't a single endpoint, so we use static weights + category data)
  const severityGroups = [
    {
      band: "Critical",
      color: "#ef4444",
      types: ["murder", "rape", "robbery_gang_armed"],
      desc: "Life-threatening or violent felonies",
    },
    {
      band: "High",
      color: "#f97316",
      types: [
        "robbery_solo_armed",
        "robbery_gang_unarmed",
        "robbery_solo_unarmed",
        "causing_injury",
      ],
      desc: "Serious violent or armed offences",
    },
    {
      band: "Medium",
      color: "#f59e0b",
      types: ["break_in", "theft_vehicle_motorcar", "theft_vehicle_lorry"],
      desc: "Property crimes with significant loss",
    },
    {
      band: "Low",
      color: "#10b981",
      types: ["theft_vehicle_motorcycle", "theft_other"],
      desc: "Petty theft and minor property offences",
    },
  ];

  // Radar data using severity weights
  const crimeTypeEntries = Object.entries(SEVERITY_WEIGHT).map(
    ([type, weight]) => ({
      type: capitalize(type).split(" ").slice(0, 2).join(" "),
      severity: weight,
      band: getSeverityBand(weight).label,
      color: getSeverityBand(weight).color,
    }),
  );

  // Group counts for radar (aggregate weights by category for a compact radar)
  const radarData = [
    { subject: "Assault", A: 10 },
    { subject: "Robbery", A: 8 },
    { subject: "Break-in", A: 4 },
    { subject: "Vehicle\nTheft", A: 3 },
    { subject: "Petty\nTheft", A: 1 },
    { subject: "Rape", A: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* Severity Band Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {severityGroups.map((group) => (
          <div
            key={group.band}
            className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <span
                className="text-sm font-bold"
                style={{ color: group.color }}
              >
                {group.band}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {group.desc}
            </p>
            <div className="space-y-1 pt-1">
              {group.types.map((t) => (
                <span
                  key={t}
                  className="block text-xs font-medium text-foreground/70 truncate"
                >
                  • {capitalize(t)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Severity weight horizontal bar */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Crime Type Severity Index
        </p>
        <div className="space-y-2">
          {crimeTypeEntries
            .sort((a, b) => b.severity - a.severity)
            .map((entry) => (
              <div key={entry.type} className="flex items-center gap-3">
                <span className="text-xs text-foreground/70 w-28 shrink-0 truncate">
                  {entry.type}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(entry.severity / 10) * 100}%`,
                      backgroundColor: entry.color,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-bold w-14 text-right shrink-0"
                  style={{ color: entry.color }}
                >
                  {entry.band}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Radar Chart */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Relative Severity by Crime Category
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={radarData}
              margin={{ top: 8, right: 32, bottom: 8, left: 32 }}
            >
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <Radar
                name="Severity"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(val: any) => [val, "Severity Score"]}
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend note */}
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">ℹ Severity Index:</span> Scores are
          based on standardised criminological severity weights (1 = least
          severe, 10 = most severe). These ratings are used for resource
          prioritisation and are not a reflection of case resolution rates.
        </p>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

export function DetailedAnalytics() {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ChartBarBig className="h-5 w-5 text-blue-600" /> Detailed Analytics
        </CardTitle>

        <CardDescription>
          Explore crime data across districts, time periods, and severity levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="district" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="district" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              By District
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              By Time
            </TabsTrigger>
            <TabsTrigger value="severity" className="flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              By Severity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="district" className="mt-0">
            <ByDistrict />
          </TabsContent>

          <TabsContent value="time" className="mt-0">
            <ByTime />
          </TabsContent>

          <TabsContent value="severity" className="mt-0">
            <BySeverity />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
