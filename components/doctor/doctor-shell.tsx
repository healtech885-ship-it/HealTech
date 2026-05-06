"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

type DoctorVisit = VisitRow & {
  patients: PatientRow | null;
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

  useEffect(() => {
    let active = true;

    async function loadVisit() {
      setState({ loading: true, data: null, error: null, status: "loading" });
      const { data, error } = await supabase.from("visits").select(visitSelect).eq("id", visitId).maybeSingle();
      if (!active) return;

      if (error) {
        setState({ loading: false, data: null, error: error.message, status: "error" });
        return;
      }

      if (!data) {
        setState({ loading: false, data: null, error: null, status: "not-found" });
        return;
      }

      const visit = (data as unknown) as DoctorVisit;
      if (visit.doctor_id !== profile.id) {
        setState({ loading: false, data: null, error: null, status: "unauthorized" });
        return;
      }

      setState({ loading: false, data: visit, error: null, status: "ready" });
    }

    void loadVisit();
    return () => {
      active = false;
    };
  }, [profile.id, supabase, visitId]);

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
      {state.status === "ready" && state.data ? <VisitDetailCard visit={state.data} /> : null}
    </section>
  );
}

function VisitDetailCard({ visit }: { visit: DoctorVisit }) {
  const patient = visit.patients;

  return (
    <div className="space-y-6">
      <PageHeading
        title={`Visit ${visit.visit_code}`}
        description="Read-only clinical detail shell. Diagnosis editing is intentionally not enabled in this step."
        action={<StatusBadge value={visit.status} />}
      />

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

      <DataPanel title="Clinical Information">
        <div className="grid gap-4 lg:grid-cols-2">
          <InfoBlock label="Chief complaint" value={visit.chief_complaint} />
          <InfoBlock label="Symptoms" value={visit.symptoms} />
          <InfoBlock label="Diagnosis" value={visit.diagnosis} />
          <InfoBlock label="Disease" value={visit.disease} />
          <InfoBlock label="Doctor instructions" value={visit.doctor_instructions} wide />
          <InfoBlock label="Notes" value={visit.notes} wide />
        </div>
      </DataPanel>
    </div>
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

  useEffect(() => {
    let active = true;

    async function loadResults() {
      setState((current) => ({ ...current, loading: true, error: null }));
      const { data, error } = await supabase
        .from("lab_order_items")
        .select("id,status,result_value,result_notes,created_at,updated_at,lab_tests(name,code,unit,normal_range),lab_orders!inner(id,visit_id,doctor_id,patients(id,full_name,mrn,student_id),visits(id,visit_code,chief_complaint,status,priority))")
        .eq("lab_orders.doctor_id", profile.id)
        .order("updated_at", { ascending: false });

      if (!active) return;
      if (error) {
        setState({ loading: false, data: [], error: error.message });
        return;
      }
      setState({ loading: false, data: ((data ?? []) as unknown) as LabResultItem[], error: null });
    }

    void loadResults();
    return () => {
      active = false;
    };
  }, [profile.id, supabase]);

  return (
    <section className="px-5 py-7 lg:px-8">
      <PageHeading title="Lab Results" description="Result items connected to lab orders for your assigned visits." />
      <DataPanel className="mt-6" title="Results Awaiting Review">
        {state.loading ? <LoadingState label="Loading lab results" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No lab results" description="There are no lab result items visible for your doctor profile." /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? (
          <div className="divide-y divide-[#e1e9ef]">
            {state.data.map((item) => (
              <div key={item.id} className="grid gap-4 py-4 lg:grid-cols-[1.1fr_1fr_0.8fr_0.7fr_0.4fr] lg:items-center">
                <div>
                  <p className="font-semibold">{item.lab_tests?.name ?? "Lab test"}</p>
                  <p className="text-sm text-[#607084]">{item.lab_orders?.visits?.visit_code ?? "Visit"} / {item.lab_orders?.patients?.full_name ?? "Patient unavailable"}</p>
                </div>
                <p className="text-sm text-[#41546b]">{item.lab_orders?.visits?.chief_complaint ?? "No complaint recorded"}</p>
                <p className="text-sm">{item.result_value ?? "No value entered"}</p>
                <StatusBadge value={item.status} />
                <Link href={`/doctor/visits/${item.lab_orders?.visit_id ?? ""}`} className="inline-flex items-center text-sm font-semibold text-[#006d86]">
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

function DoctorMedicineOrders({ profile }: { profile: AppProfile }) {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<QueryState<RelatedOrder[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setState((current) => ({ ...current, loading: true, error: null }));
      const { data, error } = await supabase
        .from("medicine_orders")
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

  return <OrderPage title="Medicine Orders" description="Medicine orders created under your doctor profile." state={state} kind="medicine" />;
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

type LabResultItem = {
  id: string;
  status: string;
  result_value: string | null;
  result_notes: string | null;
  created_at: string;
  updated_at: string;
  lab_tests: { name: string; code: string | null; unit: string | null; normal_range: string | null } | null;
  lab_orders: {
    id: string;
    visit_id: string;
    doctor_id: string;
    patients: Pick<PatientRow, "id" | "full_name" | "mrn" | "student_id"> | null;
    visits: Pick<DoctorVisit, "id" | "visit_code" | "chief_complaint" | "status" | "priority"> | null;
  } | null;
};

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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#e1e9ef] text-left">
        <thead className="bg-[#f4f8fb] text-xs uppercase tracking-wide text-[#607084]">
          <tr>
            <th className="px-4 py-3 font-semibold">Visit Code</th>
            <th className="px-4 py-3 font-semibold">Patient</th>
            {!compact ? <th className="px-4 py-3 font-semibold">MRN / Student ID</th> : null}
            <th className="px-4 py-3 font-semibold">Chief Complaint</th>
            <th className="px-4 py-3 font-semibold">Priority</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            <th className="px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e1e9ef] bg-white">
          {visits.map((visit) => (
            <tr key={visit.id}>
              <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-[#24364b]">{visit.visit_code}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={visit.patients?.full_name ?? "Patient"} small />
                  <span className="text-sm font-medium">{visit.patients?.full_name ?? "Patient unavailable"}</span>
                </div>
              </td>
              {!compact ? <td className="whitespace-nowrap px-4 py-4 text-sm text-[#607084]">{patientIdentifier(visit.patients)}</td> : null}
              <td className="min-w-[220px] px-4 py-4 text-sm text-[#41546b]">{visit.chief_complaint ?? "Not recorded"}</td>
              <td className="px-4 py-4"><PriorityBadge value={visit.priority} /></td>
              <td className="px-4 py-4"><StatusBadge value={visit.status} /></td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-[#607084]">{formatDateTime(visit.created_at)}</td>
              <td className="px-4 py-4">
                <Link href={`/doctor/visits/${visit.id}`} className="inline-flex h-9 items-center justify-center rounded-lg bg-[#006d86] px-3 text-sm font-semibold text-white">
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

function InfoBlock({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-[#e1e9ef] bg-[#f8fbfd] p-4", wide && "lg:col-span-2")}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#17212f]">{value || "Not recorded"}</p>
    </div>
  );
}

function patientIdentifier(patient: PatientRow | null) {
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
