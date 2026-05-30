import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CrimeTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crime Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md m-6">
        <p className="text-muted-foreground italic">Crime trend chart will be rendered here</p>
      </CardContent>
    </Card>
  );
}
