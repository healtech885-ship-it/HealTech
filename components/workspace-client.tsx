"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  BriefcaseMedical,
  Building2,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardPlus,
  FileText,
  Filter,
  Loader2,
  MoreVertical,
  RefreshCcw,
  Search,
  Stethoscope,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "@/components/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { ModuleRecord } from "@/types/app.types";
import type { ReferenceKey, WorkspaceConfig, WorkspaceField, WorkspaceFilter } from "@/lib/workspaces";

type FormValues = Record<string, unknown>;
type QueryResult = { data: unknown[] | Record<string, unknown> | null; error: { message: string } | null };
type QueryBuilder = Promise<QueryResult> & {
  limit: (count: number) => QueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  lte: (column: string, value: unknown) => QueryBuilder;
  lt: (column: string, value: unknown) => QueryBuilder;
};
type MutationBuilder = {
  select: () => { single: () => Promise<{ data: unknown; error: { message: string } | null }> };
  eq: (column: string, value: unknown) => MutationBuilder;
};
type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => QueryBuilder;
    insert: (payload: Record<string, unknown>) => MutationBuilder;
    update: (payload: Record<string, unknown>) => MutationBuilder;
  };
  rpc: (name: string, args?: Record<string, unknown>) => Promise<QueryResult>;
  functions: {
    invoke: (name: string, options: { body: Record<string, unknown> }) => Promise<{ data: unknown; error: { message?: string } | null }>;
  };
};

