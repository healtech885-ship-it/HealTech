import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Calendar, Search, UserPlus, SlidersHorizontal } from "lucide-react";
import { Select } from "@/components/ui/select";
import { AvatarCircle } from "./reception-shell";

const patients = [
  { initials: "EW", name: "Eleanor Weaver", phone: "(555) 019-2834", mrn: "M-88291", sid: "STD-091A", age: "28 yrs", gender: "Female", dept: "Cardiology", lastVisit: "Oct 12, 2023", status: "Active", statusColor: "#0b9ab5", statusBg: "#e0f7fa", color: "#5b8fb9" },
  { initials: "MH", name: "Marcus Hayes", phone: "(555) 837-1120", mrn: "M-77420", sid: "-", age: "45 yrs", gender: "Male", dept: "General Practice", lastVisit: "Sep 04, 2023", status: "Follow-up Req.", statusColor: "#b46a09", statusBg: "#fff3d6", color: "#c59434" },
];

export function ReceptionPatientsView() {
  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 tracking-tight">Patient Directory</h1>
          <p className="text-[15px] text-[#51647c]">Search, filter, and manage patient records.</p>
        </div>
        <Link href="/reception/patients/new" className="flex h-10 items-center gap-2 rounded-lg bg-[#0b5e6e] px-5 text-sm font-semibold text-white">
          <UserPlus className="h-4 w-4" /> Add Patient
        </Link>
      </div>

      {/* Search */}
      <div className="mt-6 rounded-xl border border-[#d7e1e7] bg-white p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8293a8]" />
            <input className="h-11 w-full rounded-lg border border-[#c8d5de] bg-white pl-11 pr-4 text-sm outline-none placeholder:text-[#8293a8] focus:border-[#0b9ab5]" placeholder="Search by patient name, phone, MRN, or student ID..." />
          </div>
          <button className="h-11 rounded-lg bg-[#0b9ab5] px-6 text-sm font-semibold text-white">Search</button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-medium text-[#51647c]">
            <SlidersHorizontal className="h-4 w-4" /> Filters:
          </span>
          <Select
            aria-label="Filter patients by gender"
            defaultValue="Gender (All)"
            options={["Gender (All)", "Male", "Female"]}
            className="w-36"
            triggerClassName="h-9 min-h-9"
          />
          <Select
            aria-label="Filter patients by department"
            defaultValue="Department (All)"
            options={["Department (All)", "Cardiology", "General Practice", "Neurology"]}
            className="w-48"
            triggerClassName="h-9 min-h-9"
          />
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8293a8]" />
            <input type="date" className="h-9 rounded-lg border border-[#c8d5de] bg-white pl-9 pr-3 text-sm outline-none" />
          </div>
          <button className="text-sm font-medium text-[#0b9ab5]">Clear Filters</button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-[#d7e1e7] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e8ecf1] text-left text-xs font-semibold uppercase tracking-wider text-[#64717a]">
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">MRN / ID</th>
              <th className="px-6 py-3">Demographics</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Last Visit</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.mrn} className="border-t border-[#e8ecf1]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <AvatarCircle initials={p.initials} color={p.color} />
                    <div>
                      <p className="font-semibold text-[#0b9ab5]">{p.name}</p>
                      <p className="text-xs text-[#64717a]">{p.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">{p.mrn}</p>
                  <p className="text-xs text-[#64717a]">{p.sid}</p>
                </td>
                <td className="px-6 py-4">
                  <p>{p.age}</p>
                  <p className="text-xs text-[#64717a]">{p.gender}</p>
                </td>
                <td className="px-6 py-4">{p.dept}</td>
                <td className="px-6 py-4">{p.lastVisit}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: p.statusBg, color: p.statusColor }}>{p.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 text-[#64717a]">
                    <Link href={`/reception/patients/eleanor-harding`}><Eye className="h-4 w-4" /></Link>
                    <Calendar className="h-4 w-4" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-[#e8ecf1] px-6 py-3 text-sm text-[#64717a]">
          <p>Showing 1-2 of 42 results</p>
          <div className="flex gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded border border-[#d5dfe5] text-[#96a3ac]"><ChevronLeft className="h-4 w-4" /></button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-[#d5dfe5]"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
