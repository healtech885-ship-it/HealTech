import type { UserRole } from "@/types/app.types";

export const ROLE_DASHBOARD_ROUTES = {
  admin: "/admin/dashboard",
  doctor: "/doctor/dashboard",
  reception: "/reception/dashboard",
  lab: "/lab/dashboard",
  pharmacy: "/pharmacy/dashboard",
  patient: "/patient/dashboard",
} as const satisfies Record<UserRole, string>;

export const MISSING_ROLE_REDIRECT = "/login?error=missing-role";

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && value in ROLE_DASHBOARD_ROUTES;
}

export function getDashboardRouteForRole(role: unknown): string | null {
  return isUserRole(role) ? ROLE_DASHBOARD_ROUTES[role] : null;
}
