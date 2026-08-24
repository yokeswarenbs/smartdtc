import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  demoBuses,
  demoCrew,
  demoDuties,
  demoRoutes,
  demoStats,
} from "@/data/demoData";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  buses: {
    label: "Buses",
    color: "oklch(var(--chart-1))",
  },
} satisfies ChartConfig;

const routeChartData = demoRoutes.map((route) => ({
  route: route.code,
  buses: demoBuses.filter((b) => b.currentRoute === route.code).length,
}));

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  "On Route": "default",
  Available: "secondary",
  Maintenance: "outline",
  "Out of Service": "destructive",
};

const dutyStatusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Scheduled: "secondary",
  "In Progress": "default",
  Completed: "outline",
  Cancelled: "destructive",
};

const summaryCards = [
  {
    label: "Fleet Utilization",
    value: `${Math.round((demoStats.activeBuses / demoStats.totalBuses) * 100)}%`,
    sub: `${demoStats.activeBuses} of ${demoStats.totalBuses} buses active`,
  },
  {
    label: "Crew Utilization",
    value: `${Math.round((demoStats.crewOnDuty / demoStats.totalCrew) * 100)}%`,
    sub: `${demoStats.crewOnDuty} of ${demoStats.totalCrew} on duty`,
  },
  {
    label: "Route Coverage",
    value: `${Math.round((demoStats.activeRoutes / demoStats.totalRoutes) * 100)}%`,
    sub: `${demoStats.activeRoutes} of ${demoStats.totalRoutes} routes active`,
  },
  {
    label: "On-Time Rate",
    value: `${demoStats.onTimeRate}%`,
    sub: "last 7 days",
  },
];

export function ReportsPage() {
  return (
    <Layout title="Reports" crumbs={[{ label: "Reports" }]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((stat) => (
          <Card
            key={stat.label}
            data-ocid={`report_stat.${stat.label.toLowerCase().replace(/\s+/g, "_")}`}
          >
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Buses Assigned by Route
            <Badge variant="secondary">Demo Data</Badge>
          </CardTitle>
          <CardDescription>
            Current distribution of active buses across the route network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={routeChartData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="route"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="buses" fill="var(--color-buses)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Fleet Status
              <Badge variant="secondary">Demo Data</Badge>
            </CardTitle>
            <CardDescription>
              Breakdown of buses by current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Fuel</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoBuses.map((bus) => (
                  <TableRow key={bus.id} data-ocid={`report_bus.${bus.id}`}>
                    <TableCell className="font-mono font-medium">
                      {bus.registration}
                    </TableCell>
                    <TableCell>{bus.model}</TableCell>
                    <TableCell className="text-right">
                      {bus.fuelLevel}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={statusVariant[bus.status]}>
                        {bus.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Duty Summary
              <Badge variant="secondary">Demo Data</Badge>
            </CardTitle>
            <CardDescription>
              All scheduled and active duties across the network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Crew</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoDuties.map((duty) => (
                  <TableRow key={duty.id} data-ocid={`report_duty.${duty.id}`}>
                    <TableCell className="font-mono font-medium">
                      {duty.code}
                    </TableCell>
                    <TableCell>{duty.type}</TableCell>
                    <TableCell>{duty.crewMember}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={dutyStatusVariant[duty.status]}>
                        {duty.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