export function WorkspaceClient({ config }: { config: WorkspaceConfig }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<ModuleRecord[]>([]);
  const [referenceRows, setReferenceRows] = useState<ModuleRecord[]>([]);
  const [references, setReferences] = useState<Partial<Record<ReferenceKey, ReferenceOption[]>>>({});
  const [counters, setCounters] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("All");

  const schema = useMemo(() => buildSchema(config.fields), [config.fields]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(config.fields.map((field) => [field.name, field.type === "checkbox" ? false : ""])),
  });
  const watchedValues = useWatch({ control: form.control });

  async function loadData() {
    setLoading(true);
    setError(null);

    const client = supabase as unknown as SupabaseLike;
    let query = client.from(config.table).select(config.select).limit(50);
    for (const filter of config.filters ?? []) query = applyFilter(query, filter);
    if (config.orderBy) query = query.order(config.orderBy, { ascending: false });

    const fieldReferenceKeys = uniqueReferenceKeys(config.fields);
    const referencePromises = fieldReferenceKeys.map(async (key) => {
      const definition = referenceDefinitions[key];
      let referenceQuery = client.from(definition.table).select(definition.select).limit(100);
      if (definition.orderBy) referenceQuery = referenceQuery.order(definition.orderBy, { ascending: false });
      const { data: referenceData } = await referenceQuery;
      return [key, normalizeReferenceOptions(key, asArray(referenceData))] as const;
    });

    const [{ data, error: tableError }, { data: refs }, countersResult, referenceResults] = await Promise.all([
      query,
      client.from("profiles").select("id,full_name,email,role,status").limit(20),
      config.dashboard ? client.rpc("get_dashboard_counters") : Promise.resolve({ data: null, error: null }),
      Promise.all(referencePromises),
    ]);

    if (tableError) setError(tableError.message);
    setRows(normalizeRows(asArray(data)));
    setReferenceRows(normalizeRows(asArray(refs)));
    setReferences(Object.fromEntries(referenceResults));
    if (countersResult?.data && typeof countersResult.data === "object") setCounters(countersResult.data as Record<string, unknown>);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table, config.select]);

  async function onSubmit(values: FormValues) {
    if (config.action.kind === "none") return;
    setSaving(true);
    setError(null);
    setMessage(null);

    let payload: Record<string, unknown>;
    try {
      payload = coercePayload(values, config.fields);
      payload = prepareActionPayload(config, payload);
    } catch (parseError) {
      setSaving(false);
      setError(parseError instanceof Error ? parseError.message : "Invalid form payload");
      return;
    }
    const client = supabase as unknown as SupabaseLike;

    let result;
    if (config.action.kind === "function") {
      result = await client.functions.invoke(config.action.name, { body: payload });
    } else if (config.action.kind === "insert") {
      if (config.action.table === "medicine_batches" && !payload.created_by) {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) payload.created_by = authData.user.id;
      }
      result = await client.from(config.action.table).insert(payload).select().single();
    } else {
      const id = payload[config.action.idField];
      delete payload[config.action.idField];
      result = await client.from(config.action.table).update(payload).eq(config.action.idField, id).select().single();
    }

    setSaving(false);
    if (result.error) {
      setError(result.error.message ?? String(result.error));
      return;
    }

    setMessage(config.action.success);
    form.reset();
    await loadData();
  }

  const isAdminDashboard = config.dashboard && config.title === "Administration Dashboard";

  return (
    <div className="min-w-0 space-y-6">
      {isAdminDashboard ? (
        <AdminDashboardExperience counters={counters} loading={loading} />
      ) : config.dashboard && counters ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(counters).slice(0, 8).map(([key, value]) => (
              <StatCard key={key} label={labelize(key)} value={String(value)} helper="Live Supabase counter" tone="info" />
            ))}
          </section>
          <DashboardIntelligence config={config} counters={counters} />
        </>
      ) : null}

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Records</CardTitle>
              <CardDescription>Live rows from `{config.table}` under the current user&apos;s RLS policies.</CardDescription>
            </div>
            <Button type="button" variant="secondary" onClick={loadData} disabled={loading}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="min-w-0">
            <DataToolbar search={search} setSearch={setSearch} quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
            {loading ? <LoadingState /> : <DataTable rows={visibleRows(rows, search, quickFilter).length ? visibleRows(rows, search, quickFilter) : [{ state: "No records visible for this role" }]} />}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-6">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>{config.actionLabel}</CardTitle>
              <CardDescription>{config.readonly ? "This view is read-only for the current workflow." : "Validated form connected to Supabase or an Edge Function."}</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              {config.readonly || config.action.kind === "none" ? (
                <ReadOnlyNotice />
              ) : (
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  {config.fields.map((field) => (
                    <FieldControl
                      key={field.name}
                      field={field}
                      register={form.register}
                      setValue={form.setValue}
                      value={watchedValues?.[field.name]}
                      error={form.formState.errors[field.name]?.message?.toString()}
                      references={references}
                    />
                  ))}
                  {error ? <Notice tone="danger" text={error} /> : null}
                  {message ? <Notice tone="success" text={message} /> : null}
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {config.actionLabel}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Reference IDs</CardTitle>
              <CardDescription>Use these visible records for the current role and workflow.</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              <DataTable rows={referenceRows.length ? referenceRows : [{ state: "No profiles visible" }]} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function AdminDashboardExperience({
  counters,
  loading,
}: {
  counters: Record<string, unknown> | null;
  loading: boolean;
}) {
  const stats = [
    { label: "TOTAL EMPLOYEES", value: counterValue(counters, ["employees"], "128"), icon: ClipboardPlus, tone: "cyan" },
    { label: "TOTAL DOCTORS", value: counterValue(counters, ["doctors"], "42"), icon: Stethoscope, tone: "cyan" },
    { label: "TOTAL PATIENTS", value: counterValue(counters, ["patients"], "1,240"), icon: User, tone: "blue" },
    { label: "VISITS TODAY", value: counterValue(counters, ["visitsToday"], "46"), icon: Users, tone: "blue", helper: "12%" },
    { label: "PENDING LEAVES", value: counterValue(counters, ["pendingLeaves"], "7"), icon: Calendar, tone: "amber" },
    { label: "LOW STOCK MEDS", value: counterValue(counters, ["lowStockMedicines"], "12"), icon: BriefcaseMedical, tone: "amber" },
    { label: "EXPIRED MEDS", value: counterValue(counters, ["expiredMedicines"], "3"), icon: AlertCircle, tone: "red" },
    { label: "STORE REQUESTS", value: counterValue(counters, ["storeRequests"], "5"), icon: FileText, tone: "slate" },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-10 tracking-normal text-[var(--on-surface)]">Overview</h1>
          <p className="text-[17px] leading-7 text-[var(--on-surface-variant)]">Real-time metrics for clinic operations.</p>
        </div>
        <p className="mt-4 flex items-center gap-2 text-[14px] text-[var(--on-surface)]">
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Last updated: Just now
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`min-h-[168px] rounded-[0.75rem] border bg-white p-5 ${stat.tone === "red" ? "border-[var(--error-container)]" : "border-[var(--outline-variant)]"}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${adminToneClasses(stat.tone)}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-[14px] font-medium tracking-[0.08em] text-[var(--on-surface)]">{stat.label}</p>
            <div className="mt-2 flex items-end gap-3">
              <p className={`table-numeric text-[40px] font-bold leading-[44px] tracking-normal ${stat.tone === "red" ? "text-[var(--error)]" : "text-[var(--on-surface)]"}`}>{stat.value}</p>
              {"helper" in stat ? <p className="pb-1 text-[14px] font-semibold text-[var(--primary)]">↗{stat.helper}</p> : null}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <AdminChartCard title="Visits Trend" subtitle="(Last 30 Days)" type="line" />
        <AdminChartCard title="Visits by Department" type="bars" />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_386px]">
        <div className="rounded-[0.75rem] border border-[var(--outline-variant)] bg-white p-5">
          <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-4">
            <h2 className="text-[27px] font-semibold tracking-normal text-[var(--on-surface)]">Recent Activity</h2>
            <Link href="/admin/audit-logs" className="text-[17px] font-medium text-[var(--primary)]">View All</Link>
          </div>
          <AdminActivityRow icon={UserPlus} title="New Employee Added" text="Dr. Sarah Jenkins was added to General Medicine." time="10 mins ago" />
          <AdminActivityRow icon={Calendar} title="Leave Request Submitted" text="Nurse Mark O. requested 3 days of annual leave." time="45 mins ago" amber />
        </div>
        <div className="rounded-[0.75rem] border border-[var(--outline-variant)] bg-white p-5">
          <h2 className="border-b border-[var(--outline-variant)] pb-4 text-[27px] font-semibold tracking-normal text-[var(--on-surface)]">Quick Actions</h2>
          <div className="mt-5 space-y-3">
            <AdminActionButton href="/admin/employees/new" icon={UserPlus} label="Add Employee" primary />
            <AdminActionButton href="/admin/departments" icon={Building2} label="Create Department" />
            <AdminActionButton href="/admin/leave-requests" icon={FileText} label="Review Leave Requests" amber />
          </div>
        </div>
      </section>

      <div className="pt-2">
        <h2 className="text-[22px] font-semibold tracking-normal text-[var(--on-surface)]">Operational Workspace</h2>
        <p className="mt-1 text-[15px] text-[var(--on-surface-variant)]">Live records and workflow forms remain connected below.</p>
      </div>
    </div>
  );
}

function AdminChartCard({ title, subtitle, type }: { title: string; subtitle?: string; type: "line" | "bars" }) {
  return (
    <div className="h-[384px] rounded-[0.75rem] border border-[var(--outline-variant)] bg-white p-5">
      <div className="flex justify-between">
        <h2 className="text-[27px] font-semibold tracking-normal text-[var(--on-surface)]">
          {title} {subtitle ? <span className="text-[15px] font-normal text-[var(--on-surface-variant)]">{subtitle}</span> : null}
        </h2>
        <MoreVertical className="h-6 w-6 text-[var(--on-surface-variant)]" />
      </div>
      {type === "line" ? (
        <div className="mt-7 grid h-[270px] grid-cols-[34px_1fr] text-[14px] text-[var(--on-surface-variant)]">
          <div className="flex flex-col justify-between pb-7 pt-0">
            <span>150</span>
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
          <div className="relative border-l border-[var(--surface-container-high)] bg-[linear-gradient(to_bottom,transparent_0,transparent_11%,var(--surface-container-high)_11%,transparent_12%,transparent_40%,var(--surface-container-high)_40%,transparent_41%,transparent_69%,var(--surface-container-high)_69%,transparent_70%)]">
            <svg viewBox="0 0 520 236" className="h-[236px] w-full">
              <path d="M6 214 C58 186 118 226 160 144 S244 158 286 94 S363 126 413 88 S486 58 516 116" fill="none" stroke="var(--primary)" strokeWidth="3" />
              <path d="M6 214 C58 186 118 226 160 144 S244 158 286 94 S363 126 413 88 S486 58 516 116 L516 236 L6 236 Z" fill="var(--primary)" opacity=".14" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[14px]">
              <span>1st</span>
              <span>10th</span>
              <span>20th</span>
              <span>30th</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-16 flex h-[205px] items-end justify-center gap-5">
          {[
            ["Gen", 200, 0.78, "var(--primary-container)"],
            ["Den", 200, 0.60, "var(--secondary)"],
            ["Derma", 200, 0.40, "var(--primary-container)"],
            ["Peds", 200, 0.70, "var(--secondary)"],
            ["Int", 200, 0.64, "var(--primary-container)"],
          ].map(([label, total, ratio, color]) => (
            <div key={String(label)} className="flex w-[88px] flex-col items-center gap-2">
              <div className="relative h-[200px] w-full overflow-hidden rounded-t-sm bg-[var(--surface-container-high)]">
                <div className="absolute inset-x-0 top-0 h-[40px] bg-[var(--surface-container-highest)]" />
                <div className="absolute inset-x-0 bottom-0" style={{ height: Number(total) * Number(ratio), backgroundColor: String(color) }} />
              </div>
              <span className="text-[14px] text-[var(--on-surface)]">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminActivityRow({ icon: Icon, title, text, time, amber }: { icon: typeof UserPlus; title: string; text: string; time: string; amber?: boolean }) {
  return (
    <div className="flex gap-5 py-5">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${amber ? "bg-[var(--tertiary-fixed)] text-[var(--tertiary-container)]" : "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[18px] font-semibold text-[var(--on-surface)]">{title}</p>
        <p className="text-[16px] text-[var(--on-surface-variant)]">{text}</p>
        <p className="mt-1 text-[14px] text-[var(--on-surface)]">{time}</p>
      </div>
    </div>
  );
}

function AdminActionButton({ href, icon: Icon, label, primary, amber }: { href: string; icon: typeof UserPlus; label: string; primary?: boolean; amber?: boolean }) {
  return (
    <Link href={href} className={`flex h-[52px] items-center gap-4 rounded-[0.5rem] border px-6 text-[19px] font-semibold ${primary ? "border-[var(--primary-container)] bg-[var(--primary-container)] text-white" : "border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)]"}`}>
      <Icon className={`h-6 w-6 ${amber ? "text-[var(--tertiary)]" : ""}`} />
      {label}
    </Link>
  );
}

function counterValue(counters: Record<string, unknown> | null, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = counters?.[key];
    if (value !== undefined && value !== null) return Number(value).toLocaleString();
  }
  return fallback;
}

function adminToneClasses(tone: "cyan" | "blue" | "amber" | "red" | "slate") {
  if (tone === "amber") return "bg-[var(--tertiary-fixed)] text-[var(--tertiary-container)]";
  if (tone === "red") return "bg-[var(--error-container)] text-[var(--error)]";
  if (tone === "blue") return "bg-[var(--secondary-container)] text-[var(--secondary)]";
  if (tone === "slate") return "bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]";
  return "bg-[var(--primary-fixed)]/30 text-[var(--primary)]";
}

function DashboardIntelligence({ config, counters }: { config: WorkspaceConfig; counters: Record<string, unknown> }) {
  const values = Object.values(counters).map((value) => Number(value) || 0);
  return (
    <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Operational Trend</CardTitle>
          <CardDescription>Simple, low-noise visual summary for today&apos;s clinical workload.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-44 items-end gap-2 rounded-[0.75rem] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-4">
            {[38, 54, 46, 72, 63, 86, 78, 94, 68, 82, 91, 76].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <span className="w-full rounded-t-md bg-primary/80" style={{ height }} />
                <span className="text-[10px] text-[var(--on-surface-variant)]">{index + 8}:00</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Priority Feed</CardTitle>
          <CardDescription>Recent events and safety prompts for this workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            `${config.title} refreshed from Supabase`,
            `Visible rows are restricted by role policies`,
            values.some((value) => value === 0) ? "Some queues are clear" : "Queues need review",
          ].map((item, index) => (
            <div key={item} className="flex gap-3 rounded-lg border border-border bg-white p-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="text-sm font-semibold text-[var(--on-surface)]">{item}</p>
                <p className="mt-1 text-xs text-[var(--on-surface-variant)]">{index === 0 ? "Now" : `${index + 2} min ago`}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

type QuickFilter = "All" | "Today" | "Pending" | "Completed";

function DataToolbar({
  search,
  setSearch,
  quickFilter,
  setQuickFilter,
}: {
  search: string;
  setSearch: (value: string) => void;
  quickFilter: QuickFilter;
  setQuickFilter: (value: QuickFilter) => void;
}) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--outline)]" />
          <Input className="pl-9" placeholder="Search by name, status, code, or ID" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", "Today", "Pending", "Completed"] as QuickFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setQuickFilter(tab)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${quickFilter === tab ? "border-primary bg-primary text-white" : "border-border bg-white text-[var(--on-surface-variant)] hover:border-primary hover:text-primary"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 font-semibold text-[var(--on-surface-variant)]"><Filter className="h-3.5 w-3.5" /> Role-aware filters</span>
        <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 font-semibold text-[var(--on-surface-variant)]"><CalendarDays className="h-3.5 w-3.5" /> Date range</span>
        <span className="inline-flex items-center rounded-lg border border-border bg-muted px-3 py-2 font-semibold text-[var(--on-surface-variant)]">Columns</span>
        <span className="inline-flex items-center rounded-lg border border-border bg-muted px-3 py-2 font-semibold text-[var(--on-surface-variant)]">Export</span>
      </div>
    </div>
  );
}

function FieldControl({
  field,
  register,
  setValue,
  value,
  error,
  references,
}: {
  field: WorkspaceField;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  value: unknown;
  error?: string;
  references: Partial<Record<ReferenceKey, ReferenceOption[]>>;
}) {
  const inputType = field.type ?? "text";
  const referenceOptions = field.reference ? references[field.reference] ?? [] : [];
  const registration = register(field.name);
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{field.label}{field.required ? " *" : ""}</Label>
      {field.reference ? (
        <CustomSelect
          id={field.name}
          placeholder={`Select ${field.label.toLowerCase()}`}
          value={String(value ?? "")}
          options={referenceOptions}
          registration={registration}
          onChange={(nextValue) => setValue(field.name, nextValue, { shouldDirty: true, shouldValidate: true })}
        />
      ) : inputType === "textarea" ? (
        <Textarea id={field.name} placeholder={field.placeholder ?? field.label} {...registration} />
      ) : inputType === "select" ? (
        <CustomSelect
          id={field.name}
          placeholder="Select"
          value={String(value ?? "")}
          options={(field.options ?? []).map((option) => ({ value: option, label: option }))}
          registration={registration}
          onChange={(nextValue) => setValue(field.name, nextValue, { shouldDirty: true, shouldValidate: true })}
        />
      ) : inputType === "checkbox" ? (
        <input id={field.name} type="checkbox" className="h-4 w-4 rounded border-border text-primary" {...registration} />
      ) : (
        <Input id={field.name} type={inputType} step={field.step} placeholder={field.placeholder ?? field.label} {...registration} />
      )}
      {error ? <p className="text-xs font-medium text-[var(--error)]">{error}</p> : null}
    </div>
  );
}

function CustomSelect({
  id,
  placeholder,
  value,
  options,
  registration,
  onChange,
}: {
  id: string;
  placeholder: string;
  value: string;
  options: ReferenceOption[];
  registration: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <input {...registration} value={value} readOnly className="sr-only" tabIndex={-1} />
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className="flex h-12 w-full items-center justify-between rounded-lg border border-[#bdc8ce] bg-white px-4 text-left text-[15px] text-[#171c1e] shadow-none outline-none transition hover:border-[#8fa4ae] focus:border-[#00647c] focus:ring-3 focus:ring-[#00647c]/15"
      >
        <span className={selected ? "truncate" : "truncate text-[#7b8990]"}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#526168] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-[#bdc8ce] bg-white p-1 shadow-[0_16px_34px_rgba(15,23,42,0.14)]">
          <div role="listbox" aria-labelledby={id} className="max-h-64 overflow-auto">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`flex h-10 w-full items-center justify-between rounded-md px-3 text-left text-sm transition ${!value ? "bg-[#e5f4f7] font-semibold text-[#00647c]" : "text-[#3e484d] hover:bg-[#f0f4f7]"}`}
            >
              {placeholder}
              {!value ? <Check className="h-4 w-4" /> : null}
            </button>
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition ${active ? "bg-[#e5f4f7] font-semibold text-[#00647c]" : "text-[#171c1e] hover:bg-[#f0f4f7]"}`}
                >
                  <span className="min-w-0 break-words">{option.label}</span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildSchema(fields: WorkspaceField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    let schema: z.ZodTypeAny;
    if (field.type === "number") schema = z.coerce.number();
    else if (field.type === "checkbox") schema = z.coerce.boolean();
    else schema = z.string();
    if (!field.required && field.type !== "checkbox") schema = schema.optional().or(z.literal(""));
    if (field.required && field.type !== "number" && field.type !== "checkbox") schema = (schema as z.ZodString).min(1, `${field.label} is required`);
    shape[field.name] = schema;
  }
  return z.object(shape);
}

function coercePayload(values: FormValues, fields: WorkspaceField[]) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const value = values[field.name];
    if (value === "" || value === undefined || value === null) continue;
    if (field.type === "number") payload[field.name] = Number(value);
    else if (field.type === "checkbox") payload[field.name] = Boolean(value);
    else if (field.reference && field.name.endsWith("_ids")) payload[field.name] = [String(value)];
    else if (field.type === "textarea" && (field.name.endsWith("_ids") || field.name === "results" || field.name === "items")) {
      try {
        payload[field.name] = JSON.parse(String(value));
      } catch {
        throw new Error(`${field.label} must be valid JSON`);
      }
    } else {
      payload[field.name] = value;
    }
  }
  return payload;
}

