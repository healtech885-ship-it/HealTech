"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Beaker,
  Bell,
  CalendarClock,
  ClipboardList,
  HeartPulse,
  Loader2,
  LogOut,
  Pill,
  Search,
  Settings,
} from "lucide-react";
import { Badge, badgeTone } from "@/components/ui/badge";
import { EmptyState as SharedEmptyState, FeedbackAlert, LoadingState as SharedLoadingState } from "@/components/ui/data-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { navigationByRole } from "@/lib/constants/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { AppProfile } from "@/types/app.types";

type PatientShellProps = {
  profile: AppProfile;
  segments?: string[];
};

type Screen = "dashboard" | "profile" | "visits" | "lab-results" | "medicines" | "appointment-requests" | "notifications" | "account-settings";
type FilterValue = string | number | boolean;

type DepartmentSummary = {
  name: string;
};

type DepartmentOption = {
  id: string;
  name: string;
  status: string;
};

type PatientRecord = {
  id: string;
  profile_id: string | null;
  full_name: string;
  student_id: string | null;
  mrn: string | null;
  gender: string | null;
  birth_date: string | null;
  phone: string | null;
  emergency_phone: string | null;
  blood_type: string | null;
  address: string | null;
  dorm_info: string | null;
  nationality: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  departments: DepartmentSummary | null;
};

type DoctorSummary = {
  full_name: string;
  email: string;
};

type VisitRecord = {
  id: string;
  visit_code: string;
  patient_id: string;
  doctor_id: string;
  status: string;
  priority: string;
  chief_complaint: string | null;
  doctor_instructions: string | null;
  created_at: string;
  completed_at: string | null;
  doctor: DoctorSummary | null;
};

type AppointmentRequestRecord = {
  id: string;
  patient_id: string;
  requested_department_id: string | null;
  preferred_date: string | null;
  reason: string | null;
  status: string;
  admin_comment: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  requested_department: DepartmentSummary | null;
  reviewer: DoctorSummary | null;
};

type AppointmentRequestFormState = {
  requested_department_id: string;
  preferred_date: string;
  reason: string;
};

type AppointmentRequestInsert = {
  patient_id: string;
  requested_department_id: string | null;
  preferred_date: string;
  reason: string;
  status: "pending";
};

type PatientContactFormState = {
  phone: string;
  emergency_phone: string;
  address: string;
};

type PatientContactUpdate = {
  phone: string | null;
  emergency_phone: string | null;
  address: string | null;
};

type LabResultRecord = {
  id: string;
  visit_id: string;
  patient_id: string;
  doctor_id: string;
  lab_test_id: string;
  result_value: string | null;
  result_notes: string | null;
  status: string;
  entered_at: string | null;
  reviewed_at: string | null;
  visible_to_patient: boolean;
  created_at: string;
  updated_at: string;
  lab_tests: {
    name: string;
    code: string | null;
    unit: string | null;
    normal_range: string | null;
    description: string | null;
  } | null;
  visits: {
    id: string;
    visit_code: string;
    chief_complaint: string | null;
    status: string;
    priority: string;
    created_at: string;
    completed_at: string | null;
  } | null;
  doctor: DoctorSummary | null;
};

type PrescriptionItemRecord = {
  id: string;
  prescription_id: string;
  medicine_id: string;
  requested_quantity: number;
  dispensed_quantity: number;
  dosage_instructions: string | null;
  status: string;
  dispensed_at: string | null;
  created_at: string;
  updated_at: string | null;
  medicines: {
    id: string;
    name: string;
    category: string | null;
    description: string | null;
    status: string;
  } | null;
};

type PrescriptionRecord = {
  id: string;
  visit_id: string;
  patient_id: string;
  doctor_id: string;
  status: string;
  doctor_notes: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string | null;
  visits: {
    id: string;
    visit_code: string;
    chief_complaint: string | null;
    status: string;
    priority: string;
    created_at: string;
    completed_at: string | null;
  } | null;
  doctor: DoctorSummary | null;
  prescription_items: PrescriptionItemRecord[];
};

type QueryState<T> = {
  loading: boolean;
  data: T;
  error: string | null;
};

type PatientLoadState = {
  loading: boolean;
  patient: PatientRecord | null;
  error: string | null;
};

type DashboardCounts = {
  visits: number;
  visibleLabs: number;
  prescriptions: number;
  appointmentRequests: number;
};

type QueryError = { message: string };
type QueryResult<T> = { data: T[] | null; error: QueryError | null; count?: number | null };
type CountResult = { data: null; error: QueryError | null; count: number | null };
type SingleResult<T> = { data: T | null; error: QueryError | null };
type CountOptions = { count: "exact"; head: true };

type SupabaseQuery<T> = PromiseLike<QueryResult<T>> & {
  eq(column: string, value: FilterValue): SupabaseQuery<T>;
  order(column: string, options: { ascending: boolean }): SupabaseQuery<T>;
  limit(count: number): SupabaseQuery<T>;
  maybeSingle(): PromiseLike<SingleResult<T>>;
};

type SupabaseCountQuery = PromiseLike<CountResult> & {
  eq(column: string, value: FilterValue): SupabaseCountQuery;
};

type SupabaseUpdateFilter<T> = {
  select(columns: string): SupabaseQuery<T>;
};

type SupabaseUpdateQuery<T> = {
  eq(column: string, value: FilterValue): SupabaseUpdateFilter<T>;
};

type PatientPortalClient = {
  from(table: "patients"): {
    select(columns: string): SupabaseQuery<PatientRecord>;
    update(payload: PatientContactUpdate): SupabaseUpdateQuery<PatientRecord>;
  };
  from(table: "visits"): {
    select(columns: string): SupabaseQuery<VisitRecord>;
    select(columns: string, options: CountOptions): SupabaseCountQuery;
  };
  from(table: "appointment_requests"): {
    select(columns: string): SupabaseQuery<AppointmentRequestRecord>;
    select(columns: string, options: CountOptions): SupabaseCountQuery;
    insert(payload: AppointmentRequestInsert): PromiseLike<QueryResult<AppointmentRequestRecord>>;
  };
  from(table: "departments"): {
    select(columns: string): SupabaseQuery<DepartmentOption>;
  };
  from(table: "lab_results"): {
    select(columns: string): SupabaseQuery<LabResultRecord>;
    select(columns: string, options: CountOptions): SupabaseCountQuery;
  };
  from(table: "prescriptions"): {
    select(columns: string): SupabaseQuery<PrescriptionRecord>;
    select(columns: string, options: CountOptions): SupabaseCountQuery;
  };
};

