// Shared domain types for the SMARTDTC dashboard.
// These mirror the shape of the demo data module so a live backend can
// replace `data/demoData.ts` later without touching the UI.

export type BusStatus =
  | "On Route"
  | "Available"
  | "Maintenance"
  | "Out of Service";

export interface Bus {
  id: string;
  registration: string;
  model: string;
  capacity: number;
  status: BusStatus;
  currentRoute: string | null;
  driver: string | null;
  fuelLevel: number; // percentage 0-100
  lastService: string; // ISO date
}

export type CrewRole = "Driver" | "Conductor" | "Supervisor";

export interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  badgeNumber: string;
  status: "On Duty" | "Off Duty" | "On Leave";
  assignedBus: string | null;
  contact: string;
}

export type DutyType = "Linked" | "Unlinked";

export interface Duty {
  id: string;
  code: string;
  type: DutyType;
  crewMember: string;
  bus: string;
  route: string;
  startTime: string;
  endTime: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
}

export type RouteStatus = "Active" | "Suspended" | "Under Review";

export interface Route {
  id: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationMin: number;
  frequencyMin: number;
  status: RouteStatus;
  stops: number;
}

export type RoadConditionSeverity = "Low" | "Moderate" | "High" | "Critical";

export interface RoadCondition {
  id: string;
  location: string;
  route: string;
  type: string;
  severity: RoadConditionSeverity;
  description: string;
  reportedAt: string;
  status: "Open" | "Monitoring" | "Closed";
}

export type AlertSeverity = "Info" | "Warning" | "Critical";

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
}

export interface DashboardStats {
  activeBuses: number;
  totalBuses: number;
  crewOnDuty: number;
  totalCrew: number;
  activeRoutes: number;
  totalRoutes: number;
  openAlerts: number;
  onTimeRate: number; // percentage
}
