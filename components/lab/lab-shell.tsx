"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Beaker,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileClock,
  Loader2,
  LogOut,
  Search,
  Settings,
  X,
} from "lucide-react";
import { Badge, badgeTone } from "@/components/ui/badge";
import { navigationByRole } from "@/lib/constants/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { AppProfile, StatusTone } from "@/types/app.types";
import type { Database, Tables } from "@/types/database.types";

type LabShellProps = {
  profile: AppProfile;
  segments?: string[];
};

type Screen = "dashboard" | "orders" | "pending" | "completed" | "tests";
type LabResultStatus = Database["public"]["Enums"]["lab_result_status"];
type VisitPriority = Database["public"]["Enums"]["visit_priority"];
type VisitStatus = Database["public"]["Enums"]["visit_status"];
type LabTestRow = Pick<Tables<"lab_tests">, "id" | "name" | "code" | "description" | "normal_range" | "unit" | "status" | "created_at">;

type PatientSummary = {
  full_name: string;
  mrn: string | null;
  student_id: string | null;
};

type VisitSummary = {
  id: string;
  visit_code: string;
  chief_complaint: string | null;
  status: VisitStatus;
  priority: VisitPriority;
};

type DoctorSummary = {
  full_name: string;
  email: string;
};

type LabTestSummary = {
  name: string;
  code: string | null;
  unit: string | null;
  normal_range: string | null;
};

type LabResultRecord = {
  id: string;
  visit_id: string;
  patient_id: string;
  doctor_id: string;
  lab_test_id: string;
  result_value: string | null;
  result_notes: string | null;
  status: LabResultStatus;
  entered_by: string | null;
  entered_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  visible_to_patient: boolean;
  created_at: string;
  updated_at: string;
  patients: PatientSummary | null;
  visits: VisitSummary | null;
  doctor: DoctorSummary | null;
  lab_tests: LabTestSummary | null;
};

type QueryState<T> = {
  loading: boolean;
  data: T;
  error: string | null;
};

type DashboardCounts = {
  pending: number;
  entered: number;
  submitted: number;
  reviewed: number;
  visible: number;
  activeTests: number;
};

type QueryError = { message: string };
type QueryResult<T> = { data: T[] | null; error: QueryError | null; count?: number | null };
type CountResult = { data: null; error: QueryError | null; count: number | null };

type SupabaseQuery<T> = PromiseLike<QueryResult<T>> & {
  eq(column: string, value: string | boolean): SupabaseQuery<T>;
  in(column: string, values: string[]): SupabaseQuery<T>;
  order(column: string, options: { ascending: boolean }): SupabaseQuery<T>;
  limit(count: number): SupabaseQuery<T>;
};

type SupabaseCountQuery = PromiseLike<CountResult> & {
  eq(column: string, value: string | boolean): SupabaseCountQuery;
  in(column: string, values: string[]): SupabaseCountQuery;
};

type CanonicalLabResultsClient = {
  from(table: "lab_results"): {
    select(columns: string): SupabaseQuery<LabResultRecord>;
    select(columns: string, options: { count: "exact"; head: true }): SupabaseCountQuery;
  };
};

type LabTestsClient = {
  from(table: "lab_tests"): {
    select(columns: string): SupabaseQuery<LabTestRow>;
    select(columns: string, options: { count: "exact"; head: true }): SupabaseCountQuery;
  };
};

type SubmitResultPayload = {
  lab_result_id: string;
  result_value: string;
  result_notes?: string;
};

const labResultSelect =
  "id,visit_id,patient_id,doctor_id,lab_test_id,result_value,result_notes,status,entered_by,entered_at,reviewed_by,reviewed_at,visible_to_patient,created_at,updated_at,patients(full_name,mrn,student_id),visits(id,visit_code,chief_complaint,status,priority),doctor:profiles!lab_results_doctor_id_fkey(full_name,email),lab_tests(name,code,unit,normal_range)";

const statusFilters: Record<"pending" | "completed", LabResultStatus[]> = {
  pending: ["pending", "entered"],
  completed: ["submitted", "reviewed"],
};