function prepareActionPayload(config: WorkspaceConfig, payload: Record<string, unknown>) {
  if (config.action.kind === "function" && config.action.name === "order-medicines") {
    return {
      visit_id: payload.visit_id,
      doctor_notes: payload.doctor_notes,
      items: [{
        medicine_name_id: payload.medicine_name_id,
        requested_quantity: payload.requested_quantity,
        dosage_instructions: payload.dosage_instructions,
      }],
    };
  }
  if (config.action.kind === "function" && config.action.name === "submit-lab-results") {
    return {
      lab_order_id: payload.lab_order_id,
      results: [{
        id: payload.lab_order_item_id,
        result_value: payload.result_value,
        result_notes: payload.result_notes,
      }],
    };
  }
  return payload;
}

type ReferenceOption = {
  value: string;
  label: string;
};

const referenceDefinitions: Record<ReferenceKey, { table: string; select: string; orderBy?: string }> = {
  patients: { table: "patients", select: "id,full_name,mrn,student_id,created_at", orderBy: "created_at" },
  doctors: { table: "profiles", select: "id,full_name,email,role,status,created_at", orderBy: "created_at" },
  profiles: { table: "profiles", select: "id,full_name,email,role,status,created_at", orderBy: "created_at" },
  employees: { table: "employees", select: "id,profile_id,job_title,employee_code,status" },
  departments: { table: "departments", select: "id,name,status" },
  visits: { table: "visits", select: "id,visit_code,chief_complaint,status,created_at", orderBy: "created_at" },
  labOrders: { table: "lab_orders", select: "id,visit_id,status,doctor_notes,created_at", orderBy: "created_at" },
  labTests: { table: "lab_tests", select: "id,name,code,status" },
  labOrderItems: { table: "lab_order_items", select: "id,lab_order_id,lab_test_id,result_value,status,visible_to_patient,created_at", orderBy: "created_at" },
  medicineNames: { table: "medicine_names", select: "id,name,category,status" },
  medicineOrderItems: { table: "medicine_order_items", select: "id,medicine_order_id,medicine_name_id,requested_quantity,dispensed_quantity,status,created_at", orderBy: "created_at" },
  storeItems: { table: "store_items", select: "id,name,category,status" },
};

