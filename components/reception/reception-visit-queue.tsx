import Link from "next/link";
import {
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock3,
  Filter, MoreVertical, Plus, RefreshCw, Search, Users,
} from "lucide-react";
import { Badge, badgeTone } from "@/components/ui/badge";
import { AvatarCircle } from "./reception-shell";

const queueStats = [
  { label: "Total in Queue", value: "24", icon: Users, helper: "Current waiting", tone: "blue" },
  { label: "Average Wait", value: "18m", icon: Clock3, helper: "Target: < 15m", tone: "amber" },
  { label: "Checked In", value: "8", icon: CheckCircle2, helper: "With providers", tone: "green" },
  { label: "Overdue (>30m)", value: "3", icon: AlertTriangle, helper: "Needs attention", tone: "red" },
];

const visits = [
  { code: "VN-8492", patient: "Sarah Jenkins", initials: "SJ", dob: "05/12/84", doctor: "Dr. Vance", dept: "General Practice", priority: "Normal", waitTime: "12m", status: "Waiting", color: "#5b8fb9" },
  { code: "VN-8493", patient: "Michael Chang", initials: "MC", dob: "11/03/92", doctor: "Dr. Vance", dept: "General Practice", priority: "Normal", waitTime: "8m", status: "Waiting", color: "#c59434" },
  { code: "VN-8494", patient: "Elena Rostova", initials: "ER", dob: "02/18/76", doctor: "Dr. Smith", dept: "Internal Medicine", priority: "High", waitTime: "45m", status: "Delayed", color: "#8293a8" },
  { code: "VN-8495", patient: "David Miller", initials: "DM", dob: "08/25/65", doctor: "Dr. Vance", dept: "General Practice", priority: "Normal", waitTime: "5m", status: "Checked In", color: "#5b8fb9" },
  { code: "VN-8496", patient: "Aisha Karim", initials: "AK", dob: "03/14/90", doctor: "Dr. Patel", dept: "Pediatrics", priority: "Urgent", waitTime: "2m", status: "Checked In", color: "#c59434" },
  { code: "VN-8497", patient: "Robert Johansson", initials: "RJ", dob: "01/22/60", doctor: "Dr. Lee", dept: "Orthopedics", priority: "Normal", waitTime: "22m", status: "Waiting", color: "#64717a" },
];

export function ReceptionVisitQueueView() {
  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 tracking-tight">Visit Queue</h1>
          <p className="text-[15px] text-[#51647c]">Monitor and manage today&apos;s patient visits in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex h-10 items-center gap-2 rounded-lg border border-[#b9c8d0] bg-white px-4 text-sm font-medium">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <Link href="/reception/visits/new" className="flex h-10 items-center gap-2 rounded-lg bg-[#0b5e6e] px-5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Create Visit
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {queueStats.map((stat) => {
          const borderColor = stat.tone === "red" ? "border-[#f5b8b8]" : "border-[#d7e1e7]";
          const bgColor = stat.tone === "red" ? "bg-[#fff5f5]" : "bg-white";
          return (
            <div key={stat.label} className={`rounded-xl border p-4 ${borderColor} ${bgColor}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64717a]">{stat.label}</p>
                <stat.icon className={`h-5 w-5 ${stat.tone === "red" ? "text-[#d32f2f]" : stat.tone === "amber" ? "text-[#b46a09]" : stat.tone === "green" ? "text-[#146c43]" : "text-[#51647c]"}`} />
              </div>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-[#64717a]">{stat.helper}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          {["All Visits", "Waiting", "Checked In", "Delayed"].map((tab, i) => (
            <button key={tab} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${i === 0 ? "border-[#0b9ab5] bg-[#e0f7fa] text-[#0b9ab5]" : "border-[#d7e1e7] bg-white text-[#51647c] hover:border-[#0b9ab5]"}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8293a8]" />
            <input className="h-9 w-full rounded-lg border border-[#c8d5de] bg-white pl-9 pr-3 text-sm outline-none" placeholder="Search visits..." />
          </div>
          <button className="flex h-9 items-center gap-2 rounded-lg border border-[#c8d5de] bg-white px-3 text-sm">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-[#d7e1e7] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8ecf1] text-left text-xs font-semibold uppercase tracking-wider text-[#64717a]">
              <th className="px-5 py-3">Visit ID</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Doctor</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Wait Time</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
                <tr key={v.code} className="border-t border-[#e8ecf1] hover:bg-[#f9fbfd]">
                  <td className="px-5 py-4 font-medium text-[#0b9ab5]">{v.code}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <AvatarCircle initials={v.initials} color={v.color} />
                      <div>
                        <p className="font-semibold">{v.patient}</p>
                        <p className="text-xs text-[#64717a]">DOB: {v.dob}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{v.doctor}</td>
                  <td className="px-5 py-4 text-[#64717a]">{v.dept}</td>
                  <td className="px-5 py-4">
                    <Badge tone={badgeTone(v.priority)}>{v.priority}</Badge>
                  </td>
                  <td className={`px-5 py-4 font-medium ${v.status === "Delayed" ? "text-[#d32f2f]" : ""}`}>{v.waitTime}</td>
                  <td className="px-5 py-4">
                    <Badge tone={badgeTone(v.status)}>{v.status}</Badge>
                  </td>
                  <td className="px-5 py-4"><MoreVertical className="h-4 w-4 text-[#8293a8]" /></td>
                </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-[#e8ecf1] px-5 py-3 text-sm text-[#64717a]">
          <p>Showing 1-6 of 24 visits</p>
          <div className="flex gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded border border-[#d5dfe5] text-[#96a3ac]"><ChevronLeft className="h-4 w-4" /></button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-[#0b9ab5] text-[#0b9ab5]">1</button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-[#d5dfe5]">2</button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-[#d5dfe5]">3</button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-[#d5dfe5]"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
