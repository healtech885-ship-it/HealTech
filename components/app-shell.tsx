"use client";

import Link from "next/link";
import {
  Bell,
  BriefcaseMedical,
  CircleHelp,
  Clock3,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  Plus,
  Search,
  ShieldCheck,
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
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[var(--sidebar-width)] border-r border-border bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--on-surface-variant)] transition hover:bg-muted hover:text-[var(--on-surface)]",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-[var(--sidebar-width)]">
        <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur">
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
          <nav className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
            {navItems.slice(0, 8).map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-[var(--on-surface-variant)]">
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
  const path = segments?.length ? segments.join("/") : "dashboard";
  const adminItems = navigationByRole.admin;
  const activeHref = getAdminActiveHref(path, adminItems);
  const adminPrimaryItems = adminItems.filter((item) => item.href !== "/admin/settings");
  const settingsItem = adminItems.find((item) => item.href === "/admin/settings");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f6fafd] font-[Manrope,Inter,Segoe_UI,Arial,sans-serif] text-[#171c1e] lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
      {mobileOpen ? <button aria-label="Close navigation overlay" className="fixed inset-0 z-20 bg-[#0f172a]/24 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[300px] -translate-x-full flex-col border-r border-[#d8e2e8] bg-[#f7fbff] px-5 py-6 shadow-[12px_0_30px_rgba(15,23,42,0.08)] transition-[transform,width,padding] duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none",
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
            <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-xl bg-[#00758d] text-white shadow-[0_10px_24px_rgba(0,100,124,0.14)]">
              <BriefcaseMedical className="h-7 w-7" />
            </span>
            <span className={cn("min-w-0 overflow-hidden transition-[opacity,width] duration-200", collapsed && "lg:w-0 lg:opacity-0")}>
              <span className="block text-[23px] font-bold leading-7 tracking-normal text-[#11181c]">City General</span>
              <span className="block text-[14px] leading-5 text-[#52647a]">Admin Wing</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
            className={cn(
              "hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d7e1e8] bg-white text-[#263a54] shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition hover:border-[#9fb4bf] hover:text-[#00647c] lg:flex",
              collapsed && "lg:absolute lg:-right-[38px] lg:top-2 lg:z-40",
            )}
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d7e1e8] bg-white text-[#263a54] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Link
          href="/admin/visits"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "mt-[42px] flex h-[45px] items-center justify-center gap-3 overflow-hidden rounded-lg bg-[#00758d] text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(0,100,124,0.12)] transition-all duration-300",
            collapsed && "lg:mx-auto lg:h-[54px] lg:w-[54px] lg:rounded-xl lg:px-0",
          )}
          title={collapsed ? "New Consultation" : undefined}
        >
          <Plus className="h-5 w-5 shrink-0" />
          <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "lg:hidden")}>New Consultation</span>
        </Link>

        <nav className={cn("mt-3 space-y-2", collapsed && "lg:flex lg:flex-col lg:items-center")}>
          {adminPrimaryItems.map((item) => {
            const selected = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex h-[46px] items-center gap-5 overflow-hidden rounded-lg px-5 text-[16px] font-medium transition-all duration-300",
                  collapsed && "lg:h-[54px] lg:w-[54px] lg:justify-center lg:gap-0 lg:rounded-xl lg:px-0",
                  selected
                    ? "border border-[#d7e1e8] bg-white text-[#0089a8] shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                    : "text-[#263a54] hover:bg-white hover:text-[#00647c]",
                )}
              >
                <item.icon className="h-[22px] w-[22px] shrink-0" />
                <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "lg:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={cn("mt-auto border-t border-[#d7e1e7] pt-5", collapsed && "lg:flex lg:flex-col lg:items-center")}>
          {settingsItem ? (
            <Link
              href={settingsItem.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? settingsItem.label : undefined}
              className={cn(
                "flex h-[50px] items-center gap-5 overflow-hidden rounded-lg px-5 text-[16px] font-medium transition-all duration-300",
                collapsed && "lg:h-[54px] lg:w-[54px] lg:justify-center lg:gap-0 lg:rounded-xl lg:px-0",
                settingsItem.href === activeHref ? "border border-[#d7e1e8] bg-white text-[#0089a8] shadow-sm" : "text-[#263a54]",
              )}
            >
              <settingsItem.icon className="h-[22px] w-[22px] shrink-0" />
              <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "lg:hidden")}>{settingsItem.label}</span>
            </Link>
          ) : null}
          <SignOutButton
            className={cn(
              "mt-2 !h-[50px] w-full justify-start gap-5 overflow-hidden border-0 bg-transparent px-5 text-[16px] font-medium text-[#263a54] transition-all duration-300 hover:bg-white",
              collapsed && "lg:!h-[54px] lg:w-[54px] lg:justify-center lg:gap-0 lg:rounded-xl lg:px-0",
            )}
            iconClassName="h-[22px] w-[22px]"
            label={collapsed ? "" : "Logout"}
            variant="ghost"
          />
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-[#d9e3ea] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          <div className="flex min-h-20 items-center gap-6 px-5 lg:px-[30px]">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d7e1e8] bg-white text-[#263a54] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="hidden shrink-0 text-[25px] font-bold tracking-normal text-[#080d10] sm:block">HealTech</p>
            <div className="relative hidden min-w-0 flex-1 md:block lg:max-w-[398px]">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8293a8]" />
              <input
                className="h-12 w-full rounded-full border-0 bg-[#f0f4f7] pl-14 pr-5 text-[16px] outline-none placeholder:text-[#8293a8]"
                placeholder="Search patients, records..."
              />
            </div>
            <div className="ml-auto flex items-center gap-4 text-[#51647c] sm:gap-6">
              <span className="relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -right-0.5 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-[#ba1a1a]" />
              </span>
              <Clock3 className="h-6 w-6" />
              <CircleHelp className="h-6 w-6" />
              <span className="hidden h-8 w-px bg-[#d7e1e7] sm:block" />
              <button className="hidden h-10 items-center gap-2 rounded-full border border-[#f2b8b5] bg-white px-5 text-[16px] font-medium text-[#c10010] md:flex">
                <span className="text-[26px] leading-none">*</span>
                Emergency
              </button>
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#c7d5e0] bg-[#e5eef4] text-sm font-semibold text-[#00647c]">
                {initials(profile.full_name)}
              </span>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-[#d9e3ea] px-4 py-2 lg:hidden">
            {adminItems.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d7e1e8] bg-white px-3 py-2 text-xs font-semibold text-[#263a54]">
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

function getAdminActiveHref(path: string, items: typeof navigationByRole.admin) {
  const currentHref = `/admin/${path}`.replace(/\/+$/, "");
  const activeItem = items
    .filter((item) => currentHref === item.href || currentHref.startsWith(`${item.href}/`))
    .sort((first, second) => second.href.length - first.href.length)[0];

  return activeItem?.href ?? "/admin/dashboard";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AD";
}