const patientSelect =
  "id,profile_id,full_name,student_id,mrn,gender,birth_date,phone,emergency_phone,blood_type,address,dorm_info,nationality,status,created_at,updated_at,departments(name)";
const visitSelect =
  "id,visit_code,patient_id,doctor_id,status,priority,chief_complaint,doctor_instructions,created_at,completed_at,doctor:profiles!visits_doctor_id_fkey(full_name,email)";
const appointmentRequestSelect =
  "id,patient_id,requested_department_id,preferred_date,reason,status,admin_comment,reviewed_at,created_at,updated_at,requested_department:departments!appointment_requests_requested_department_id_fkey(name),reviewer:profiles!appointment_requests_reviewed_by_fkey(full_name,email)";
const labResultSelect =
  "id,visit_id,patient_id,doctor_id,lab_test_id,result_value,result_notes,status,entered_at,reviewed_at,visible_to_patient,created_at,updated_at,lab_tests(name,code,unit,normal_range,description),visits(id,visit_code,chief_complaint,status,priority,created_at,completed_at),doctor:profiles!lab_results_doctor_id_fkey(full_name,email)";
const prescriptionSelect =
  "id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at,updated_at,visits(id,visit_code,chief_complaint,status,priority,created_at,completed_at),doctor:profiles!prescriptions_doctor_id_fkey(full_name,email),prescription_items(id,prescription_id,medicine_id,requested_quantity,dispensed_quantity,dosage_instructions,status,dispensed_at,created_at,updated_at,medicines(id,name,category,description,status))";

export function PatientShell({ profile, segments = [] }: PatientShellProps) {
  const pathname = usePathname();
  const screen = resolvePatientScreen(segments);
  const supabase = useMemo(() => createClient() as unknown as PatientPortalClient, []);
  const [patientState, setPatientState] = useState<PatientLoadState>({ loading: true, patient: null, error: null });

  useEffect(() => {
    let active = true;

    async function loadPatient() {
      setPatientState({ loading: true, patient: null, error: null });
      const result = await supabase.from("patients").select(patientSelect).eq("profile_id", profile.id).maybeSingle();
      if (!active) return;
      if (result.error) {
        setPatientState({ loading: false, patient: null, error: result.error.message });
        return;
      }
      setPatientState({ loading: false, patient: result.data, error: null });
    }

    void loadPatient();
    return () => {
      active = false;
    };
  }, [profile.id, supabase]);

  const patient = patientState.patient;

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#17212f]">
      <PatientSidebar activePath={pathname} profile={profile} patient={patient} />
      <main className="min-h-screen lg:pl-[290px]">
        <PatientTopbar profile={profile} patient={patient} />
        {patientState.loading ? <PageFrame><LoadingState label="Loading patient profile" /></PageFrame> : null}
        {patientState.error ? <PageFrame><ErrorState message={patientState.error} /></PageFrame> : null}
        {!patientState.loading && !patientState.error && !patient ? (
          <PageFrame>
            <EmptyState title="No patient profile is linked to this account." description="Please contact reception before viewing health records in the patient portal." />
          </PageFrame>
        ) : null}
        {!patientState.loading && !patientState.error && patient ? (
          <>
            {screen === "dashboard" ? <PatientDashboard supabase={supabase} profile={profile} patient={patient} /> : null}
            {screen === "profile" ? (
              <PatientProfilePage
                supabase={supabase}
                patient={patient}
                onPatientUpdated={(updatedPatient) => setPatientState({ loading: false, patient: updatedPatient, error: null })}
              />
            ) : null}
            {screen === "visits" ? <PatientVisitsPage supabase={supabase} patient={patient} /> : null}
            {screen === "lab-results" ? <PatientLabResultsPage supabase={supabase} patient={patient} /> : null}
            {screen === "medicines" ? <PatientMedicinesPage supabase={supabase} patient={patient} /> : null}
            {screen === "appointment-requests" ? <PatientAppointmentRequestsPage supabase={supabase} patient={patient} /> : null}
            {screen === "notifications" ? <PatientNotificationsPage supabase={supabase} patient={patient} /> : null}
            {screen === "account-settings" ? <PatientAccountSettingsPage profile={profile} patient={patient} /> : null}
          </>
        ) : null}
      </main>
    </div>
  );
}

function resolvePatientScreen(segments: string[]): Screen {
  const path = segments.join("/");
  if (!path || path === "dashboard") return "dashboard";
  if (path === "profile") return "profile";
  if (path === "visits") return "visits";
  if (path === "lab-results") return "lab-results";
  if (path === "medicines") return "medicines";
  if (path === "appointment-requests") return "appointment-requests";
  if (path === "notifications") return "notifications";
  if (path === "account-settings") return "account-settings";
  return "dashboard";
}

