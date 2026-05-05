import type { UserRole } from "@/types/app.types";
import { recordsByModule } from "./demo-data";
import { titleCase } from "./utils";

export type ModuleDefinition = {
  title: string;
  eyebrow: string;
  description: string;
  primaryAction?: string;
  tableKey: keyof typeof recordsByModule;
  formFields: string[];
};

const defaultsByRole: Record<UserRole, ModuleDefinition> = {
  admin: {
    title: "Administration Dashboard",
    eyebrow: "System overview",
    description: "Monitor clinic operations, staff, stock, leave requests, and sensitive workflow activity.",
    primaryAction: "Create Employee",
    tableKey: "employees",
    formFields: ["Full name", "Email", "Role", "Department"],
  },
  reception: {
    title: "Reception Dashboard",
    eyebrow: "Front desk workflow",
    description: "Search patients, create visits, assign doctors, and keep the waiting queue moving.",
    primaryAction: "Create Visit",
    tableKey: "visits",
    formFields: ["Patient", "Doctor", "Chief complaint", "Priority"],
  },
  doctor: {
    title: "Doctor Dashboard",
    eyebrow: "Clinical queue",
    description: "Review assigned visits, record diagnosis, order labs or medicines, and complete treatment.",
    primaryAction: "Open Visit",
    tableKey: "visits",
    formFields: ["Symptoms", "Diagnosis", "Disease", "Instructions"],
  },
  lab: {
    title: "Laboratory Dashboard",
    eyebrow: "Diagnostic workflow",
    description: "Track lab orders, enter results, submit completed tests, and prepare results for review.",
    primaryAction: "Submit Results",
    tableKey: "lab",
    formFields: ["Order", "Result value", "Result notes", "Status"],
  },
  pharmacy: {
    title: "Pharmacy Dashboard",
    eyebrow: "Stock and dispensing",
    description: "Manage medicine stock, monitor expiry risk, and safely dispense doctor orders.",
    primaryAction: "Dispense Medicine",
    tableKey: "pharmacy",
    formFields: ["Order item", "Quantity", "Batch preference", "Notes"],
  },
  patient: {
    title: "Patient Portal",
    eyebrow: "Personal health access",
    description: "View your profile, visits, approved lab results, medicines, and appointment requests.",
    primaryAction: "Request Appointment",
    tableKey: "lab-results",
    formFields: ["Department", "Preferred date", "Reason"],
  },
};

const moduleOverrides: Record<string, Partial<ModuleDefinition>> = {
  employees: { title: "Employees", tableKey: "employees", primaryAction: "Create Employee", formFields: ["Full name", "Email", "Role", "Department"] },
  departments: { title: "Departments", tableKey: "departments", primaryAction: "Add Department", formFields: ["Name", "Description", "Status"] },
  patients: { title: "Patients", tableKey: "patients", primaryAction: "Add Patient", formFields: ["Full name", "Student ID or MRN", "Gender", "Phone"] },
  visits: { title: "Visits", tableKey: "visits", primaryAction: "Create Visit", formFields: ["Patient", "Doctor", "Chief complaint", "Priority"] },
  "leave-requests": { title: "Leave Requests", tableKey: "leave-requests", primaryAction: "Review Request", formFields: ["Leave type", "Start date", "End date", "Admin comment"] },
  store: { title: "Store and Assets", tableKey: "store", primaryAction: "Assign Item", formFields: ["Item", "Employee", "Quantity", "Notes"] },
  reports: { title: "Reports", tableKey: "visits", primaryAction: "Export Report", formFields: ["Report type", "Date range", "Department"] },
  settings: { title: "Settings", tableKey: "departments", primaryAction: "Save Setting", formFields: ["Setting", "Value"] },
  orders: { title: "Orders", tableKey: "lab", primaryAction: "Open Order", formFields: ["Order", "Result value", "Result notes"] },
  tests: { title: "Lab Test Types", tableKey: "lab", primaryAction: "Add Lab Test", formFields: ["Name", "Code", "Normal range", "Unit"] },
  medicines: { title: "Medicines", tableKey: "medicines", primaryAction: "Add Medicine Batch", formFields: ["Medicine", "Quantity", "Expiry date", "Unit price"] },
  "lab-results": { title: "Lab Results", tableKey: "lab-results", primaryAction: "Approve Result", formFields: ["Result item", "Visibility", "Review notes"] },
  medicines_patient: { title: "My Medicines", tableKey: "pharmacy", primaryAction: "View Details", formFields: ["Question", "Message"] },
  profile: { title: "My Profile", tableKey: "patients", primaryAction: "Update Contact Info", formFields: ["Phone", "Emergency phone", "Address"] },
  "appointment-requests": { title: "Appointment Requests", tableKey: "appointment-requests", primaryAction: "Request Appointment", formFields: ["Department", "Preferred date", "Reason"] },
};

export function getModuleDefinition(role: UserRole, segments?: string[]): ModuleDefinition {
  const base = defaultsByRole[role];
  const cleanSegments = (segments ?? []).filter(Boolean);
  const first = cleanSegments[0] ?? "dashboard";
  const routeKey = cleanSegments.join("/");
  const overrideKey = role === "patient" && first === "medicines" ? "medicines_patient" : first;
  const isCreate = cleanSegments.includes("new");
  const isDetail = cleanSegments.length > 1 && !isCreate;
  const override = moduleOverrides[overrideKey] ?? {};

  return {
    ...base,
    ...override,
    title: isCreate ? `New ${override.title ?? titleCase(first)}` : isDetail ? `${override.title ?? titleCase(first)} Detail` : override.title ?? base.title,
    eyebrow: routeKey === "dashboard" ? base.eyebrow : `${base.eyebrow} / ${titleCase(routeKey)}`,
    description: isCreate
      ? `Create a validated ${titleCase(first)} record using the same business rules enforced by Supabase.`
      : override.description ?? base.description,
  };
}
