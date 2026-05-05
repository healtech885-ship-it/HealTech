import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { getDashboardRouteForRole, MISSING_ROLE_REDIRECT } from "@/lib/auth/roles";
import { resolveCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth-callback", requestUrl.origin));
    }
  }

  const result = await resolveCurrentProfile();
  const fallbackPath =
    result.status === "authenticated"
      ? getDashboardRouteForRole(result.profile.role) ?? MISSING_ROLE_REDIRECT
      : result.status === "inactive"
        ? "/login?error=inactive"
        : result.status === "missing-role"
          ? MISSING_ROLE_REDIRECT
          : "/login";

  const requestedNext = result.status === "authenticated" ? requestUrl.searchParams.get("next") : null;
  const redirectPath = getSafeRedirectPath(requestedNext, fallbackPath);
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
