import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { demoCrew, demoDuties } from "@/data/demoData";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

type CrewRole = "Driver" | "Conductor";
type CrewStatus =
  | "Available"
  | "Assigned"
  | "Resting"
  | "Off Duty"
  | "On Leave";
type Shift = "Morning" | "Evening" | "Night";

interface CrewRecord {
  id: string;
  name: string;
  role: CrewRole;
  shift: Shift;
  status: CrewStatus;
  bus: string | null;
  dutyTime: string;
  restUntil: string;
  contact: string;
}

const statusStyle: Record<CrewStatus, string> = {
  Available: "border-transparent bg-success text-success-foreground",
  Assigned: "border-transparent bg-info text-info-foreground",
  Resting: "border-transparent bg-warning text-warning-foreground",
  "Off Duty": "border-transparent bg-muted text-muted-foreground",
  "On Leave": "border-transparent bg-accent text-accent-foreground",
};

const roleStyle: Record<CrewRole, string> = {
  Driver: "border-transparent bg-primary text-primary-foreground",
  Conductor: "border-transparent bg-secondary text-secondary-foreground",
};

const shiftOrder: Shift[] = ["Morning", "Evening", "Night"];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function seedCrew(): CrewRecord[] {
  return demoCrew.map((member, i) => {
    const duty = demoDuties.find((d) => d.crewMember === member.name);
    const status: CrewStatus =
      member.status === "On Duty"
        ? "Assigned"
        : member.status === "On Leave"
          ? "On Leave"
          : "Off Duty";
    return {
      id: member.id,
      name: member.name,
      role: member.role === "Driver" ? "Driver" : "Conductor",
      shift: shiftOrder[i % shiftOrder.length],
      status,
      bus: member.assignedBus,
      dutyTime: duty ? `${duty.startTime} – ${duty.endTime}` : "—",
      restUntil: status === "On Leave" ? "Tomorrow 06:00" : "—",
      contact: member.contact,
    };
  });
}

const emptyForm: Omit<CrewRecord, "id"> = {
  name: "",
  role: "Driver",
  shift: "Morning",
  status: "Available",
  bus: null,
  dutyTime: "",
  restUntil: "",
  contact: "",
};

