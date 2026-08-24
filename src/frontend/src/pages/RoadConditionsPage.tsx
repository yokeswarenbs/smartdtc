import { Layout } from "@/components/Layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { demoRoadConditions, demoRoutes } from "@/data/demoData";
import { cn } from "@/lib/utils";
import { ShieldAlert, TriangleAlert } from "lucide-react";

const severityVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Low: "secondary",
  Moderate: "outline",
  High: "default",
  Critical: "destructive",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  Open: "secondary",
  Monitoring: "default",
  Closed: "destructive",
};

function severityDot(severity: string) {
  return cn(
    "size-2 shrink-0 rounded-full",
    severity === "Low" && "bg-chart-2",
    severity === "Moderate" && "bg-chart-4",
    severity === "High" && "bg-chart-5",
    severity === "Critical" && "bg-destructive",
  );
}

export function RoadConditionsPage() {
  const activeConditions = demoRoadConditions.filter(
    (c) => c.status !== "Closed",
  );
  const critical = demoRoadConditions.filter((c) => c.severity === "Critical");

  return (
    <Layout title="Road Conditions" crumbs={[{ label: "Road Conditions" }]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card data-ocid="road_summary.active">
          <CardHeader className="pb-2">
            <CardDescription>Active Conditions</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {activeConditions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              of {demoRoadConditions.length} reported
            </p>
          </CardContent>
        </Card>
        <Card data-ocid="road_summary.critical">
          <CardHeader className="pb-2">
            <CardDescription>Critical Alerts</CardDescription>
            <CardTitle className="text-3xl font-semibold text-destructive">
              {critical.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              require immediate attention
            </p>
          </CardContent>
        </Card>
        <Card data-ocid="road_summary.routes">
          <CardHeader className="pb-2">
            <CardDescription>Routes Affected</CardDescription>
            <CardTitle className="text-3xl font-semibold">
              {new Set(demoRoadConditions.map((c) => c.route)).size}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">across the network</p>
          </CardContent>
        </Card>
      </div>

      {critical.length > 0 && (
        <Alert
          variant="destructive"
          className="mt-4"
          data-ocid="road_critical_alert"
        >
          <TriangleAlert className="size-4" />
          <AlertTitle>Critical conditions detected</AlertTitle>
          <AlertDescription>
            {critical.map((c) => c.location).join(", ")} — affected routes are
            being rerouted.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-4 text-muted-foreground" />
            Reported Conditions
            <Badge variant="secondary">Demo Data</Badge>
          </CardTitle>
          <CardDescription>
            Live road condition reports mapped to the routes they affect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Reported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoRoadConditions.map((condition) => (
                <TableRow
                  key={condition.id}
                  data-ocid={`road_row.${condition.id}`}
                >
                  <TableCell className="font-medium">
                    {condition.location}
                  </TableCell>
                  <TableCell className="font-mono">{condition.route}</TableCell>
                  <TableCell>{condition.type}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={severityDot(condition.severity)} />
                      <Badge variant={severityVariant[condition.severity]}>
                        {condition.severity}
                      </Badge>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[condition.status]}>
                      {condition.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(condition.reportedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Route Status Overview
            <Badge variant="secondary">Demo Data</Badge>
          </CardTitle>
          <CardDescription>
            Which routes currently have active conditions reported against them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {demoRoutes.map((route) => {
              const conditions = demoRoadConditions.filter(
                (c) => c.route === route.code,
              );
              const hasActive = conditions.some((c) => c.status !== "Closed");
              return (
                <Card
                  key={route.id}
                  className="gap-0"
                  data-ocid={`route_condition.${route.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="font-mono text-sm">
                        {route.code}
                      </CardTitle>
                      <Badge variant={hasActive ? "default" : "secondary"}>
                        {hasActive ? "Affected" : "Clear"}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {route.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    {conditions.length > 0 ? (
                      <ul className="space-y-1.5">
                        {conditions.map((c) => (
                          <li
                            key={c.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className={severityDot(c.severity)} />
                            <span className="min-w-0 truncate text-muted-foreground">
                              {c.type} · {c.location}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No conditions reported.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