function uniqueReferenceKeys(fields: WorkspaceField[]) {
  return Array.from(new Set(fields.map((field) => field.reference).filter(Boolean))) as ReferenceKey[];
}

function normalizeReferenceOptions(key: ReferenceKey, rows: unknown[]) {
  return rows
    .filter((row) => row && typeof row === "object")
    .filter((row) => key !== "doctors" || (row as Record<string, unknown>).role === "doctor")
    .filter((row) => key !== "medicineOrderItems" || isDispensableMedicineItem(row as Record<string, unknown>))
    .map((row) => {
      const record = row as Record<string, unknown>;
      return {
        value: String(record.id),
        label: referenceLabel(key, record),
      };
    });
}

function referenceLabel(key: ReferenceKey, record: Record<string, unknown>) {
  if (key === "patients") return `${record.full_name ?? "Patient"}${record.mrn ? ` / ${record.mrn}` : ""}${record.student_id ? ` / ${record.student_id}` : ""}`;
  if (key === "profiles" || key === "doctors") return `${record.full_name ?? "Profile"}${record.role ? ` / ${record.role}` : ""}`;
  if (key === "visits") return `${record.visit_code ?? "Visit"} / ${record.status ?? "open"}${record.chief_complaint ? ` / ${record.chief_complaint}` : ""}`;
  if (key === "labOrders") return `${record.id} / ${record.status ?? "ordered"}${record.doctor_notes ? ` / ${record.doctor_notes}` : ""}`;
  if (key === "departments" || key === "labTests" || key === "medicineNames" || key === "storeItems") return String(record.name ?? record.id);
  if (key === "labOrderItems") return `${record.id} / ${record.status ?? "pending"}${record.visible_to_patient ? " / visible" : ""}${record.result_value ? ` / ${record.result_value}` : ""}`;
  if (key === "medicineOrderItems") return `${record.id} / ${record.status ?? "pending"} / ${record.dispensed_quantity ?? 0}/${record.requested_quantity ?? 0}`;
  return String(record.id);
}

