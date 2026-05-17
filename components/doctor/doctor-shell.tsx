"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Beaker,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileClock,
  Home,
  Loader2,
  LogOut,
  Pill,
  Search,
  Settings,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Badge, badgeTone } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { HealTechAIChat } from "@/components/healtech-ai-chat";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { navigationByRole } from "@/lib/constants/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { AppProfile } from "@/types/app.types";
import type { Database, Tables } from "@/types/database.types";

type DoctorShellProps = {
  profile: AppProfile;
  segments?: string[];
};

type VisitStatus = Database["public"]["Enums"]["visit_status"];
type VisitPriority = Database["public"]["Enums"]["visit_priority"];
type VisitRow = Tables<"visits">;
type PatientRow = Pick<Tables<"patients">, "id" | "full_name" | "mrn" | "student_id" | "gender" | "birth_date" | "phone">;
type LabTestRow = Pick<Tables<"lab_tests">, "id" | "name" | "code" | "description" | "normal_range" | "unit" | "status">;
type MedicineRow = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  status: string;
};
type VisitAction = "starting" | "saving" | "completing";

type DoctorVisit = VisitRow & {
  patients: PatientRow | null;
};

type VisitFormState = Pick<DoctorVisit, "chief_complaint" | "symptoms" | "diagnosis" | "disease" | "doctor_instructions" | "notes" | "priority">;

type PrescriptionDraftItem = {
  draftId: string;
  medicine_id: string;
  medicine: MedicineRow;
  requested_quantity: number;
  dosage_instructions: string;
};

type QueryState<T> = {
  loading: boolean;
  data: T;
  error: string | null;
};

type Screen = "dashboard" | "visits" | "visit-details" | "lab-orders" | "lab-results" | "medicine-orders" | "completed";

const visitSelect =
  "id,visit_code,patient_id,doctor_id,status,priority,chief_complaint,symptoms,diagnosis,disease,doctor_instructions,notes,started_at,completed_at,created_at,updated_at,patients(id,full_name,mrn,student_id,gender,birth_date,phone)";

const visitTabs: Array<{ label: string; value: "all" | VisitStatus }> = [
  { label: "All", value: "all" },
  { label: "Queued", value: "queued" },
  { label: "In Progress", value: "in_progress" },
  { label: "Waiting Lab", value: "waiting_lab" },
  { label: "Waiting Pharmacy", value: "waiting_pharmacy" },
  { label: "Completed", value: "completed" },
];

export function DoctorShell({ profile, segments = [] }: DoctorShellProps) {
  const pathname = usePathname();
  const screen = resolveScreen(segments);
  const visitId = screen === "visit-details" ? segments[1] : undefined;

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#17212f]">
      <DoctorSidebar activePath={pathname} profile={profile} />
      <main className="min-h-screen lg:pl-[290px]">
        <DoctorTopbar profile={profile} />
        {screen === "dashboard" ? <DoctorDashboard profile={profile} /> : null}
        {screen === "visits" ? <DoctorVisits profile={profile} /> : null}
        {screen === "visit-details" && visitId ? <VisitDetails profile={profile} visitId={visitId} /> : null}
        {screen === "lab-orders" ? <DoctorLabOrders profile={profile} /> : null}
        {screen === "lab-results" ? <DoctorLabResults profile={profile} /> : null}
        {screen === "medicine-orders" ? <DoctorMedicineOrders profile={profile} /> : null}
        {screen === "completed" ? <DoctorVisits profile={profile} completedOnly /> : null}
      </main>
    </div>
  );
}

function resolveScreen(segments: string[]): Screen {
  const path = segments.join("/");
  if (!path || path === "dashboard") return "dashboard";
  if (path === "visits") return "visits";
  if (path === "visits/completed") return "completed";
  if (path === "lab-orders") return "lab-orders";
  if (path === "lab-results") return "lab-results";
  if (path === "medicine-orders") return "medicine-orders";
  if (segments[0] === "visits" && segments[1]) return "visit-details";
  return "dashboard";
}

