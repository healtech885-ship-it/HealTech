import Link from "next/link";
import {
  AlertTriangle, Calendar, CheckCircle2, MoreVertical, Plus,
  Search, TrendingUp, UserPlus, Users, Activity, Zap,
} from "lucide-react";
import { AvatarCircle } from "./reception-shell";

const visitQueue = [
  { time: "09:00 AM", name: "Sarah Jenkins", dob: "05/12/84", provider: "Dr. Vance", status: "Active", statusColor: "#0b9ab5", statusBg: "#e0f7fa" },
  { time: "09:30 AM", name: "Michael Chang", dob: "11/03/92", provider: "Dr. Vance", status: "Queued", statusColor: "#475569", statusBg: "#e8ecf1" },
  { time: "08:45 AM", name: "Elena Rostova", dob: "02/18/76", provider: "Dr. Smith", status: "Delayed (45m)", statusColor: "#d32f2f", statusBg: "#fde8e8", timeRed: true },
  { time: "10:00 AM", name: "David Miller", dob: "08/25/65", provider: "Dr. Vance", status: "Queued", statusColor: "#475569", statusBg: "#e8ecf1" },
];

const recentPatients = [
  { initials: "AJ", name: "Alex Johnson", id: "MC-8492", color: "#5b8fb9" },
  { initials: "BW", name: "Beth Williams", id: "MC-7731", color: "#c59434" },
  { initials: "TC", name: "Thomas Chen", id: "MC-9102", color: "#8293a8" },
];

export function ReceptionDashboardView() {
  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 tracking-tight">Reception Dashboard</h1>
          <p className="text-[15px] text-[#51647c]">Today&apos;s Overview • Oct 24, 2023</p>
        </div>
        <div className="flex gap-3">
          <Link href="/reception/patients" className="flex h-10 items-center gap-2 rounded-lg border border-[#b9c8d0] bg-white px-4 text-sm font-medium">
            <Search className="h-4 w-4" /> Search Patient
          </Link>
          <Link href="/reception/patients/new" className="flex h-10 items-center gap-2 rounded-lg border border-[#b9c8d0] bg-white px-4 text-sm font-medium">
            <UserPlus className="h-4 w-4" /> Add Patient
          </Link>
          <Link href="/reception/visits/new" className="flex h-10 items-center gap-2 rounded-lg bg-[#0b5e6e] px-5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Create Visit
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-6 grid grid-cols-6 gap-4">
        <StatBox label="TODAY'S" sublabel="VISITS" value="42" icon={<Calendar className="h-5 w-5 text-[#51647c]" />} />
        <StatBox label="QUEUED" value="18" icon={<Users className="h-5 w-5 text-[#51647c]" />} />
        <StatBox label="ACTIVE" value="3" icon={<Activity className="h-5 w-5 text-[#d32f2f]" />} />
        <StatBox label="COMPLETED" value="21" icon={<CheckCircle2 className="h-5 w-5 text-[#51647c]" />} />
        <StatBox label="NEW PATIENTS" value="5" icon={<TrendingUp className="h-5 w-5 text-[#51647c]" />} />
        <StatBox label="WAIT ALERT" value="2" sublabel="> 30m" icon={<AlertTriangle className="h-5 w-5 text-[#d32f2f]" />} danger />
      </div>

      {/* Main Content */}
      <div className="mt-6 grid grid-cols-[1fr_320px] gap-5">
        {/* Visit Queue */}
        <div className="rounded-xl border border-[#d7e1e7] bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold">Today&apos;s Visit Queue</h2>
            <button className="text-sm font-medium text-[#0b9ab5]">View All</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-[#e8ecf1] text-left text-xs font-semibold uppercase tracking-wider text-[#64717a]">
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitQueue.map((v) => (
                <tr key={v.name} className="border-t border-[#e8ecf1]">
                  <td className={`px-6 py-4 font-medium ${v.timeRed ? "text-[#d32f2f]" : ""}`}>{v.time}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{v.name}</p>
                    <p className="text-xs text-[#64717a]">DOB: {v.dob}</p>
                  </td>
                  <td className="px-6 py-4">{v.provider}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: v.statusBg, color: v.statusColor }}>{v.status}</span>
                  </td>
                  <td className="px-6 py-4"><MoreVertical className="h-4 w-4 text-[#8293a8]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Operational Alerts */}
          <div className="rounded-xl border border-[#d7e1e7] bg-white p-5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#d32f2f]">
              <Zap className="h-4 w-4" /> Operational Alerts
            </h3>
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#fde8e8] bg-[#fff8f8] p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#d32f2f]" />
              <div>
                <p className="text-sm font-semibold">Wait Time Exceeded</p>
                <p className="mt-1 text-xs text-[#64717a]">2 patients have been waiting &gt; 30 mins in Lobby A.</p>
              </div>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="rounded-xl border border-[#d7e1e7] bg-white p-5">
            <h3 className="text-base font-semibold">Recent Patients</h3>
            <div className="mt-4 space-y-3">
              {recentPatients.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AvatarCircle initials={p.initials} color={p.color} />
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-[#64717a]">ID: {p.id}</p>
                    </div>
                  </div>
                  <button className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d7e1e7]">
                    <Plus className="h-3.5 w-3.5 text-[#64717a]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, sublabel, value, icon, danger }: { label: string; sublabel?: string; value: string; icon: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${danger ? "border-[#f5b8b8] bg-[#fff5f5]" : "border-[#d7e1e7] bg-white"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64717a]">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {sublabel && <p className="text-xs text-[#64717a]">{sublabel}</p>}
    </div>
  );
}
