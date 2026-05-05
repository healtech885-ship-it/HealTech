import { redirect } from "next/navigation";
import { getDashboardRouteForRole, MISSING_ROLE_REDIRECT } from "@/lib/auth/roles";
import { resolveCurrentProfile } from "@/lib/auth/session";

export default async function DashboardRedirectPage() {
  const result = await resolveCurrentProfile();

  if (result.status === "unauthenticated") redirect("/login");
  if (result.status === "inactive") redirect("/login?error=inactive");
  if (result.status === "missing-role") redirect(MISSING_ROLE_REDIRECT);

  redirect(getDashboardRouteForRole(result.profile.role) ?? MISSING_ROLE_REDIRECT);
}
