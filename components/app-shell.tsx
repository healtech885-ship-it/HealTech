"use client";

import Link from "next/link";
import {
  Bell,
  BriefcaseMedical,
  CircleHelp,
  Clock3,
  ChevronsLeft,
  ChevronsRight,
  FileCog,
  Grid2X2,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { navigationByRole, roleLabels } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import type { AppProfile, UserRole } from "@/types/app.types";

export function AppShell({
  role,
  profile,
  segments,
  children,
}: {
  role: UserRole;
  profile: AppProfile;
  segments?: string[];
  children: React.ReactNode;
}) {
  if (role === "admin") {
    return (
      <AdminShell profile={profile} segments={segments}>
        {children}
      </AdminShell>
    );
  }

  const navItems = navigationByRole[role];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 hidden w-[var(--sidebar-width)] border-r border-[var(--outline-variant)] bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-[var(--outline-variant)] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] bg-[var(--primary)] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--on-surface)]">HealTech</p>
            <p className="text-xs text-[var(--on-surface-variant)]">{roleLabels[role]}</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[0.5rem] px-3 py-2.5 text-sm font-medium text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-[var(--sidebar-width)]">
        <header className="sticky top-0 z-10 border-b border-[var(--outline-variant)] bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]">{roleLabels[role]}</p>
            <p className="text-sm font-semibold text-[var(--on-surface)]">{profile.full_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--on-surface-variant)] sm:inline">{profile.email}</span>
            <SignOutButton />
          </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-[var(--outline-variant)] px-4 py-2 lg:hidden">
            {navItems.slice(0, 8).map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-white px-3 py-2 text-xs font-semibold text-[var(--on-surface-variant)]">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

function AdminShell({
  profile,
  segments,
  children,
}: {
  profile: AppProfile;
  segments?: string[];
  children: React.ReactNode;
}) {
  const path = (segments ?? ["dashboard"]).join("/");
  const active = getAdminActive(path);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: Grid2X2 },
    { label: "Patients", href: "/admin/patients", icon: navigationByRole.admin[3].icon },
    { label: "Appointments", href: "/admin/visits", icon: navigationByRole.admin[4].icon },
    { label: "Medical Records", href: "/admin/employees", icon: FileCog },
    { label: "Analytics", href: "/admin/reports", icon: navigationByRole.admin[9].icon },
    { label: "Billing", href: "/admin/store/requests", icon: WalletCards },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--background)] font-[Manrope,Inter,Segoe_UI,Arial,sans-serif] text-[var(--on-surface)] lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
      {mobileOpen ? <button aria-label="Close navigation overlay" className="fixed inset-0 z-20 bg-[var(--inverse-surface)]/24 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[300px] -translate-x-full flex-col border-r border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-5 py-6 shadow-[12px_0_30px_rgba(15,23,42,0.08)] transition-[transform,width,padding] duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none",
          mobileOpen && "translate-x-0",
          collapsed ? "lg:w-[96px] lg:px-5" : "lg:w-[320px]",
        )}
      >
        <div className={cn("relative flex items-center gap-3", collapsed ? "lg:justify-center" : "justify-between")}>
          <Link
            href="/admin/dashboard"
            onClick={() => setMobileOpen(false)}
            title={collapsed ? "City General" : undefined}
            className={cn("flex min-w-0 items-center gap-4", collapsed && "lg:justify-center")}
          >
            <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[0.75rem] bg-[var(--primary-container)] text-white shadow-[0_10px_24px_rgba(0,100,124,0.14)]">
              <BriefcaseMedical className="h-7 w-7" />
            </span>
            <span className={cn("min-w-0 overflow-hidden transition-[opacity,width] duration-200", collapsed && "lg:w-0 lg:opacity-0")}>
              <span className="block text-[23px] font-bold leading-7 tracking-normal text-[var(--on-surface)]">City General</span>
              <span className="block text-[14px] leading-5 text-[var(--on-surface-variant)]">Admin Wing</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
            className={cn(
              "hidden h-9 w-9 shrink-0 items-center justify-center rounded-[0.5rem] border border-[var(--outline-variant)] bg-white text-[var(--on-surface)] shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition hover:border-[var(--outline)] hover:text-[var(--primary)] lg:flex",
              collapsed && "lg:absolute lg:-right-[38px] lg:top-2 lg:z-40",
            )}
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.5rem] border border-[var(--outline-variant)] bg-white text-[var(--on-surface)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Link
          href="/admin/visits"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "mt-[42px] flex h-[45px] items-center justify-center gap-3 overflow-hidden rounded-[0.5rem] bg-[var(--primary-container)] text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(0,100,124,0.12)] transition-all duration-300 hover:bg-[var(--primary)]",
            collapsed && "lg:mx-auto lg:h-[54px] lg:w-[54px] lg:rounded-[0.75rem] lg:px-0",
          )}
          title={collapsed ? "New Consultation" : undefined}
        >
          <Plus className="h-5 w-5 shrink-0" />
          <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "lg:hidden")}>New Consultation</span>
        </Link>

        <nav className={cn("mt-3 space-y-2", collapsed && "lg:flex lg:flex-col lg:items-center")}>
          {adminItems.map((item) => {
            const selected = item.label === active;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex h-[46px] items-center gap-5 overflow-hidden rounded-[0.5rem] px-5 text-[16px] font-medium transition-all duration-300",
                  collapsed && "lg:h-[54px] lg:w-[54px] lg:justify-center lg:gap-0 lg:rounded-[0.75rem] lg:px-0",
                  selected
                    ? "border border-[var(--outline-variant)] bg-white text-[var(--primary)] shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                    : "text-[var(--on-surface)] hover:bg-white hover:text-[var(--primary)]",
                )}
              >
                <item.icon className="h-[22px] w-[22px] shrink-0" />
                <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "lg:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={cn("mt-auto border-t border-[var(--outline-variant)] pt-5", collapsed && "lg:flex lg:flex-col lg:items-center")}>
          <Link
            href="/admin/settings"
            onClick={() => setMobileOpen(false)}
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "flex h-[50px] items-center gap-5 overflow-hidden rounded-[0.5rem] px-5 text-[16px] font-medium transition-all duration-300",
              collapsed && "lg:h-[54px] lg:w-[54px] lg:justify-center lg:gap-0 lg:rounded-[0.75rem] lg:px-0",
              active === "Settings" ? "border border-[var(--outline-variant)] bg-white text-[var(--primary)] shadow-sm" : "text-[var(--on-surface)]",
            )}
          >
            <Settings className="h-[22px] w-[22px] shrink-0" />
            <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "lg:hidden")}>Settings</span>
          </Link>
          <SignOutButton
            className={cn(
              "mt-2 !h-[50px] w-full justify-start gap-5 overflow-hidden border-0 bg-transparent px-5 text-[16px] font-medium text-[var(--on-surface)] transition-all duration-300 hover:bg-white",
              collapsed && "lg:!h-[54px] lg:w-[54px] lg:justify-center lg:gap-0 lg:rounded-[0.75rem] lg:px-0",
            )}
            iconClassName="h-[22px] w-[22px]"
            label={collapsed ? "" : "Logout"}
            variant="ghost"
          />
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-[var(--outline-variant)] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          <div className="flex min-h-20 items-center gap-6 px-5 lg:px-[30px]">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.5rem] border border-[var(--outline-variant)] bg-white text-[var(--on-surface)] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="hidden shrink-0 text-[25px] font-bold tracking-normal text-[var(--on-surface)] sm:block">MedCore Clinic</p>
            <div className="relative hidden min-w-0 flex-1 md:block lg:max-w-[398px]">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--outline)]" />
              <input
                className="h-12 w-full rounded-full border-0 bg-[var(--surface-container-low)] pl-14 pr-5 text-[16px] outline-none placeholder:text-[var(--outline)]"
                placeholder="Search patients, records..."
              />
            </div>
            <div className="ml-auto flex items-center gap-4 text-[var(--on-surface-variant)] sm:gap-6">
              <span className="relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -right-0.5 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-[var(--error)]" />
              </span>
              <Clock3 className="h-6 w-6" />
              <CircleHelp className="h-6 w-6" />
              <span className="hidden h-8 w-px bg-[var(--outline-variant)] sm:block" />
              <button className="hidden h-10 items-center gap-2 rounded-full border border-[var(--error-container)] bg-white px-5 text-[16px] font-medium text-[var(--error)] md:flex">
                <span className="text-[26px] leading-none">*</span>
                Emergency
              </button>
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-high)] text-sm font-semibold text-[var(--primary)]">
                {initials(profile.full_name)}
              </span>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-[var(--outline-variant)] px-4 py-2 lg:hidden">
            {adminItems.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-white px-3 py-2 text-xs font-semibold text-[var(--on-surface)]">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
            <SignOutButton className="shrink-0" label="Logout" variant="secondary" />
          </nav>
        </header>

        <div className="min-w-0 px-5 py-8 lg:px-[30px] lg:py-9">{children}</div>
      </main>
    </div>
  );
}

function getAdminActive(path: string) {
  if (path === "patients") return "Patients";
  if (path === "visits") return "Appointments";
  if (path === "reports" || path === "audit-logs") return "Analytics";
  if (path === "settings") return "Settings";
  if (path.startsWith("store/")) return "Billing";
  if (path.startsWith("employees") || path === "departments" || path.startsWith("leave-requests")) return "Medical Records";
  return "Dashboard";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AD";
}
