import {
  Activity,
  BadgeCheck,
  Beaker,
  Boxes,
  Building2,
  CalendarClock,
  ClipboardList,
  FileBarChart,
  FileClock,
  HeartPulse,
  Home,
  Inbox,
  Pill,
  ShieldAlert,
  Settings,
  Stethoscope,
  Store,
  PackagePlus,
  UserRound,
  Users,
} from "lucide-react";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/auth/roles";
import type { UserRole } from "@/types/app.types";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const roleHome = ROLE_DASHBOARD_ROUTES;

export const roleLabels: Record<UserRole, string> = {
  admin: "Administration",
  reception: "Reception",
  doctor: "Doctor",
  lab: "Laboratory",
  pharmacy: "Pharmacy",
  patient: "Patient Portal",
};

export const navigationByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: Home },
    { label: "Employees", href: "/admin/employees", icon: Users },
    { label: "Departments", href: "/admin/departments", icon: Building2 },
    { label: "Patients", href: "/admin/patients", icon: HeartPulse },
    { label: "Visits", href: "/admin/visits", icon: ClipboardList },
    { label: "Leave Requests", href: "/admin/leave-requests", icon: CalendarClock },
    { label: "Store Items", href: "/admin/store/items", icon: Store },
    { label: "Store Stock", href: "/admin/store/batches", icon: PackagePlus },
    { label: "Store Assignments", href: "/admin/store/assignments", icon: Boxes },
    { label: "Store Requests", href: "/admin/store/requests", icon: BadgeCheck },
    { label: "Reports", href: "/admin/reports", icon: FileBarChart },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  reception: [
    { label: "Dashboard", href: "/reception/dashboard", icon: Home },
    { label: "Search Patient", href: "/reception/patients", icon: HeartPulse },
    { label: "Add Patient", href: "/reception/patients/new", icon: UserRound },
    { label: "Create Visit", href: "/reception/visits/new", icon: ClipboardList },
    { label: "Queued Visits", href: "/reception/visits", icon: Activity },
  ],
  doctor: [
    { label: "Dashboard", href: "/doctor/dashboard", icon: Home },
    { label: "My Visits", href: "/doctor/visits", icon: Stethoscope },
    { label: "Lab Orders", href: "/doctor/lab-orders", icon: Beaker },
    { label: "Waiting Lab Results", href: "/doctor/lab-results", icon: Beaker },
    { label: "Medicine Orders", href: "/doctor/medicine-orders", icon: Pill },
    { label: "Completed Visits", href: "/doctor/visits/completed", icon: BadgeCheck },
  ],
  lab: [
    { label: "Dashboard", href: "/lab/dashboard", icon: Home },
    { label: "Lab Orders", href: "/lab/orders", icon: Beaker },
    { label: "Pending Results", href: "/lab/orders/pending", icon: ClipboardList },
    { label: "Completed Results", href: "/lab/orders/completed", icon: BadgeCheck },
    { label: "Lab Test Types", href: "/lab/tests", icon: Settings },
  ],
  pharmacy: [
    { label: "Dashboard", href: "/pharmacy/dashboard", icon: Home },
    { label: "Medicine Orders", href: "/pharmacy/orders", icon: ClipboardList },
    { label: "Medicine Stock", href: "/pharmacy/medicines", icon: Pill },
    { label: "Add Medicine", href: "/pharmacy/medicines/new", icon: BadgeCheck },
    { label: "Low Stock", href: "/pharmacy/medicines/low-stock", icon: FileClock },
    { label: "Out of Stock", href: "/pharmacy/medicines/out-of-stock", icon: Inbox },
    { label: "Expired Medicines", href: "/pharmacy/medicines/expired", icon: CalendarClock },
  ],
  patient: [
    { label: "Dashboard", href: "/patient/dashboard", icon: Home },
    { label: "My Profile", href: "/patient/profile", icon: UserRound },
    { label: "My Visits", href: "/patient/visits", icon: ClipboardList },
    { label: "Lab Results", href: "/patient/lab-results", icon: Beaker },
    { label: "Medicines", href: "/patient/medicines", icon: Pill },
    { label: "Appointment Requests", href: "/patient/appointment-requests", icon: CalendarClock },
    { label: "Notifications", href: "/patient/notifications", icon: Inbox },
    { label: "Account Settings", href: "/patient/account-settings", icon: Settings },
  ],
};