function DoctorSidebar({ activePath, profile }: { activePath: string; profile: AppProfile }) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[290px] border-r border-[#d4e0e8] bg-white lg:flex lg:flex-col">
      <div className="border-b border-[#d4e0e8] px-6 py-6">
        <Link href="/doctor/dashboard" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#00758d] text-lg font-bold text-white">H</span>
          <div>
            <p className="text-xl font-semibold text-[#00758d]">HealTech</p>
            <p className="text-sm text-[#607084]">Doctor Workspace</p>
          </div>
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <Avatar name={profile.full_name} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{profile.full_name}</p>
            <p className="truncate text-sm text-[#607084]">{profile.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigationByRole.doctor.map((item) => {
          const active = isActiveDoctorPath(activePath, item.href);
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

function isActiveDoctorPath(activePath: string, href: string) {
  if (activePath === href) return true;
  if (href === "/doctor/visits") return activePath.startsWith("/doctor/visits/") && activePath !== "/doctor/visits/completed";
  return false;
}

function DoctorTopbar({ profile }: { profile: AppProfile }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d4e0e8] bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-5 lg:px-8">
        <Link href="/doctor/dashboard" className="font-semibold text-[#00758d] lg:hidden">
          HealTech
        </Link>
        <div className="relative hidden w-full max-w-md sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8ca1]" />
          <input
            aria-label="Search doctor workspace"
            className="h-10 w-full rounded-lg border border-[#cbd8e2] bg-[#f4f8fb] pl-10 pr-3 text-sm outline-none focus:border-[#00758d]"
            placeholder="Search visits by patient, MRN, or complaint"
          />
        </div>
        <div className="ml-auto flex items-center gap-3 text-[#41546b]">
          <Bell className="h-5 w-5" />
          <Settings className="h-5 w-5" />
          <div className="hidden items-center gap-2 border-l border-[#d4e0e8] pl-4 sm:flex">
            <Avatar name={profile.full_name} small />
            <span className="text-sm font-medium">{profile.full_name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function DoctorDashboard({ profile }: { profile: AppProfile }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<QueryState<DoctorVisit[]>>({ loading: true, data: [], error: null });
  const [counts, setCounts] = useState({
    assigned: 0,
    queued: 0,
    inProgress: 0,
    waitingLab: 0,
    waitingPharmacy: 0,
    completed: 0,
    urgent: 0,
  });

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setState((current) => ({ ...current, loading: true, error: null }));

      const baseCount = () => supabase.from("visits").select("id", { count: "exact", head: true }).eq("doctor_id", profile.id);
      const [visitsResult, assigned, queued, inProgress, waitingLab, waitingPharmacy, completed, urgent] = await Promise.all([
        supabase.from("visits").select(visitSelect).eq("doctor_id", profile.id).order("created_at", { ascending: false }).limit(8),
        baseCount(),
        baseCount().eq("status", "queued"),
        baseCount().eq("status", "in_progress"),
        baseCount().eq("status", "waiting_lab"),
        baseCount().eq("status", "waiting_pharmacy"),
        baseCount().eq("status", "completed"),
        baseCount().in("priority", ["high", "urgent"]),
      ]);

      if (!active) return;

      const countError = [assigned, queued, inProgress, waitingLab, waitingPharmacy, completed, urgent].find((result) => result.error)?.error;
      if (visitsResult.error || countError) {
        setState({ loading: false, data: [], error: visitsResult.error?.message ?? countError?.message ?? "Unable to load doctor dashboard." });
        return;
      }

      setCounts({
        assigned: assigned.count ?? 0,
        queued: queued.count ?? 0,
        inProgress: inProgress.count ?? 0,
        waitingLab: waitingLab.count ?? 0,
        waitingPharmacy: waitingPharmacy.count ?? 0,
        completed: completed.count ?? 0,
        urgent: urgent.count ?? 0,
      });
      setState({ loading: false, data: ((visitsResult.data ?? []) as unknown) as DoctorVisit[], error: null });
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [profile.id, supabase]);

  return (
    <section className="px-5 py-7 lg:px-8">
      <PageHeading
        title="Doctor Dashboard"
        description="Real-time workload for visits assigned to your doctor profile."
        action={<LinkButton href="/doctor/visits" label="Open Visits" icon={ClipboardList} />}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Assigned Visits" value={counts.assigned} icon={Stethoscope} />
        <MetricCard title="Queued" value={counts.queued} icon={FileClock} />
        <MetricCard title="In Progress" value={counts.inProgress} icon={Home} />
        <MetricCard title="Completed" value={counts.completed} icon={CheckCircle2} />
        <MetricCard title="Waiting Lab" value={counts.waitingLab} icon={Beaker} />
        <MetricCard title="Waiting Pharmacy" value={counts.waitingPharmacy} icon={Pill} />
        <MetricCard title="Urgent or High Priority" value={counts.urgent} icon={AlertTriangle} danger />
      </div>

      {counts.urgent > 0 ? (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-[#f0b7b2] bg-[#fff6f5] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-[#b42318]" />
            <div>
              <p className="font-semibold text-[#9f1f17]">{counts.urgent} urgent or high priority assigned visit{counts.urgent === 1 ? "" : "s"}</p>
              <p className="mt-1 text-sm text-[#7a3a36]">Review priority visits assigned to your profile first.</p>
            </div>
          </div>
          <Link href="/doctor/visits" className="inline-flex h-10 items-center justify-center rounded-lg bg-[#b42318] px-4 text-sm font-semibold text-white">
            Review Now
          </Link>
        </div>
      ) : null}

      <DataPanel
        className="mt-6"
        title="AI Care Coordinator"
        description="Doctor-scoped AI support for patient summaries, visit context, lab-order drafts, and prescription drafts."
      >
        <HealTechAIChat userRole="doctor" />
      </DataPanel>

      <DataPanel
        className="mt-6"
        title="Recent Assigned Visits"
        description="Latest visits visible to you through Supabase RLS."
        action={<Link href="/doctor/visits" className="text-sm font-semibold text-[#006d86]">View all</Link>}
      >
        {state.loading ? <LoadingState label="Loading assigned visits" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No assigned visits" description="There are no visits assigned to your doctor profile yet." /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? <VisitTable visits={state.data} compact /> : null}
      </DataPanel>
    </section>
  );
}

function DoctorVisits({ profile, completedOnly = false }: { profile: AppProfile; completedOnly?: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = useState<"all" | VisitStatus>("all");
  const [state, setState] = useState<QueryState<DoctorVisit[]>>({ loading: true, data: [], error: null });
  const selectedStatus: "all" | VisitStatus = completedOnly ? "completed" : activeTab;

  useEffect(() => {
    let active = true;

    async function loadVisits() {
      setState((current) => ({ ...current, loading: true, error: null }));

      let query = supabase.from("visits").select(visitSelect).eq("doctor_id", profile.id).order("created_at", { ascending: false });
      if (selectedStatus !== "all") query = query.eq("status", selectedStatus);

      const { data, error } = await query;
      if (!active) return;

      if (error) {
        setState({ loading: false, data: [], error: error.message });
        return;
      }

      setState({ loading: false, data: ((data ?? []) as unknown) as DoctorVisit[], error: null });
    }

    void loadVisits();
    return () => {
      active = false;
    };
  }, [profile.id, selectedStatus, supabase]);

  return (
    <section className="px-5 py-7 lg:px-8">
      <PageHeading
        title={completedOnly ? "Completed Visits" : "My Assigned Visits"}
        description={completedOnly ? "Completed encounters assigned to your doctor profile." : "Only visits where doctor_id matches your authenticated doctor profile are shown."}
      />

      {!completedOnly ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {visitTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "h-10 rounded-lg border border-[#cbd8e2] bg-white px-4 text-sm font-semibold text-[#41546b]",
                activeTab === tab.value && "border-[#00758d] bg-[#e3f7fa] text-[#006d86]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <DataPanel className="mt-6" title={completedOnly ? "Completed Visit List" : "Assigned Visit List"}>
        {state.loading ? <LoadingState label="Loading visits" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <EmptyState title={completedOnly ? "No completed visits" : "No assigned visits"} description="No visits matched the current doctor and filter." />
        ) : null}
        {!state.loading && !state.error && state.data.length > 0 ? <VisitTable visits={state.data} /> : null}
      </DataPanel>
    </section>
  );
}

function VisitDetails({ profile, visitId }: { profile: AppProfile; visitId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<{
    loading: boolean;
    data: DoctorVisit | null;
    error: string | null;
    status: "loading" | "ready" | "not-found" | "unauthorized" | "error";
  }>({ loading: true, data: null, error: null, status: "loading" });

  const fetchVisit = useCallback(async () => {
    const { data, error } = await supabase.from("visits").select(visitSelect).eq("id", visitId).maybeSingle();

    if (error) {
      return { loading: false, data: null, error: error.message, status: "error" as const };
    }

    if (!data) {
      return { loading: false, data: null, error: null, status: "not-found" as const };
    }

    const visit = (data as unknown) as DoctorVisit;
    if (visit.doctor_id !== profile.id) {
      return { loading: false, data: null, error: null, status: "unauthorized" as const };
    }

    return { loading: false, data: visit, error: null, status: "ready" as const };
  }, [profile.id, supabase, visitId]);

  const refreshVisit = useCallback(async () => {
    const nextState = await fetchVisit();
    setState(nextState);
    return nextState.data;
  }, [fetchVisit]);

  useEffect(() => {
    let active = true;

    async function loadVisit() {
      setState({ loading: true, data: null, error: null, status: "loading" });
      const nextState = await fetchVisit();
      if (active) {
        setState(nextState);
      }
    }

    void loadVisit();
    return () => {
      active = false;
    };
  }, [fetchVisit]);

  return (
    <section className="px-5 py-7 lg:px-8">
      <div className="mb-5">
        <Link href="/doctor/visits" className="inline-flex items-center gap-2 text-sm font-semibold text-[#006d86]">
          Back to visits
        </Link>
      </div>

      {state.loading ? <LoadingState label="Loading visit details" /> : null}
      {state.status === "error" && state.error ? <ErrorState message={state.error} /> : null}
      {state.status === "not-found" ? (
        <EmptyState title="Visit not found" description="This visit was not found or is hidden by the current Supabase row-level security policy." />
      ) : null}
      {state.status === "unauthorized" ? (
        <EmptyState title="Unauthorized" description="This visit is not assigned to your doctor profile." />
      ) : null}
      {state.status === "ready" && state.data ? <VisitDetailCard key={`${state.data.id}-${state.data.updated_at}`} visit={state.data} onRefresh={refreshVisit} /> : null}
    </section>
  );
}

function VisitDetailCard({ visit, onRefresh }: { visit: DoctorVisit; onRefresh: () => Promise<DoctorVisit | null> }) {
  const patient = visit.patients;
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState<VisitFormState>(() => visitToFormState(visit));
  const [action, setAction] = useState<VisitAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const closed = visit.status === "completed" || visit.status === "cancelled";

  function updateField<K extends keyof VisitFormState>(field: K, value: VisitFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitVisitUpdate(nextAction: VisitAction, body: Record<string, unknown>, successMessage: string) {
    setAction(nextAction);
    setMessage(null);
    setFormError(null);

    const { error } = await supabase.functions.invoke("update-visit", { body });

    if (error) {
      setFormError(error.message);
      setAction(null);
      return;
    }

    await onRefresh();
    setMessage(successMessage);
    setAction(null);
  }

  async function handleStartVisit() {
    await submitVisitUpdate("starting", { visit_id: visit.id, status: "in_progress" }, "Visit started.");
  }

  async function handleSaveProgress() {
    await submitVisitUpdate("saving", { visit_id: visit.id, ...formPayload(form) }, "Visit progress saved.");
  }

  async function handleCompleteVisit() {
    if (!form.diagnosis?.trim()) {
      setFormError("Diagnosis is required before completing the visit.");
      setMessage(null);
      return;
    }
    if (!form.doctor_instructions?.trim()) {
      setFormError("Doctor instructions are required before completing the visit.");
      setMessage(null);
      return;
    }

    await submitVisitUpdate("completing", { visit_id: visit.id, ...formPayload(form), complete: true }, "Visit completed.");
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title={`Visit ${visit.visit_code}`}
        description="Manage the clinical notes and completion workflow for this assigned visit."
        action={<StatusBadge value={visit.status} />}
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/doctor/lab-orders" className="inline-flex h-10 items-center justify-center rounded-lg border border-[#cbd8e2] bg-white px-4 text-sm font-semibold text-[#006d86]">
          Order Lab Tests
        </Link>
        <Link href="/doctor/medicine-orders" className="inline-flex h-10 items-center justify-center rounded-lg border border-[#cbd8e2] bg-white px-4 text-sm font-semibold text-[#006d86]">
          Prescriptions
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
        <DataPanel title="Patient Information">
          <div className="flex items-start gap-4">
            <Avatar name={patient?.full_name ?? "Patient"} />
            <div>
              <h2 className="text-xl font-semibold">{patient?.full_name ?? "Patient unavailable"}</h2>
              <p className="mt-1 text-sm text-[#607084]">MRN: {patient?.mrn ?? "Not set"}</p>
              <p className="text-sm text-[#607084]">Student ID: {patient?.student_id ?? "Not set"}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Gender" value={patient?.gender} />
            <InfoItem label="Birth date" value={patient?.birth_date ? formatDate(patient.birth_date) : null} />
            <InfoItem label="Phone" value={patient?.phone} />
            <InfoItem label="Patient ID" value={patient?.id} />
          </div>
        </DataPanel>

        <DataPanel title="Visit Summary">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Visit code" value={visit.visit_code} />
            <InfoItem label="Priority" value={formatLabel(visit.priority)} />
            <InfoItem label="Status" value={formatLabel(visit.status)} />
            <InfoItem label="Created" value={formatDateTime(visit.created_at)} />
          </div>
        </DataPanel>
      </div>

      <DataPanel title="Clinical Documentation">
        {closed ? <InlineNotice tone="danger" message="This visit is closed and cannot be edited." /> : null}
        {message ? <InlineNotice tone="success" message={message} /> : null}
        {formError ? <InlineNotice tone="danger" message={formError} /> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <ClinicalTextarea label="Chief complaint" value={form.chief_complaint ?? ""} disabled={closed || action !== null} onChange={(value) => updateField("chief_complaint", value)} />
          <ClinicalTextarea label="Symptoms" value={form.symptoms ?? ""} disabled={closed || action !== null} onChange={(value) => updateField("symptoms", value)} />
          <ClinicalTextarea label="Diagnosis" value={form.diagnosis ?? ""} disabled={closed || action !== null} required onChange={(value) => updateField("diagnosis", value)} />
          <ClinicalInput label="Disease" value={form.disease ?? ""} disabled={closed || action !== null} onChange={(value) => updateField("disease", value)} />
          <ClinicalTextarea label="Doctor instructions" value={form.doctor_instructions ?? ""} disabled={closed || action !== null} required wide onChange={(value) => updateField("doctor_instructions", value)} />
          <ClinicalTextarea label="Notes" value={form.notes ?? ""} disabled={closed || action !== null} wide onChange={(value) => updateField("notes", value)} />
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-[#41546b]">Priority</span>
            <Select
              value={form.priority}
              disabled={closed || action !== null}
              onValueChange={(value) => updateField("priority", value as VisitPriority)}
              options={[
                { value: "low", label: "Low" },
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
          </div>
        </div>

        {!closed ? (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#e1e9ef] pt-5">
            {visit.status === "queued" ? (
              <button type="button" onClick={handleStartVisit} disabled={action !== null} className="inline-flex h-10 items-center justify-center rounded-lg border border-[#006d86] bg-white px-4 text-sm font-semibold text-[#006d86] disabled:cursor-not-allowed disabled:opacity-60">
                {action === "starting" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Stethoscope className="mr-2 h-4 w-4" />}
                Start Visit
              </button>
            ) : null}
            <button type="button" onClick={handleSaveProgress} disabled={action !== null} className="inline-flex h-10 items-center justify-center rounded-lg border border-[#cbd8e2] bg-white px-4 text-sm font-semibold text-[#24364b] disabled:cursor-not-allowed disabled:opacity-60">
              {action === "saving" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Progress
            </button>
            <button type="button" onClick={handleCompleteVisit} disabled={action !== null} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#006d86] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {action === "completing" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Complete Visit
            </button>
          </div>
        ) : null}
      </DataPanel>

      <LabOrderPanel visit={visit} closed={closed} onRefresh={onRefresh} onCreated={() => setHistoryRefreshKey((current) => current + 1)} />
      <PrescriptionCreationPanel visit={visit} closed={closed} onRefresh={onRefresh} onCreated={() => setHistoryRefreshKey((current) => current + 1)} />
      <VisitHistoryPanel visit={visit} refreshKey={historyRefreshKey} />
    </div>
  );
}

function LabOrderPanel({
  visit,
  closed,
  onRefresh,
  onCreated,
}: {
  visit: DoctorVisit;
  closed: boolean;
  onRefresh: () => Promise<DoctorVisit | null>;
  onCreated: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tests, setTests] = useState<LabTestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLabTests() {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from("lab_tests")
        .select("id,name,code,description,normal_range,unit,status")
        .eq("status", "active")
        .order("name", { ascending: true });

      if (!active) return;
      if (error) {
        setLoadError(error.message);
        setTests([]);
      } else {
        setTests((data ?? []) as LabTestRow[]);
      }
      setLoading(false);
    }

    void loadLabTests();
    return () => {
      active = false;
    };
  }, [supabase]);

  const filteredTests = tests.filter((test) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${test.name} ${test.code ?? ""} ${test.description ?? ""}`.toLowerCase().includes(needle);
  });

  function toggleTest(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSuccess(null);

    if (closed) {
      setSubmitError("Lab tests cannot be ordered for a closed visit.");
      return;
    }
    if (!visit.id) {
      setSubmitError("No visit is loaded.");
      return;
    }
    if (selectedIds.length === 0) {
      setSubmitError("Select at least one lab test before submitting.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.functions.invoke("order-lab-tests", {
      body: {
        visit_id: visit.id,
        lab_test_ids: selectedIds,
        doctor_notes: doctorNotes.trim() || undefined,
      },
    });

    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }

    setSelectedIds([]);
    setDoctorNotes("");
    setQuery("");
    setSuccess("Lab tests ordered successfully.");
    await onRefresh();
    onCreated();
    setSubmitting(false);
  }

  return (
    <DataPanel
      title="Order Lab Tests"
      description="Request one or more active lab tests for this visit."
      action={success ? <Link href="/doctor/lab-results" className="text-sm font-semibold text-[#006d86]">View lab results</Link> : null}
    >
      {closed ? <InlineNotice tone="danger" message="Lab tests cannot be ordered for a closed visit." /> : null}
      {success ? <InlineNotice tone="success" message={success} /> : null}
      {submitError ? <InlineNotice tone="danger" message={submitError} /> : null}
      {loadError ? <ErrorState message={loadError} /> : null}

      {!closed ? (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-[#41546b]" htmlFor="lab-test-search">Search Lab Tests</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8ca1]" />
              <input
                id="lab-test-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                disabled={loading || submitting}
                className="h-11 w-full rounded-lg border border-[#cbd8e2] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
                placeholder="Search by test name, code, or description"
              />
            </div>
          </div>

          {loading ? <LoadingState label="Loading active lab tests" /> : null}
          {!loading && !loadError && tests.length === 0 ? <EmptyState title="No active lab tests" description="There are no active lab tests available to order." /> : null}
          {!loading && !loadError && tests.length > 0 ? (
            <div className="max-h-[360px] overflow-y-auto rounded-lg border border-[#d4e0e8]">
              {filteredTests.length === 0 ? (
                <p className="p-4 text-sm text-[#607084]">No lab tests match your search.</p>
              ) : (
                <div className="divide-y divide-[#e1e9ef]">
                  {filteredTests.map((test) => (
                    <Checkbox
                      key={test.id}
                        checked={selectedIds.includes(test.id)}
                        disabled={submitting}
                      onCheckedChange={() => toggleTest(test.id)}
                      className="cursor-pointer p-4 hover:bg-[#f8fbfd]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{test.name}</span>
                        <span className="mt-1 block text-sm text-[#607084]">
                          {test.code ? `Code: ${test.code}` : "No code"}
                          {test.unit ? ` / Unit: ${test.unit}` : ""}
                          {test.normal_range ? ` / Range: ${test.normal_range}` : ""}
                        </span>
                        {test.description ? <span className="mt-1 block text-sm text-[#41546b]">{test.description}</span> : null}
                      </span>
                    </Checkbox>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold text-[#41546b]">Doctor Notes</span>
            <textarea
              value={doctorNotes}
              disabled={submitting}
              onChange={(event) => setDoctorNotes(event.target.value)}
              className="mt-2 min-h-[110px] w-full resize-y rounded-lg border border-[#cbd8e2] bg-white p-3 text-sm leading-6 outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
              placeholder="Optional notes for the lab team"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e9ef] pt-5">
            <p className="text-sm text-[#607084]">{selectedIds.length} selected</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#006d86] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Beaker className="mr-2 h-4 w-4" />}
              Order Selected Tests
            </button>
          </div>
        </div>
      ) : null}
    </DataPanel>
  );
}

function PrescriptionCreationPanel({
  visit,
  closed,
  onRefresh,
  onCreated,
}: {
  visit: DoctorVisit;
  closed: boolean;
  onRefresh: () => Promise<DoctorVisit | null>;
  onCreated: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [items, setItems] = useState<PrescriptionDraftItem[]>([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadMedicines() {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await (supabase as unknown as CanonicalMedicinesClient)
        .from("medicines")
        .select("id,name,category,description,status")
        .eq("status", "active")
        .order("name", { ascending: true });

      if (!active) return;
      if (error) {
        setLoadError(error.message);
        setMedicines([]);
      } else {
        setMedicines(((data ?? []) as unknown) as MedicineRow[]);
      }
      setLoading(false);
    }

    void loadMedicines();
    return () => {
      active = false;
    };
  }, [supabase]);

  const filteredMedicines = medicines.filter((medicine) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return `${medicine.name} ${medicine.category ?? ""} ${medicine.description ?? ""}`.toLowerCase().includes(needle);
  });

  function addMedicine(medicine: MedicineRow) {
    setSubmitError(null);
    setSuccess(null);
    setItems((current) => {
      if (current.some((item) => item.medicine_id === medicine.id)) return current;
      return [
        ...current,
        {
          draftId: crypto.randomUUID(),
          medicine_id: medicine.id,
          medicine,
          requested_quantity: 1,
          dosage_instructions: "",
        },
      ];
    });
  }

  function updateDraftItem(draftId: string, patch: Partial<Pick<PrescriptionDraftItem, "requested_quantity" | "dosage_instructions">>) {
    setItems((current) => current.map((item) => (item.draftId === draftId ? { ...item, ...patch } : item)));
  }

  function removeDraftItem(draftId: string) {
    setItems((current) => current.filter((item) => item.draftId !== draftId));
  }

  function validatePrescription() {
    if (closed) return "Prescriptions cannot be created for a closed visit.";
    if (!visit.id) return "No visit is loaded.";
    if (items.length === 0) return "Add at least one medicine before creating a prescription.";

    const missingMedicine = items.find((item) => !item.medicine_id);
    if (missingMedicine) return "Each prescription item must have a medicine selected.";

    const invalidQuantity = items.find((item) => !Number.isInteger(item.requested_quantity) || item.requested_quantity <= 0);
    if (invalidQuantity) return "Requested quantity must be a positive whole number for every medicine.";

    const missingInstructions = items.find((item) => !item.dosage_instructions.trim());
    if (missingInstructions) return "Dosage instructions are required for every medicine.";

    return null;
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSuccess(null);

    const validationError = validatePrescription();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.functions.invoke("order-medicines", {
      body: {
        visit_id: visit.id,
        items: items.map((item) => ({
          medicine_id: item.medicine_id,
          requested_quantity: item.requested_quantity,
          dosage_instructions: item.dosage_instructions.trim(),
        })),
        doctor_notes: doctorNotes.trim() || undefined,
      },
    });

    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }

    setItems([]);
    setDoctorNotes("");
    setQuery("");
    setSuccess("Prescription created successfully.");
    await onRefresh();
    onCreated();
    setSubmitting(false);
  }

  return (
    <DataPanel
      title="Create Prescription"
      description="Create a canonical prescription for this visit."
      action={success ? <Link href="/doctor/medicine-orders" className="text-sm font-semibold text-[#006d86]">View prescriptions</Link> : null}
    >
      {closed ? <InlineNotice tone="danger" message="Prescriptions cannot be created for a closed visit." /> : null}
      {success ? <InlineNotice tone="success" message={success} /> : null}
      {submitError ? <InlineNotice tone="danger" message={submitError} /> : null}
      {loadError ? <ErrorState message={loadError} /> : null}

      {!closed ? (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-[#41546b]" htmlFor="medicine-search">Search Medicines</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8ca1]" />
              <input
                id="medicine-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                disabled={loading || submitting}
                className="h-11 w-full rounded-lg border border-[#cbd8e2] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
                placeholder="Search by medicine name, category, or description"
              />
            </div>
          </div>

          {loading ? <LoadingState label="Loading active medicines" /> : null}
          {!loading && !loadError && medicines.length === 0 ? <EmptyState title="No active medicines" description="There are no active medicines available to prescribe." /> : null}
          {!loading && !loadError && medicines.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto rounded-lg border border-[#d4e0e8]">
              {filteredMedicines.length === 0 ? (
                <p className="p-4 text-sm text-[#607084]">No medicines match your search.</p>
              ) : (
                <div className="divide-y divide-[#e1e9ef]">
                  {filteredMedicines.map((medicine) => {
                    const added = items.some((item) => item.medicine_id === medicine.id);
                    return (
                      <div key={medicine.id} className="flex flex-col gap-3 p-4 hover:bg-[#f8fbfd] sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold">{medicine.name}</p>
                          <p className="mt-1 text-sm text-[#607084]">{medicine.category ?? "No category"}</p>
                          {medicine.description ? <p className="mt-1 text-sm text-[#41546b]">{medicine.description}</p> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => addMedicine(medicine)}
                          disabled={added || submitting}
                          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-[#006d86] px-3 text-sm font-semibold text-[#006d86] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {added ? "Added" : "Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-[#41546b]">Prescription Items</h3>
            {items.length === 0 ? (
              <p className="mt-2 rounded-lg border border-dashed border-[#cbd8e2] bg-[#f8fbfd] p-3 text-sm text-[#607084]">No medicines selected yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {items.map((item) => (
                  <div key={item.draftId} className="rounded-lg border border-[#d4e0e8] bg-[#f8fbfd] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">{item.medicine.name}</p>
                        <p className="text-sm text-[#607084]">{item.medicine.category ?? "No category"}</p>
                      </div>
                      <button type="button" onClick={() => removeDraftItem(item.draftId)} disabled={submitting} className="text-sm font-semibold text-[#b42318] disabled:cursor-not-allowed disabled:opacity-60">
                        Remove
                      </button>
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr]">
                      <label className="block">
                        <span className="text-sm font-semibold text-[#41546b]">Requested Quantity</span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={item.requested_quantity}
                          disabled={submitting}
                          onChange={(event) => updateDraftItem(item.draftId, { requested_quantity: Number(event.target.value) })}
                          className="mt-2 h-11 w-full rounded-lg border border-[#cbd8e2] bg-white px-3 text-sm outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-[#41546b]">Dosage Instructions</span>
                        <textarea
                          value={item.dosage_instructions}
                          disabled={submitting}
                          onChange={(event) => updateDraftItem(item.draftId, { dosage_instructions: event.target.value })}
                          className="mt-2 min-h-[92px] w-full resize-y rounded-lg border border-[#cbd8e2] bg-white p-3 text-sm leading-6 outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
                          placeholder="Example: One tablet twice daily after meals"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-[#41546b]">Doctor Notes</span>
            <textarea
              value={doctorNotes}
              disabled={submitting}
              onChange={(event) => setDoctorNotes(event.target.value)}
              className="mt-2 min-h-[110px] w-full resize-y rounded-lg border border-[#cbd8e2] bg-white p-3 text-sm leading-6 outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
              placeholder="Optional notes for the pharmacy team"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e9ef] pt-5">
            <p className="text-sm text-[#607084]">{items.length} medicine item{items.length === 1 ? "" : "s"}</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#006d86] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pill className="mr-2 h-4 w-4" />}
              Create Prescription
            </button>
          </div>
        </div>
      ) : null}
    </DataPanel>
  );
}

function VisitHistoryPanel({ visit, refreshKey }: { visit: DoctorVisit; refreshKey: number }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<QueryState<VisitHistoryData>>({
    loading: true,
    data: { labOrders: [], labResults: [], prescriptions: [] },
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      setState((current) => ({ ...current, loading: true, error: null }));

      const [labOrdersResult, labResultsResult, prescriptionsResult] = await Promise.all([
        supabase
          .from("lab_orders")
          .select("id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at")
          .eq("visit_id", visit.id)
          .order("created_at", { ascending: false }),
        (supabase as unknown as CanonicalVisitLabResultsClient)
          .from("lab_results")
          .select(
            "id,visit_id,patient_id,doctor_id,lab_test_id,result_value,result_notes,status,entered_at,reviewed_at,visible_to_patient,created_at,updated_at,lab_tests(name,code,unit,normal_range)",
          )
          .eq("visit_id", visit.id)
          .order("created_at", { ascending: false }),
        (supabase as unknown as CanonicalPrescriptionsByVisitClient)
          .from("prescriptions")
          .select(
            "id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,updated_at,completed_at,prescription_items(id,prescription_id,medicine_id,requested_quantity,dispensed_quantity,dosage_instructions,status,dispensed_at,created_at,medicines(id,name,category,description,status))",
          )
          .eq("visit_id", visit.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      const error = labOrdersResult.error ?? labResultsResult.error ?? prescriptionsResult.error;
      if (error) {
        setState({
          loading: false,
          data: { labOrders: [], labResults: [], prescriptions: [] },
          error: error.message,
        });
        return;
      }

      setState({
        loading: false,
        data: {
          labOrders: ((labOrdersResult.data ?? []) as unknown) as VisitLabOrder[],
          labResults: ((labResultsResult.data ?? []) as unknown) as VisitLabResult[],
          prescriptions: ((prescriptionsResult.data ?? []) as unknown) as PrescriptionRecord[],
        },
        error: null,
      });
    }

    void loadHistory();
    return () => {
      active = false;
    };
  }, [refreshKey, supabase, visit.id]);

  return (
    <DataPanel title="Current Visit History" description="Read-only lab and prescription context for this visit.">
      {state.loading ? <LoadingState label="Loading visit history" /> : null}
      {state.error ? <ErrorState message={state.error} /> : null}
      {!state.loading && !state.error ? (
        <div className="space-y-6">
          <section>
            <HistoryHeading title="Lab Orders" count={state.data.labOrders.length} />
            {state.data.labOrders.length === 0 ? (
              <CompactEmpty message="No lab orders for this visit." />
            ) : (
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {state.data.labOrders.map((order) => (
                  <article key={order.id} className="rounded-lg border border-[#d4e0e8] bg-[#f8fbfd] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <StatusBadge value={order.status} />
                      <span className="text-xs text-[#607084]">Created {formatDateTime(order.created_at)}</span>
                    </div>
                    {order.doctor_notes ? <p className="mt-3 whitespace-pre-wrap text-sm text-[#41546b]">{order.doctor_notes}</p> : <p className="mt-3 text-sm text-[#607084]">No doctor notes.</p>}
                    {order.completed_at ? <p className="mt-3 text-xs text-[#607084]">Completed {formatDateTime(order.completed_at)}</p> : null}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <HistoryHeading title="Lab Results" count={state.data.labResults.length} />
            {state.data.labResults.length === 0 ? (
              <CompactEmpty message="No lab results for this visit." />
            ) : (
              <div className="mt-3 space-y-3">
                {state.data.labResults.map((result) => (
                  <article key={result.id} className="rounded-lg border border-[#d4e0e8] bg-white p-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr_0.8fr_0.8fr] lg:items-start">
                      <div>
                        <p className="font-semibold">{result.lab_tests?.name ?? "Lab test"}</p>
                        <p className="mt-1 text-sm text-[#607084]">
                          {result.lab_tests?.code ? `Code: ${result.lab_tests.code}` : "No code"}
                          {result.lab_tests?.normal_range ? ` / Range: ${result.lab_tests.normal_range}` : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Result</p>
                        <p className="mt-1 text-sm text-[#41546b]">{result.result_value ? `${result.result_value}${result.lab_tests?.unit ? ` ${result.lab_tests.unit}` : ""}` : "No value entered"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Status</p>
                        <div className="mt-2 space-y-2">
                          <StatusBadge value={result.status} />
                          <p className="text-xs text-[#607084]">{result.visible_to_patient ? "Visible to patient" : "Not visible to patient"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Dates</p>
                        <p className="mt-1 text-xs text-[#607084]">Entered: {result.entered_at ? formatDateTime(result.entered_at) : "Not entered"}</p>
                        <p className="mt-1 text-xs text-[#607084]">Reviewed: {result.reviewed_at ? formatDateTime(result.reviewed_at) : "Not reviewed"}</p>
                      </div>
                    </div>
                    {result.result_notes ? <p className="mt-3 whitespace-pre-wrap rounded-lg bg-[#f8fbfd] p-3 text-sm text-[#41546b]">{result.result_notes}</p> : null}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <HistoryHeading title="Prescriptions" count={state.data.prescriptions.length} />
            {state.data.prescriptions.length === 0 ? (
              <CompactEmpty message="No prescriptions for this visit." />
            ) : (
              <div className="mt-3 space-y-4">
                {state.data.prescriptions.map((prescription) => (
                  <article key={prescription.id} className="rounded-lg border border-[#d4e0e8] bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <StatusBadge value={prescription.status} />
                        <p className="mt-2 text-xs text-[#607084]">Created {formatDateTime(prescription.created_at)}</p>
                        {prescription.completed_at ? <p className="mt-1 text-xs text-[#607084]">Completed {formatDateTime(prescription.completed_at)}</p> : null}
                      </div>
                      {prescription.doctor_notes ? <p className="max-w-xl whitespace-pre-wrap text-sm text-[#41546b]">{prescription.doctor_notes}</p> : <p className="text-sm text-[#607084]">No doctor notes.</p>}
                    </div>

                    {prescription.prescription_items.length === 0 ? (
                      <CompactEmpty message="No medicine items for this prescription." />
                    ) : (
                      <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#e1e9ef] text-left text-sm">
                          <thead className="bg-[#f4f8fb] text-xs uppercase tracking-wide text-[#607084]">
                            <tr>
                              <th className="px-3 py-3 font-semibold">Medicine</th>
                              <th className="px-3 py-3 font-semibold">Requested</th>
                              <th className="px-3 py-3 font-semibold">Dispensed</th>
                              <th className="px-3 py-3 font-semibold">Dosage</th>
                              <th className="px-3 py-3 font-semibold">Status</th>
                              <th className="px-3 py-3 font-semibold">Dispensed At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e1e9ef]">
                            {prescription.prescription_items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-3 py-3">
                                  <p className="font-medium">{item.medicines?.name ?? "Medicine unavailable"}</p>
                                  <p className="text-xs text-[#607084]">{item.medicines?.category ?? "No category"}</p>
                                </td>
                                <td className="px-3 py-3 text-[#41546b]">{item.requested_quantity}</td>
                                <td className="px-3 py-3 text-[#41546b]">{item.dispensed_quantity}</td>
                                <td className="min-w-[220px] px-3 py-3 text-[#41546b]">{item.dosage_instructions ?? "Not recorded"}</td>
                                <td className="px-3 py-3"><StatusBadge value={item.status} /></td>
                                <td className="px-3 py-3 text-[#607084]">{item.dispensed_at ? formatDateTime(item.dispensed_at) : "Not dispensed"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </DataPanel>
  );
}

function DoctorLabOrders({ profile }: { profile: AppProfile }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<QueryState<RelatedOrder[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setState((current) => ({ ...current, loading: true, error: null }));
      const { data, error } = await supabase
        .from("lab_orders")
        .select("id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,completed_at,patients(id,full_name,mrn,student_id),visits(id,visit_code,chief_complaint,status,priority)")
        .eq("doctor_id", profile.id)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setState({ loading: false, data: [], error: error.message });
        return;
      }
      setState({ loading: false, data: ((data ?? []) as unknown) as RelatedOrder[], error: null });
    }

    void loadOrders();
    return () => {
      active = false;
    };
  }, [profile.id, supabase]);

  return <OrderPage title="Lab Orders" description="Lab orders created under your doctor profile." state={state} kind="lab" />;
}

function DoctorLabResults({ profile }: { profile: AppProfile }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<QueryState<LabResultItem[]>>({ loading: true, data: [], error: null });
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    const { data, error } = await (supabase as unknown as CanonicalLabResultsClient)
      .from("lab_results")
      .select(
        "id,visit_id,patient_id,doctor_id,lab_test_id,result_value,result_notes,status,entered_by,entered_at,reviewed_by,reviewed_at,visible_to_patient,created_at,updated_at,patients(full_name,mrn,student_id),visits(id,visit_code,chief_complaint,status,priority),lab_tests(name,code,unit,normal_range)",
      )
      .eq("doctor_id", profile.id)
      .order("updated_at", { ascending: false });

    return { data: ((data ?? []) as unknown) as LabResultItem[], error };
  }, [profile.id, supabase]);

  useEffect(() => {
    let active = true;

    async function loadResults() {
      setState((current) => ({ ...current, loading: true, error: null }));
      const { data, error } = await fetchResults();
      if (!active) return;
      if (error) {
        setState({ loading: false, data: [], error: error.message });
        return;
      }
      setState({ loading: false, data, error: null });
    }

    void loadResults();
    return () => {
      active = false;
    };
  }, [fetchResults]);

  async function handleApprove(result: LabResultItem) {
    setApprovingId(result.id);
    setApprovalMessage(null);
    setApprovalError(null);

    const { error } = await supabase.functions.invoke("approve-lab-result-for-patient", {
      body: { lab_result_ids: [result.id] },
    });

    if (error) {
      setApprovalError(error.message);
      setApprovingId(null);
      return;
    }

    setApprovalMessage(`${result.lab_tests?.name ?? "Lab result"} approved for patient portal.`);
    setState((current) => ({ ...current, loading: true, error: null }));
    const refreshed = await fetchResults();
    if (refreshed.error) {
      setState({ loading: false, data: [], error: refreshed.error.message });
    } else {
      setState({ loading: false, data: refreshed.data, error: null });
    }
    setApprovingId(null);
  }

  return (
    <section className="px-5 py-7 lg:px-8">
      <PageHeading title="Lab Results" description="Lab results created for visits assigned to your doctor profile." />
      <DataPanel className="mt-6" title="Canonical Lab Results">
        {approvalMessage ? <InlineNotice tone="success" message={approvalMessage} /> : null}
        {approvalError ? <InlineNotice tone="danger" message={approvalError} /> : null}
        {state.loading ? <LoadingState label="Loading lab results" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No lab results" description="There are no canonical lab results visible for your doctor profile." /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? (
          <div className="divide-y divide-[#e1e9ef]">
            {state.data.map((item) => (
              <div key={item.id} className="grid gap-4 py-4 lg:grid-cols-[1.1fr_1fr_0.85fr_0.75fr_0.9fr] lg:items-center">
                <div>
                  <p className="font-semibold">{item.lab_tests?.name ?? "Lab test"}</p>
                  <p className="text-sm text-[#607084]">{item.visits?.visit_code ?? "Visit"} / {item.patients?.full_name ?? "Patient unavailable"}</p>
                  <p className="text-xs text-[#7a8ca1]">{item.lab_tests?.code ?? "No code"}{item.lab_tests?.normal_range ? ` / Range: ${item.lab_tests.normal_range}` : ""}</p>
                </div>
                <p className="text-sm text-[#41546b]">{item.visits?.chief_complaint ?? "No complaint recorded"}</p>
                <div className="text-sm">
                  <p>{item.result_value ? `${item.result_value}${item.lab_tests?.unit ? ` ${item.lab_tests.unit}` : ""}` : "No value entered"}</p>
                  {item.result_notes ? <p className="mt-1 text-xs text-[#607084]">{item.result_notes}</p> : null}
                </div>
                <div className="space-y-2">
                  <StatusBadge value={item.status} />
                  {item.visible_to_patient ? <p className="text-xs font-medium text-[#0b7a3b]">Visible to patient</p> : <p className="text-xs text-[#607084]">Not visible to patient</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <LabResultApprovalAction result={item} approving={approvingId === item.id} onApprove={handleApprove} />
                  <Link href={`/doctor/visits/${item.visit_id}`} className="inline-flex items-center text-sm font-semibold text-[#006d86]">
                    Open <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </DataPanel>
    </section>
  );
}

function DoctorMedicineOrders({ profile }: { profile: AppProfile }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<QueryState<PrescriptionRecord[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;

    async function loadPrescriptions() {
      setState((current) => ({ ...current, loading: true, error: null }));
      const { data, error } = await (supabase as unknown as CanonicalPrescriptionsClient)
        .from("prescriptions")
        .select(
          "id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,updated_at,completed_at,patients(id,full_name,mrn,student_id),visits(id,visit_code,chief_complaint,status,priority),prescription_items(id,prescription_id,medicine_id,requested_quantity,dispensed_quantity,dosage_instructions,status,dispensed_at,created_at,medicines(id,name,category,description,status))",
        )
        .eq("doctor_id", profile.id)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setState({ loading: false, data: [], error: error.message });
        return;
      }
      setState({ loading: false, data: ((data ?? []) as unknown) as PrescriptionRecord[], error: null });
    }

    void loadPrescriptions();
    return () => {
      active = false;
    };
  }, [profile.id, supabase]);

  return (
    <section className="px-5 py-7 lg:px-8">
      <PageHeading title="Prescriptions" description="Prescriptions created for visits assigned to your doctor profile." />
      <DataPanel className="mt-6" title="Prescription List">
        {state.loading ? <LoadingState label="Loading prescriptions" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No prescriptions" description="No prescriptions are visible for your doctor profile." /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? <PrescriptionList prescriptions={state.data} /> : null}
      </DataPanel>
    </section>
  );
}

type RelatedOrder = {
  id: string;
  visit_id: string;
  status: string;
  doctor_notes: string | null;
  created_at: string;
  completed_at: string | null;
  patients: Pick<PatientRow, "id" | "full_name" | "mrn" | "student_id"> | null;
  visits: Pick<DoctorVisit, "id" | "visit_code" | "chief_complaint" | "status" | "priority"> | null;
};

type VisitLabOrder = {
  id: string;
  visit_id: string;
  patient_id: string;
  doctor_id: string;
  status: string;
  doctor_notes: string | null;
  created_at: string;
  completed_at: string | null;
};

type LabResultItem = {
  id: string;
  visit_id: string;
  patient_id: string;
  doctor_id: string;
  lab_test_id: string;
  result_value: string | null;
  result_notes: string | null;
  status: Database["public"]["Enums"]["lab_result_status"];
  entered_by: string | null;
  entered_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  visible_to_patient: boolean;
  created_at: string;
  updated_at: string;
  patients: Pick<PatientRow, "full_name" | "mrn" | "student_id"> | null;
  visits: Pick<DoctorVisit, "id" | "visit_code" | "chief_complaint" | "status" | "priority"> | null;
  lab_tests: { name: string; code: string | null; unit: string | null; normal_range: string | null } | null;
};

type VisitLabResult = Omit<LabResultItem, "entered_by" | "reviewed_by" | "patients" | "updated_at"> & {
  updated_at: string;
};

type PrescriptionStatus = "ordered" | "partially_dispensed" | "dispensed" | "cancelled";
type PrescriptionItemStatus = "pending" | "dispensed" | "unavailable" | "cancelled";

type PrescriptionMedicine = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  status: string;
};

type PrescriptionItemRecord = {
  id: string;
  prescription_id: string;
  medicine_id: string;
  requested_quantity: number;
  dispensed_quantity: number;
  dosage_instructions: string | null;
  status: PrescriptionItemStatus;
  dispensed_at: string | null;
  created_at: string;
  medicines: PrescriptionMedicine | null;
};

type PrescriptionRecord = {
  id: string;
  visit_id: string;
  patient_id: string;
  doctor_id: string;
  status: PrescriptionStatus;
  doctor_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  patients: Pick<PatientRow, "id" | "full_name" | "mrn" | "student_id"> | null;
  visits: Pick<DoctorVisit, "id" | "visit_code" | "chief_complaint" | "status" | "priority"> | null;
  prescription_items: PrescriptionItemRecord[];
};

type VisitHistoryData = {
  labOrders: VisitLabOrder[];
  labResults: VisitLabResult[];
  prescriptions: PrescriptionRecord[];
};

type CanonicalLabResultsClient = {
  from(table: "lab_results"): {
    select(columns: string): {
      eq(column: "doctor_id", value: string): {
        order(column: "updated_at", options: { ascending: boolean }): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
};

type CanonicalVisitLabResultsClient = {
  from(table: "lab_results"): {
    select(columns: string): {
      eq(column: "visit_id", value: string): {
        order(column: "created_at", options: { ascending: boolean }): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
};

type CanonicalPrescriptionsClient = {
  from(table: "prescriptions"): {
    select(columns: string): {
      eq(column: "doctor_id", value: string): {
        order(column: "created_at", options: { ascending: boolean }): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
};

type CanonicalPrescriptionsByVisitClient = {
  from(table: "prescriptions"): {
    select(columns: string): {
      eq(column: "visit_id", value: string): {
        order(column: "created_at", options: { ascending: boolean }): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
};

type CanonicalMedicinesClient = {
  from(table: "medicines"): {
    select(columns: string): {
      eq(column: "status", value: "active"): {
        order(column: "name", options: { ascending: boolean }): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
};

function LabResultApprovalAction({
  result,
  approving,
  onApprove,
}: {
  result: LabResultItem;
  approving: boolean;
  onApprove: (result: LabResultItem) => void;
}) {
  if (result.visible_to_patient) return <p className="text-xs font-medium text-[#0b7a3b]">Already visible to patient</p>;
  if (result.status === "reviewed") return <p className="text-xs font-medium text-[#41546b]">Reviewed</p>;
  if (!result.result_value) return <p className="text-xs font-medium text-[#8a5a00]">Waiting for lab result</p>;
  if (result.status !== "submitted" && result.status !== "entered") return <p className="text-xs font-medium text-[#607084]">Waiting for lab submission</p>;

  return (
    <button
      type="button"
      onClick={() => onApprove(result)}
      disabled={approving}
      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#006d86] px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
      Approve for Patient
    </button>
  );
}

function InlineNotice({ tone, message }: { tone: "success" | "danger"; message: string }) {
  return (
    <div className={cn("mb-4 rounded-lg border p-3 text-sm", tone === "success" ? "border-[#a7dfb7] bg-[#f1fbf4] text-[#0b7a3b]" : "border-[#f0b7b2] bg-[#fff6f5] text-[#9f1f17]")}>
      {message}
    </div>
  );
}

function HistoryHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#e1e9ef] pb-2">
      <h3 className="font-semibold">{title}</h3>
      <span className="rounded-full bg-[#eef3f7] px-2.5 py-1 text-xs font-semibold text-[#607084]">{count}</span>
    </div>
  );
}

function CompactEmpty({ message }: { message: string }) {
  return <p className="mt-3 rounded-lg border border-dashed border-[#cbd8e2] bg-[#f8fbfd] p-3 text-sm text-[#607084]">{message}</p>;
}

function PrescriptionList({ prescriptions }: { prescriptions: PrescriptionRecord[] }) {
  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <article key={prescription.id} className="rounded-lg border border-[#d4e0e8] bg-white p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.7fr_0.8fr_auto] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Visit</p>
              <p className="mt-1 font-semibold">{prescription.visits?.visit_code ?? "Visit"}</p>
              <p className="mt-1 text-sm text-[#607084]">{prescription.patients?.full_name ?? "Patient unavailable"}</p>
              <p className="text-xs text-[#7a8ca1]">{patientIdentifier(prescription.patients)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Chief Complaint</p>
              <p className="mt-1 text-sm text-[#41546b]">{prescription.visits?.chief_complaint ?? "No complaint recorded"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Status</p>
              <div className="mt-2">
                <StatusBadge value={prescription.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Created</p>
              <p className="mt-1 text-sm text-[#41546b]">{formatDateTime(prescription.created_at)}</p>
            </div>
            <Link href={`/doctor/visits/${prescription.visit_id}`} className="inline-flex h-9 items-center justify-center rounded-lg bg-[#006d86] px-3 text-sm font-semibold text-white">
              Open Visit
            </Link>
          </div>

          {prescription.doctor_notes ? (
            <div className="mt-4 rounded-lg border border-[#e1e9ef] bg-[#f8fbfd] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Doctor Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[#41546b]">{prescription.doctor_notes}</p>
            </div>
          ) : null}

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Medicines</p>
            {prescription.prescription_items.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e1e9ef] text-left text-sm">
                  <thead className="bg-[#f4f8fb] text-xs uppercase tracking-wide text-[#607084]">
                    <tr>
                      <th className="px-3 py-3 font-semibold">Medicine</th>
                      <th className="px-3 py-3 font-semibold">Requested</th>
                      <th className="px-3 py-3 font-semibold">Dispensed</th>
                      <th className="px-3 py-3 font-semibold">Dosage Instructions</th>
                      <th className="px-3 py-3 font-semibold">Item Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e9ef]">
                    {prescription.prescription_items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-3">
                          <p className="font-medium">{item.medicines?.name ?? "Medicine unavailable"}</p>
                          <p className="text-xs text-[#607084]">{item.medicines?.category ?? "No category"}</p>
                        </td>
                        <td className="px-3 py-3 text-[#41546b]">{item.requested_quantity}</td>
                        <td className="px-3 py-3 text-[#41546b]">{item.dispensed_quantity}</td>
                        <td className="min-w-[220px] px-3 py-3 text-[#41546b]">{item.dosage_instructions ?? "Not recorded"}</td>
                        <td className="px-3 py-3"><StatusBadge value={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 rounded-lg border border-dashed border-[#cbd8e2] bg-[#f8fbfd] p-3 text-sm text-[#607084]">No medicines are attached to this prescription.</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function OrderPage({
  title,
  description,
  state,
  kind,
}: {
  title: string;
  description: string;
  state: QueryState<RelatedOrder[]>;
  kind: "lab" | "medicine";
}) {
  return (
    <section className="px-5 py-7 lg:px-8">
      <PageHeading title={title} description={description} />
      <DataPanel className="mt-6" title={`${title} List`}>
        {state.loading ? <LoadingState label={`Loading ${title.toLowerCase()}`} /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title={`No ${title.toLowerCase()}`} description={`No ${kind} orders are visible for your doctor profile.`} /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? (
          <div className="divide-y divide-[#e1e9ef]">
            {state.data.map((order) => (
              <div key={order.id} className="grid gap-4 py-4 lg:grid-cols-[0.9fr_1fr_0.8fr_0.7fr_0.4fr] lg:items-center">
                <div>
                  <p className="font-semibold">{order.visits?.visit_code ?? "Visit"}</p>
                  <p className="text-sm text-[#607084]">{order.patients?.full_name ?? "Patient unavailable"}</p>
                </div>
                <p className="text-sm text-[#41546b]">{order.visits?.chief_complaint ?? "No complaint recorded"}</p>
                <p className="text-sm">{formatDateTime(order.created_at)}</p>
                <StatusBadge value={order.status} />
                <Link href={`/doctor/visits/${order.visit_id}`} className="inline-flex items-center text-sm font-semibold text-[#006d86]">
                  Open <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : null}
      </DataPanel>
    </section>
  );
}

function VisitTable({ visits, compact = false }: { visits: DoctorVisit[]; compact?: boolean }) {
  return (
    <TableFrame>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Visit Code</TableHead>
            <TableHead>Patient</TableHead>
            {!compact ? <TableHead>MRN / Student ID</TableHead> : null}
            <TableHead>Chief Complaint</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.map((visit) => (
            <TableRow key={visit.id}>
              <TableCell className="whitespace-nowrap font-semibold">{visit.visit_code}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={visit.patients?.full_name ?? "Patient"} small />
                  <span className="text-sm font-medium">{visit.patients?.full_name ?? "Patient unavailable"}</span>
                </div>
              </TableCell>
              {!compact ? <TableCell className="whitespace-nowrap text-[#607084]">{patientIdentifier(visit.patients)}</TableCell> : null}
              <TableCell className="min-w-[220px] text-[#41546b]">{visit.chief_complaint ?? "Not recorded"}</TableCell>
              <TableCell><PriorityBadge value={visit.priority} /></TableCell>
              <TableCell><StatusBadge value={visit.status} /></TableCell>
              <TableCell className="whitespace-nowrap text-[#607084]">{formatDateTime(visit.created_at)}</TableCell>
              <TableCell>
                <Link href={`/doctor/visits/${visit.id}`} className="inline-flex h-9 items-center justify-center rounded-lg bg-[#006d86] px-3 text-sm font-semibold text-white">
                  Open
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableFrame>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  danger,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#d4e0e8] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#607084]">{title}</p>
        <Icon className={cn("h-5 w-5", danger ? "text-[#b42318]" : "text-[#00758d]")} />
      </div>
      <p className={cn("mt-4 text-3xl font-bold", danger ? "text-[#b42318]" : "text-[#17212f]")}>{value}</p>
    </div>
  );
}

function DataPanel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-[#d4e0e8] bg-white", className)}>
      <div className="flex flex-col gap-3 border-b border-[#d4e0e8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[#607084]">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-[#17212f]">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#607084]">{description}</p>
      </div>
      {action}
    </div>
  );
}

function LinkButton({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link href={href} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006d86] px-4 text-sm font-semibold text-white">
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center gap-3 text-sm text-[#607084]">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-[#cbd8e2] bg-[#f8fbfd] p-6 text-center">
      <UserRound className="h-8 w-8 text-[#7a8ca1]" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#607084]">{description}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#f0b7b2] bg-[#fff6f5] p-4 text-sm text-[#9f1f17]">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4" />
        <div>
          <p className="font-semibold">Supabase error</p>
          <p className="mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  return <Badge tone={badgeTone(value)}>{formatLabel(value)}</Badge>;
}

function PriorityBadge({ value }: { value: VisitPriority }) {
  const tone = value === "urgent" || value === "high" ? "danger" : value === "normal" ? "info" : "neutral";
  return <Badge tone={tone}>{formatLabel(value)}</Badge>;
}

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-[#d9edf3] font-semibold text-[#006d86]", small ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm")}>
      {initials(name)}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">{label}</p>
      <p className="mt-1 break-words text-sm text-[#17212f]">{value || "Not recorded"}</p>
    </div>
  );
}

function ClinicalTextarea({
  label,
  value,
  disabled,
  required,
  wide,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  required?: boolean;
  wide?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={cn("block", wide && "lg:col-span-2")}>
      <span className="text-sm font-semibold text-[#41546b]">
        {label}
        {required ? <span className="text-[#b42318]"> *</span> : null}
      </span>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-[128px] w-full resize-y rounded-lg border border-[#cbd8e2] bg-white p-3 text-sm leading-6 outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
      />
    </label>
  );
}

function ClinicalInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#41546b]">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-[#cbd8e2] bg-white px-3 text-sm outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
      />
    </label>
  );
}

function visitToFormState(visit: DoctorVisit): VisitFormState {
  return {
    chief_complaint: visit.chief_complaint,
    symptoms: visit.symptoms,
    diagnosis: visit.diagnosis,
    disease: visit.disease,
    doctor_instructions: visit.doctor_instructions,
    notes: visit.notes,
    priority: visit.priority,
  };
}

function nullableText(value: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function formPayload(form: VisitFormState) {
  return {
    chief_complaint: nullableText(form.chief_complaint),
    symptoms: nullableText(form.symptoms),
    diagnosis: nullableText(form.diagnosis),
    disease: nullableText(form.disease),
    doctor_instructions: nullableText(form.doctor_instructions),
    notes: nullableText(form.notes),
    priority: form.priority,
  };
}

function patientIdentifier(patient: Pick<PatientRow, "mrn" | "student_id"> | null) {
  if (!patient) return "Not available";
  if (patient.mrn && patient.student_id) return `${patient.mrn} / ${patient.student_id}`;
  return patient.mrn ?? patient.student_id ?? "Not set";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DR";
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
