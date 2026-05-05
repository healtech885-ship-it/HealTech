import Link from "next/link";
import { AlertTriangle, Info, UserPlus } from "lucide-react";

export function ReceptionAddPatientView() {
  return (
    <div className="px-6 py-5">
      {/* Breadcrumb & Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#51647c]">
            <Link href="/reception/patients" className="hover:underline">Patients</Link>
            <span className="mx-2">&gt;</span>
            <span>New Registration</span>
          </p>
          <h1 className="mt-1 text-[28px] font-bold leading-9 tracking-tight">Patient Registration</h1>
        </div>
        <p className="flex items-center gap-2 text-sm text-[#64717a]">
          <Info className="h-4 w-4" /> Fields marked with <span className="text-[#d32f2f]">*</span> are required
        </p>
      </div>

      {/* Duplicate Warning */}
      <div className="mt-5 rounded-xl border border-[#f5b8b8] bg-[#fef2f2] p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#d32f2f]" />
          <div>
            <p className="font-semibold text-[#d32f2f]">Potential Duplicate Detected</p>
            <p className="mt-1 text-sm text-[#51647c]">
              A patient with the name <b>John Doe</b> and DOB <b>1985-04-12</b> already exists in the system. Creating a duplicate record may cause clinical data fragmentation.
            </p>
            <button className="mt-3 rounded-lg border border-[#d7e1e7] bg-white px-4 py-2 text-sm font-medium">Review Existing Record</button>
          </div>
        </div>
      </div>

      {/* Form Grid */}
      <div className="mt-5 grid grid-cols-[1fr_380px] gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Basic Information */}
          <fieldset className="rounded-xl border border-[#d7e1e7] bg-white p-6">
            <legend className="flex items-center gap-2 px-2 text-lg font-semibold">
              <UserPlus className="h-5 w-5 text-[#51647c]" /> Basic Information
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <FormField label="First Name" required placeholder="John" defaultValue="John" />
              <FormField label="Last Name" required placeholder="Doe" defaultValue="Doe" />
              <FormField label="Date of Birth" required type="date" defaultValue="1985-04-12" />
              <FormField label="Gender" type="select" options={["Male", "Female"]} defaultValue="Male" />
            </div>
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Blood Type</p>
              <div className="flex gap-3">
                {["A+", "A-", "B+", "O+", "Unknown"].map((bt) => (
                  <label key={bt} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${bt === "O+" ? "border-[#0b9ab5] bg-[#e0f7fa]" : "border-[#d7e1e7]"}`}>
                    <input type="radio" name="blood_type" defaultChecked={bt === "O+"} className="accent-[#0b9ab5]" /> {bt}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          {/* Contact Information */}
          <fieldset className="rounded-xl border border-[#d7e1e7] bg-white p-6">
            <legend className="flex items-center gap-2 px-2 text-lg font-semibold">
              📇 Contact Information
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <FormField label="Phone Number" required placeholder="(555) 000-0000" defaultValue="(555) 000-0000" />
              <FormField label="Email Address" type="email" placeholder="patient@example.com" />
            </div>
            <div className="mt-4">
              <FormField label="Street Address" required placeholder="123 Main St" defaultValue="123 Main St" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <FormField label="City" required placeholder="City" />
              <FormField label="State" required placeholder="ST" />
              <FormField label="ZIP Code" required placeholder="12345" defaultValue="12345" />
            </div>
          </fieldset>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Identification & Status */}
          <fieldset className="rounded-xl border border-[#d7e1e7] bg-white p-6">
            <legend className="flex items-center gap-2 px-2 text-lg font-semibold">
              🏥 Identification &amp; Status
            </legend>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Medical Record Number (MRN)</p>
                <span className="rounded bg-[#e8ecf1] px-2 py-0.5 text-xs text-[#64717a]">Auto-generated</span>
              </div>
              <input className="mt-1 h-10 w-full rounded-lg border border-[#d7e1e7] bg-[#f5f9fc] px-3 text-sm" value="Pending Creation..." disabled />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium">Patient Type <span className="text-[#d32f2f]">*</span></p>
              <div className="mt-2 flex gap-4">
                {["Student", "Staff/Faculty", "Visitor"].map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <input type="radio" name="patient_type" defaultChecked={t === "Staff/Faculty"} className="accent-[#0b9ab5]" /> {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <FormField label="University ID / Employee ID" placeholder="e.g. 800123456" />
            </div>
            <div className="mt-4">
              <FormField label="Primary Department" type="select" options={["Administration", "Engineering", "Sciences"]} defaultValue="Administration" />
            </div>
          </fieldset>

          {/* Emergency Contact */}
          <fieldset className="rounded-xl border border-[#d7e1e7] bg-white p-6">
            <legend className="flex items-center gap-2 px-2 text-lg font-semibold">
              🎯 Emergency Contact
            </legend>
            <div className="mt-2">
              <FormField label="Full Name" required placeholder="Jane Doe" defaultValue="Jane Doe" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormField label="Relationship" required type="select" options={["Spouse", "Parent", "Sibling", "Other"]} defaultValue="Spouse" />
              <FormField label="Phone" required placeholder="(555) 111-2222" defaultValue="(555) 111-2222" />
            </div>
          </fieldset>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3 rounded-xl border border-[#d7e1e7] bg-white px-6 py-4">
        <Link href="/reception/patients" className="h-10 rounded-lg border border-[#b9c8d0] bg-white px-6 text-sm font-medium leading-10">Cancel</Link>
        <button className="h-10 rounded-lg border border-[#0b9ab5] px-6 text-sm font-semibold text-[#0b9ab5]">Save Patient</button>
        <button className="flex h-10 items-center gap-2 rounded-lg bg-[#0b5e6e] px-6 text-sm font-semibold text-white">
          <UserPlus className="h-4 w-4" /> Save and Create Visit
        </button>
      </div>
    </div>
  );
}

function FormField({ label, required, type = "text", placeholder, defaultValue, options }: {
  label: string; required?: boolean; type?: string; placeholder?: string; defaultValue?: string; options?: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}{required && <span className="text-[#d32f2f]"> *</span>}</span>
      {type === "select" ? (
        <select className="mt-1 h-10 w-full rounded-lg border border-[#c8d5de] bg-white px-3 text-sm outline-none focus:border-[#0b9ab5]" defaultValue={defaultValue}>
          {(options ?? []).map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} className="mt-1 h-10 w-full rounded-lg border border-[#c8d5de] bg-white px-3 text-sm outline-none focus:border-[#0b9ab5]" placeholder={placeholder} defaultValue={defaultValue} />
      )}
    </label>
  );
}
