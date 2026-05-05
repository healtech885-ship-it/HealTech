"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDashboardRouteForRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";
import type { UserStatus } from "@/types/app.types";

const demoCredentials = [
  { label: "Admin", email: "admin@healtech.local", password: "Password123!" },
  { label: "Reception", email: "reception@healtech.local", password: "Password123!" },
  { label: "Doctor", email: "doctor@healtech.local", password: "Password123!" },
  { label: "Lab", email: "lab@healtech.local", password: "Password123!" },
  { label: "Pharmacy", email: "pharmacy@healtech.local", password: "Password123!" },
  { label: "Patient", email: "patient@healtech.local", password: "Password123!" },
];

export function LoginForm() {
  const showDemoHint = process.env.NODE_ENV !== "production";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    const passwordWithoutWhitespace = normalizedPassword.replace(/\s+/g, "");
    if (signInError && passwordWithoutWhitespace !== normalizedPassword) {
      const retry = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: passwordWithoutWhitespace,
      });
      signInData = retry.data;
      signInError = retry.error;
    }

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    if (!signInData.user) {
      setLoading(false);
      setError("Authentication did not return a user.");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", signInData.user.id)
      .single();
    const profile = profileData as { role: unknown; status: UserStatus } | null;

    setLoading(false);

    if (profileError || !profile) {
      setError("Profile was not found for this account.");
      return;
    }

    if (profile.status !== "active") {
      setError("This account is not active.");
      return;
    }

    const dashboardRoute = getDashboardRouteForRole(profile.role);
    if (!dashboardRoute) {
      setError("Profile role is missing or invalid.");
      return;
    }

    window.location.href = dashboardRoute;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="login-form">
        {error ? (
          <div className="login-alert flex items-center gap-3 border border-[#f2b7b7] bg-[#fde9e6] text-[#c10010]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="login-alert-title font-semibold">Authentication Failed</p>
              <p className="login-alert-copy">{error === "Invalid login credentials" ? "Invalid email or password" : error}</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email" className="login-label normal-case font-medium tracking-normal text-[#151c21]">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a9b6bd]" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={`login-input rounded-lg border bg-white pl-14 pr-4 text-[#171c1e] shadow-none placeholder:text-[#8a969c] focus-visible:ring-2 focus-visible:ring-[#00647c]/15 ${error ? "border-[#e00012] focus-visible:border-[#e00012]" : "border-[#bdc8ce] focus-visible:border-[#00647c]"
                }`}
              placeholder="admin@healtech.local"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="login-label normal-case font-medium tracking-normal text-[#151c21]">
            Password
          </Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a9b6bd]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={`login-input login-password-input rounded-lg border bg-white pl-14 pr-14 text-[#171c1e] shadow-none placeholder:text-[#8a969c] focus-visible:ring-2 focus-visible:ring-[#00647c]/15 ${error ? "border-[#e00012] focus-visible:border-[#e00012]" : "border-[#bdc8ce] focus-visible:border-[#00647c]"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7a878d] transition hover:text-[#00647c]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="login-actions-row flex items-center justify-between gap-3">
          <label className="flex items-center gap-3 text-[#4d585e]">
            <input type="checkbox" className="login-checkbox rounded-md border-[#bdc8ce] text-[#00647c] focus:ring-[#00647c]" />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-semibold text-[#00647c] transition hover:text-[#004e61]">
            Forgot password?
          </Link>
        </div>

        {showDemoHint ? (
          <div className="space-y-2">
            <p className="login-demo-hint">
              Demo account: <span>admin@healtech.local</span> / <span>Password123!</span>
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {demoCredentials.map((credential) => (
                <button
                  key={credential.email}
                  type="button"
                  className="h-9 rounded-lg border border-[#d6e0e5] bg-white px-3 text-xs font-semibold text-[#00647c] transition hover:border-[#00647c] hover:bg-[#f3f8fa]"
                  onClick={() => {
                    setEmail(credential.email);
                    setPassword(credential.password);
                    setError(null);
                  }}
                >
                  {credential.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <Button
          type="submit"
          className="login-submit w-full rounded-lg bg-[#006f87] font-semibold text-white transition hover:bg-[#00586d]"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          Sign in
          {!loading ? <ArrowRight className="h-6 w-6" /> : null}
        </Button>
      </form>
    </div>
  );
}
