import { redirect } from "next/navigation";
import { demoProfiles } from "@/lib/demo-data";
import { isUserRole, MISSING_ROLE_REDIRECT } from "@/lib/auth/roles";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AppProfile, UserRole } from "@/types/app.types";

export type ProfileResolution =
  | { status: "authenticated"; profile: AppProfile }
  | { status: "inactive"; profile: AppProfile }
  | { status: "missing-role" }
  | { status: "unauthenticated" };

type ProfileRow = Omit<AppProfile, "role"> & { role: unknown };

function toAppProfile(profile: ProfileRow | null): AppProfile | null {
  if (!profile || !isUserRole(profile.role)) return null;
  return { ...profile, role: profile.role };
}

export async function resolveCurrentProfile(roleHint?: UserRole): Promise<ProfileResolution> {
  if (!hasSupabaseEnv()) {
    if (!roleHint) return { status: "unauthenticated" };
    return { status: "authenticated", profile: demoProfiles[roleHint] };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { status: "unauthenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,full_name,email,role,status")
    .eq("id", userData.user.id)
    .single();

  const appProfile = toAppProfile(profile as ProfileRow | null);
  if (!appProfile) return { status: "missing-role" };
  if (appProfile.status !== "active") return { status: "inactive", profile: appProfile };
  return { status: "authenticated", profile: appProfile };
}

export async function getCurrentProfile(roleHint?: UserRole): Promise<AppProfile | null> {
  const result = await resolveCurrentProfile(roleHint);
  return result.status === "authenticated" || result.status === "inactive" ? result.profile : null;
}

export async function requireRole(role: UserRole) {
  const result = await resolveCurrentProfile(role);
  if (result.status === "unauthenticated") redirect("/login");
  if (result.status === "missing-role") redirect(MISSING_ROLE_REDIRECT);
  if (result.status === "inactive") redirect("/login?error=inactive");

  const profile = result.profile;
  if (hasSupabaseEnv() && profile.role !== role) {
    redirect("/unauthorized");
  }
  return profile;
}