export function LabShell({ profile, segments = [] }: LabShellProps) {
  const pathname = usePathname();
  const screen = resolveLabScreen(segments);

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#17212f]">
      <LabSidebar activePath={pathname} profile={profile} />
      <main className="min-h-screen lg:pl-[290px]">
        <LabTopbar profile={profile} />
        {screen === "dashboard" ? <LabDashboard /> : null}
        {screen === "orders" ? <LabResultsList title="Lab Results Queue" description="Canonical lab results awaiting entry, submission, or review context." /> : null}
        {screen === "pending" ? (
          <LabResultsList title="Pending Results" description="Pending and entered lab results that still need completion." statuses={statusFilters.pending} emptyTitle="No pending results" />
        ) : null}
        {screen === "completed" ? (
          <LabResultsList title="Completed Results" description="Submitted and reviewed canonical lab results." statuses={statusFilters.completed} emptyTitle="No completed results" />
        ) : null}
        {screen === "tests" ? <LabTestsPage /> : null}
      </main>
    </div>
  );
}

function resolveLabScreen(segments: string[]): Screen {
  const path = segments.join("/");
  if (!path || path === "dashboard") return "dashboard";
  if (path === "orders") return "orders";
  if (path === "orders/pending") return "pending";
  if (path === "orders/completed") return "completed";
  if (path === "tests") return "tests";
  return "dashboard";
}