export function CrewPage() {
  const [crew, setCrew] = useState<CrewRecord[]>(seedCrew);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | CrewRole>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | CrewStatus>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CrewRecord | null>(null);
  const [form, setForm] = useState<Omit<CrewRecord, "id">>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return crew.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.bus ?? "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "All" || m.role === roleFilter;
      const matchesStatus = statusFilter === "All" || m.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [crew, search, roleFilter, statusFilter]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(member: CrewRecord) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role,
      shift: member.shift,
      status: member.status,
      bus: member.bus,
      dutyTime: member.dutyTime,
      restUntil: member.restUntil,
      contact: member.contact,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.dutyTime.trim()) next.dutyTime = "Duty time is required.";
    if (form.status === "Assigned" && !form.bus) {
      next.bus = "Assign a bus for an Assigned crew member.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    if (editingId) {
      setCrew((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...form } : m)),
      );
    } else {
      const id = `crew-${Date.now()}`;
      setCrew((prev) => [...prev, { ...form, id }]);
    }
    setModalOpen(false);
  }

  return (
    <Layout title="Crew" crumbs={[{ label: "Crew" }]}>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              Crew Roster
              <Badge variant="secondary">Demo Data</Badge>
            </CardTitle>
            <CardDescription>
              {crew.length} drivers and conductors across the network.
            </CardDescription>
          </div>
          <Button
            data-ocid="crew.add_button"
            onClick={openAdd}
            className="shrink-0"
          >
            <Plus className="size-4" />
            Add Crew
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                data-ocid="crew.search_input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID or bus…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v as "All" | CrewRole)}
              >
                <SelectTrigger
                  data-ocid="crew.filter.role"
                  className="w-36"
                  aria-label="Filter by role"
                >
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All roles</SelectItem>
                  <SelectItem value="Driver">Driver</SelectItem>
                  <SelectItem value="Conductor">Conductor</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as "All" | CrewStatus)}
              >
                <SelectTrigger
                  data-ocid="crew.filter.status"
                  className="w-40"
                  aria-label="Filter by status"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="Resting">Resting</SelectItem>
                  <SelectItem value="Off Duty">Off Duty</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table data-ocid="crew.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Crew ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Duty Time</TableHead>
                  <TableHead>Rest Until</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No crew members match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((member, i) => (
                    <TableRow
                      key={member.id}
                      data-ocid={`crew.row.${i + 1}`}
                      className="cursor-pointer"
                      onClick={() => setDetail(member)}
                    >
                      <TableCell className="font-mono text-xs">
                        {member.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-secondary text-xs">
                              {initials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleStyle[member.role]}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.shift}</TableCell>
                      <TableCell>
                        <Badge className={statusStyle[member.status]}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {member.bus ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {member.dutyTime}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {member.restUntil}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-ocid={`crew.edit_button.${i + 1}`}
                          aria-label={`Edit ${member.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(member);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="crew.modal" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Crew Member" : "Add Crew Member"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the crew member's details below."
                : "Fill in the details to add a new crew member."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="crew-name">Name</Label>
              <Input
                id="crew-name"
                data-ocid="crew.input.name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ravi Kumar"
              />
              {errors.name && (
                <p
                  data-ocid="crew.error.name"
                  className="text-destructive text-xs"
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm({ ...form, role: v as CrewRole })
                  }
                >
                  <SelectTrigger data-ocid="crew.input.role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Driver">Driver</SelectItem>
                    <SelectItem value="Conductor">Conductor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Shift</Label>
                <Select
                  value={form.shift}
                  onValueChange={(v) => setForm({ ...form, shift: v as Shift })}
                >
                  <SelectTrigger data-ocid="crew.input.shift">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as CrewStatus })
                  }
                >
                  <SelectTrigger data-ocid="crew.input.status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="Resting">Resting</SelectItem>
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Bus</Label>
                <Input
                  data-ocid="crew.input.bus"
                  value={form.bus ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bus: e.target.value || null,
                    })
                  }
                  placeholder="e.g. KA-01-AB-1234"
                />
                {errors.bus && (
                  <p
                    data-ocid="crew.error.bus"
                    className="text-destructive text-xs"
                  >
                    {errors.bus}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="crew-duty">Duty Time</Label>
                <Input
                  id="crew-duty"
                  data-ocid="crew.input.duty_time"
                  value={form.dutyTime}
                  onChange={(e) =>
                    setForm({ ...form, dutyTime: e.target.value })
                  }
                  placeholder="e.g. 06:00 – 14:00"
                />
                {errors.dutyTime && (
                  <p
                    data-ocid="crew.error.duty_time"
                    className="text-destructive text-xs"
                  >
                    {errors.dutyTime}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="crew-rest">Rest Until</Label>
                <Input
                  id="crew-rest"
                  data-ocid="crew.input.rest_until"
                  value={form.restUntil}
                  onChange={(e) =>
                    setForm({ ...form, restUntil: e.target.value })
                  }
                  placeholder="e.g. Tomorrow 06:00"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="crew-contact">Contact</Label>
              <Input
                id="crew-contact"
                data-ocid="crew.input.contact"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="e.g. +91 98450 12345"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="crew.cancel_button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button data-ocid="crew.submit_button" onClick={handleSubmit}>
              {editingId ? "Save Changes" : "Add Crew"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent data-ocid="crew.detail" className="sm:max-w-md">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-secondary text-sm">
                      {initials(detail.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-base">
                      {detail.name}
                    </DialogTitle>
                    <DialogDescription className="font-mono text-xs">
                      {detail.id} · {detail.role}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={roleStyle[detail.role]}>
                    {detail.role}
                  </Badge>
                  <Badge className={statusStyle[detail.status]}>
                    {detail.status}
                  </Badge>
                  <Badge variant="secondary">{detail.shift} shift</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="text-muted-foreground text-xs">
                      Current Assignment
                    </p>
                    <p className="mt-1 font-medium">
                      {detail.bus ?? "Unassigned"}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {detail.dutyTime}
                    </p>
                  </div>
                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="text-muted-foreground text-xs">Rest Until</p>
                    <p className="mt-1 font-medium">{detail.restUntil}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {detail.contact}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                    <UserRound className="size-4" />
                    Duty History
                  </p>
                  <div className="space-y-2">
                    {demoDuties
                      .filter((d) => d.crewMember === detail.name)
                      .map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                        >
                          <span className="font-mono text-xs">{d.code}</span>
                          <span className="text-muted-foreground">
                            {d.route} · {d.startTime}–{d.endTime}
                          </span>
                          <Badge variant="secondary">{d.status}</Badge>
                        </div>
                      ))}
                    {demoDuties.filter((d) => d.crewMember === detail.name)
                      .length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        No duty history recorded.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  data-ocid="crew.detail_close"
                  onClick={() => setDetail(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
