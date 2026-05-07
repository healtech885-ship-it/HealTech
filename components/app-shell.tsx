"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  BriefcaseMedical,
  CircleHelp,
  Clock3,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { navigationByRole, roleLabels, type NavItem } from "@/lib/constants/navigation";
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
  const activeHref = getRoleActiveHref(role, segments, navItems);

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
          {navItems.map((item) => {
            const selected = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition",
                  selected
                    ? "border-border bg-muted text-primary shadow-sm"
                    : "text-[var(--on-surface-variant)] hover:bg-muted hover:text-[var(--on-surface)]",
                )}
              >
                <item.icon className={cn("h-4 w-4", selected && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
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
            {navItems.slice(0, 8).map((item) => {
              const selected = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                    selected
                      ? "border-primary bg-muted text-primary"
                      : "border-border bg-white text-[var(--on-surface-variant)] hover:bg-muted hover:text-[var(--on-surface)]",
                  )}
                >
                  <item.icon className={cn("h-3.5 w-3.5", selected && "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
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
  const adminItems = navigationByRole.admin;
  const activeHref = getRoleActiveHref("admin", segments, adminItems);
  const adminPrimaryItems = adminItems.filter((item) => item.href !== "/admin/settings");
  const settingsItem = adminItems.find((item) => item.href === "/admin/settings");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTopbarMenu, setActiveTopbarMenu] = useState<AdminTopbarMenu>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#eef6f8] font-[Manrope,Inter,Segoe_UI,Arial,sans-serif] text-[#171c1e] lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
      {mobileOpen ? <button aria-label="Close navigation overlay" className="fixed inset-0 z-20 bg-[#0f172a]/24 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[300px] -translate-x-full flex-col border-r border-[#cfe0e8] bg-white px-5 py-6 shadow-[18px_0_44px_rgba(15,23,42,0.12)] transition-[transform,width,padding] duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none",
          mobileOpen && "translate-x-0",
          collapsed ? "lg:w-[96px] lg:px-5" : "lg:w-[320px]",
        )}
      >
        <div className={cn("relative flex items-center gap-3 rounded-2xl border border-[#d8e6eb] bg-[#f6fbfd] p-3", collapsed ? "lg:justify-center" : "justify-between")}>
          <Link
            href="/admin/dashboard"
            onClick={() => setMobileOpen(false)}
            title={collapsed ? "City General" : undefined}
            className={cn("flex min-w-0 items-center gap-4", collapsed && "lg:justify-center")}
          >
            <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-xl bg-[#00758d] text-white shadow-[0_14px_30px_rgba(0,117,141,0.24)]">
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
              "hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#cfe0e8] bg-white text-[#263a54] shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition hover:border-[#8fb4c2] hover:text-[#00647c] lg:flex",
              collapsed && "lg:absolute lg:-right-[38px] lg:top-5 lg:z-40",
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
            "mt-6 flex h-[48px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-[#00758d] text-[16px] font-semibold text-white shadow-[0_14px_28px_rgba(0,117,141,0.20)] transition-all duration-300 hover:bg-[#00647c]",
            collapsed && "lg:mx-auto lg:h-[54px] lg:w-[54px] lg:rounded-xl lg:px-0",
          )}
          title={collapsed ? "New Consultation" : undefined}
        >
          <Plus className="h-5 w-5 shrink-0" />
          <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "lg:hidden")}>New Consultation</span>
        </Link>

        <nav className={cn("mt-5 space-y-1.5", collapsed && "lg:flex lg:flex-col lg:items-center")}>
          {adminPrimaryItems.map((item) => {
            const selected = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "relative flex h-[48px] items-center gap-4 overflow-hidden rounded-xl px-4 text-[15px] font-semibold transition-all duration-300",
                  collapsed && "lg:h-[54px] lg:w-[54px] lg:justify-center lg:gap-0 lg:rounded-xl lg:px-0",
                  selected
                    ? "border border-[#b8dce5] bg-[#eef9fb] text-[#00647c] shadow-[0_8px_22px_rgba(0,117,141,0.10)] before:absolute before:left-0 before:top-3 before:h-6 before:w-1 before:rounded-r-full before:bg-[#00758d]"
                    : "text-[#52647a] hover:bg-[#f6fbfd] hover:text-[#00647c]",
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", selected ? "text-[#00758d]" : "text-[#718394]")} />
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
                "flex h-[50px] items-center gap-4 overflow-hidden rounded-xl px-4 text-[15px] font-semibold transition-all duration-300",
                collapsed && "lg:h-[54px] lg:w-[54px] lg:justify-center lg:gap-0 lg:rounded-xl lg:px-0",
                settingsItem.href === activeHref ? "border border-[#b8dce5] bg-[#eef9fb] text-[#00647c] shadow-sm" : "text-[#52647a] hover:bg-[#f6fbfd] hover:text-[#00647c]",
              )}
            >
              <settingsItem.icon className="h-[22px] w-[22px] shrink-0" />
              <span className={cn("whitespace-nowrap transition-opacity duration-200", collapsed && "lg:hidden")}>{settingsItem.label}</span>
            </Link>
          ) : null}
          <SignOutButton
            className={cn(
              "mt-2 !h-[50px] w-full justify-start gap-4 overflow-hidden border-0 bg-transparent px-4 text-[15px] font-semibold text-[#52647a] transition-all duration-300 hover:bg-[#f6fbfd] hover:text-[#00647c]",
              collapsed && "lg:!h-[54px] lg:w-[54px] lg:justify-center lg:gap-0 lg:rounded-xl lg:px-0",
            )}
            iconClassName="h-[22px] w-[22px]"
            label={collapsed ? "" : "Logout"}
            variant="ghost"
          />
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-[#d4e2e9] bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex min-h-20 items-center gap-6 px-5 lg:px-8">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d7e1e8] bg-white text-[#263a54] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden shrink-0 sm:block">
              <p className="text-[23px] font-bold tracking-normal text-[#080d10]">HealTech</p>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#607084]">Admin Command Center</p>
            </div>
            <div className="relative hidden min-w-0 flex-1 md:block lg:max-w-[398px]">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8293a8]" />
              <input
                className="h-12 w-full rounded-full border border-[#d4e2e9] bg-[#f6fbfd] pl-14 pr-5 text-[15px] outline-none placeholder:text-[#8293a8] transition focus:border-[#00758d] focus:bg-white focus:ring-3 focus:ring-[#00758d]/15"
                placeholder="Search patients, records..."
              />
            </div>
            <div className="ml-auto flex items-center gap-2 text-[#51647c] sm:gap-3">
              <AdminNotificationsMenu
                open={activeTopbarMenu === "notifications"}
                onOpenChange={(open) => setActiveTopbarMenu(open ? "notifications" : null)}
              />
              <AdminClockMenu
                profile={profile}
                open={activeTopbarMenu === "clock"}
                onOpenChange={(open) => setActiveTopbarMenu(open ? "clock" : null)}
              />
              <AdminHelpMenu
                open={activeTopbarMenu === "help"}
                onOpenChange={(open) => setActiveTopbarMenu(open ? "help" : null)}
              />
              <span className="hidden h-8 w-px bg-[#d7e1e7] sm:block" />
              <button
                type="button"
                aria-label="Open emergency workflow"
                onClick={() => setEmergencyOpen(true)}
                className="flex h-10 items-center gap-2 rounded-full border border-[#f2b8b5] bg-[#fff7f6] px-3 text-sm font-semibold text-[#b42318] shadow-[0_8px_18px_rgba(186,26,26,0.08)] transition hover:bg-[#fff1ef] focus:outline-none focus:ring-2 focus:ring-[#f2b8b5] md:px-5 md:text-[15px]"
              >
                <span className="text-[26px] leading-none">*</span>
                <span className="hidden sm:inline">Emergency</span>
              </button>
              <AdminProfileMenu
                profile={profile}
                open={activeTopbarMenu === "profile"}
                onOpenChange={(open) => setActiveTopbarMenu(open ? "profile" : null)}
              />
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

        <div className="min-w-0 px-5 py-8 lg:px-8 lg:py-9">{children}</div>
      </main>
      <EmergencyWorkflowDialog open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </div>
  );
}

