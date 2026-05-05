/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  Activity, AlertTriangle, Bell, Calendar, ChevronRight, CircleHelp,
  Clock3, ClipboardCheck, Grid2X2, LogOut, MoreVertical, Plus,
  Search, Settings, User, UserPlus, Users,
} from "lucide-react";

export type ReceptionView = "dashboard" | "patients" | "add-patient" | "patient-details" | "create-visit" | "visit-queue" | "completed-visits";

export function getReceptionView(segments?: string[]): ReceptionView {
  const path = (segments ?? ["dashboard"]).join("/");
  if (path === "patients") return "patients";
  if (path === "patients/new") return "add-patient";
  if (path.startsWith("patients/") && path !== "patients/new") return "patient-details";
  if (path === "visits/new") return "create-visit";
  if (path === "visits/completed") return "completed-visits";
  if (path === "visits") return "visit-queue";
  return "dashboard";
}

export function ReceptionSidebar({ active }: { active: string }) {
  const items = [
    { label: "Dashboard", href: "/reception/dashboard", icon: Grid2X2 },
    { label: "Patients", href: "/reception/patients", icon: Users },
    { label: "Appointments", href: "/reception/visits", icon: Calendar },
    { label: "Medical Records", href: "/reception/patients", icon: ClipboardCheck },
    { label: "Analytics", href: "/reception/dashboard", icon: Activity },
    { label: "Billing", href: "/reception/dashboard", icon: Clock3 },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[260px] flex-col border-r border-[#d7e1e7] bg-[#f7fbff] px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-[#006f87] text-lg font-bold text-white">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold leading-6 tracking-tight text-[#10171c]">City General</p>
          <p className="text-sm text-[#51647c]">Admin Wing</p>
        </div>
      </div>

      <Link href="/reception/visits/new" className="mt-8 flex h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0b9ab5] text-[15px] font-semibold text-white shadow-sm">
        <Plus className="h-4 w-4" />
        New Consultation
      </Link>

      <nav className="mt-4 space-y-1">
        {items.map((item) => {
          const selected = item.label === active;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-[44px] items-center gap-4 rounded-lg px-4 text-[15px] font-medium transition ${selected ? "border border-[#d5e1e8] bg-white text-[#0089a8] shadow-sm" : "text-[#263a54] hover:bg-white"
                }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#d7e1e7] pt-4">
        <Link href="/reception/dashboard" className="flex h-[44px] items-center gap-4 rounded-lg px-4 text-[15px] font-medium text-[#263a54]">
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
        <button type="button" className="flex h-[44px] w-full items-center gap-4 rounded-lg px-4 text-left text-[15px] font-medium text-[#263a54]">
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export function ReceptionTopbar({ searchPlaceholder, children }: { searchPlaceholder: string; children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b border-[#d9e3ea] bg-white px-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <p className="mr-6 text-lg font-bold tracking-tight text-[#080d10]">HealTech</p>
      <div className="relative w-[340px]">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8293a8]" />
        <input className="h-10 w-full rounded-full border-0 bg-[#f5f9fc] pl-11 pr-4 text-sm outline-none placeholder:text-[#8293a8]" placeholder={searchPlaceholder} />
      </div>
      <div className="flex-1" />
      {children}
      <div className="ml-4 flex items-center gap-5 text-[#51647c]">
        <Bell className="h-5 w-5" />
        <Clock3 className="h-5 w-5" />
        <CircleHelp className="h-5 w-5" />
        <span className="h-6 w-px bg-[#d7e1e7]" />
        <button className="rounded-full border border-[#f5b8b8] px-5 py-1.5 text-sm font-medium text-[#d00000]">✱ Emergency</button>
        <img alt="" src="https://i.pravatar.cc/80?img=13" className="h-8 w-8 rounded-full border border-[#c7d5e0]" />
      </div>
    </header>
  );
}

export function AvatarCircle({ initials, color = "#51647c" }: { initials: string; color?: string }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: color }}>
      {initials}
    </span>
  );
}

export { Search, UserPlus, Plus, MoreVertical, ChevronRight, AlertTriangle, User };
