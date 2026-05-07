import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { roleHome, roleLabels } from "@/lib/constants/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { UserRole } from "@/types/app.types";

const roles: UserRole[] = ["admin", "reception", "doctor", "lab", "pharmacy", "patient"];

export default function LoginPage() {
  const demoMode = !hasSupabaseEnv();

  return (
    <main className="login-main bg-[var(--surface-elevated)] font-[Manrope,Inter,sans-serif] text-[var(--healtech-ink)]">
      <div className="login-grid">
        <section className="login-left">
          <Link href="/" className="login-home-link" aria-label="Back to home page">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

          <div className="login-panel">
            <div className="login-brand">
              <div className="login-brand-icon text-[var(--primary)]">
                <ShieldCheck className="h-7 w-7 stroke-[2.4]" />
              </div>
              <p className="login-brand-text text-[var(--healtech-ink)]">HealTech</p>
            </div>

            <div className="login-heading-block">
              <h1 className="login-heading text-[var(--healtech-ink)]">Sign In</h1>
              <p className="login-subheading text-[var(--healtech-slate)]">Manage your clinic operations</p>
            </div>

            {demoMode ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {roles.map((role) => (
                  <Link
                    key={role}
                    href={roleHome[role]}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-sm transition hover:border-[var(--primary)] hover:bg-[var(--surface-muted)]"
                  >
                    <p className="font-semibold text-[var(--on-surface)]">{roleLabels[role]}</p>
                    <p className="mt-1 text-[var(--on-surface-variant)]">Open {roleLabels[role].toLowerCase()} workspace</p>
                  </Link>
                ))}
              </div>
            ) : (
              <LoginForm />
            )}
          </div>
        </section>

        <section className="login-visual bg-[var(--surface-muted)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.94),rgba(238,246,244,0.66)_34%,rgba(217,240,236,0.86)_82%)]" />
          <div className="absolute left-[9%] top-[12%] h-16 w-32 rotate-[-7deg] rounded-2xl bg-white/45 blur-[2px]" />
          <div className="absolute right-[9%] top-[14%] h-16 w-24 rotate-[18deg] rounded-2xl bg-white/55 blur-[2px]" />
          <div className="absolute inset-x-0 top-[28%] h-[330px] bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.42)_24%,rgba(255,255,255,0.36)_78%,rgba(255,255,255,0)_100%)] blur-xl" />

          <div className="login-visual-inner">
            <div className="login-info-card border border-white/75 bg-white/88 backdrop-blur">
              <div className="login-info-icon bg-[var(--primary)] text-white">
                <ShieldCheck className="h-6 w-6 stroke-[2.4]" />
              </div>
              <h2 className="login-info-heading text-[var(--healtech-ink)]">Secure Patient Records</h2>
              <p className="login-info-copy text-[var(--on-surface-variant)]">
                Role-based access control for maximum compliance. HealTech ensures all operational data remains encrypted and isolated per practitioner.
              </p>
              <div className="login-bars">
                <div className="login-bar bg-[var(--surface-variant)]">
                  <div className="login-bar-fill login-bar-fill-primary bg-[var(--primary)]" />
                </div>
                <div className="login-bar bg-[var(--surface-variant)]">
                  <div className="login-bar-fill login-bar-fill-secondary bg-[var(--accent)]" />
                </div>
              </div>
              <div className="login-integrity">
                <span className="text-[var(--muted)]">System Integrity</span>
                <span className="font-semibold tracking-[0.04em] text-[var(--primary)]">100% Encrypted</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
