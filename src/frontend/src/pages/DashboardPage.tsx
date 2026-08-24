import { DutyTable } from "@/components/DutyTable";
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
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DEMO_DATA_LABEL,
  demoAlerts,
  demoBuses,
  demoCrew,
  demoDuties,
  demoRoutes,
} from "@/data/demoData";
import type { AlertSeverity } from "@/types";
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  CircleDot,
  Info,
  MapPin,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts";

// ---------------------------------------------------------------------------
// KPI stat cards
// ---------------------------------------------------------------------------

const busStatusCounts = {
  available: demoBuses.filter((b) => b.status === "Available").length,
  inService: demoBuses.filter((b) => b.status === "On Route").length,
  maintenance: demoBuses.filter((b) => b.status === "Maintenance").length,
};

const crewStatusCounts = {
  onDuty: demoCrew.filter((c) => c.status === "On Duty").length,
  resting: demoCrew.filter((c) => c.status === "Off Duty").length,
};

const statCards = [
  {
    label: "Total Buses",
    value: `${demoBuses.length}`,
    sub: "fleet registered",
    icon: Bus,
    tone: "text-primary",
  },
  {
    label: "Available",
    value: `${busStatusCounts.available}`,
    sub: "ready for dispatch",
    icon: CircleDot,
    tone: "text-success",
  },
  {
    label: "In Service",
    value: `${busStatusCounts.inService}`,
    sub: "on route now",
    icon: MapPin,
    tone: "text-info",
  },
  {
    label: "Maintenance",
    value: `${busStatusCounts.maintenance}`,
    sub: "in workshop",
    icon: Wrench,
    tone: "text-warning",
  },
  {
    label: "Total Crew",
    value: `${demoCrew.length}`,
    sub: "drivers & staff",
    icon: Users,
    tone: "text-primary",
  },
  {
    label: "Available Crew",
    value: `${crewStatusCounts.onDuty}`,
    sub: "on duty now",
    icon: CheckCircle2,
    tone: "text-success",
  },
  {
    label: "Resting",
    value: `${crewStatusCounts.resting}`,
    sub: "off duty / leave",
    icon: CircleDot,
    tone: "text-muted-foreground",
  },
  {
    label: "Active Routes",
    value: `${demoRoutes.filter((r) => r.status === "Active").length}`,
    sub: `of ${demoRoutes.length} total`,
    icon: MapPin,
    tone: "text-info",
  },
];

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

const busUtilizationConfig = {
  inService: { label: "In Service", color: "oklch(var(--chart-1))" },
  available: { label: "Available", color: "oklch(var(--chart-2))" },
  maintenance: { label: "Maintenance", color: "oklch(var(--chart-4))" },
  outOfService: { label: "Out of Service", color: "oklch(var(--chart-5))" },
};

const busUtilizationData = [
  {
    name: "In Service",
    value: busStatusCounts.inService,
    fill: "var(--color-inService)",
  },
  {
    name: "Available",
    value: busStatusCounts.available,
    fill: "var(--color-available)",
  },
  {
    name: "Maintenance",
    value: busStatusCounts.maintenance,
    fill: "var(--color-maintenance)",
  },
  {
    name: "Out of Service",
    value: demoBuses.filter((b) => b.status === "Out of Service").length,
    fill: "var(--color-outOfService)",
  },
];

const crewStatusConfig = {
  onDuty: { label: "On Duty", color: "oklch(var(--chart-3))" },
  resting: { label: "Resting", color: "oklch(var(--chart-4))" },
  leave: { label: "On Leave", color: "oklch(var(--chart-5))" },
};

const crewStatusData = [
  {
    status: "Crew",
    onDuty: crewStatusCounts.onDuty,
    resting: crewStatusCounts.resting,
    leave: demoCrew.filter((c) => c.status === "On Leave").length,
  },
];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

const severityVariant: Record<
  AlertSeverity,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Critical: "destructive",
  Warning: "secondary",
  Info: "outline",
};

const severityIcon: Record<AlertSeverity, typeof Info> = {
  Critical: ShieldAlert,
  Warning: AlertTriangle,
  Info: Info,
};

const severityTone: Record<AlertSeverity, string> = {
  Critical: "text-destructive",
  Warning: "text-warning",
  Info: "text-info",
};

export function DashboardPage() {
  return (
    <Layout title="Dashboard" crumbs={[{ label: "Dashboard" }]}>
      <div className="flex flex-col gap-6">
        {/* KPI stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                data-ocid={`stat_card.${stat.label.toLowerCase().replace(/\s+/g, "_")}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <Icon className={`h-4 w-4 ${stat.tone}`} />
                </CardHeader>
                <CardContent>
                  <CardTitle className="font-mono text-3xl font-semibold tabular-nums">
                    {stat.value}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.sub}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card data-ocid="chart.bus_utilization">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Bus Utilization
                <Badge variant="secondary">{DEMO_DATA_LABEL}</Badge>
              </CardTitle>
              <CardDescription>Fleet status across the network</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={busUtilizationConfig}
                className="mx-auto aspect-square max-h-[260px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={busUtilizationData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={4}
                  >
                    {busUtilizationData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="flex-wrap"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card data-ocid="chart.crew_status">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Crew Status
                <Badge variant="secondary">{DEMO_DATA_LABEL}</Badge>
              </CardTitle>
              <CardDescription>
                Duty state of the current crew roster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={crewStatusConfig}
                className="aspect-auto h-[260px] w-full"
              >
                <BarChart data={crewStatusData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="status"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="onDuty"
                    stackId="crew"
                    fill="var(--color-onDuty)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="resting"
                    stackId="crew"
                    fill="var(--color-resting)"
                  />
                  <Bar
                    dataKey="leave"
                    stackId="crew"
                    fill="var(--color-leave)"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    className="flex-wrap"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Schedule + alerts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2" data-ocid="panel.today_schedule">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Today's Schedule
                <Badge variant="secondary">{DEMO_DATA_LABEL}</Badge>
              </CardTitle>
              <CardDescription>
                Active duties currently on the roster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DutyTable duties={demoDuties} />
            </CardContent>
          </Card>

          <Card data-ocid="panel.alerts">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Operational Alerts
                <Badge variant="secondary">{DEMO_DATA_LABEL}</Badge>
              </CardTitle>
              <CardDescription>Issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {demoAlerts.map((alert, index) => {
                const Icon = severityIcon[alert.severity];
                return (
                  <div
                    key={alert.id}
                    data-ocid={`alert.item.${index + 1}`}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${severityTone[alert.severity]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {alert.title}
                        </p>
                        <Badge variant={severityVariant[alert.severity]}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
