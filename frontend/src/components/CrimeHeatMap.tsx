import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CrimeHeatMap() {
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Crime Heat Map</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[300px] bg-muted/50 rounded-md m-6">
        <p className="text-muted-foreground italic">Heat map visualization will be rendered here</p>
      </CardContent>
    </Card>
  );
}