function isDispensableMedicineItem(record: Record<string, unknown>) {
  const requested = Number(record.requested_quantity ?? 0);
  const dispensed = Number(record.dispensed_quantity ?? 0);
  const status = String(record.status ?? "").toLowerCase();
  return requested > dispensed && !["dispensed", "cancelled", "unavailable"].includes(status);
}

function applyFilter(query: QueryBuilder, filter: WorkspaceFilter) {
  const value = filter.value === "today" ? new Date().toISOString().slice(0, 10) : filter.value;
  if (filter.operator === "lte") return query.lte(filter.column, value);
  if (filter.operator === "lt") return query.lt(filter.column, value);
  return query.eq(filter.column, value);
}

function visibleRows(rows: ModuleRecord[], search: string, quickFilter: QuickFilter) {
  const needle = search.trim().toLowerCase();
  return rows.filter((row) => matchesQuickFilter(row, quickFilter))
    .filter((row) => !needle || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(needle)));
}

function matchesQuickFilter(row: ModuleRecord, quickFilter: QuickFilter) {
  if (quickFilter === "All") return true;
  if (quickFilter === "Today") return Object.entries(row).some(([key, value]) => key.toLowerCase().includes("created") && String(value ?? "").slice(0, 10) === new Date().toISOString().slice(0, 10));
  const status = String(row.status ?? "").toLowerCase();
  if (quickFilter === "Pending") return ["ordered", "queued", "in_progress", "pending", "pending_review", "waiting_lab", "waiting_pharmacy", "partially_dispensed"].includes(status);
  return ["completed", "reviewed", "dispensed", "approved"].includes(status);
}

