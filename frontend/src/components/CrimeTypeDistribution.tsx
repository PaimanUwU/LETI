import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CrimeTypeDistribution() {
  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Crime Type Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[300px] bg-muted/50 rounded-md m-6">
        <p className="text-muted-foreground italic">Distribution chart will be rendered here</p>
      </CardContent>
    </Card>
  );
}
