/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Edit3, Info, MoreVertical, Plus, Shield } from "lucide-react";
import { AvatarCircle } from "./reception-shell";

const visits = [
  { date: "Today, 09:30 AM", provider: "Dr. Vance", complaint: "Routine Checkup", status: "Checked In", statusColor: "#0b9ab5", statusBg: "#e0f7fa" },
  { date: "Aug 14, 2023", provider: "Dr. Smith", complaint: "Fever, Cough", status: "Completed", statusColor: "#146c43", statusBg: "#d8f3df" },
  { date: "Mar 02, 2023", provider: "Dr. Vance", complaint: "Annual Physical", status: "Completed", statusColor: "#146c43", statusBg: "#d8f3df" },
  { date: "Nov 18, 2022", provider: "NP. Davis", complaint: "Vaccination", status: "Completed", statusColor: "#146c43", statusBg: "#d8f3df" },
];

export function ReceptionPatientDetailsView() {
  return (
    <div className="px-6 py-5">
      {/* Patient Header */}
      <div className="rounded-xl border border-[#d7e1e7] bg-[#f7fbff] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AvatarCircle initials="EH" color="#5b8fb9" />
            <div>
              <h1 className="text-2xl font-bold">Eleanor Harding</h1>
              <p className="text-sm text-[#51647c]">
                📋 MRN: 984-22-105 &nbsp;&nbsp; 📞 (555) 019-8372
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex h-10 items-center gap-2 rounded-lg border border-[#b9c8d0] bg-white px-4 text-sm font-medium">
              <Edit3 className="h-4 w-4" /> Edit
            </button>
            <Link href="/reception/visits/new" className="flex h-10 items-center gap-2 rounded-lg bg-[#0b5e6e] px-5 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Create Visit
            </Link>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="mt-5 grid grid-cols-[380px_1fr] gap-5">
        {/* Left Column - Info Cards */}
        <div className="space-y-5">
          {/* Demographics */}
          <div className="rounded-xl border border-[#d7e1e7] bg-white p-5">
            <h2 className="text-lg font-semibold">Demographics</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-[#0b9ab5]">DOB</dt><dd>Oct 12, 1985 (38y)</dd></div>
              <div className="flex justify-between"><dt className="text-[#0b9ab5]">Gender</dt><dd>Female</dd></div>
              <div className="flex justify-between"><dt className="text-[#0b9ab5]">Address</dt><dd className="text-right">1240 Willow Creek Rd<br />Apt 4B, Springfield</dd></div>
              <div className="flex justify-between"><dt className="text-[#0b9ab5]">Email</dt><dd>e.harding@email.com</dd></div>
            </dl>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-xl border border-[#d7e1e7] bg-white p-5">
            <h2 className="text-lg font-semibold">Emergency Contact</h2>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">Marcus Harding</p>
                <p className="text-[#0b9ab5]">Spouse</p>
              </div>
              <p>(555) 019-8833</p>
            </div>
          </div>

          {/* Insurance */}
          <div className="rounded-xl border border-[#d7e1e7] bg-white p-5">
            <h2 className="text-lg font-semibold">Insurance</h2>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">BlueCross Standard</p>
                <p className="text-[#64717a]">ID: BC-9948271</p>
              </div>
              <span className="rounded-full bg-[#d8f3df] px-3 py-1 text-xs font-semibold text-[#146c43]">Active</span>
            </div>
          </div>
        </div>

        {/* Right Column - Visit History */}
        <div className="space-y-5">
          <div className="rounded-xl border border-[#d7e1e7] bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-lg font-semibold">Visit History</h2>
              <button className="text-sm font-medium text-[#0b9ab5]">View All</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-[#e8ecf1] text-left text-xs font-semibold uppercase tracking-wider text-[#64717a]">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Provider</th>
                  <th className="px-6 py-3">Complaint</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v, i) => (
                  <tr key={i} className="border-t border-[#e8ecf1]">
                    <td className="px-6 py-4">{v.date}</td>
                    <td className="px-6 py-4">{v.provider}</td>
                    <td className="px-6 py-4">{v.complaint}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: v.statusBg, color: v.statusColor }}>{v.status}</span>
                    </td>
                    <td className="px-6 py-4"><MoreVertical className="h-4 w-4 text-[#8293a8]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Front Desk Note */}
          <div className="rounded-xl border border-[#f0dba8] bg-[#fffdf5] p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#b46a09]" />
              <div>
                <p className="font-semibold text-[#b46a09]">Front Desk Note</p>
                <p className="mt-1 text-sm text-[#51647c]">
                  Patient requested to update billing address on next visit. Please verify insurance card.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
