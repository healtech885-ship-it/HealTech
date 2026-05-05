import type { ProfileResolution } from "@/lib/auth/session";
import type { AppProfile, UserRole } from "@/types/app.types";

const MISSING_ROLE_DESTINATION = "/login?error=missing-role";

export type RoleAccessDecision =
  | { type: "allow"; profile: AppProfile }
  | { type: "redirect"; destination: "/login" | "/login?error=inactive" | typeof MISSING_ROLE_DESTINATION | "/unauthorized" };

export function getRoleAccessDecision(result: ProfileResolution, allowedRoles?: readonly UserRole[]): RoleAccessDecision {
  if (result.status === "unauthenticated") return { type: "redirect", destination: "/login" };
  if (result.status === "inactive") return { type: "redirect", destination: "/login?error=inactive" };
  if (result.status === "missing-role") return { type: "redirect", destination: MISSING_ROLE_DESTINATION };

  if (allowedRoles && !allowedRoles.includes(result.profile.role)) {
    return { type: "redirect", destination: "/unauthorized" };
  }

  return { type: "allow", profile: result.profile };
}