function PatientSidebar({ activePath, profile, patient }: { activePath: string; profile: AppProfile; patient: PatientRecord | null }) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[290px] border-r border-[#d4e0e8] bg-white lg:flex lg:flex-col">
      <div className="border-b border-[#d4e0e8] px-6 py-6">
        <Link href="/patient/dashboard" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#00758d] text-white">
            <HeartPulse className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-semibold text-[#00758d]">HealTech</p>
            <p className="text-sm text-[#607084]">Patient Portal</p>
          </div>
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <Avatar name={patient?.full_name ?? profile.full_name} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{patient?.full_name ?? profile.full_name}</p>
            <p className="truncate text-sm text-[#607084]">{patientIdentifier(patient)}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigationByRole.patient.map((item) => {
          const active = isActivePatientPath(activePath, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#2d4058] transition hover:bg-[#edf6f8]",
                active && "bg-[#e3f7fa] text-[#006d86]",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#d4e0e8] p-4">
        <button onClick={handleSignOut} className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#2d4058] hover:bg-[#f4f8fb]">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function isActivePatientPath(activePath: string, href: string) {
  return activePath === href;
}

function PatientTopbar({ profile, patient }: { profile: AppProfile; patient: PatientRecord | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d4e0e8] bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-5 lg:px-8">
        <Link href="/patient/dashboard" className="font-semibold text-[#00758d] lg:hidden">
          HealTech
        </Link>
        <div className="relative hidden w-full max-w-md sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8ca1]" />
          <Input
            aria-label="Search patient portal"
            className="h-10 bg-[#f4f8fb] pl-10 pr-3"
            placeholder="Search your visits, labs, or medicines"
          />
        </div>
        <div className="ml-auto flex items-center gap-3 text-[#41546b]">
          <Link href="/patient/notifications" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Link>
          <Link href="/patient/account-settings" aria-label="Account settings">
            <Settings className="h-5 w-5" />
          </Link>
          <div className="hidden items-center gap-2 border-l border-[#d4e0e8] pl-4 sm:flex">
            <Avatar name={patient?.full_name ?? profile.full_name} small />
            <span className="text-sm font-medium">{patient?.full_name ?? profile.full_name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function PatientDashboard({ supabase, profile, patient }: { supabase: PatientPortalClient; profile: AppProfile; patient: PatientRecord }) {
  const [counts, setCounts] = useState<DashboardCounts>({ visits: 0, visibleLabs: 0, prescriptions: 0, appointmentRequests: 0 });
  const [state, setState] = useState<QueryState<VisitRecord[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setState((current) => ({ ...current, loading: true, error: null }));
      const [visitsCount, labsCount, prescriptionsCount, appointmentsCount, latestVisits] = await Promise.all([
        countByPatient(supabase, "visits", patient.id),
        supabase.from("lab_results").select("id", { count: "exact", head: true }).eq("patient_id", patient.id).eq("visible_to_patient", true),
        countByPatient(supabase, "prescriptions", patient.id),
        countByPatient(supabase, "appointment_requests", patient.id),
        supabase.from("visits").select(visitSelect).eq("patient_id", patient.id).order("created_at", { ascending: false }).limit(5),
      ]);

      if (!active) return;
      const error = visitsCount.error ?? labsCount.error ?? prescriptionsCount.error ?? appointmentsCount.error ?? latestVisits.error;
      if (error) {
        setState({ loading: false, data: [], error: error.message });
        return;
      }

      setCounts({
        visits: visitsCount.count ?? 0,
        visibleLabs: labsCount.count ?? 0,
        prescriptions: prescriptionsCount.count ?? 0,
        appointmentRequests: appointmentsCount.count ?? 0,
      });
      setState({ loading: false, data: latestVisits.data ?? [], error: null });
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [patient.id, supabase]);

  return (
    <PageFrame>
      <PageHeader title={`Welcome, ${patient.full_name}`} description="Your personal health portal summary." />
      {state.error ? <ErrorState message={state.error} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Visits" value={counts.visits} icon={ClipboardList} />
        <StatCard title="Visible Lab Results" value={counts.visibleLabs} icon={Beaker} tone="success" />
        <StatCard title="Prescriptions" value={counts.prescriptions} icon={Pill} />
        <StatCard title="Appointment Requests" value={counts.appointmentRequests} icon={CalendarClock} tone="warning" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <DataCard title="Latest Visits">
          {state.loading ? <LoadingState label="Loading latest visits" /> : null}
          {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No visits yet" description="Your completed or scheduled clinic visits will appear here." /> : null}
          {!state.loading && !state.error && state.data.length > 0 ? <VisitList visits={state.data} compact /> : null}
        </DataCard>
        <DataCard title="Patient Identity">
          <InfoGrid
            rows={[
              ["Name", patient.full_name],
              ["MRN", patient.mrn ?? "Not assigned"],
              ["Student ID", patient.student_id ?? "Not assigned"],
              ["Patient Status", formatLabel(patient.status)],
              ["Account Status", formatLabel(profile.status)],
            ]}
          />
        </DataCard>
      </div>
    </PageFrame>
  );
}

function PatientProfilePage({
  supabase,
  patient,
  onPatientUpdated,
}: {
  supabase: PatientPortalClient;
  patient: PatientRecord;
  onPatientUpdated: (patient: PatientRecord) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<PatientContactFormState>(() => patientContactFormFromPatient(patient));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function startEditing() {
    setForm(patientContactFormFromPatient(patient));
    setFormError(null);
    setSuccessMessage(null);
    setEditing(true);
  }

  function cancelEditing() {
    setForm(patientContactFormFromPatient(patient));
    setFormError(null);
    setEditing(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const validationError = validatePatientContactForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = patientContactUpdatePayload(form);
    setSaving(true);
    const result = await supabase.from("patients").update(payload).eq("id", patient.id).select(patientSelect).maybeSingle();
    setSaving(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    if (!result.data) {
      setFormError("Your contact information could not be updated.");
      return;
    }

    onPatientUpdated(result.data);
    setForm(patientContactFormFromPatient(result.data));
    setEditing(false);
    setSuccessMessage("Contact information updated.");
  }

  return (
    <PageFrame>
      <PageHeader title="My Profile" description="Your patient demographics and contact information." />
      <DataCard title="Patient Identity">
        <InfoGrid
          rows={[
            ["Full Name", patient.full_name],
            ["MRN", patient.mrn ?? "Not assigned"],
            ["Student ID", patient.student_id ?? "Not assigned"],
            ["Department", patient.departments?.name ?? "Not assigned"],
            ["Gender", patient.gender ?? "Not recorded"],
            ["Birth Date", patient.birth_date ? formatDate(patient.birth_date) : "Not recorded"],
            ["Blood Type", patient.blood_type ?? "Not recorded"],
            ["Nationality", patient.nationality ?? "Not recorded"],
            ["Dorm Info", patient.dorm_info ?? "Not recorded"],
            ["Status", formatLabel(patient.status)],
            ["Last Updated", formatDateTime(patient.updated_at)],
          ]}
        />
      </DataCard>

      <DataCard title="Contact Information">
        {!editing ? (
          <div className="space-y-5">
            {successMessage ? <div className="rounded-lg border border-[#a8dfb7] bg-[#effaf2] p-4 text-sm text-[#087a35]">{successMessage}</div> : null}
            <InfoGrid
              rows={[
                ["Phone", patient.phone ?? "Not recorded"],
                ["Emergency Phone", patient.emergency_phone ?? "Not recorded"],
                ["Address", patient.address ?? "Not recorded"],
              ]}
            />
            <div className="flex justify-end">
              <button onClick={startEditing} className="h-10 rounded-lg bg-[#00758d] px-4 text-sm font-semibold text-white">
                Edit Contact Info
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="patient_phone">Phone</Label>
                <Input
                  id="patient_phone"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="bg-[#f4f8fb] text-[#17212f]"
                  disabled={saving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="patient_emergency_phone">Emergency Phone</Label>
                <Input
                  id="patient_emergency_phone"
                  value={form.emergency_phone}
                  onChange={(event) => setForm((current) => ({ ...current, emergency_phone: event.target.value }))}
                  className="bg-[#f4f8fb] text-[#17212f]"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patient_address">Address</Label>
              <Textarea
                id="patient_address"
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                className="bg-[#f4f8fb] text-[#17212f]"
                disabled={saving}
              />
            </div>
            {formError ? <ErrorState message={formError} /> : null}
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={cancelEditing} disabled={saving} className="h-10 rounded-lg border border-[#cbd8e2] px-4 text-sm font-semibold text-[#41546b]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#00758d] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Saving" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </DataCard>
    </PageFrame>
  );
}

function PatientVisitsPage({ supabase, patient }: { supabase: PatientPortalClient; patient: PatientRecord }) {
  const [state, setState] = useState<QueryState<VisitRecord[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;

    async function loadVisits() {
      setState({ loading: true, data: [], error: null });
      const result = await supabase.from("visits").select(visitSelect).eq("patient_id", patient.id).order("created_at", { ascending: false });
      if (!active) return;
      if (result.error) {
        setState({ loading: false, data: [], error: result.error.message });
        return;
      }
      setState({ loading: false, data: result.data ?? [], error: null });
    }

    void loadVisits();
    return () => {
      active = false;
    };
  }, [patient.id, supabase]);

  return (
    <PageFrame>
      <PageHeader title="My Visits" description="Clinic visits linked to your patient record." />
      <DataCard title="Visits">
        {state.loading ? <LoadingState label="Loading visits" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No visits" description="No visits are currently visible for your patient record." /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? <VisitList visits={state.data} /> : null}
      </DataCard>
    </PageFrame>
  );
}

function PatientLabResultsPage({ supabase, patient }: { supabase: PatientPortalClient; patient: PatientRecord }) {
  const [state, setState] = useState<QueryState<LabResultRecord[]>>({ loading: true, data: [], error: null });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "reviewed" | "recent">("all");
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLabResults() {
      setState({ loading: true, data: [], error: null });
      const result = await supabase
        .from("lab_results")
        .select(labResultSelect)
        .eq("patient_id", patient.id)
        .eq("visible_to_patient", true)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (result.error) {
        setState({ loading: false, data: [], error: result.error.message });
        return;
      }
      setState({ loading: false, data: result.data ?? [], error: null });
    }

    void loadLabResults();
    return () => {
      active = false;
    };
  }, [patient.id, supabase]);

  const filteredResults = useMemo(() => filterLabResults(state.data, query, filter), [filter, query, state.data]);
  const selectedResult = filteredResults.find((result) => result.id === selectedResultId) ?? null;

  return (
    <PageFrame>
      <PageHeader title="Lab Results" description="Approved lab results released to your patient portal." />
      <DataCard title="Visible Lab Results">
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <SearchField value={query} onChange={setQuery} placeholder="Search by test name, visit code, result, or status" />
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All visible"],
              ["reviewed", "Reviewed"],
              ["recent", "Recent"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value as "all" | "reviewed" | "recent")}
                className={cn(
                  "h-10 rounded-lg border border-[#cbd8e2] px-4 text-sm font-semibold text-[#41546b]",
                  filter === value && "border-[#00758d] bg-[#e3f7fa] text-[#006d86]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {state.loading ? <LoadingState label="Loading lab results" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <EmptyState title="No visible lab results" description="Approved lab results will appear here after your doctor releases them to the patient portal." />
        ) : null}
        {!state.loading && !state.error && state.data.length > 0 && filteredResults.length === 0 ? (
          <EmptyState title="No matching lab results" description="Try a different test name, visit code, result value, or status filter." />
        ) : null}
        {!state.loading && !state.error && filteredResults.length > 0 ? (
          <LabResultList
            results={filteredResults}
            selectedResultId={selectedResultId}
            onSelect={(result) => setSelectedResultId((current) => (current === result.id ? null : result.id))}
          />
        ) : null}
      </DataCard>
      {selectedResult ? <LabResultDetail result={selectedResult} onClose={() => setSelectedResultId(null)} /> : null}
    </PageFrame>
  );
}

function PatientMedicinesPage({ supabase, patient }: { supabase: PatientPortalClient; patient: PatientRecord }) {
  const [state, setState] = useState<QueryState<PrescriptionRecord[]>>({ loading: true, data: [], error: null });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "partially_dispensed" | "dispensed">("all");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  const filteredPrescriptions = useMemo(() => filterPrescriptions(state.data, query, filter), [filter, query, state.data]);
  const selectedPrescription = filteredPrescriptions.find((prescription) => prescription.id === selectedPrescriptionId) ?? null;

  useEffect(() => {
    let active = true;

    async function loadPrescriptions() {
      setState({ loading: true, data: [], error: null });
      const result = await supabase.from("prescriptions").select(prescriptionSelect).eq("patient_id", patient.id).order("created_at", { ascending: false });
      if (!active) return;
      if (result.error) {
        setState({ loading: false, data: [], error: result.error.message });
        return;
      }
      setState({ loading: false, data: result.data ?? [], error: null });
    }

    void loadPrescriptions();
    return () => {
      active = false;
    };
  }, [patient.id, supabase]);

  return (
    <PageFrame>
      <PageHeader title="Medicines" description="Prescriptions linked to your visits." />
      <DataCard title="Prescriptions">
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <SearchField value={query} onChange={setQuery} placeholder="Search by medicine, visit, doctor, status, or dosage" />
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["active", "Active / Ordered"],
              ["partially_dispensed", "Partially Dispensed"],
              ["dispensed", "Dispensed"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value as "all" | "active" | "partially_dispensed" | "dispensed")}
                className={cn(
                  "h-10 rounded-lg border border-[#cbd8e2] px-4 text-sm font-semibold text-[#41546b]",
                  filter === value && "border-[#00758d] bg-[#e3f7fa] text-[#006d86]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {state.loading ? <LoadingState label="Loading medicines" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <EmptyState title="No prescriptions" description="Your prescribed medicines will appear here after your doctor creates a prescription." />
        ) : null}
        {!state.loading && !state.error && state.data.length > 0 && filteredPrescriptions.length === 0 ? (
          <EmptyState title="No matching prescriptions" description="Try a different medicine, visit, doctor, status, or dosage search." />
        ) : null}
        {!state.loading && !state.error && filteredPrescriptions.length > 0 ? (
          <PrescriptionList
            prescriptions={filteredPrescriptions}
            selectedPrescriptionId={selectedPrescriptionId}
            onSelect={(prescription) => setSelectedPrescriptionId((current) => (current === prescription.id ? null : prescription.id))}
          />
        ) : null}
      </DataCard>
      {selectedPrescription ? <PrescriptionDetail prescription={selectedPrescription} onClose={() => setSelectedPrescriptionId(null)} /> : null}
    </PageFrame>
  );
}

function PatientAppointmentRequestsPage({ supabase, patient }: { supabase: PatientPortalClient; patient: PatientRecord }) {
  const [state, setState] = useState<QueryState<AppointmentRequestRecord[]>>({ loading: true, data: [], error: null });
  const [departmentsState, setDepartmentsState] = useState<QueryState<DepartmentOption[]>>({ loading: true, data: [], error: null });
  const [form, setForm] = useState<AppointmentRequestFormState>({ requested_department_id: "", preferred_date: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      setState({ loading: true, data: [], error: null });
      const result = await supabase.from("appointment_requests").select(appointmentRequestSelect).eq("patient_id", patient.id).order("created_at", { ascending: false });
      if (!active) return;
      if (result.error) {
        setState({ loading: false, data: [], error: result.error.message });
        return;
      }
      setState({ loading: false, data: result.data ?? [], error: null });
    }

    void loadRequests();
    return () => {
      active = false;
    };
  }, [patient.id, refreshKey, supabase]);

  useEffect(() => {
    let active = true;

    async function loadDepartments() {
      setDepartmentsState({ loading: true, data: [], error: null });
      const result = await supabase.from("departments").select("id,name,status").eq("status", "active").order("name", { ascending: true });
      if (!active) return;
      if (result.error) {
        setDepartmentsState({ loading: false, data: [], error: result.error.message });
        return;
      }
      setDepartmentsState({ loading: false, data: result.data ?? [], error: null });
    }

    void loadDepartments();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const validationError = validateAppointmentRequestForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    const result = await supabase.from("appointment_requests").insert({
      patient_id: patient.id,
      requested_department_id: form.requested_department_id || null,
      preferred_date: form.preferred_date,
      reason: form.reason.trim(),
      status: "pending",
    });
    setSaving(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }

    setForm({ requested_department_id: "", preferred_date: "", reason: "" });
    setSuccessMessage("Appointment request submitted. Reception will review it.");
    setRefreshKey((current) => current + 1);
  }

  return (
    <PageFrame>
      <PageHeader title="Appointment Requests" description="Requests submitted for your patient record." />
      <DataCard title="Request Appointment">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="appointment_department">Department</Label>
              <Select
                id="appointment_department"
                value={form.requested_department_id}
                onValueChange={(value) => setForm((current) => ({ ...current, requested_department_id: value }))}
                triggerClassName="bg-[#f4f8fb] text-[#17212f]"
                disabled={saving || departmentsState.loading}
                placeholder="No department preference"
                allowEmptyOption
                options={departmentsState.data.map((department) => ({ value: department.id, label: department.name }))}
              />
              {departmentsState.loading ? <span className="text-xs text-[#607084]">Loading departments...</span> : null}
              {departmentsState.error ? <span className="text-xs text-[#b42318]">Departments could not be loaded: {departmentsState.error}</span> : null}
              {!departmentsState.loading && !departmentsState.error && departmentsState.data.length === 0 ? (
                <span className="text-xs text-[#607084]">No active departments are available to select.</span>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="appointment_preferred_date">Preferred Date</Label>
              <Input
                id="appointment_preferred_date"
                type="date"
                value={form.preferred_date}
                min={todayDateInputValue()}
                onChange={(event) => setForm((current) => ({ ...current, preferred_date: event.target.value }))}
                className="bg-[#f4f8fb] text-[#17212f]"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="appointment_reason">Reason</Label>
            <Textarea
              id="appointment_reason"
              value={form.reason}
              onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
              className="bg-[#f4f8fb] text-[#17212f]"
              placeholder="Briefly describe the reason for your appointment request"
              disabled={saving}
            />
          </div>

          {formError ? <ErrorState message={formError} /> : null}
          {successMessage ? <div className="rounded-lg border border-[#a8dfb7] bg-[#effaf2] p-4 text-sm text-[#087a35]">{successMessage}</div> : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#00758d] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Submitting" : "Submit Request"}
            </button>
          </div>
        </form>
      </DataCard>
      <DataCard title="Requests">
        {state.loading ? <LoadingState label="Loading appointment requests" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No appointment requests" description="Appointment request history will appear here." /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? <AppointmentRequestList requests={state.data} /> : null}
      </DataCard>
    </PageFrame>
  );
}

function PatientNotificationsPage({ supabase, patient }: { supabase: PatientPortalClient; patient: PatientRecord }) {
  const [state, setState] = useState<QueryState<AppointmentRequestRecord[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      setState({ loading: true, data: [], error: null });
      const result = await supabase.from("appointment_requests").select(appointmentRequestSelect).eq("patient_id", patient.id).order("updated_at", { ascending: false }).limit(10);
      if (!active) return;
      if (result.error) {
        setState({ loading: false, data: [], error: result.error.message });
        return;
      }
      setState({ loading: false, data: result.data ?? [], error: null });
    }

    void loadNotifications();
    return () => {
      active = false;
    };
  }, [patient.id, supabase]);

  return (
    <PageFrame>
      <PageHeader title="Notifications" description="Patient-specific updates based on your appointment request statuses." />
      <DataCard title="Recent Updates">
        {state.loading ? <LoadingState label="Loading notifications" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No notifications" description="Appointment request updates will appear here." /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? <NotificationList requests={state.data} /> : null}
      </DataCard>
    </PageFrame>
  );
}

function PatientAccountSettingsPage({ profile, patient }: { profile: AppProfile; patient: PatientRecord }) {
  return (
    <PageFrame>
      <PageHeader title="Account Settings" description="Read-only account details for this portal login." />
      <DataCard title="Account">
        <InfoGrid
          rows={[
            ["Account Name", profile.full_name],
            ["Email", profile.email],
            ["Role", formatLabel(profile.role)],
            ["Account Status", formatLabel(profile.status)],
            ["Linked Patient", patient.full_name],
            ["Linked Patient ID", patient.id],
          ]}
        />
      </DataCard>
    </PageFrame>
  );
}

function VisitList({ visits, compact = false }: { visits: VisitRecord[]; compact?: boolean }) {
  return (
    <div className="divide-y divide-[#dce6ee]">
      {visits.map((visit) => (
        <div key={visit.id} className={cn("grid gap-4 py-4", compact ? "md:grid-cols-[1fr_auto]" : "lg:grid-cols-[1fr_1fr_1fr_auto]")}>
          <div>
            <p className="font-semibold">{visit.visit_code}</p>
            <p className="mt-1 text-sm text-[#607084]">{visit.chief_complaint ?? "No chief complaint recorded"}</p>
          </div>
          {!compact ? <InfoBlock label="Doctor" value={visit.doctor?.full_name ?? visit.doctor_id} helper={visit.doctor?.email ?? undefined} /> : null}
          {!compact ? <InfoBlock label="Instructions" value={visit.doctor_instructions ?? "No instructions recorded"} /> : null}
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={badgeTone(visit.status)}>{formatLabel(visit.status)}</Badge>
            <Badge tone={badgeTone(visit.priority)}>{formatLabel(visit.priority)}</Badge>
            <span className="text-sm text-[#607084]">{formatDateTime(visit.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LabResultList({
  results,
  selectedResultId,
  onSelect,
}: {
  results: LabResultRecord[];
  selectedResultId: string | null;
  onSelect: (result: LabResultRecord) => void;
}) {
  return (
    <div className="grid gap-4">
      {results.map((result) => (
        <button
          key={result.id}
          onClick={() => onSelect(result)}
          className={cn(
            "grid gap-4 rounded-lg border border-[#d4e0e8] bg-white p-4 text-left transition hover:border-[#00758d] hover:bg-[#f8fbfd] lg:grid-cols-[1.2fr_1fr_1fr_auto]",
            selectedResultId === result.id && "border-[#00758d] bg-[#eefaff]",
          )}
        >
          <div>
            <p className="font-semibold">{result.lab_tests?.name ?? "Lab result"}</p>
            <p className="mt-1 text-sm text-[#607084]">
              {[result.lab_tests?.code, result.visits?.visit_code ?? result.visit_id].filter(Boolean).join(" / ")}
            </p>
          </div>
          <InfoBlock label="Result" value={formatResultValue(result)} helper={result.lab_tests?.normal_range ? `Normal range: ${result.lab_tests.normal_range}` : undefined} />
          <InfoBlock label="Doctor" value={result.doctor?.full_name ?? result.doctor_id} helper={result.visits?.chief_complaint ?? undefined} />
          <div>
            <Badge tone={badgeTone(result.status)}>{formatLabel(result.status)}</Badge>
            <p className="mt-2 text-sm text-[#607084]">{result.reviewed_at ? `Reviewed ${formatDateTime(result.reviewed_at)}` : "Not reviewed"}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function LabResultDetail({ result, onClose }: { result: LabResultRecord; onClose: () => void }) {
  return (
    <DataCard title="Lab Result Details">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{result.lab_tests?.name ?? "Lab result"}</h2>
          <p className="mt-1 text-sm text-[#607084]">{result.lab_tests?.description ?? "Detailed result context released to your patient portal."}</p>
        </div>
        <button onClick={onClose} className="h-10 rounded-lg border border-[#cbd8e2] px-4 text-sm font-semibold text-[#41546b]">
          Close Details
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <InfoBlock label="Test Name" value={result.lab_tests?.name ?? "Lab result"} />
        <InfoBlock label="Test Code" value={result.lab_tests?.code ?? "Not assigned"} />
        <InfoBlock label="Status" value={formatLabel(result.status)} />
        <InfoBlock label="Result Value" value={result.result_value ?? "Result not entered"} />
        <InfoBlock label="Unit" value={result.lab_tests?.unit ?? "Not specified"} />
        <InfoBlock label="Normal Range" value={result.lab_tests?.normal_range ?? "Not specified"} />
        <InfoBlock label="Visible To Patient" value={result.visible_to_patient ? "Yes" : "No"} />
        <InfoBlock label="Entered" value={result.entered_at ? formatDateTime(result.entered_at) : "Not entered"} />
        <InfoBlock label="Reviewed" value={result.reviewed_at ? formatDateTime(result.reviewed_at) : "Not reviewed"} />
        <InfoBlock label="Visit Code" value={result.visits?.visit_code ?? result.visit_id} />
        <InfoBlock label="Visit Status" value={result.visits?.status ? formatLabel(result.visits.status) : "Not available"} />
        <InfoBlock label="Visit Priority" value={result.visits?.priority ? formatLabel(result.visits.priority) : "Not available"} />
        <InfoBlock label="Chief Complaint" value={result.visits?.chief_complaint ?? "No chief complaint recorded"} />
        <InfoBlock label="Doctor" value={result.doctor?.full_name ?? result.doctor_id} helper={result.doctor?.email ?? undefined} />
        <InfoBlock label="Created" value={formatDateTime(result.created_at)} />
        <InfoBlock label="Updated" value={formatDateTime(result.updated_at)} />
        <InfoBlock label="Visit Created" value={result.visits?.created_at ? formatDateTime(result.visits.created_at) : "Not available"} />
        <InfoBlock label="Visit Completed" value={result.visits?.completed_at ? formatDateTime(result.visits.completed_at) : "Not completed"} />
      </div>

      <div className="mt-5 rounded-lg border border-[#d4e0e8] bg-[#f8fbfd] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Result Notes</p>
        <p className="mt-2 text-sm text-[#2d4058]">{result.result_notes ?? "No result notes were released with this lab result."}</p>
      </div>
    </DataCard>
  );
}

function PrescriptionList({
  prescriptions,
  selectedPrescriptionId,
  onSelect,
}: {
  prescriptions: PrescriptionRecord[];
  selectedPrescriptionId: string | null;
  onSelect: (prescription: PrescriptionRecord) => void;
}) {
  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <section
          key={prescription.id}
          className={cn("rounded-lg border border-[#d4e0e8] p-4", selectedPrescriptionId === prescription.id && "border-[#00758d] bg-[#f8fbfd]")}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{prescription.doctor?.full_name ?? prescription.doctor_id}</p>
              <p className="mt-1 text-sm text-[#607084]">
                {[prescription.visits?.visit_code ?? prescription.visit_id, prescription.visits?.chief_complaint].filter(Boolean).join(" / ")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={badgeTone(prescription.status)}>{formatLabel(prescription.status)}</Badge>
              <button onClick={() => onSelect(prescription)} className="h-9 rounded-lg border border-[#cbd8e2] px-3 text-sm font-semibold text-[#41546b]">
                {selectedPrescriptionId === prescription.id ? "Hide Details" : "View Details"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <InfoBlock label="Doctor Notes" value={prescription.doctor_notes ?? "No prescription notes"} />
            <InfoBlock label="Created" value={formatDateTime(prescription.created_at)} />
            <InfoBlock label="Completed" value={prescription.completed_at ? formatDateTime(prescription.completed_at) : "Not completed"} />
          </div>

          <div className="mt-4 divide-y divide-[#e5edf3]">
            {prescription.prescription_items.length === 0 ? (
              <p className="py-3 text-sm text-[#607084]">No medicines are attached to this prescription.</p>
            ) : (
              prescription.prescription_items.map((item) => (
                <div key={item.id} className="grid gap-3 py-3 lg:grid-cols-[1.2fr_130px_130px_130px_auto]">
                  <div>
                    <p className="font-medium">{item.medicines?.name ?? item.medicine_id}</p>
                    <p className="text-sm text-[#607084]">
                      {[item.medicines?.category, item.dosage_instructions ?? "No dosage instructions"].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <InfoBlock label="Requested" value={String(item.requested_quantity)} />
                  <InfoBlock label="Dispensed" value={String(item.dispensed_quantity)} />
                  <InfoBlock label="Remaining" value={String(remainingPrescriptionQuantity(item))} helper={item.dispensed_at ? `Dispensed ${formatDateTime(item.dispensed_at)}` : undefined} />
                  <div>
                    <Badge tone={badgeTone(item.status)}>{formatLabel(item.status)}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function PrescriptionDetail({ prescription, onClose }: { prescription: PrescriptionRecord; onClose: () => void }) {
  return (
    <DataCard title="Prescription Details">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{prescription.visits?.visit_code ?? "Prescription"}</h2>
          <p className="mt-1 text-sm text-[#607084]">{prescription.visits?.chief_complaint ?? "Full prescription context from your visit."}</p>
        </div>
        <button onClick={onClose} className="h-10 rounded-lg border border-[#cbd8e2] px-4 text-sm font-semibold text-[#41546b]">
          Close Details
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <InfoBlock label="Prescription ID" value={prescription.id} />
        <InfoBlock label="Status" value={formatLabel(prescription.status)} />
        <InfoBlock label="Doctor" value={prescription.doctor?.full_name ?? prescription.doctor_id} helper={prescription.doctor?.email ?? undefined} />
        <InfoBlock label="Visit Code" value={prescription.visits?.visit_code ?? prescription.visit_id} />
        <InfoBlock label="Visit Status" value={prescription.visits?.status ? formatLabel(prescription.visits.status) : "Not available"} />
        <InfoBlock label="Visit Priority" value={prescription.visits?.priority ? formatLabel(prescription.visits.priority) : "Not available"} />
        <InfoBlock label="Chief Complaint" value={prescription.visits?.chief_complaint ?? "No chief complaint recorded"} />
        <InfoBlock label="Created" value={formatDateTime(prescription.created_at)} />
        <InfoBlock label="Completed" value={prescription.completed_at ? formatDateTime(prescription.completed_at) : "Not completed"} />
        <InfoBlock label="Updated" value={prescription.updated_at ? formatDateTime(prescription.updated_at) : "Not available"} />
        <InfoBlock label="Visit Created" value={prescription.visits?.created_at ? formatDateTime(prescription.visits.created_at) : "Not available"} />
        <InfoBlock label="Visit Completed" value={prescription.visits?.completed_at ? formatDateTime(prescription.visits.completed_at) : "Not completed"} />
      </div>

      <div className="mt-5 rounded-lg border border-[#d4e0e8] bg-[#f8fbfd] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Doctor Notes</p>
        <p className="mt-2 text-sm text-[#2d4058]">{prescription.doctor_notes ?? "No prescription notes were recorded."}</p>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-semibold text-[#41546b]">Medicine Items</p>
        {prescription.prescription_items.length === 0 ? (
          <EmptyState title="No medicine items" description="No medicines are attached to this prescription." />
        ) : (
          <div className="divide-y divide-[#e5edf3] rounded-lg border border-[#d4e0e8]">
            {prescription.prescription_items.map((item) => (
              <div key={item.id} className="grid gap-4 p-4 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
                <div>
                  <p className="font-semibold">{item.medicines?.name ?? item.medicine_id}</p>
                  <p className="mt-1 text-sm text-[#607084]">{item.medicines?.description ?? item.dosage_instructions ?? "No medicine description available"}</p>
                </div>
                <InfoBlock label="Dosage" value={item.dosage_instructions ?? "No dosage instructions"} helper={item.medicines?.category ?? undefined} />
                <InfoBlock
                  label="Quantity"
                  value={`${item.dispensed_quantity} of ${item.requested_quantity} dispensed`}
                  helper={`${remainingPrescriptionQuantity(item)} remaining`}
                />
                <div>
                  <Badge tone={badgeTone(item.status)}>{formatLabel(item.status)}</Badge>
                  <p className="mt-2 text-sm text-[#607084]">{item.dispensed_at ? formatDateTime(item.dispensed_at) : "Not dispensed"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DataCard>
  );
}

function AppointmentRequestList({ requests }: { requests: AppointmentRequestRecord[] }) {
  return (
    <div className="divide-y divide-[#dce6ee]">
      {requests.map((request) => (
        <div key={request.id} className="grid gap-4 py-4 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
          <div>
            <p className="font-semibold">{request.requested_department?.name ?? request.requested_department_id ?? "No department preference"}</p>
            <p className="mt-1 text-sm text-[#607084]">{request.reason ?? "No reason recorded"}</p>
          </div>
          <InfoBlock label="Preferred Date" value={request.preferred_date ? formatDate(request.preferred_date) : "No preferred date"} />
          <InfoBlock
            label="Review"
            value={request.admin_comment ?? "No admin comment"}
            helper={request.reviewed_at ? `Reviewed ${formatDateTime(request.reviewed_at)}` : "Not reviewed yet"}
          />
          <div>
            <Badge tone={badgeTone(request.status)}>{formatLabel(request.status)}</Badge>
            <p className="mt-2 text-sm text-[#607084]">Created {formatDateTime(request.created_at)}</p>
            <p className="mt-1 text-sm text-[#607084]">Updated {formatDateTime(request.updated_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationList({ requests }: { requests: AppointmentRequestRecord[] }) {
  return (
    <div className="divide-y divide-[#dce6ee]">
      {requests.map((request) => (
        <div key={request.id} className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">Appointment request {formatLabel(request.status)}</p>
            <Badge tone={badgeTone(request.status)}>{formatLabel(request.status)}</Badge>
          </div>
          <p className="mt-1 text-sm text-[#607084]">
            {request.requested_department?.name ?? "Requested department"} updated {formatDateTime(request.updated_at)}.
          </p>
          {request.admin_comment ? <p className="mt-2 rounded-lg bg-[#edf6f8] p-3 text-sm text-[#2d4058]">{request.admin_comment}</p> : null}
        </div>
      ))}
    </div>
  );
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return <section className="space-y-6 px-5 py-6 lg:px-8">{children}</section>;
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-[#607084]">{description}</p>
    </div>
  );
}

function DataCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#d4e0e8] bg-white shadow-sm">
      <div className="border-b border-[#d4e0e8] px-5 py-4">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function StatCard({ title, value, icon: Icon, tone = "info" }: { title: string; value: number; icon: typeof ClipboardList; tone?: "info" | "success" | "warning" }) {
  const toneClass = {
    info: "bg-[#e3f7fa] text-[#006d86]",
    success: "bg-[#e4f7e9] text-[#087a35]",
    warning: "bg-[#fff5d9] text-[#9b6400]",
  }[tone];

  return (
    <div className="rounded-lg border border-[#d4e0e8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-3xl font-semibold">{value}</span>
      </div>
      <p className="mt-5 text-sm font-medium text-[#41546b]">{title}</p>
    </div>
  );
}

function InfoGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <InfoBlock key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <span className="relative block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8ca1]" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 bg-[#f4f8fb] pl-10 pr-3"
        placeholder={placeholder}
      />
    </span>
  );
}

function InfoBlock({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
      {helper ? <p className="mt-1 text-sm text-[#607084]">{helper}</p> : null}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return <SharedLoadingState label={label} />;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <SharedEmptyState title={title} description={description} />;
}

function ErrorState({ message }: { message: string }) {
  return <FeedbackAlert tone="danger" message={message} />;
}

function Avatar({ name, small }: { name: string; small?: boolean }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-[#d9eef3] font-semibold text-[#006d86]", small ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm")}>
      {initials(name)}
    </span>
  );
}

function countByPatient(client: PatientPortalClient, table: "visits", patientId: string): PromiseLike<CountResult>;
function countByPatient(client: PatientPortalClient, table: "appointment_requests", patientId: string): PromiseLike<CountResult>;
function countByPatient(client: PatientPortalClient, table: "prescriptions", patientId: string): PromiseLike<CountResult>;
function countByPatient(client: PatientPortalClient, table: "visits" | "appointment_requests" | "prescriptions", patientId: string) {
  if (table === "visits") return client.from("visits").select("id", { count: "exact", head: true }).eq("patient_id", patientId);
  if (table === "appointment_requests") return client.from("appointment_requests").select("id", { count: "exact", head: true }).eq("patient_id", patientId);
  return client.from("prescriptions").select("id", { count: "exact", head: true }).eq("patient_id", patientId);
}

function filterLabResults(results: LabResultRecord[], query: string, filter: "all" | "reviewed" | "recent") {
  const text = query.trim().toLowerCase();
  const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return results.filter((result) => {
    if (filter === "reviewed" && result.status !== "reviewed") return false;
    if (filter === "recent" && new Date(result.reviewed_at ?? result.updated_at ?? result.created_at).getTime() < recentCutoff) return false;
    if (!text) return true;

    return [
      result.lab_tests?.name,
      result.lab_tests?.code,
      result.result_value,
      result.status,
      result.visits?.visit_code,
      result.visits?.chief_complaint,
      result.doctor?.full_name,
    ].some((value) => value?.toLowerCase().includes(text));
  });
}

function filterPrescriptions(prescriptions: PrescriptionRecord[], query: string, filter: "all" | "active" | "partially_dispensed" | "dispensed") {
  const text = query.trim().toLowerCase();

  return prescriptions.filter((prescription) => {
    if (filter === "active" && prescription.status !== "ordered") return false;
    if (filter === "partially_dispensed" && prescription.status !== "partially_dispensed") return false;
    if (filter === "dispensed" && prescription.status !== "dispensed") return false;
    if (!text) return true;

    return [
      prescription.status,
      prescription.doctor_notes,
      prescription.doctor?.full_name,
      prescription.doctor?.email,
      prescription.doctor_id,
      prescription.visits?.visit_code,
      prescription.visits?.chief_complaint,
      ...prescription.prescription_items.flatMap((item) => [
        item.status,
        item.dosage_instructions,
        item.medicine_id,
        item.medicines?.name,
        item.medicines?.category,
        item.medicines?.description,
      ]),
    ].some((value) => value?.toLowerCase().includes(text));
  });
}

function formatResultValue(result: LabResultRecord) {
  if (!result.result_value) return "Result not entered";
  return [result.result_value, result.lab_tests?.unit].filter(Boolean).join(" ");
}

function remainingPrescriptionQuantity(item: PrescriptionItemRecord) {
  return Math.max(item.requested_quantity - item.dispensed_quantity, 0);
}

function validateAppointmentRequestForm(form: AppointmentRequestFormState) {
  if (!form.preferred_date) return "Preferred date is required.";
  if (form.preferred_date < todayDateInputValue()) return "Preferred date cannot be in the past.";
  if (!form.reason.trim()) return "Reason is required.";
  return null;
}

function patientContactFormFromPatient(patient: PatientRecord): PatientContactFormState {
  return {
    phone: patient.phone ?? "",
    emergency_phone: patient.emergency_phone ?? "",
    address: patient.address ?? "",
  };
}

function validatePatientContactForm(form: PatientContactFormState) {
  if (form.phone.length > 0 && !form.phone.trim()) return "Phone cannot contain only spaces.";
  if (form.emergency_phone.length > 0 && !form.emergency_phone.trim()) return "Emergency phone cannot contain only spaces.";
  if (form.address.length > 0 && !form.address.trim()) return "Address cannot contain only spaces.";
  return null;
}

function patientContactUpdatePayload(form: PatientContactFormState): PatientContactUpdate {
  return {
    phone: nullableTrimmedValue(form.phone),
    emergency_phone: nullableTrimmedValue(form.emergency_phone),
    address: nullableTrimmedValue(form.address),
  };
}

function nullableTrimmedValue(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function todayDateInputValue() {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
}

function patientIdentifier(patient: PatientRecord | null) {
  if (!patient) return "No linked patient";
  return patient.mrn ?? patient.student_id ?? "No patient identifier";
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
