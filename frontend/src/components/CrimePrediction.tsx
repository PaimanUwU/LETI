import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

export function CrimePrediction() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Predictive Analytics</CardTitle>
        <CardDescription>AI-powered crime prediction for the next 30 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-background rounded-lg border border-primary/10">
          <h4 className="font-semibold mb-2">Likely Hotspots</h4>
          <p className="text-sm text-muted-foreground">Based on historical data and current trends, high-risk areas identified: Kuala Lumpur, Petaling Jaya, Johor Bahru.</p>
        </div>
        <Button className="w-full">Generate Detailed Prediction Report</Button>
      </CardContent>
    </Card>
  );
}
