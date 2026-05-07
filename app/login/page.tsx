import Link from "next/link";
import { Activity, ArrowLeft, CalendarDays, ClipboardCheck, ShieldCheck, UsersRound } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { roleHome, roleLabels } from "@/lib/constants/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { UserRole } from "@/types/app.types";

const roles: UserRole[] = ["admin", "reception", "doctor", "lab", "pharmacy", "patient"];

export default function LoginPage() {
  const demoMode = !hasSupabaseEnv();

  return (
    <main className="login-main bg-[var(--background)] font-[Manrope,Inter,sans-serif] text-[var(--healtech-ink)]">
      <div className="login-grid">
        <section className="login-visual bg-[var(--healtech-ink)]">
          <div className="login-visual-orbit login-visual-orbit-one" />
          <div className="login-visual-orbit login-visual-orbit-two" />
          <div className="login-visual-mesh" />
          <div className="login-visual-inner">
            <div className="login-visual-brand">
              <div className="login-visual-mark">
                <ShieldCheck className="h-7 w-7 stroke-[2.4]" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none text-[var(--surface-elevated)]">HealTech</p>
                <p className="mt-1 text-sm font-medium text-[var(--surface-container-high)]">Clinic command workspace</p>
              </div>
            </div>

            <div className="login-visual-copy">
              <p className="login-kicker">Role-aware clinic operations</p>
              <h1>Run front desk, clinical, lab, pharmacy, and patient workflows from one calm workspace.</h1>
              <p>
                HealTech keeps daily clinic work organized with clear role workspaces, operational queues, and focused admin controls.
              </p>
            </div>

            <div className="login-signal-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--surface-container-high)]">Today&apos;s workspace shape</p>
                  <p className="mt-2 text-2xl font-bold text-[var(--surface-elevated)]">Fast access, fewer distractions</p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-[var(--surface-elevated)]">Admin ready</span>
              </div>
              <div className="login-workflow-grid">
                {[
                  { icon: UsersRound, label: "Patients", text: "Search and registration" },
                  { icon: CalendarDays, label: "Visits", text: "Queue and routing" },
                  { icon: ClipboardCheck, label: "Records", text: "Role-filtered access" },
                  { icon: Activity, label: "Tasks", text: "Operational follow-up" },
                ].map((item) => (
                  <div key={item.label} className="login-workflow-tile">
                    <item.icon className="h-5 w-5 text-[var(--accent)]" />
                    <span>
                      <span className="block text-sm font-bold text-[var(--surface-elevated)]">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--surface-container-high)]">{item.text}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="login-left">
          <div className="login-panel">
            <Link href="/" className="login-home-link login-home-link-inline" aria-label="Back to home page">
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="login-brand">
              <div className="login-brand-icon bg-[var(--primary)] text-[var(--primary-foreground)]">
                <ShieldCheck className="h-7 w-7 stroke-[2.4]" />
              </div>
              <div>
                <p className="login-brand-text text-[var(--healtech-ink)]">HealTech</p>
                <p className="mt-1 text-sm font-semibold text-[var(--muted)]">Clinical management system</p>
              </div>
            </div>

            <div className="login-heading-block">
              <p className="login-kicker text-[var(--primary)]">Secure workspace access</p>
              <h1 className="login-heading text-[var(--healtech-ink)]">Welcome back</h1>
              <p className="login-subheading text-[var(--healtech-slate)]">Sign in to continue managing clinic operations with the right role workspace.</p>
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
      </div>
    </main>
  );
}
