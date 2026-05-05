import {
  Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Download,
  Eye, Filter, MoreVertical, Search, TrendingUp, Users,
} from "lucide-react";
import { AvatarCircle } from "./reception-shell";

const completedVisits = [
  { code: "VN-8480", patient: "James Wilson", initials: "JW", dob: "06/15/78", doctor: "Dr. Vance", dept: "General Practice", complaint: "Annual Physical", duration: "32m", completedAt: "Today, 08:45 AM", color: "#5b8fb9" },
  { code: "VN-8479", patient: "Maria Santos", initials: "MS", dob: "09/22/85", doctor: "Dr. Smith", dept: "Internal Medicine", complaint: "Follow-up: Hypertension", duration: "18m", completedAt: "Today, 08:12 AM", color: "#c59434" },
  { code: "VN-8475", patient: "Ahmad Khalil", initials: "AK", dob: "12/01/70", doctor: "Dr. Lee", dept: "Orthopedics", complaint: "Knee Pain Assessment", duration: "45m", completedAt: "Yesterday, 04:30 PM", color: "#8293a8" },
  { code: "VN-8472", patient: "Lisa Park", initials: "LP", dob: "04/08/95", doctor: "Dr. Patel", dept: "Pediatrics", complaint: "Child Wellness Visit", duration: "25m", completedAt: "Yesterday, 03:15 PM", color: "#5b8fb9" },
  { code: "VN-8470", patient: "Omar Farouk", initials: "OF", dob: "07/19/88", doctor: "Dr. Vance", dept: "General Practice", complaint: "Fever, Cough", duration: "22m", completedAt: "Yesterday, 02:00 PM", color: "#c59434" },
  { code: "VN-8468", patient: "Catherine Bell", initials: "CB", dob: "11/30/62", doctor: "Dr. Smith", dept: "Internal Medicine", complaint: "Diabetes Review", duration: "38m", completedAt: "Yesterday, 11:20 AM", color: "#64717a" },
];

export function ReceptionCompletedVisitsView() {
  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 tracking-tight">Completed Visits</h1>
          <p className="text-[15px] text-[#51647c]">Review past visits, outcomes, and clinical summaries.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex h-10 items-center gap-2 rounded-lg border border-[#b9c8d0] bg-white px-4 text-sm font-medium">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <StatBox label="Completed Today" value="21" icon={CheckCircle2} helper="On track" iconColor="text-[#146c43]" />
        <StatBox label="Avg. Duration" value="28m" icon={Clock3} helper="Target: < 30m" iconColor="text-[#0b9ab5]" />
        <StatBox label="Total This Week" value="142" icon={TrendingUp} helper="+8% vs last week" iconColor="text-[#51647c]" />
        <StatBox label="Patient Seen" value="138" icon={Users} helper="Unique patients" iconColor="text-[#51647c]" />
      </div>

      {/* Filters */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-3">
          <div className="relative w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8293a8]" />
            <input className="h-9 w-full rounded-lg border border-[#c8d5de] bg-white pl-9 pr-3 text-sm outline-none" placeholder="Search by patient, visit ID..." />
          </div>
          <select className="h-9 rounded-lg border border-[#c8d5de] bg-white px-3 text-sm outline-none">
            <option>All Doctors</option><option>Dr. Vance</option><option>Dr. Smith</option><option>Dr. Patel</option><option>Dr. Lee</option>
          </select>
          <select className="h-9 rounded-lg border border-[#c8d5de] bg-white px-3 text-sm outline-none">
            <option>All Departments</option><option>General Practice</option><option>Internal Medicine</option><option>Pediatrics</option>
          </select>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8293a8]" />
            <input type="date" className="h-9 rounded-lg border border-[#c8d5de] bg-white pl-9 pr-3 text-sm outline-none" />
          </div>
        </div>
        <button className="flex h-9 items-center gap-2 rounded-lg border border-[#c8d5de] bg-white px-3 text-sm">
          <Filter className="h-4 w-4" /> More Filters
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-[#d7e1e7] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8ecf1] text-left text-xs font-semibold uppercase tracking-wider text-[#64717a]">
              <th className="px-5 py-3">Visit ID</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Doctor</th>
              <th className="px-5 py-3">Complaint</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Completed</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {completedVisits.map((v) => (
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
                <td className="px-5 py-4 text-[#51647c]">{v.complaint}</td>
                <td className="px-5 py-4 font-medium">{v.duration}</td>
                <td className="px-5 py-4 text-[#64717a]">{v.completedAt}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[#d8f3df] px-3 py-1 text-xs font-semibold text-[#146c43]">Completed</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2 text-[#64717a]">
                    <Eye className="h-4 w-4 cursor-pointer hover:text-[#0b9ab5]" />
                    <MoreVertical className="h-4 w-4" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-[#e8ecf1] px-5 py-3 text-sm text-[#64717a]">
          <p>Showing 1-6 of 142 completed visits</p>
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

function StatBox({ label, value, icon: Icon, helper, iconColor }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; helper: string; iconColor: string }) {
  return (
    <div className="rounded-xl border border-[#d7e1e7] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64717a]">{label}</p>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="text-xs text-[#64717a]">{helper}</p>
    </div>
  );
}