function LabSidebar({ activePath, profile }: { activePath: string; profile: AppProfile }) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[290px] border-r border-[#d4e0e8] bg-white lg:flex lg:flex-col">
      <div className="border-b border-[#d4e0e8] px-6 py-6">
        <Link href="/lab/dashboard" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#00758d] text-white">
            <Beaker className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-semibold text-[#00758d]">HealTech</p>
            <p className="text-sm text-[#607084]">Laboratory Workspace</p>
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
        {navigationByRole.lab.map((item) => {
          const active = isActiveLabPath(activePath, item.href);
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

function isActiveLabPath(activePath: string, href: string) {
  if (activePath === href) return true;
  if (href === "/lab/orders") return activePath.startsWith("/lab/orders/") && !activePath.includes("/pending") && !activePath.includes("/completed");
  return false;
}

function LabTopbar({ profile }: { profile: AppProfile }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d4e0e8] bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-5 lg:px-8">
        <Link href="/lab/dashboard" className="font-semibold text-[#00758d] lg:hidden">
          HealTech
        </Link>
        <div className="relative hidden w-full max-w-md sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8ca1]" />
          <input
            aria-label="Search lab workspace"
            className="h-10 w-full rounded-lg border border-[#cbd8e2] bg-[#f4f8fb] pl-10 pr-3 text-sm outline-none focus:border-[#00758d]"
            placeholder="Search patients, visits, or lab tests"
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

function LabDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [counts, setCounts] = useState<DashboardCounts>({ pending: 0, entered: 0, submitted: 0, reviewed: 0, visible: 0, activeTests: 0 });
  const [state, setState] = useState<QueryState<LabResultRecord[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;
    const labResults = supabase as unknown as CanonicalLabResultsClient;
    const labTests = supabase as unknown as LabTestsClient;

    async function loadDashboard() {
      setState((current) => ({ ...current, loading: true, error: null }));

      const [pending, entered, submitted, reviewed, visible, activeTests, recent] = await Promise.all([
        countLabResults(labResults, "status", "pending"),
        countLabResults(labResults, "status", "entered"),
        countLabResults(labResults, "status", "submitted"),
        countLabResults(labResults, "status", "reviewed"),
        countLabResults(labResults, "visible_to_patient", true),
        countLabTests(labTests, "status", "active"),
        labResults.from("lab_results").select(labResultSelect).eq("status", "pending").order("created_at", { ascending: false }).limit(6),
      ]);

      if (!active) return;
      const error = pending.error ?? entered.error ?? submitted.error ?? reviewed.error ?? visible.error ?? activeTests.error ?? recent.error;
      if (error) {
        setState({ loading: false, data: [], error: error.message });
        return;
      }

      setCounts({
        pending: pending.count ?? 0,
        entered: entered.count ?? 0,
        submitted: submitted.count ?? 0,
        reviewed: reviewed.count ?? 0,
        visible: visible.count ?? 0,
        activeTests: activeTests.count ?? 0,
      });
      setState({ loading: false, data: recent.data ?? [], error: null });
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [supabase]);

  return (
    <section className="px-5 py-8 lg:px-8">
      <PageHeader title="Lab Dashboard" description="Canonical lab result workload for the laboratory team." />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Pending Results" value={counts.pending} icon={FileClock} tone="warning" />
        <StatCard title="Entered Results" value={counts.entered} icon={ClipboardList} tone="info" />
        <StatCard title="Submitted Results" value={counts.submitted} icon={BadgeCheck} tone="info" />
        <StatCard title="Reviewed Results" value={counts.reviewed} icon={CheckCircle2} tone="success" />
        <StatCard title="Visible To Patient" value={counts.visible} icon={BadgeCheck} tone="success" />
        <StatCard title="Active Lab Tests" value={counts.activeTests} icon={Beaker} tone="neutral" />
      </div>

      <section className="mt-8 rounded-xl border border-[#d4e0e8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d4e0e8] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Recent Pending Results</h2>
            <p className="text-sm text-[#607084]">Newest canonical lab results with pending status.</p>
          </div>
          <Link href="/lab/orders/pending" className="text-sm font-semibold text-[#006d86]">
            View pending
          </Link>
        </div>
        {state.loading ? <LoadingState label="Loading pending results" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No pending results" description="There are no pending lab results visible to this lab profile." /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? <LabResultsTable results={state.data} compact /> : null}
      </section>
    </section>
  );
}

async function countLabResults(client: CanonicalLabResultsClient, column: string, value: string | boolean) {
  return client.from("lab_results").select("id", { count: "exact", head: true }).eq(column, value);
}

async function countLabTests(client: LabTestsClient, column: string, value: string | boolean) {
  return client.from("lab_tests").select("id", { count: "exact", head: true }).eq(column, value);
}

function LabResultsList({
  title,
  description,
  statuses,
  emptyTitle = "No lab results",
}: {
  title: string;
  description: string;
  statuses?: LabResultStatus[];
  emptyTitle?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<QueryState<LabResultRecord[]>>({ loading: true, data: [], error: null });
  const [selectedResult, setSelectedResult] = useState<LabResultRecord | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    const client = supabase as unknown as CanonicalLabResultsClient;

    await Promise.resolve();
    setState({ loading: true, data: [], error: null });
    const base = client.from("lab_results").select(labResultSelect);
    const result = statuses?.length ? await base.in("status", statuses).order("updated_at", { ascending: false }) : await base.order("updated_at", { ascending: false });

    if (result.error) {
      setState({ loading: false, data: [], error: result.error.message });
      return;
    }
    setState({ loading: false, data: result.data ?? [], error: null });
  }, [statuses, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadResults();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadResults]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return state.data;
    return state.data.filter((result) =>
      [
        result.patients?.full_name,
        result.patients?.mrn,
        result.patients?.student_id,
        result.visits?.visit_code,
        result.visits?.chief_complaint,
        result.lab_tests?.name,
        result.lab_tests?.code,
        result.doctor?.full_name,
        result.result_value,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, state.data]);

  return (
    <section className="px-5 py-8 lg:px-8">
      <PageHeader title={title} description={description} />
      {successMessage ? <Notice message={successMessage} /> : null}
      <div className="mt-6 rounded-xl border border-[#d4e0e8] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#d4e0e8] p-4 md:flex-row md:items-center md:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder="Filter by patient, visit, test, doctor, or result value" />
          <p className="text-sm text-[#607084]">{filtered.length} visible results</p>
        </div>
        {state.loading ? <LoadingState label="Loading lab results" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <EmptyState title={emptyTitle} description="No canonical lab results match this page." />
        ) : null}
        {!state.loading && !state.error && state.data.length > 0 && filtered.length === 0 ? (
          <EmptyState title="No matching results" description="Try a different patient, visit, doctor, or lab test search." />
        ) : null}
        {!state.loading && !state.error && filtered.length > 0 ? <LabResultsTable results={filtered} onEditResult={setSelectedResult} /> : null}
      </div>
      <ResultEntryDialog
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
        onSubmitted={async (result) => {
          setSuccessMessage(`${result.lab_tests?.name ?? "Lab result"} submitted successfully.`);
          setSelectedResult(null);
          await loadResults();
        }}
      />
    </section>
  );
}

function LabResultsTable({ results, compact = false, onEditResult }: { results: LabResultRecord[]; compact?: boolean; onEditResult?: (result: LabResultRecord) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#d4e0e8] text-sm">
        <thead className="bg-[#edf4f7] text-left text-xs uppercase tracking-wide text-[#607084]">
          <tr>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Visit</th>
            <th className="px-4 py-3">Test</th>
            {!compact ? <th className="px-4 py-3">Doctor</th> : null}
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Result Value</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4edf2]">
          {results.map((result) => (
            <tr key={result.id} className="align-top">
              <td className="px-4 py-4">
                <p className="font-semibold">{result.patients?.full_name ?? "Unknown patient"}</p>
                <p className="text-xs text-[#607084]">{patientIdentifier(result.patients)}</p>
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold">{result.visits?.visit_code ?? "No visit code"}</p>
                <p className="max-w-xs text-xs text-[#607084]">{result.visits?.chief_complaint ?? "No chief complaint"}</p>
                {result.visits ? <Badge tone={badgeTone(result.visits.priority)} className="mt-2">{formatLabel(result.visits.priority)}</Badge> : null}
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold">{result.lab_tests?.name ?? "Lab test"}</p>
                <p className="text-xs text-[#607084]">
                  {result.lab_tests?.code ?? "No code"}
                  {result.lab_tests?.normal_range ? ` / Range: ${result.lab_tests.normal_range}` : ""}
                </p>
              </td>
              {!compact ? (
                <td className="px-4 py-4">
                  <p className="font-medium">{result.doctor?.full_name ?? "Assigned doctor"}</p>
                  <p className="text-xs text-[#607084]">{result.doctor?.email ?? result.doctor_id}</p>
                </td>
              ) : null}
              <td className="px-4 py-4">
                <Badge tone={badgeTone(result.status)}>{formatLabel(result.status)}</Badge>
                <p className="mt-2 text-xs text-[#607084]">{result.visible_to_patient ? "Visible to patient" : "Not visible to patient"}</p>
              </td>
              <td className="px-4 py-4">
                <p className="font-medium">{formatResultValue(result)}</p>
                <p className="mt-1 max-w-xs text-xs text-[#607084]">{result.result_notes ?? "No result notes"}</p>
              </td>
              <td className="px-4 py-4 text-[#41546b]">{formatDate(result.created_at)}</td>
              <td className="px-4 py-4 text-right">
                <LabResultAction result={result} onEditResult={onEditResult} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LabResultAction({ result, onEditResult }: { result: LabResultRecord; onEditResult?: (result: LabResultRecord) => void }) {
  if (result.status === "submitted" || result.status === "reviewed") {
    return <span className="inline-flex rounded-lg border border-[#cbd8e2] px-3 py-2 text-xs font-semibold text-[#607084]">{formatLabel(result.status)}</span>;
  }

  const label = result.status === "entered" || result.result_value ? "Edit Result" : "Enter Result";
  if (!onEditResult) {
    return (
      <Link href="/lab/orders/pending" className="inline-flex rounded-lg bg-[#006d86] px-3 py-2 text-xs font-semibold text-white hover:bg-[#005f75]">
        {label}
      </Link>
    );
  }

  return (
    <button onClick={() => onEditResult(result)} className="inline-flex rounded-lg bg-[#006d86] px-3 py-2 text-xs font-semibold text-white hover:bg-[#005f75]">
      {label}
    </button>
  );
}

function ResultEntryDialog({
  result,
  onClose,
  onSubmitted,
}: {
  result: LabResultRecord | null;
  onClose: () => void;
  onSubmitted: (result: LabResultRecord) => Promise<void>;
}) {
  if (!result) return null;
  return <ResultEntryForm key={result.id} result={result} onClose={onClose} onSubmitted={onSubmitted} />;
}

function ResultEntryForm({
  result,
  onClose,
  onSubmitted,
}: {
  result: LabResultRecord;
  onClose: () => void;
  onSubmitted: (result: LabResultRecord) => Promise<void>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [resultValue, setResultValue] = useState(result.result_value ?? "");
  const [resultNotes, setResultNotes] = useState(result.result_notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const readOnly = result.status === "submitted" || result.status === "reviewed";

  async function handleSubmit() {
    if (readOnly) {
      setValidationError("Submitted or reviewed lab results cannot be edited.");
      return;
    }

    const trimmedValue = resultValue.trim();
    if (!trimmedValue) {
      setValidationError("Result value is required.");
      return;
    }

    setSubmitting(true);
    setValidationError(null);
    setSubmitError(null);

    const payload: SubmitResultPayload = {
      lab_result_id: result.id,
      result_value: trimmedValue,
    };
    const trimmedNotes = resultNotes.trim();
    if (trimmedNotes) payload.result_notes = trimmedNotes;

    const { error } = await supabase.functions.invoke("submit-lab-results", {
      body: { results: [payload] },
    });

    if (error) {
      setSubmitError(error.message);
      setSubmitting(false);
      return;
    }

    await onSubmitted(result);
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#d4e0e8] bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#d4e0e8] px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold">{result.result_value ? "Edit Lab Result" : "Enter Lab Result"}</h2>
            <p className="mt-1 text-sm text-[#607084]">Submit canonical lab result values for this visit.</p>
          </div>
          <button onClick={onClose} disabled={submitting} className="rounded-lg p-2 text-[#607084] hover:bg-[#f4f8fb] disabled:opacity-60" aria-label="Close result entry">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-4 rounded-lg border border-[#d4e0e8] bg-[#f8fbfd] p-4 md:grid-cols-2">
            <InfoBlock label="Patient" value={result.patients?.full_name ?? "Unknown patient"} helper={patientIdentifier(result.patients)} />
            <InfoBlock label="Visit" value={result.visits?.visit_code ?? "No visit code"} helper={result.visits?.chief_complaint ?? "No chief complaint"} />
            <InfoBlock label="Doctor" value={result.doctor?.full_name ?? "Assigned doctor"} helper={result.doctor?.email ?? result.doctor_id} />
            <InfoBlock label="Lab Test" value={result.lab_tests?.name ?? "Lab test"} helper={labTestHelper(result.lab_tests)} />
            <InfoBlock label="Unit" value={result.lab_tests?.unit ?? "Not set"} helper="Result unit" />
            <InfoBlock label="Normal Range" value={result.lab_tests?.normal_range ?? "Not set"} helper="Reference range" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Current Status</p>
              <Badge tone={badgeTone(result.status)} className="mt-2">{formatLabel(result.status)}</Badge>
            </div>
          </div>

          {readOnly ? <Notice message={`${formatLabel(result.status)} lab results are read-only in this workflow.`} /> : null}
          {validationError ? <div className="rounded-lg border border-[#e6ca83] bg-[var(--warning-container)] p-3 text-sm text-[var(--warning)]">{validationError}</div> : null}
          {submitError ? <ErrorState message={submitError} /> : null}

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Result Value *
              <input
                value={resultValue}
                onChange={(event) => setResultValue(event.target.value)}
                disabled={readOnly || submitting}
                className="h-11 rounded-lg border border-[#cbd8e2] px-3 outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
                placeholder="Enter result value"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Result Notes
              <textarea
                value={resultNotes}
                onChange={(event) => setResultNotes(event.target.value)}
                disabled={readOnly || submitting}
                className="min-h-28 resize-y rounded-lg border border-[#cbd8e2] p-3 outline-none focus:border-[#00758d] disabled:bg-[#eef3f7]"
                placeholder="Optional notes for this result"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#d4e0e8] px-5 py-4">
          <button onClick={onClose} disabled={submitting} className="rounded-lg border border-[#cbd8e2] px-4 py-2 text-sm font-semibold text-[#41546b] disabled:opacity-60">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={readOnly || submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#006d86] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005f75] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Submitting" : "Submit Result"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LabTestsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<QueryState<LabTestRow[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;
    const client = supabase as unknown as LabTestsClient;

    async function loadTests() {
      setState({ loading: true, data: [], error: null });
      const result = await client.from("lab_tests").select("id,name,code,description,normal_range,unit,status,created_at").order("name", { ascending: true });
      if (!active) return;
      if (result.error) {
        setState({ loading: false, data: [], error: result.error.message });
        return;
      }
      setState({ loading: false, data: result.data ?? [], error: null });
    }

    void loadTests();
    return () => {
      active = false;
    };
  }, [supabase]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return state.data;
    return state.data.filter((test) =>
      [test.name, test.code, test.description, test.normal_range, test.unit, test.status].filter(Boolean).join(" ").toLowerCase().includes(needle),
    );
  }, [query, state.data]);

  const activeCount = state.data.filter((test) => test.status === "active").length;

  return (
    <section className="px-5 py-8 lg:px-8">
      <PageHeader title="Lab Test Types" description="Read-only catalog of configured laboratory tests." />
      <div className="mt-6 rounded-xl border border-[#d4e0e8] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#d4e0e8] p-4 md:flex-row md:items-center md:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder="Filter by test name, code, unit, range, or status" />
          <p className="text-sm text-[#607084]">{activeCount} active tests</p>
        </div>
        {state.loading ? <LoadingState label="Loading lab tests" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No lab tests" description="No lab test types are visible to this lab profile." /> : null}
        {!state.loading && !state.error && state.data.length > 0 && activeCount === 0 ? <Notice message="No active lab tests are currently available." /> : null}
        {!state.loading && !state.error && filtered.length === 0 && state.data.length > 0 ? <EmptyState title="No matching tests" description="Try a different lab test search." /> : null}
        {!state.loading && !state.error && filtered.length > 0 ? <LabTestsTable tests={filtered} /> : null}
      </div>
    </section>
  );
}

function LabTestsTable({ tests }: { tests: LabTestRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#d4e0e8] text-sm">
        <thead className="bg-[#edf4f7] text-left text-xs uppercase tracking-wide text-[#607084]">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Unit</th>
            <th className="px-4 py-3">Normal Range</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4edf2]">
          {tests.map((test) => (
            <tr key={test.id}>
              <td className="px-4 py-4 font-semibold">{test.name}</td>
              <td className="px-4 py-4">{test.code ?? "No code"}</td>
              <td className="max-w-md px-4 py-4 text-[#41546b]">{test.description ?? "No description"}</td>
              <td className="px-4 py-4">{test.unit ?? "Not set"}</td>
              <td className="px-4 py-4">{test.normal_range ?? "Not set"}</td>
              <td className="px-4 py-4">
                <Badge tone={badgeTone(test.status)}>{formatLabel(test.status)}</Badge>
              </td>
              <td className="px-4 py-4 text-[#41546b]">{formatDate(test.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-[#17212f]">{title}</h1>
      <p className="mt-2 text-sm text-[#607084]">{description}</p>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, tone }: { title: string; value: number; icon: typeof Beaker; tone: StatusTone }) {
  return (
    <div className="rounded-xl border border-[#d4e0e8] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#607084]">{title}</p>
          <p className="mt-3 text-3xl font-semibold">{value}</p>
        </div>
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg", statToneClass(tone))}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8ca1]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-[#cbd8e2] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#00758d]"
        placeholder={placeholder}
      />
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-8 text-sm text-[#607084]">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return <div className="m-4 rounded-lg border border-[#f2aaa4] bg-[var(--error-container)] p-4 text-sm text-[var(--error)]">Supabase error: {message}</div>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-[#607084]">{description}</p>
    </div>
  );
}

function Notice({ message }: { message: string }) {
  return <div className="m-4 rounded-lg border border-[#e6ca83] bg-[var(--warning-container)] p-4 text-sm text-[var(--warning)]">{message}</div>;
}

function InfoBlock({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
      {helper ? <p className="mt-1 text-xs text-[#607084]">{helper}</p> : null}
    </div>
  );
}

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-[#d7eef3] font-semibold text-[#006d86]", small ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm")}>
      {initials || "L"}
    </span>
  );
}

function patientIdentifier(patient: PatientSummary | null) {
  if (!patient) return "No patient identifier";
  return patient.mrn ? `MRN: ${patient.mrn}` : patient.student_id ? `Student ID: ${patient.student_id}` : "No MRN or student ID";
}

function formatResultValue(result: LabResultRecord) {
  if (!result.result_value) return "No value entered";
  return `${result.result_value}${result.lab_tests?.unit ? ` ${result.lab_tests.unit}` : ""}`;
}

function labTestHelper(test: LabTestSummary | null) {
  if (!test) return "No test metadata";
  return [test.code ? `Code: ${test.code}` : "No code", test.normal_range ? `Range: ${test.normal_range}` : null].filter(Boolean).join(" / ");
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statToneClass(tone: StatusTone) {
  const classes: Record<StatusTone, string> = {
    neutral: "bg-[#eef3f7] text-[#41546b]",
    info: "bg-[#e3f7fa] text-[#006d86]",
    success: "bg-[var(--success-container)] text-[var(--success)]",
    warning: "bg-[var(--warning-container)] text-[var(--warning)]",
    danger: "bg-[var(--error-container)] text-[var(--error)]",
  };
  return classes[tone];
}
