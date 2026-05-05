import { redirect } from "next/navigation";
import { demoProfiles } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AppProfile, UserRole } from "@/types/app.types";

export async function getCurrentProfile(roleHint?: UserRole): Promise<AppProfile | null> {
  if (!hasSupabaseEnv()) {
    return demoProfiles[roleHint ?? "admin"];
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,full_name,email,role,status")
    .eq("id", userData.user.id)
    .single();

  return profile as AppProfile | null;
}

export async function requireRole(role: UserRole) {
  const profile = await getCurrentProfile(role);
  if (!profile) redirect("/login");
  if (profile.status !== "active") redirect("/login?error=inactive");
  if (hasSupabaseEnv() && profile.role !== role && profile.role !== "admin") {
    redirect(`/${profile.role}/dashboard`);
  }
  return profile;
}