function normalizeRows(rows: unknown[]): ModuleRecord[] {
  return rows.map((row) => flatten(row as Record<string, unknown>));
}

function asArray(value: unknown[] | Record<string, unknown> | null): unknown[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function flatten(row: Record<string, unknown>) {
  const out: ModuleRecord = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = typeof value === "object" && value !== null ? JSON.stringify(value) : value;
  }
  return out;
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

function LoadingState() {
  return <div className="flex h-40 items-center justify-center text-sm text-[var(--on-surface-variant)]"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading records</div>;
}

function ReadOnlyNotice() {
  return <Notice tone="warning" text="This screen is intentionally read-only. Related updates must happen through the correct workflow action." />;
}

function Notice({ tone, text }: { tone: "success" | "warning" | "danger"; text: string }) {
  const classes = tone === "success"
    ? "border-[var(--success-container)] bg-[var(--success-container)] text-[var(--success)]"
    : tone === "warning"
      ? "border-[var(--warning-container)] bg-[var(--warning-container)] text-[var(--warning)]"
      : "border-[var(--error-container)] bg-[var(--error-container)] text-[var(--error)]";

  return (
    <p className={`flex items-start gap-2 rounded-[0.5rem] border px-3 py-2 text-sm ${classes}`}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      {text}
    </p>
  );
}
