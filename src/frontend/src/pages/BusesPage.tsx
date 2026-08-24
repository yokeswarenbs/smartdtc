import { Layout } from "@/components/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { demoBuses } from "@/data/demoData";
import { cn } from "@/lib/utils";
import { Bus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type BusStatus =
  | "Available"
  | "In Service"
  | "Maintenance"
  | "Assigned"
  | "Out of Service";

interface BusRow {
  id: string;
  registration: string;
  type: string;
  capacity: number;
  status: BusStatus;
  route: string | null;
  crew: string | null;
}

const STATUSES: BusStatus[] = [
  "Available",
  "In Service",
  "Maintenance",
  "Assigned",
  "Out of Service",
];

const TYPES = Array.from(new Set(demoBuses.map((b) => b.model))).sort();

const statusBadgeClass: Record<BusStatus, string> = {
  Available:
    "bg-[oklch(var(--success))] text-[oklch(var(--success-foreground))]",
  "In Service": "bg-[oklch(var(--info))] text-[oklch(var(--info-foreground))]",
  Maintenance:
    "bg-[oklch(var(--warning))] text-[oklch(var(--warning-foreground))]",
  Assigned: "bg-[oklch(var(--accent))] text-[oklch(var(--accent-foreground))]",
  "Out of Service":
    "bg-[oklch(var(--destructive))] text-[oklch(var(--destructive-foreground))]",
};

function mapDemoStatus(status: string): BusStatus {
  switch (status) {
    case "On Route":
      return "In Service";
    case "Maintenance":
      return "Maintenance";
    case "Out of Service":
      return "Out of Service";
    default:
      return "Available";
  }
}

function seedRows(): BusRow[] {
  return demoBuses.map((b) => ({
    id: b.id,
    registration: b.registration,
    type: b.model,
    capacity: b.capacity,
    status: mapDemoStatus(b.status),
    route: b.currentRoute,
    crew: b.driver,
  }));
}

interface FormState {
  id: string;
  registration: string;
  type: string;
  capacity: string;
  status: BusStatus;
  route: string;
  crew: string;
}

const emptyForm: FormState = {
  id: "",
  registration: "",
  type: "",
  capacity: "",
  status: "Available",
  route: "",
  crew: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function BusesPage() {
  const [rows, setRows] = useState<BusRow[]>(seedRows);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const [deleteTarget, setDeleteTarget] = useState<BusRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !q ||
        row.id.toLowerCase().includes(q) ||
        row.registration.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q) ||
        (row.crew ?? "").toLowerCase().includes(q) ||
        (row.route ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;
      const matchesType = typeFilter === "all" || row.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [rows, search, statusFilter, typeFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (row: BusRow) => {
    setEditingId(row.id);
    setForm({
      id: row.id,
      registration: row.registration,
      type: row.type,
      capacity: String(row.capacity),
      status: row.status,
      route: row.route ?? "",
      crew: row.crew ?? "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.id.trim()) next.id = "Bus ID is required.";
    else if (editingId === null && rows.some((r) => r.id === form.id.trim()))
      next.id = "Bus ID already exists.";
    if (!form.registration.trim())
      next.registration = "Registration is required.";
    if (!form.type.trim()) next.type = "Type is required.";
    const capacity = Number(form.capacity);
    if (!form.capacity.trim()) next.capacity = "Capacity is required.";
    else if (!Number.isFinite(capacity) || capacity < 1 || capacity > 100)
      next.capacity = "Capacity must be between 1 and 100.";
    if (!form.status) next.status = "Status is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const row: BusRow = {
      id: form.id.trim(),
      registration: form.registration.trim(),
      type: form.type.trim(),
      capacity: Number(form.capacity),
      status: form.status,
      route: form.route.trim() || null,
      crew: form.crew.trim() || null,
    };
    if (editingId === null) {
      setRows((prev) => [...prev, row]);
      toast.success(`Bus ${row.id} added to the fleet.`);
    } else {
      setRows((prev) => prev.map((r) => (r.id === editingId ? row : r)));
      toast.success(`Bus ${row.id} updated.`);
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    toast.success(`Bus ${deleteTarget.id} removed from the fleet.`);
    setDeleteTarget(null);
  };

  return (
    <Layout title="Bus Management" crumbs={[{ label: "Buses" }]}>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bus className="size-4 text-muted-foreground" />
              Fleet
              <Badge variant="secondary">Demo Data</Badge>
            </CardTitle>
            <CardDescription>
              {rows.length} buses in the SMARTDTC fleet. Manage bus records,
              status, and assignments.
            </CardDescription>
          </div>
          <Button onClick={openAdd} data-ocid="bus.add_button">
            <Plus className="size-4" />
            Add Bus
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, registration, type, route, or crew…"
                className="pl-9"
                data-ocid="bus.search_input"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                data-ocid="bus.filter.status"
              >
                <SelectTrigger
                  className="w-full sm:w-44"
                  data-ocid="bus.filter.status_trigger"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
                data-ocid="bus.filter.type"
              >
                <SelectTrigger
                  className="w-full sm:w-52"
                  data-ocid="bus.filter.type_trigger"
                >
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center"
              data-ocid="bus.empty_state"
            >
              <Bus className="size-8 text-muted-foreground" />
              <p className="font-medium">No buses found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters, or add a new bus.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={openAdd}
                className="mt-2"
                data-ocid="bus.empty_add_button"
              >
                <Plus className="size-4" />
                Add Bus
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bus ID</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Crew</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row, index) => (
                    <TableRow key={row.id} data-ocid={`bus.row.${index + 1}`}>
                      <TableCell>
                        <span className="font-mono text-xs font-medium">
                          {row.id}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.registration}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {row.type}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.capacity}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border-transparent",
                            statusBadgeClass[row.status],
                          )}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.route ?? "—"}
                      </TableCell>
                      <TableCell>{row.crew ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit bus ${row.id}`}
                            onClick={() => openEdit(row)}
                            data-ocid={`bus.edit_button.${index + 1}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete bus ${row.id}`}
                            onClick={() => setDeleteTarget(row)}
                            className="text-destructive hover:text-destructive"
                            data-ocid={`bus.delete_button.${index + 1}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg" data-ocid="bus.modal">
          <DialogHeader>
            <DialogTitle>
              {editingId === null ? "Add Bus" : `Edit Bus ${editingId}`}
            </DialogTitle>
            <DialogDescription>
              {editingId === null
                ? "Add a new bus to the SMARTDTC fleet."
                : "Update the details for this bus."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bus-id">Bus ID</Label>
              <Input
                id="bus-id"
                value={form.id}
                onChange={(e) => setField("id", e.target.value)}
                placeholder="e.g. bus-7"
                aria-invalid={!!errors.id}
                data-ocid="bus.form.id"
              />
              {errors.id && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="bus.form.id_error"
                >
                  {errors.id}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bus-registration">Registration</Label>
              <Input
                id="bus-registration"
                value={form.registration}
                onChange={(e) => setField("registration", e.target.value)}
                placeholder="e.g. KA-01-AE-3344"
                aria-invalid={!!errors.registration}
                data-ocid="bus.form.registration"
              />
              {errors.registration && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="bus.form.registration_error"
                >
                  {errors.registration}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bus-type">Type</Label>
              <Input
                id="bus-type"
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
                placeholder="e.g. Volvo 8400 B8R"
                aria-invalid={!!errors.type}
                data-ocid="bus.form.type"
              />
              {errors.type && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="bus.form.type_error"
                >
                  {errors.type}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bus-capacity">Capacity</Label>
              <Input
                id="bus-capacity"
                type="number"
                min={1}
                max={100}
                value={form.capacity}
                onChange={(e) => setField("capacity", e.target.value)}
                placeholder="e.g. 45"
                aria-invalid={!!errors.capacity}
                data-ocid="bus.form.capacity"
              />
              {errors.capacity && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="bus.form.capacity_error"
                >
                  {errors.capacity}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bus-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setField("status", v as BusStatus)}
                data-ocid="bus.form.status"
              >
                <SelectTrigger
                  id="bus-status"
                  className="w-full"
                  data-ocid="bus.form.status_trigger"
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="bus.form.status_error"
                >
                  {errors.status}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bus-route">Route</Label>
              <Input
                id="bus-route"
                value={form.route}
                onChange={(e) => setField("route", e.target.value)}
                placeholder="e.g. R-101 (optional)"
                data-ocid="bus.form.route"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bus-crew">Crew</Label>
              <Input
                id="bus-crew"
                value={form.crew}
                onChange={(e) => setField("crew", e.target.value)}
                placeholder="e.g. Ravi Kumar (optional)"
                data-ocid="bus.form.crew"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="bus.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} data-ocid="bus.submit_button">
              {editingId === null ? "Add Bus" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="bus.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bus {deleteTarget?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-mono text-xs">
                {deleteTarget?.registration}
              </span>{" "}
              from the fleet. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="bus.delete_cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="bus.delete_confirm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