type AdminTopbarMenu = "notifications" | "clock" | "help" | "profile" | null;

const adminNotifications = [
  {
    title: "Low stock medicines require review",
    description: "Open stock batches to review low or expiring inventory.",
    href: "/admin/store/batches",
    unread: true,
  },
  {
    title: "Pending leave requests",
    description: "Review staff leave requests waiting for admin action.",
    href: "/admin/leave-requests",
    unread: true,
  },
  {
    title: "Store requests awaiting approval",
    description: "Store team requests need approval or rejection.",
    href: "/admin/store/requests",
    unread: true,
  },
];

const adminHelpItems = [
  { title: "How to create an employee", description: "Open Employees, then use Create Employee.", href: "/admin/employees/new" },
  { title: "How to register patients", description: "Open Patients and register a new patient profile.", href: "/admin/patients" },
  { title: "How to manage visits", description: "Open Visits to review clinic workflow state.", href: "/admin/visits" },
  { title: "How to review store requests", description: "Open Store Requests and review pending items.", href: "/admin/store/requests" },
];

function AdminNotificationsMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const ref = useDismissibleLayer<HTMLDivElement>(open, () => onOpenChange(false));
  const unreadCount = adminNotifications.filter((item) => item.unread).length;

  return (
    <div ref={ref} className="relative">
      <TopbarIconButton
        label="Open notifications"
        open={open}
        onClick={() => onOpenChange(!open)}
        badge={unreadCount > 0}
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
      </TopbarIconButton>
      {open ? (
        <TopbarPanel className="right-0 w-[min(92vw,360px)]">
          <div className="flex items-start justify-between gap-4 border-b border-[#e1e9ef] px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#11181c]">Notifications</p>
              <p className="mt-0.5 text-xs text-[#607084]">{unreadCount} unread clinic item{unreadCount === 1 ? "" : "s"}</p>
            </div>
            <span className="rounded-full bg-[#fde9e6] px-2.5 py-1 text-xs font-semibold text-[#ba1a1a]">Live</span>
          </div>
          <div className="max-h-[320px] overflow-y-auto py-2">
            {adminNotifications.length === 0 ? (
              <p className="px-4 py-5 text-sm text-[#607084]">No notifications right now.</p>
            ) : (
              adminNotifications.map((item) => (
                <Link key={item.title} href={item.href} onClick={() => onOpenChange(false)} className="flex gap-3 px-4 py-3 transition hover:bg-[#f5f9fc]">
                  <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", item.unread ? "bg-[#ba1a1a]" : "bg-[#c6d4df]")} />
                  <span>
                    <span className="block text-sm font-semibold text-[#263a54]">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#607084]">{item.description}</span>
                  </span>
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-[#e1e9ef] px-4 py-3">
            <button type="button" disabled className="w-full rounded-lg border border-[#d7e1e8] bg-[#f7fbfd] px-3 py-2 text-sm font-semibold text-[#7a8ca1]">
              View all notifications - coming soon
            </button>
          </div>
        </TopbarPanel>
      ) : null}
    </div>
  );
}

function AdminClockMenu({
  profile,
  open,
  onOpenChange,
}: {
  profile: AppProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ref = useDismissibleLayer<HTMLDivElement>(open, () => onOpenChange(false));
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    const firstTick = window.setTimeout(updateTime, 0);
    const interval = window.setInterval(updateTime, 60_000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(interval);
    };
  }, []);

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "full" }), []);
  const timeFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }), []);

  return (
    <div ref={ref} className="relative">
      <TopbarIconButton label="Open time and session status" open={open} onClick={() => onOpenChange(!open)}>
        <Clock3 className="h-5 w-5 sm:h-6 sm:w-6" />
      </TopbarIconButton>
      {open ? (
        <TopbarPanel className="right-0 w-[min(92vw,320px)]">
          <div className="border-b border-[#e1e9ef] px-4 py-3">
            <p className="text-sm font-bold text-[#11181c]">Clinic Time</p>
            <p className="mt-0.5 text-xs text-[#607084]">Local device time, refreshed every minute.</p>
          </div>
          <div className="grid gap-3 px-4 py-4 text-sm">
            <StatusRow label="Date" value={now ? dateFormatter.format(now) : "Loading"} />
            <StatusRow label="Time" value={now ? timeFormatter.format(now) : "Loading"} />
            <StatusRow label="Role" value={roleLabels[profile.role]} />
            <StatusRow label="Last updated" value={now ? timeFormatter.format(now) : "Loading"} />
          </div>
        </TopbarPanel>
      ) : null}
    </div>
  );
}

function AdminHelpMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const ref = useDismissibleLayer<HTMLDivElement>(open, () => onOpenChange(false));

  return (
    <div ref={ref} className="relative">
      <TopbarIconButton label="Open help menu" open={open} onClick={() => onOpenChange(!open)}>
        <CircleHelp className="h-5 w-5 sm:h-6 sm:w-6" />
      </TopbarIconButton>
      {open ? (
        <TopbarPanel className="right-0 w-[min(92vw,380px)]">
          <div className="border-b border-[#e1e9ef] px-4 py-3">
            <p className="text-sm font-bold text-[#11181c]">Admin Help</p>
            <p className="mt-0.5 text-xs text-[#607084]">Quick links for common admin workflows.</p>
          </div>
          <div className="py-2">
            {adminHelpItems.map((item) => (
              <Link key={item.title} href={item.href} onClick={() => onOpenChange(false)} className="block px-4 py-3 transition hover:bg-[#f5f9fc]">
                <span className="block text-sm font-semibold text-[#263a54]">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-[#607084]">{item.description}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-[#e1e9ef] bg-[#f8fbfd] px-4 py-3">
            <p className="text-sm font-semibold text-[#263a54]">Need support?</p>
            <p className="mt-1 text-xs leading-5 text-[#607084]">Contact the clinic system administrator or your internal IT support channel.</p>
          </div>
        </TopbarPanel>
      ) : null}
    </div>
  );
}

function AdminProfileMenu({
  profile,
  open,
  onOpenChange,
}: {
  profile: AppProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ref = useDismissibleLayer<HTMLDivElement>(open, () => onOpenChange(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#c7d5e0] bg-[#e5eef4] text-sm font-semibold text-[#00647c] transition hover:border-[#8fb4c2] focus:outline-none focus:ring-2 focus:ring-[#00758d]/25"
      >
        {initials(profile.full_name)}
      </button>
      {open ? (
        <TopbarPanel className="right-0 w-[min(92vw,320px)]">
          <div className="border-b border-[#e1e9ef] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e5eef4] text-sm font-bold text-[#00647c]">
                {initials(profile.full_name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#11181c]">{profile.full_name}</p>
                <p className="truncate text-xs text-[#607084]">{profile.email}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 px-4 py-4 text-sm">
            <StatusRow label="Role" value={roleLabels[profile.role]} />
            <StatusRow label="Account status" value={profile.status} />
          </div>
          <div className="border-t border-[#e1e9ef] px-4 py-3">
            <Link href="/admin/settings" onClick={() => onOpenChange(false)} className="mb-2 flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#263a54] transition hover:bg-[#f5f9fc]">
              <Settings className="h-4 w-4" />
              Admin settings
            </Link>
            <SignOutButton className="w-full justify-center" label="Logout" variant="secondary" />
          </div>
        </TopbarPanel>
      ) : null}
    </div>
  );
}

function EmergencyWorkflowDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const previous = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-workflow-title"
        tabIndex={-1}
        className="w-full max-w-xl rounded-xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#f2b8b5] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fde9e6] text-[#ba1a1a]">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div>
              <h2 id="emergency-workflow-title" className="text-lg font-bold text-[#11181c]">Emergency Workflow</h2>
              <p className="mt-1 text-sm leading-6 text-[#607084]">Clinic workflow shortcuts for urgent cases. This does not call external emergency services.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close emergency workflow" className="rounded-lg p-2 text-[#607084] transition hover:bg-[#f5f9fc] hover:text-[#263a54]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 px-5 py-5">
          <p className="rounded-lg border border-[#f2b8b5] bg-[#fff6f5] px-4 py-3 text-sm leading-6 text-[#8c1d18]">
            Use these shortcuts to find or create the appropriate clinic record for an urgent visit. No database record is created until you use the normal visit or patient workflow.
          </p>
          <Link href="/admin/visits" onClick={onClose} className="flex items-center gap-3 rounded-lg border border-[#d7e1e8] px-4 py-3 text-sm font-semibold text-[#263a54] transition hover:border-[#f2b8b5] hover:bg-[#fff6f5]">
            <ClipboardList className="h-5 w-5 text-[#ba1a1a]" />
            Go to Visits page
          </Link>
          <Link href="/admin/patients" onClick={onClose} className="flex items-center gap-3 rounded-lg border border-[#d7e1e8] px-4 py-3 text-sm font-semibold text-[#263a54] transition hover:border-[#f2b8b5] hover:bg-[#fff6f5]">
            <UserRound className="h-5 w-5 text-[#ba1a1a]" />
            Go to Patients page
          </Link>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#e1e9ef] px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-[#d7e1e8] px-4 text-sm font-semibold text-[#263a54] transition hover:bg-[#f5f9fc]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function TopbarIconButton({
  label,
  open,
  badge = false,
  onClick,
  children,
}: {
  label: string;
  open: boolean;
  badge?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full text-[#51647c] transition hover:bg-[#f0f4f7] hover:text-[#263a54] focus:outline-none focus:ring-2 focus:ring-[#00758d]/25",
        open && "bg-[#e6f4f7] text-[#00647c]",
      )}
    >
      {children}
      {badge ? <span className="absolute right-2.5 top-2 h-2.5 w-2.5 rounded-full border border-white bg-[#ba1a1a]" /> : null}
    </button>
  );
}

function TopbarPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("absolute top-12 z-40 overflow-hidden rounded-xl border border-[#d7e1e8] bg-white text-left shadow-[0_18px_44px_rgba(15,23,42,0.14)]", className)}>
      {children}
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-semibold uppercase tracking-[0.02em] text-[#7a8ca1]">{label}</span>
      <span className="text-right text-sm font-semibold capitalize text-[#263a54]">{value}</span>
    </div>
  );
}

function useDismissibleLayer<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && ref.current && !ref.current.contains(target)) onClose();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return ref;
}

function getRoleActiveHref(role: UserRole, segments: string[] | undefined, items: NavItem[]) {
  const path = segments?.length ? segments.join("/") : "dashboard";
  const currentHref = `/${role}/${path}`.replace(/\/+$/, "");
  const activeItem = items
    .filter((item) => currentHref === item.href || currentHref.startsWith(`${item.href}/`))
    .sort((first, second) => second.href.length - first.href.length)[0];

  return activeItem?.href ?? `/${role}/dashboard`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AD";
}
