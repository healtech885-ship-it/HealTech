"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
          <div className="login-alert flex items-center gap-3 border border-[#efb7aa] bg-[var(--error-container)] text-[var(--danger)]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="login-alert-title font-semibold">Authentication Failed</p>
              <p className="login-alert-copy">{error === "Invalid login credentials" ? "Invalid email or password" : error}</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email" className="login-label normal-case font-medium tracking-normal text-[var(--healtech-ink)]">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={`login-input rounded-lg border bg-[var(--surface-elevated)] pl-14 pr-4 text-[var(--on-surface)] shadow-none placeholder:text-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${error ? "border-[var(--danger)] focus-visible:border-[var(--danger)]" : "border-[var(--border)] focus-visible:border-[var(--primary)]"
                }`}
              placeholder="admin@healtech.local"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="login-label normal-case font-medium tracking-normal text-[var(--healtech-ink)]">
            Password
          </Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={`login-input login-password-input rounded-lg border bg-[var(--surface-elevated)] pl-14 pr-14 text-[var(--on-surface)] shadow-none placeholder:text-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${error ? "border-[var(--danger)] focus-visible:border-[var(--danger)]" : "border-[var(--border)] focus-visible:border-[var(--primary)]"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--primary)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="login-actions-row flex items-center justify-between gap-3">
          <Checkbox className="text-[var(--on-surface-variant)]">Remember me</Checkbox>
          <Link href="/forgot-password" className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary-container)]">
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
                  className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-xs font-semibold text-[var(--primary)] transition hover:border-[var(--primary)] hover:bg-[var(--surface-muted)]"
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
          className="login-submit w-full rounded-lg bg-[var(--primary)] font-semibold text-white transition hover:bg-[var(--primary-container)]"
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
