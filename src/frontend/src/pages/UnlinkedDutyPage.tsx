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
import { Separator } from "@/components/ui/separator";
import { demoCrew, demoDuties, demoRoutes } from "@/data/demoData";
import { cn } from "@/lib/utils";
import { Bus, MapPin, Route as RouteIcon, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface Segment {
  id: string;
  start: string;
  end: string;
  crew: string;
}

interface DutyTimeline {
  dutyId: string;
  bus: string;
  route: string;
  segments: Segment[];
}

const HANDOVER_LOCATIONS = [
  "Central Station Depot",
  "Airport Terminal Bay 4",
  "Tech Park Interchange",
  "City Mall Bus Stand",
  "Railway Station Stand 2",
];

// Seed each unlinked duty with a realistic handover already in place so the
// timeline demonstrates the transfer pattern on first load.
const seedTimelines: DutyTimeline[] = demoDuties
  .filter((d) => d.type === "Unlinked")
  .map((d) => {
    const mid = d.startTime < "14:00" ? "12:00" : "16:00";
    const next = d.startTime < "14:00" ? "12:15" : "16:15";
    const secondCrew =
      d.crewMember === "Mohan Das" ? "Sunita Rao" : "Priya Nair";
    return {
      dutyId: d.id,
      bus: d.bus,
      route: d.route,
      segments: [
        { id: `${d.id}-s1`, start: d.startTime, end: mid, crew: d.crewMember },
        { id: `${d.id}-s2`, start: next, end: d.endTime, crew: secondCrew },
      ],
    };
  });

const TIME_OPTIONS = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

export function UnlinkedDutyPage() {
  const [timelines, setTimelines] = useState<DutyTimeline[]>(seedTimelines);
  const [selectedId, setSelectedId] = useState(seedTimelines[0].dutyId);
  const [crewStatus, setCrewStatus] = useState<Record<string, string>>(() =>
    Object.fromEntries(demoCrew.map((c) => [c.name, c.status])),
  );

  const [oldCrew, setOldCrew] = useState("");
  const [newCrew, setNewCrew] = useState("");
  const [location, setLocation] = useState(HANDOVER_LOCATIONS[0]);
  const [time, setTime] = useState("");

  const timeline = timelines.find((t) => t.dutyId === selectedId)!;
  const route = demoRoutes.find((r) => r.code === timeline.route);

  const oldCrewSegment = useMemo(
    () => timeline.segments.find((s) => s.crew === oldCrew),
    [timeline, oldCrew],
  );

  const availableTimes = useMemo(() => {
    if (!oldCrewSegment) return [];
    return TIME_OPTIONS.filter(
      (t) => t > oldCrewSegment.start && t < oldCrewSegment.end,
    );
  }, [oldCrewSegment]);

  const crewOptions = demoCrew.filter((c) => c.role === "Driver");

  function handleDutyChange(value: string) {
    setSelectedId(value);
    setOldCrew("");
    setNewCrew("");
    setTime("");
  }

  function validate(): string | null {
    if (!oldCrew || !newCrew || !time) {
      return "Please complete all handover fields.";
    }
    if (oldCrew === newCrew) {
      return "Old and new crew must be different.";
    }
    if (!oldCrewSegment) {
      return "The selected crew is not on this duty.";
    }
    if (time <= oldCrewSegment.start || time >= oldCrewSegment.end) {
      return "Handover time must fall within the old crew's duty window.";
    }
    // Overlapping duty: new crew already assigned to another segment on this bus.
    const alreadyOnBus = timeline.segments.some(
      (s) => s.crew === newCrew && s.id !== oldCrewSegment.id,
    );
    if (alreadyOnBus) {
      return `${newCrew} is already assigned to another segment on this bus.`;
    }
    // Rest period / availability: new crew must not be on leave or on duty elsewhere.
    const newCrewMember = demoCrew.find((c) => c.name === newCrew);
    if (newCrewMember?.status === "On Leave") {
      return `${newCrew} is on leave and has not satisfied the rest period.`;
    }
    if (crewStatus[newCrew] === "On Duty" && newCrew !== oldCrew) {
      return `${newCrew} is currently on duty elsewhere and has not satisfied the rest period.`;
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setTimelines((prev) =>
      prev.map((t) => {
        if (t.dutyId !== selectedId) return t;
        const seg = t.segments.find((s) => s.crew === oldCrew)!;
        const originalEnd = seg.end;
        const updated = t.segments.map((s) =>
          s.id === seg.id ? { ...s, end: time } : s,
        );
        const newSegment: Segment = {
          id: `${t.dutyId}-s${Date.now()}`,
          start: time,
          end: originalEnd,
          crew: newCrew,
        };
        const idx = updated.findIndex((s) => s.id === seg.id);
        const next = [...updated];
        next.splice(idx + 1, 0, newSegment);
        return { ...t, segments: next };
      }),
    );

    setCrewStatus((prev) => ({
      ...prev,
      [oldCrew]: "Off Duty",
      [newCrew]: "On Duty",
    }));

    toast.success(
      `Handover complete — ${oldCrew} → ${newCrew} at ${time} (${location}).`,
    );
    setOldCrew("");
    setNewCrew("");
    setTime("");
  }

  return (
    <Layout
      title="Unlinked Duty"
      crumbs={[{ label: "Scheduling" }, { label: "Unlinked Duty" }]}
    >
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                Duty Timeline
                <Badge variant="secondary" data-ocid="demo_data_badge">
                  Demo Data
                </Badge>
              </CardTitle>
              <CardDescription>
                Bus + route duty sequence with crew handover points.
              </CardDescription>
            </div>
            <div className="w-64">
              <Label htmlFor="duty-select" className="mb-1.5 block text-xs">
                Duty
              </Label>
              <Select value={selectedId} onValueChange={handleDutyChange}>
                <SelectTrigger
                  id="duty-select"
                  className="w-full"
                  data-ocid="duty_select"
                >
                  <SelectValue placeholder="Select duty" />
                </SelectTrigger>
                <SelectContent>
                  {demoDuties
                    .filter((d) => d.type === "Unlinked")
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.code} · {d.bus}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 font-mono"
                data-ocid="timeline_bus"
              >
                <Bus className="size-3.5" />
                {timeline.bus}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 font-mono"
                data-ocid="timeline_route"
              >
                <RouteIcon className="size-3.5" />
                {timeline.route}
              </Badge>
              {route && (
                <span className="text-sm text-muted-foreground">
                  {route.name}
                </span>
              )}
            </div>

            <ol className="relative ml-2 border-l-2 border-border pl-6">
              {timeline.segments.map((seg, i) => {
                const isLast = i === timeline.segments.length - 1;
                const crew = demoCrew.find((c) => c.name === seg.crew);
                return (
                  <li key={seg.id} className="relative pb-6 last:pb-0">
                    <span
                      className={cn(
                        "absolute -left-[31px] top-1 size-3 rounded-full border-2 border-background",
                        isLast ? "bg-chart-3" : "bg-primary",
                      )}
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold">
                          {seg.start} – {seg.end}
                        </span>
                        <Badge
                          variant={isLast ? "outline" : "default"}
                          className="gap-1"
                          data-ocid={`timeline_segment.${i}`}
                        >
                          <UserRound className="size-3" />
                          {seg.crew}
                        </Badge>
                        {crew && (
                          <span className="text-xs text-muted-foreground">
                            {crew.badgeNumber} · {crew.role}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isLast && (
                      <div
                        className="mt-3 flex items-center gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-1.5"
                        data-ocid={`handover_point.${i}`}
                      >
                        <MapPin className="size-3.5 text-primary" />
                        <span className="text-xs font-medium">
                          Handover at {seg.end}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {HANDOVER_LOCATIONS[0]}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Crew Handover</CardTitle>
              <CardDescription>
                Transfer the duty to a new crew member at a handover point.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="old-crew">Old Crew</Label>
                    <Select value={oldCrew} onValueChange={setOldCrew}>
                      <SelectTrigger id="old-crew" data-ocid="old_crew_select">
                        <SelectValue placeholder="Select crew" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeline.segments.map((s) => (
                          <SelectItem key={s.id} value={s.crew}>
                            {s.crew}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="new-crew">New Crew</Label>
                    <Select value={newCrew} onValueChange={setNewCrew}>
                      <SelectTrigger id="new-crew" data-ocid="new_crew_select">
                        <SelectValue placeholder="Select crew" />
                      </SelectTrigger>
                      <SelectContent>
                        {crewOptions.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="location">Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger id="location" data-ocid="location_select">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {HANDOVER_LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="time">Time</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger id="time" data-ocid="time_select">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            Select an old crew first
                          </SelectItem>
                        ) : (
                          availableTimes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  data-ocid="handover_submit"
                >
                  Complete Handover
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Crew Status</CardTitle>
              <CardDescription>
                Live availability of drivers on this duty.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {crewOptions.map((c) => {
                  const onTimeline = timeline.segments.some(
                    (s) => s.crew === c.name,
                  );
                  const status = crewStatus[c.name];
                  return (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
                      data-ocid={`crew_status.${c.name}`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {c.name}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.badgeNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {onTimeline && (
                          <Badge variant="outline" className="font-mono">
                            On Bus
                          </Badge>
                        )}
                        <Badge
                          variant={
                            status === "On Duty"
                              ? "default"
                              : status === "On Leave"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                Validation checks crew availability, overlapping duty and rest
                period before a handover is accepted.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
