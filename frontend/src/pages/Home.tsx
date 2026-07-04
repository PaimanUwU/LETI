import { CrimeHeatMap } from "../components/CrimeHeatMap";
import { CrimeTrendChart } from "../components/CrimeTrendChart";
import { CrimeTypeDistribution } from "../components/CrimeTypeDistribution";
import { CrimeStatCards } from "../components/CrimeStatCards";
import { CrimePrediction } from "../components/CrimePrediction";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Crime Intelligence Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time crime statistics and predictive analytics for Malaysia
        </p>
      </div>

      {/* Summary Cards */}
      <CrimeStatCards />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heat Map - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <CrimeHeatMap />
        </div>

        {/* Crime Type Distribution */}
        <div className="lg:col-span-1">
          <CrimeTypeDistribution />
        </div>
      </div>

      {/* Crime Trend Chart */}
      <CrimeTrendChart />

      {/* Crime Prediction Section */}
      <div id="prediction">
        <CrimePrediction />
      </div>

      {/* Additional Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
          <CardDescription>
            Explore crime data by different dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="district" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="district">By District</TabsTrigger>
              <TabsTrigger value="time">By Time</TabsTrigger>
              <TabsTrigger value="severity">By Severity</TabsTrigger>
            </TabsList>
            <TabsContent value="district" className="mt-4">
              <div className="text-sm text-muted-foreground">
                District-level crime analysis will be displayed here
              </div>
            </TabsContent>
            <TabsContent value="time" className="mt-4">
              <div className="text-sm text-muted-foreground">
                Time-based crime patterns will be displayed here
              </div>
            </TabsContent>
            <TabsContent value="severity" className="mt-4">
              <div className="text-sm text-muted-foreground">
                Crime severity analysis will be displayed here
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
