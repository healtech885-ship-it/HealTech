import { redirect } from "next/navigation";
import { getRoleAccessDecision, type RoleAccessDecision } from "@/lib/auth/access";
import { resolveCurrentProfile } from "@/lib/auth/session";
import type { UserRole } from "@/types/app.types";

function enforceDecision(decision: RoleAccessDecision) {
  if (decision.type === "redirect") redirect(decision.destination);
  return decision.profile;
}

export async function requireAuthenticatedProfile(roleHint?: UserRole) {
  return enforceDecision(getRoleAccessDecision(await resolveCurrentProfile(roleHint)));
}

export async function requireRole(requiredRole: UserRole) {
  return enforceDecision(getRoleAccessDecision(await resolveCurrentProfile(requiredRole), [requiredRole]));
}

export async function requireAnyRole(allowedRoles: readonly UserRole[]) {
  return enforceDecision(getRoleAccessDecision(await resolveCurrentProfile(), allowedRoles));
}
