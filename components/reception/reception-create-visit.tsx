import Link from "next/link";
import { AlertCircle, Calendar, Clock3, Info, Search, Stethoscope, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarCircle } from "./reception-shell";

const recentPatients = [
  { initials: "SJ", name: "Sarah Jenkins", mrn: "MRN-94821", phone: "(555) 123-4567", color: "#5b8fb9" },
  { initials: "MC", name: "Michael Chang", mrn: "MRN-94830", phone: "(555) 234-5678", color: "#c59434" },
  { initials: "ER", name: "Elena Rostova", mrn: "MRN-94823", phone: "(555) 345-6789", color: "#8293a8" },
];

const availableDoctors = [
  { name: "Dr. Vance", specialty: "General Practice", available: true, nextSlot: "09:30 AM" },
  { name: "Dr. Smith", specialty: "Internal Medicine", available: true, nextSlot: "10:00 AM" },
  { name: "Dr. Patel", specialty: "Pediatrics", available: false, nextSlot: "11:30 AM" },
  { name: "Dr. Lee", specialty: "Orthopedics", available: true, nextSlot: "09:45 AM" },
];

export function ReceptionCreateVisitView() {
  return (
    <div className="px-6 py-5">
      {/* Breadcrumb & Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#51647c]">
            <Link href="/reception/visits" className="hover:underline">Visits</Link>
            <span className="mx-2">&gt;</span>
            <span>Create Visit</span>
          </p>
          <h1 className="mt-1 text-[28px] font-bold leading-9 tracking-tight">Create New Visit</h1>
          <p className="mt-1 text-[15px] text-[#51647c]">Assign a patient to a doctor and start a new clinical visit.</p>
        </div>
        <p className="flex items-center gap-2 text-sm text-[#64717a]">
          <Info className="h-4 w-4" /> Fields marked with <span className="text-[#d32f2f]">*</span> are required
        </p>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_360px] gap-5">
        {/* Left Column - Form */}
        <div className="space-y-5">
          {/* Patient Selection */}
          <fieldset className="rounded-xl border border-[#d7e1e7] bg-white p-6">
            <legend className="flex items-center gap-2 px-2 text-lg font-semibold">
              <UserPlus className="h-5 w-5 text-[#51647c]" /> Patient Selection
            </legend>
            <p className="mt-1 text-sm text-[#64717a]">Search and select the patient for this visit.</p>
            <div className="mt-4 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8293a8]" />
                <Input className="pl-11 pr-4" placeholder="Search patient by name, MRN, or phone..." />
              </div>
              <button className="h-11 rounded-lg bg-[#0b9ab5] px-5 text-sm font-semibold text-white">Search</button>
            </div>
            {/* Selected Patient */}
            <div className="mt-4 flex items-center justify-between rounded-lg border border-[#0b9ab5] bg-[#f0fbfd] p-4">
              <div className="flex items-center gap-3">
                <AvatarCircle initials="SJ" color="#5b8fb9" />
                <div>
                  <p className="font-semibold">Sarah Jenkins</p>
                  <p className="text-xs text-[#64717a]">MRN-94821 • (555) 123-4567 • DOB: 05/12/84</p>
                </div>
              </div>
              <span className="rounded-full bg-[#d8f3df] px-3 py-1 text-xs font-semibold text-[#146c43]">Selected</span>
            </div>
          </fieldset>

          {/* Visit Details */}
          <fieldset className="rounded-xl border border-[#d7e1e7] bg-white p-6">
            <legend className="flex items-center gap-2 px-2 text-lg font-semibold">
              <Stethoscope className="h-5 w-5 text-[#51647c]" /> Visit Details
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <FormField label="Assigned Doctor" required type="select" options={["Dr. Vance - General Practice", "Dr. Smith - Internal Medicine", "Dr. Patel - Pediatrics", "Dr. Lee - Orthopedics"]} defaultValue="Dr. Vance - General Practice" />
              <FormField label="Visit Type" required type="select" options={["Walk-in", "Scheduled", "Follow-up", "Emergency"]} defaultValue="Walk-in" />
              <FormField label="Priority" required type="select" options={["Normal", "High", "Urgent"]} defaultValue="Normal" />
              <FormField label="Department" type="select" options={["General Practice", "Internal Medicine", "Pediatrics", "Orthopedics", "Cardiology"]} defaultValue="General Practice" />
            </div>
            <div className="mt-4">
              <div className="grid gap-1.5">
                <Label htmlFor="chief_complaint">Chief Complaint <span className="text-[#d32f2f]">*</span></Label>
                <Textarea id="chief_complaint" placeholder="Describe the patient's primary reason for the visit..." defaultValue="Routine checkup, patient reports mild headache for 3 days." />
              </div>
            </div>
            <div className="mt-4">
              <FormField label="Symptoms (optional)" placeholder="e.g. Headache, Fatigue, Mild fever" />
            </div>
          </fieldset>
        </div>

        {/* Right Column - Info Panels */}
        <div className="space-y-5">
          {/* Doctor Availability */}
          <div className="rounded-xl border border-[#d7e1e7] bg-white p-5">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Clock3 className="h-4 w-4 text-[#0b9ab5]" /> Doctor Availability
            </h3>
            <div className="mt-4 space-y-3">
              {availableDoctors.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between rounded-lg border border-[#e8ecf1] p-3">
                  <div>
                    <p className="text-sm font-semibold">{doc.name}</p>
                    <p className="text-xs text-[#64717a]">{doc.specialty}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${doc.available ? "bg-[#d8f3df] text-[#146c43]" : "bg-[#fde8e8] text-[#d32f2f]"}`}>
                      {doc.available ? "Available" : "Busy"}
                    </span>
                    <p className="mt-1 text-xs text-[#64717a]">Next: {doc.nextSlot}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Patients Quick Pick */}
          <div className="rounded-xl border border-[#d7e1e7] bg-white p-5">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4 text-[#0b9ab5]" /> Recent Patients
            </h3>
            <div className="mt-4 space-y-3">
              {recentPatients.map((p) => (
                <button key={p.mrn} type="button" className="flex w-full items-center gap-3 rounded-lg border border-[#e8ecf1] p-3 text-left transition hover:border-[#0b9ab5] hover:bg-[#f0fbfd]">
                  <AvatarCircle initials={p.initials} color={p.color} />
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-[#64717a]">{p.mrn} • {p.phone}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Visit Guidelines */}
          <div className="rounded-xl border border-[#f0dba8] bg-[#fffdf5] p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#b46a09]" />
              <div>
                <p className="font-semibold text-[#b46a09]">Visit Guidelines</p>
                <p className="mt-1 text-xs text-[#51647c]">Ensure patient ID has been verified. Insurance information should be confirmed before creating the visit. Urgent cases should be flagged with high priority.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3 rounded-xl border border-[#d7e1e7] bg-white px-6 py-4">
        <Link href="/reception/visits" className="h-10 rounded-lg border border-[#b9c8d0] bg-white px-6 text-sm font-medium leading-10">Cancel</Link>
        <button className="h-10 rounded-lg border border-[#0b9ab5] px-6 text-sm font-semibold text-[#0b9ab5]">Save as Draft</button>
        <button className="flex h-10 items-center gap-2 rounded-lg bg-[#0b5e6e] px-6 text-sm font-semibold text-white">
          <Stethoscope className="h-4 w-4" /> Create Visit &amp; Queue
        </button>
      </div>
    </div>
  );
}

function FormField({ label, required, type = "text", placeholder, defaultValue, options }: {
  label: string; required?: boolean; type?: string; placeholder?: string; defaultValue?: string; options?: string[];
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}{required && <span className="text-[#d32f2f]"> *</span>}</Label>
      {type === "select" ? (
        <select id={id} className="h-11 w-full rounded-lg border border-[#c8d5de] bg-white px-3 text-sm outline-none focus:border-[#0b9ab5] focus:ring-3 focus:ring-[#00758d]/15" defaultValue={defaultValue}>
          {(options ?? []).map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <Input id={id} type={type} placeholder={placeholder} defaultValue={defaultValue} />
      )}
    </div>
  );
}
