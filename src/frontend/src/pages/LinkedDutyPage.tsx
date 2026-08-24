import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { demoBuses, demoCrew, demoDuties, demoRoutes } from "@/data/demoData";
import type { Duty } from "@/types";
import {
  Bus,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const SHIFTS = ["Morning", "Day", "Evening", "Night"] as const;
const MIN_REST_MINUTES = 8 * 60;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function hasOverlap(name: string, start: string, end: string): boolean {
  const s = toMinutes(start);
  const e = toMinutes(end);
  return demoDuties.some(
    (d) =>
      d.crewMember === name &&
      toMinutes(d.startTime) < e &&
      toMinutes(d.endTime) > s,
  );
}

function hasSufficientRest(name: string, start: string): boolean {
  const s = toMinutes(start);
  const priorEnds = demoDuties
    .filter((d) => d.crewMember === name && toMinutes(d.endTime) <= s)
    .map((d) => toMinutes(d.endTime));
  if (priorEnds.length === 0) return true;
  return s - Math.max(...priorEnds) >= MIN_REST_MINUTES;
}

interface AvailabilityItem {
  label: string;
  ok: boolean;
  detail: string;
}

export function LinkedDutyPage() {
  const [date, setDate] = useState("2026-08-25");
  const [shift, setShift] = useState<string>(SHIFTS[0]);
  const [routeId, setRouteId] = useState("");
  const [busId, setBusId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [preview, setPreview] = useState<Duty | null>(null);

  const bus = demoBuses.find((b) => b.id === busId);
  const driver = demoCrew.find((c) => c.id === driverId);
  const conductor = demoCrew.find((c) => c.id === conductorId);
  const route = demoRoutes.find((r) => r.id === routeId);

  const availability = useMemo<AvailabilityItem[]>(() => {
    const items: AvailabilityItem[] = [];
    if (bus) {
      const ok = bus.status === "Available";
      items.push({
        label: "Bus available",
        ok,
        detail: ok
          ? `${bus.registration} is ready for dispatch`
          : `${bus.registration} is ${bus.status.toLowerCase()}`,
      });
    }
    if (driver) {
      const overlap = hasOverlap(driver.name, startTime, endTime);
      const ok = driver.status === "Off Duty" && !overlap;
      items.push({
        label: "Driver available",
        ok,
        detail: ok
          ? `${driver.name} is free for this window`
          : overlap
            ? `${driver.name} has an overlapping duty`
            : `${driver.name} is ${driver.status.toLowerCase()}`,
      });
    }
    if (conductor) {
      const overlap = hasOverlap(conductor.name, startTime, endTime);
      const ok = conductor.status === "Off Duty" && !overlap;
      items.push({
        label: "Conductor available",
        ok,
        detail: ok
          ? `${conductor.name} is free for this window`
          : overlap
            ? `${conductor.name} has an overlapping duty`
            : `${conductor.name} is ${conductor.status.toLowerCase()}`,
      });
    }
    if (driver) {
      const rest = hasSufficientRest(driver.name, startTime);
      items.push({
        label: "Rest satisfied",
        ok: rest,
        detail: rest
          ? `${driver.name} meets the ${MIN_REST_MINUTES / 60}h rest rule`
          : `${driver.name} needs more rest before this duty`,
      });
    }
    return items;
  }, [bus, driver, conductor, startTime, endTime]);

  const allChecksPass =
    availability.length > 0 && availability.every((a) => a.ok);

  const handleGenerate = () => {
    if (!routeId || !busId || !driverId || !conductorId) {
      toast.error("Complete the form", {
        description:
          "Select a route, bus, driver and conductor to generate a duty.",
      });
      return;
    }
    if (toMinutes(endTime) <= toMinutes(startTime)) {
      toast.error("Invalid time range", {
        description: "End time must be after start time.",
      });
      return;
    }

    const linkedCount = demoDuties.filter((d) => d.type === "Linked").length;
    const code = `LD-${String(linkedCount + 1).padStart(3, "0")}`;
    const duty: Duty = {
      id: `duty-${Date.now()}`,
      code,
      type: "Linked",
      crewMember: driver!.name,
      bus: bus!.registration,
      route: route!.code,
      startTime,
      endTime,
      status: "Scheduled",
    };
    setPreview(duty);

    if (allChecksPass) {
      toast.success("Duty generated", {
        description: `${code} scheduled for ${route!.code} on ${date}.`,
      });
    } else {
      const failed = availability.filter((a) => !a.ok);
      toast.warning("Duty generated with warnings", {
        description: failed.map((f) => f.label).join(", "),
      });
    }
  };

  return (
    <Layout
      title="Linked Duty"
      crumbs={[{ label: "Scheduling" }, { label: "Linked Duty" }]}
    >
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Generate Linked Duty
              <Badge variant="secondary">Demo Data</Badge>
            </CardTitle>
            <CardDescription>
              A single crew stays with one bus for the full shift. Fields are
              seeded from the demo data module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="duty-date">Date</Label>
                <Input
                  id="duty-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-ocid="duty.date"
                />
              </div>
              <div className="grid gap-2">
                <Label>Shift</Label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger data-ocid="duty.shift">
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Route</Label>
                <Select value={routeId} onValueChange={setRouteId}>
                  <SelectTrigger data-ocid="duty.route">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoRoutes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.code} · {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Bus</Label>
                <Select value={busId} onValueChange={setBusId}>
                  <SelectTrigger data-ocid="duty.bus">
                    <SelectValue placeholder="Select bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoBuses.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.registration} · {b.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Driver</Label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger data-ocid="duty.driver">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoCrew
                      .filter((c) => c.role === "Driver")
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {c.status}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Conductor</Label>
                <Select value={conductorId} onValueChange={setConductorId}>
                  <SelectTrigger data-ocid="duty.conductor">
                    <SelectValue placeholder="Select conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoCrew
                      .filter((c) => c.role === "Conductor")
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {c.status}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duty-start">Start Time</Label>
                <Input
                  id="duty-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  data-ocid="duty.start_time"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duty-end">End Time</Label>
                <Input
                  id="duty-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  data-ocid="duty.end_time"
                />
              </div>
            </div>
            <Button
              className="mt-6 w-full sm:w-auto"
              onClick={handleGenerate}
              data-ocid="duty.generate_button"
            >
              Generate Duty
            </Button>
          </CardContent>
        </Card>

        {/* Availability + preview */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-primary" />
                Availability Check
              </CardTitle>
              <CardDescription>
                Live evaluation of the current selections.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {availability.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Select a bus, driver and conductor to run the availability
                  check.
                </p>
              ) : (
                availability.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-md border p-3"
                    data-ocid={`duty.check.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
                  >
                    {item.ok ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                    ) : (
                      <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {preview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Duty Preview
                  <Badge variant="secondary">{preview.code}</Badge>
                </CardTitle>
                <CardDescription>
                  Review the generated assignment before publishing.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="font-mono">
                    {preview.startTime} – {preview.endTime}
                  </span>
                  <span className="text-muted-foreground">· {shift} shift</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="font-mono">{preview.route}</span>
                  <span className="text-muted-foreground">· {date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bus className="size-4 text-muted-foreground" />
                  <span className="font-mono">{preview.bus}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="size-4 text-muted-foreground" />
                  <span>{preview.crewMember}</span>
                  <span className="text-muted-foreground">
                    · {conductor?.name}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant="secondary">{preview.status}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
