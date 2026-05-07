"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseMedical,
  Building2,
  Calendar,
  CalendarDays,
  Check,
  ClipboardPlus,
  Copy,
  Edit,
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
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackAlert, LoadingState as SharedLoadingState } from "@/components/ui/data-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ModuleRecord } from "@/types/app.types";
import type { ReferenceKey, WorkspaceConfig, WorkspaceField, WorkspaceFilter } from "@/lib/workspaces";

type FormValues = Record<string, unknown>;
type QueryResult = { data: unknown; error: { message: string } | null };
type CreateEmployeeSuccess = {
  employeeId: string;
  profileId: string;
  temporaryPassword: string;
};
type ClinicSettingsValues = {
  clinic_name: string;
  clinic_phone: string;
  clinic_email: string;
  clinic_address: string;
  working_hours_start: string;
  working_hours_end: string;
  default_appointment_duration_minutes: number;
  allow_patient_appointment_requests: boolean;
  emergency_contact_number: string;
  lab_results_visibility_mode: string;
};
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<ModuleRecord[]>([]);
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [patientVisitRows, setPatientVisitRows] = useState<ModuleRecord[]>([]);
  const [referenceRows, setReferenceRows] = useState<ModuleRecord[]>([]);
  const [references, setReferences] = useState<Partial<Record<ReferenceKey, ReferenceOption[]>>>({});
  const [counters, setCounters] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createEmployeeResult, setCreateEmployeeResult] = useState<CreateEmployeeSuccess | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("All");

  const schema = useMemo(() => buildSchema(config.fields), [config.fields]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(config.fields.map((field) => [field.name, field.type === "checkbox" ? false : ""])),
  });
  const watchedValues = useWatch({ control: form.control });
  const queryPrefillKey = searchParams.toString();

  async function loadData() {
    setLoading(true);
    setError(null);

    const client = supabase as unknown as SupabaseLike;
    const recordMode = Boolean(config.recordId && (config.mode === "details" || config.mode === "edit" || config.mode === "store-request-details" || config.mode === "patient-details" || config.mode === "appointment-request-details"));
    const settingsMode = config.mode === "settings";
    let query = client.from(config.table).select(recordMode ? config.detailSelect ?? config.select : config.select).limit(recordMode ? 1 : 50);
    if (recordMode && config.recordId) {
      query = query.eq(config.recordIdField ?? "id", config.recordId);
    } else {
      for (const filter of config.filters ?? []) query = applyFilter(query, filter);
      if (settingsMode) query = query.limit(1);
      else if (config.orderBy) query = query.order(config.orderBy, { ascending: false });
    }

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

    let loadError = tableError?.message ?? null;
    let rawRows = asArray(data);
    if (config.table === "store_items") {
      rawRows = await enrichStoreItemsWithStock(client, rawRows);
    }
    if (config.table === "store_requests") {
      rawRows = await enrichStoreRequestsWithStock(client, rawRows);
    }
    let nextPatientVisitRows: ModuleRecord[] = [];
    if (config.mode === "patient-details" && config.recordId) {
      const { data: visitData, error: visitsError } = await client
        .from("visits")
        .select("id,visit_code,doctor_id,status,priority,chief_complaint,created_at,doctor:profiles!visits_doctor_id_fkey(full_name,email)")
        .eq("patient_id", config.recordId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (visitsError && !loadError) loadError = visitsError.message;
      nextPatientVisitRows = asArray(visitData).map((visit) => flattenPatientVisitHistory(visit as Record<string, unknown>));
    }
    const rawRecord = recordMode || settingsMode ? rawRows[0] as Record<string, unknown> | undefined : undefined;
    setError(loadError);
    setRecord(rawRecord ?? null);
    setRows(normalizeRows(rawRows, config));
    setPatientVisitRows(nextPatientVisitRows);
    setReferenceRows(normalizeRows(asArray(refs)));
    setReferences(Object.fromEntries(referenceResults));
    if (recordMode && config.mode === "edit" && rawRecord) {
      form.reset(employeeFormDefaults(rawRecord));
    }
    if (settingsMode) {
      form.reset(clinicSettingsFormDefaults(rawRecord));
    }
    if (countersResult?.data && typeof countersResult.data === "object") setCounters(countersResult.data as Record<string, unknown>);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void loadData();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table, config.select, config.mode, config.recordId]);

  useEffect(() => {
    if (config.mode !== "create-visit") return;
    const fieldNames = new Set(config.fields.map((field) => field.name));
    const params = new URLSearchParams(queryPrefillKey);
    for (const [name, value] of visitPrefillValues(params, fieldNames)) {
      form.setValue(name, value, { shouldDirty: false, shouldValidate: true });
    }
  }, [config.fields, config.mode, form, queryPrefillKey]);

  async function onSubmit(values: FormValues) {
    if (config.action.kind === "none") return;
    setSaving(true);
    setError(null);
    setMessage(null);
    setCreateEmployeeResult(null);
    setPasswordCopied(false);

    let payload: Record<string, unknown>;
    try {
      payload = coercePayload(values, config.fields);
      payload = prepareActionPayload(config, payload);
      if (config.action.kind === "function" && config.action.name === "update-employee" && config.recordId) {
        payload.employee_id = config.recordId;
      }
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
      setError(await getSupabaseErrorMessage(result.error));
      return;
    }

    const employeeResult = config.action.kind === "function" && config.action.name === "create-employee"
      ? extractCreateEmployeeSuccess(result.data)
      : null;

    if (employeeResult) {
      setCreateEmployeeResult(employeeResult);
    } else {
      setMessage(config.action.success);
    }
    form.reset();
    if (config.action.kind === "function" && config.action.name === "update-employee" && config.recordId) {
      router.push(`/admin/employees/${config.recordId}`);
      router.refresh();
      return;
    }
    if (config.mode === "create-visit" && config.action.kind === "function" && config.action.name === "create-visit") {
      router.push("/reception/visits");
      router.refresh();
      return;
    }
    await loadData();
  }

  const isAdminDashboard = config.dashboard && config.title === "Administration Dashboard";
  const isEmployeeRecordMode = config.table === "employees" && Boolean(config.recordId) && (config.mode === "details" || config.mode === "edit");

  if (config.mode === "settings") {
    return (
      <ClinicSettingsView
        loading={loading}
        record={record}
        config={config}
        form={form}
        watchedValues={watchedValues}
        saving={saving}
        error={error}
        message={message}
        onSubmit={onSubmit}
      />
    );
  }

  if (config.mode === "store-request-details") {
    return <StoreRequestDetailsView loading={loading} record={record} error={error} onReload={loadData} />;
  }

  if (config.mode === "patient-details") {
    return <PatientDetailsView loading={loading} record={record} error={error} visits={patientVisitRows} />;
  }

  if (config.mode === "appointment-request-details") {
    return <AppointmentRequestDetailsView loading={loading} record={record} error={error} onReload={loadData} />;
  }

  if (config.mode === "create-visit") {
    return (
      <CreateVisitView
        loading={loading}
        config={config}
        form={form}
        watchedValues={watchedValues}
        references={references}
        saving={saving}
        error={error}
        message={message}
        onSubmit={onSubmit}
      />
    );
  }

  if (isEmployeeRecordMode && config.mode === "details") {
    return <EmployeeDetailsView loading={loading} record={record} error={error} />;
  }

  if (isEmployeeRecordMode && config.mode === "edit") {
    return (
      <EmployeeEditView
        loading={loading}
        record={record}
        config={config}
        form={form}
        watchedValues={watchedValues}
        references={references}
        saving={saving}
        error={error}
        message={message}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <div className={cn("min-w-0 space-y-7", isAdminDashboard && "admin-workspace")}>
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

      <section className="grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(340px,430px)]">
        <Card className="admin-panel min-w-0 overflow-hidden">
          <CardHeader className="admin-panel-header flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">Live workspace</p>
              <CardTitle className="mt-1 text-2xl">Records</CardTitle>
              <CardDescription>Live rows from `{config.table}` under the current user&apos;s RLS policies.</CardDescription>
            </div>
            <Button type="button" variant="secondary" onClick={loadData} disabled={loading} className="h-11 rounded-xl border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="min-w-0">
            <DataToolbar search={search} setSearch={setSearch} quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
            {loading ? (
              <LoadingState />
            ) : (
              <DataTable
                rows={visibleRows(rows, search, quickFilter).length ? visibleRows(rows, search, quickFilter) : [{ state: "No records visible for this role" }]}
                rowLink={config.rowLink}
                hiddenColumns={config.hiddenColumns}
                columnLabels={config.columnLabels}
              />
            )}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-7">
          <Card className="admin-panel admin-form-card min-w-0 overflow-hidden">
            <CardHeader className="admin-panel-header">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary)]">Workflow action</p>
              <CardTitle className="mt-1 text-2xl">{config.actionLabel}</CardTitle>
              <CardDescription>{config.readonly ? "This view is read-only for the current workflow." : "Validated form connected to Supabase or an Edge Function."}</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              {config.readonly || config.action.kind === "none" ? (
                <ReadOnlyNotice />
              ) : (
                <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
                  {createEmployeeResult ? (
                    <CreateEmployeeSuccessPanel
                      result={createEmployeeResult}
                      copied={passwordCopied}
                      onCopy={async () => {
                        await navigator.clipboard.writeText(createEmployeeResult.temporaryPassword);
                        setPasswordCopied(true);
                      }}
                    />
                  ) : null}
                  {message ? <Notice tone="success" text={message} /> : null}
                  <Button type="submit" className="h-12 w-full rounded-xl bg-[var(--primary)] text-[15px] shadow-[0_12px_24px_rgba(14,124,123,0.18)] hover:bg-[var(--primary-container)]" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {config.actionLabel}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="admin-panel min-w-0 overflow-hidden">
            <CardHeader className="admin-panel-header">
              <CardTitle className="text-xl">Reference IDs</CardTitle>
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

function CreateVisitView({
  loading,
  config,
  form,
  watchedValues,
  references,
  saving,
  error,
  message,
  onSubmit,
}: {
  loading: boolean;
  config: WorkspaceConfig;
  form: ReturnType<typeof useForm<FormValues>>;
  watchedValues: FormValues;
  references: Partial<Record<ReferenceKey, ReferenceOption[]>>;
  saving: boolean;
  error: string | null;
  message: string | null;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/reception/visits" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Queued visits
          </Link>
          <h1 className="mt-2 text-[30px] font-semibold leading-10 tracking-normal text-[var(--healtech-ink)]">{config.title}</h1>
          <p className="text-[17px] leading-7 text-[var(--on-surface-variant)]">{config.description}</p>
        </div>
      </div>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,640px)_minmax(260px,1fr)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Create Visit</CardTitle>
            <CardDescription>New visits enter the queued visits list for doctor processing.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState />
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
                <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {config.actionLabel}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Queue Status</CardTitle>
            <CardDescription>After creation, the visit appears in Reception&apos;s queued visits page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ReadOnlyLine label="Visit status" value="queued" />
            <ReadOnlyLine label="Required fields" value="Patient and doctor" />
            <Link href="/reception/visits" className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-primary hover:bg-muted">
              View queued visits
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ClinicSettingsView({
  loading,
  record,
  config,
  form,
  watchedValues,
  saving,
  error,
  message,
  onSubmit,
}: {
  loading: boolean;
  record: Record<string, unknown> | null;
  config: WorkspaceConfig;
  form: ReturnType<typeof useForm<FormValues>>;
  watchedValues: FormValues;
  saving: boolean;
  error: string | null;
  message: string | null;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  if (loading) return <LoadingState />;

  const lastUpdated = clinicSettingsLastUpdated(record);

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-[30px] font-semibold leading-10 tracking-normal text-[var(--healtech-ink)]">Clinic Settings</h1>
        <p className="text-[17px] leading-7 text-[var(--on-surface-variant)]">Manage general clinic configuration used across scheduling, portal, and emergency workflows.</p>
      </div>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>General Configuration</CardTitle>
            <CardDescription>Settings are saved to `clinic_settings` with key `general`.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              {config.fields.map((field) => (
                <FieldControl
                  key={field.name}
                  field={field}
                  register={form.register}
                  setValue={form.setValue}
                  value={watchedValues?.[field.name]}
                  error={form.formState.errors[field.name]?.message?.toString()}
                  references={{}}
                />
              ))}
              {error ? <Notice tone="danger" text={error} /> : null}
              {message ? <Notice tone="success" text={message} /> : null}
              <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {config.actionLabel}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
            <CardDescription>Current persisted settings metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ReadOnlyLine label="Settings key" value="general" />
            <ReadOnlyLine label="Updated at" value={lastUpdated.updatedAt} />
            <ReadOnlyLine label="Updated by" value={lastUpdated.updatedBy} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StoreRequestDetailsView({
  loading,
  record,
  error,
  onReload,
}: {
  loading: boolean;
  record: Record<string, unknown> | null;
  error: string | null;
  onReload: () => Promise<void>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [adminComment, setAdminComment] = useState("");
  const [fulfillmentNotes, setFulfillmentNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<"approved" | "rejected" | "fulfilled" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (loading) return <LoadingState />;
  if (error) return <Notice tone="danger" text={error} />;
  if (!record) return <Notice tone="warning" text="Store request not found." />;

  const request = storeRequestSummary(record);

  async function review(decision: "approved" | "rejected" | "fulfilled") {
    setActionLoading(decision);
    setActionError(null);
    setActionMessage(null);

    const { error: reviewError } = await supabase.functions.invoke("review-store-request", {
      body: {
        store_request_id: request.id,
        decision,
        admin_comment: decision === "fulfilled" ? undefined : adminComment,
        notes: decision === "fulfilled" ? fulfillmentNotes : undefined,
      },
    });

    setActionLoading(null);
    if (reviewError) {
      setActionError(reviewError.message ?? String(reviewError));
      return;
    }

    setActionMessage(decision === "fulfilled" ? "Store request fulfilled" : `Store request ${decision}`);
    setAdminComment("");
    setFulfillmentNotes("");
    await onReload();
  }

  const details = [
    ["Request ID", request.id],
    ["Requester", request.requesterName],
    ["Requester email", request.requesterEmail],
    ["Store item", request.storeItem],
    ["Category", request.category],
    ["Quantity", request.quantity],
    ["Reason", request.reason],
    ["Status", request.status],
    ["Reviewed by", request.reviewedByName],
    ["Reviewed at", request.reviewedAt],
    ["Admin comment", request.adminComment],
    ["Created", request.createdAt],
    ["Available stock", request.availableStock],
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/store/requests" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Store requests
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-[30px] font-semibold leading-10 tracking-normal text-[var(--healtech-ink)]">{request.storeItem}</h1>
            <StatusBadge value={request.status} />
          </div>
          <p className="text-[17px] leading-7 text-[var(--on-surface-variant)]">Requested by {request.requesterName} for quantity {request.quantity}.</p>
        </div>
      </div>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Review the request and current stock before changing status.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-white p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]">{label}</dt>
                  <dd className="mt-2 break-words text-sm font-semibold text-[var(--on-surface)]">{formatDetailValue(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Admin Action</CardTitle>
            <CardDescription>Allowed actions depend on the current request status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.status === "pending" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="admin_comment">Admin comment</Label>
                  <Textarea id="admin_comment" value={adminComment} onChange={(event) => setAdminComment(event.target.value)} placeholder="Optional review note" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button type="button" onClick={() => void review("approved")} disabled={Boolean(actionLoading)}>
                    {actionLoading === "approved" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Approve
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => void review("rejected")} disabled={Boolean(actionLoading)}>
                    {actionLoading === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Reject
                  </Button>
                </div>
              </>
            ) : null}

            {request.status === "approved" ? (
              <>
                <div className="rounded-lg border border-border bg-muted p-3 text-sm">
                  <p className="font-semibold text-[var(--on-surface)]">Available stock: {request.availableStock}</p>
                  <p className="mt-1 text-[var(--on-surface-variant)]">Fulfilling assigns {request.quantity} item(s) to {request.requesterName}.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fulfillment_notes">Fulfillment notes</Label>
                  <Textarea id="fulfillment_notes" value={fulfillmentNotes} onChange={(event) => setFulfillmentNotes(event.target.value)} placeholder="Optional assignment note" />
                </div>
                <Button type="button" className="w-full" onClick={() => void review("fulfilled")} disabled={Boolean(actionLoading)}>
                  {actionLoading === "fulfilled" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Fulfill request
                </Button>
              </>
            ) : null}

            {["rejected", "fulfilled", "cancelled"].includes(request.status) ? (
              <ReadOnlyNotice />
            ) : null}
            {actionError ? <Notice tone="danger" text={actionError} /> : null}
            {actionMessage ? <Notice tone="success" text={actionMessage} /> : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function PatientDetailsView({
  loading,
  record,
  error,
  visits,
}: {
  loading: boolean;
  record: Record<string, unknown> | null;
  error: string | null;
  visits: ModuleRecord[];
}) {
  if (loading) return <LoadingState />;
  if (error && !record) return <Notice tone="danger" text={error} />;
  if (!record) return <Notice tone="warning" text="Patient not found." />;

  const patient = patientSummary(record);
  const details = [
    ["Patient ID", patient.id],
    ["Full name", patient.fullName],
    ["MRN", patient.mrn],
    ["Student ID", patient.studentId],
    ["Gender", patient.gender],
    ["Birth date", patient.birthDate],
    ["Phone", patient.phone],
    ["Emergency phone", patient.emergencyPhone],
    ["Blood type", patient.bloodType],
    ["Address", patient.address],
    ["Department", patient.department],
    ["Dorm info", patient.dormInfo],
    ["Nationality", patient.nationality],
    ["Status", patient.status],
    ["Created", patient.createdAt],
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/reception/patients" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Patient search
          </Link>
          <h1 className="mt-2 text-[30px] font-semibold leading-10 tracking-normal text-[var(--healtech-ink)]">{patient.fullName}</h1>
          <p className="text-[17px] leading-7 text-[var(--on-surface-variant)]">
            {patient.mrn !== "Not set" ? `MRN ${patient.mrn}` : "No MRN"} {patient.studentId !== "Not set" ? `/ Student ID ${patient.studentId}` : ""}
          </p>
        </div>
        <Link href={createVisitHref({ patientId: patient.id })} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-container)] focus:outline-none focus:ring-3 focus:ring-[var(--focus-ring)]">
          <ClipboardPlus className="h-4 w-4" />
          Create visit
        </Link>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Patient Details</CardTitle>
          <CardDescription>Core registration, contact, and student information for reception workflow.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? <Notice tone="danger" text={error} /> : null}
          <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-white p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]">{label}</dt>
                <dd className="mt-2 break-words text-sm font-semibold text-[var(--on-surface)]">{formatDetailValue(value)}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
          <CardDescription>Latest visits recorded for this patient.</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <DataTable
            rows={visits.length ? visits : [{ state: "No visits found for this patient" }]}
            hiddenColumns={["id", "doctor_id"]}
            columnLabels={{
              visit_code: "Visit code",
              doctor_name: "Doctor name",
              status: "Status",
              priority: "Priority",
              chief_complaint: "Chief complaint",
              created_at: "Created at",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function AppointmentRequestDetailsView({
  loading,
  record,
  error,
  onReload,
}: {
  loading: boolean;
  record: Record<string, unknown> | null;
  error: string | null;
  onReload: () => Promise<void>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [doctors, setDoctors] = useState<ReferenceOption[]>([]);
  const [adminComment, setAdminComment] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [priority, setPriority] = useState("normal");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [actionLoading, setActionLoading] = useState<"approved" | "rejected" | "converted_to_visit" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase
      .from("profiles")
      .select("id,full_name,email,role,status")
      .eq("role", "doctor")
      .eq("status", "active")
      .order("full_name", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setDoctors(normalizeReferenceOptions("doctors", asArray(data)));
      });
    return () => {
      active = false;
    };
  }, [supabase]);

  if (loading) return <LoadingState />;
  if (error && !record) return <Notice tone="danger" text={error} />;
  if (!record) return <Notice tone="warning" text="Appointment request not found." />;

  const request = appointmentRequestSummary(record);

  async function review(decision: "approved" | "rejected" | "converted_to_visit") {
    if (decision === "converted_to_visit" && !doctorId) {
      setActionError("Doctor is required to create a visit");
      return;
    }

    setActionLoading(decision);
    setActionError(null);
    setActionMessage(null);

    const { error: reviewError } = await supabase.functions.invoke("review-appointment-request", {
      body: {
        appointment_request_id: request.id,
        decision,
        admin_comment: adminComment,
        doctor_id: decision === "converted_to_visit" ? doctorId : undefined,
        chief_complaint: decision === "converted_to_visit" ? chiefComplaint || request.reason : undefined,
        priority: decision === "converted_to_visit" ? priority : undefined,
      },
    });

    setActionLoading(null);
    if (reviewError) {
      setActionError(reviewError.message ?? String(reviewError));
      return;
    }

    setActionMessage(decision === "converted_to_visit" ? "Appointment request converted to a visit" : `Appointment request ${decision}`);
    setAdminComment("");
    setDoctorId("");
    setPriority("normal");
    setChiefComplaint("");
    await onReload();
  }

  const details = [
    ["Request ID", request.id],
    ["Patient name", request.patientName],
    ["MRN", request.mrn],
    ["Student ID", request.studentId],
    ["Phone", request.patientPhone],
    ["Requested department", request.requestedDepartment],
    ["Preferred date", request.preferredDate],
    ["Reason", request.reason],
    ["Status", request.status],
    ["Comment", request.adminComment],
    ["Reviewed by", request.reviewedByName],
    ["Reviewed at", request.reviewedAt],
    ["Created", request.createdAt],
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/reception/appointment-requests" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Appointment requests
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-[30px] font-semibold leading-10 tracking-normal text-[var(--healtech-ink)]">{request.patientName}</h1>
            <StatusBadge value={request.status} />
          </div>
          <p className="text-[17px] leading-7 text-[var(--on-surface-variant)]">Preferred date {request.preferredDate} for {request.requestedDepartment}.</p>
        </div>
      </div>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Review patient appointment request information before changing status.</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? <Notice tone="danger" text={error} /> : null}
            <dl className="grid gap-4 md:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-white p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]">{label}</dt>
                  <dd className="mt-2 break-words text-sm font-semibold text-[var(--on-surface)]">{formatDetailValue(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Reception Action</CardTitle>
            <CardDescription>Pending requests can be reviewed. Approved requests can be converted into queued visits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.status === "pending" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="appointment_admin_comment">Comment</Label>
                  <Textarea id="appointment_admin_comment" value={adminComment} onChange={(event) => setAdminComment(event.target.value)} placeholder="Optional review note" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button type="button" onClick={() => void review("approved")} disabled={Boolean(actionLoading)}>
                    {actionLoading === "approved" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Approve
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => void review("rejected")} disabled={Boolean(actionLoading)}>
                    {actionLoading === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Reject
                  </Button>
                </div>
              </>
            ) : null}

            {request.status === "approved" ? (
              <>
                <Link
                  href={createVisitHref({ patientId: request.patientId, chiefComplaint: request.reason, priority: "normal" })}
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-semibold text-primary hover:bg-muted"
                >
                  Open Create Visit form
                </Link>
                <div className="space-y-2">
                  <Label htmlFor="appointment_doctor">Doctor *</Label>
                  <Select
                    id="appointment_doctor"
                    value={doctorId}
                    onValueChange={setDoctorId}
                    placeholder="Select doctor"
                    options={doctors}
                    triggerClassName="h-12 border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-[var(--on-surface)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment_priority">Priority</Label>
                  <Select
                    id="appointment_priority"
                    value={priority}
                    onValueChange={setPriority}
                    options={["low", "normal", "high", "urgent"].map((option) => ({ value: option, label: option }))}
                    triggerClassName="h-12 border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-[var(--on-surface)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment_chief_complaint">Chief complaint</Label>
                  <Textarea id="appointment_chief_complaint" value={chiefComplaint} onChange={(event) => setChiefComplaint(event.target.value)} placeholder={request.reason !== "Not set" ? request.reason : "Optional chief complaint"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment_conversion_comment">Comment</Label>
                  <Textarea id="appointment_conversion_comment" value={adminComment} onChange={(event) => setAdminComment(event.target.value)} placeholder="Optional conversion note" />
                </div>
                <Button type="button" className="w-full" onClick={() => void review("converted_to_visit")} disabled={Boolean(actionLoading)}>
                  {actionLoading === "converted_to_visit" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create visit from request
                </Button>
              </>
            ) : null}

            {["rejected", "completed", "cancelled"].includes(request.status) ? <ReadOnlyNotice /> : null}
            {actionError ? <Notice tone="danger" text={actionError} /> : null}
            {actionMessage ? <Notice tone="success" text={actionMessage} /> : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function EmployeeDetailsView({
  loading,
  record,
  error,
}: {
  loading: boolean;
  record: Record<string, unknown> | null;
  error: string | null;
}) {
  if (loading) return <LoadingState />;
  if (error) return <Notice tone="danger" text={error} />;
  if (!record) return <Notice tone="warning" text="Employee not found." />;

  const employee = employeeSummary(record);
  const details = [
    ["Employee ID", employee.id],
    ["Profile ID", employee.profileId],
    ["Full name", employee.fullName],
    ["Email", employee.email],
    ["Phone", employee.phone],
    ["Role", employee.role],
    ["Account status", employee.profileStatus],
    ["Department", employee.departmentName],
    ["Job title", employee.jobTitle],
    ["Employee code", employee.employeeCode],
    ["Hire date", employee.hireDate],
    ["Employee status", employee.employeeStatus],
    ["Created", employee.createdAt],
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Employees
          </Link>
          <h1 className="mt-2 text-[30px] font-semibold leading-10 tracking-normal text-[var(--healtech-ink)]">{employee.fullName}</h1>
          <p className="text-[17px] leading-7 text-[var(--on-surface-variant)]">{employee.jobTitle} {employee.departmentName !== "Not set" ? `in ${employee.departmentName}` : ""}</p>
        </div>
        <Link href={`/admin/employees/edit/${employee.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-container)] focus:outline-none focus:ring-3 focus:ring-[var(--focus-ring)]">
          <Edit className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
          <CardDescription>Profile and employment information for this staff account.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-white p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]">{label}</dt>
                <dd className="mt-2 break-words text-sm font-semibold text-[var(--on-surface)]">{formatDetailValue(value)}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeeEditView({
  loading,
  record,
  config,
  form,
  watchedValues,
  references,
  saving,
  error,
  message,
  onSubmit,
}: {
  loading: boolean;
  record: Record<string, unknown> | null;
  config: WorkspaceConfig;
  form: ReturnType<typeof useForm<FormValues>>;
  watchedValues: FormValues;
  references: Partial<Record<ReferenceKey, ReferenceOption[]>>;
  saving: boolean;
  error: string | null;
  message: string | null;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  if (loading) return <LoadingState />;
  if (error && !record) return <Notice tone="danger" text={error} />;
  if (!record) return <Notice tone="warning" text="Employee not found." />;

  const employee = employeeSummary(record);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={`/admin/employees/${employee.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Employee details
          </Link>
          <h1 className="mt-2 text-[30px] font-semibold leading-10 tracking-normal text-[var(--healtech-ink)]">Edit {employee.fullName}</h1>
          <p className="text-[17px] leading-7 text-[var(--on-surface-variant)]">{employee.email}</p>
        </div>
        <Link href={`/admin/employees/${employee.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-[var(--on-surface)] transition-colors hover:bg-muted focus:outline-none focus:ring-3 focus:ring-[var(--focus-ring)]">
          Cancel
        </Link>
      </div>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Employee Profile</CardTitle>
            <CardDescription>Updates are applied to the existing profile and employee records.</CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="sm:w-auto" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {config.actionLabel}
                </Button>
                <Link href={`/admin/employees/${employee.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-[var(--on-surface)] transition-colors hover:bg-muted focus:outline-none focus:ring-3 focus:ring-[var(--focus-ring)]">
                  Cancel
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Current Account</CardTitle>
            <CardDescription>Email and identifiers are shown for reference only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ReadOnlyLine label="Employee ID" value={employee.id} />
            <ReadOnlyLine label="Profile ID" value={employee.profileId} />
            <ReadOnlyLine label="Email" value={employee.email} />
            <ReadOnlyLine label="Created" value={employee.createdAt} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ReadOnlyLine({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-lg border border-border bg-muted p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]">{label}</p>
      <p className="mt-1 break-words font-semibold text-[var(--on-surface)]">{formatDetailValue(value)}</p>
    </div>
  );
}

function CreateEmployeeSuccessPanel({
  result,
  copied,
  onCopy,
}: {
  result: CreateEmployeeSuccess;
  copied: boolean;
  onCopy: () => Promise<void>;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-[var(--success-container)] bg-[var(--success-container)]/35 p-4 text-sm text-[var(--on-surface)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-bold text-[var(--success)]">Employee account created</p>
          <p className="mt-1 text-[var(--on-surface-variant)]">Save these sign-in details before leaving this page.</p>
        </div>
        <Link href={`/admin/employees/${result.employeeId}`} className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white px-3 text-xs font-semibold text-primary hover:bg-muted">
          Open employee details
        </Link>
      </div>

      <div className="grid gap-3">
        <ReadOnlyLine label="Employee ID" value={result.employeeId} />
        <ReadOnlyLine label="Profile ID" value={result.profileId} />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]">Temporary password</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <code className="min-w-0 flex-1 break-all rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 font-mono text-sm font-semibold text-[var(--healtech-ink)]">
            {result.temporaryPassword}
          </code>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void onCopy();
            }}
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="rounded-lg border border-[var(--warning-container)] bg-[var(--warning-container)] px-3 py-2 text-xs font-medium text-[var(--warning)]">
          Share this temporary password securely. The employee should change it after first sign-in.
        </p>
      </div>
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
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] px-6 py-6 shadow-[0_18px_48px_rgba(11,19,32,0.08)] md:px-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Admin overview</p>
          <h1 className="mt-2 text-[34px] font-bold leading-10 tracking-normal text-[var(--healtech-ink)]">Clinical operations dashboard</h1>
          <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[var(--on-surface-variant)]">Real-time metrics for staffing, visits, patients, inventory, and operational tasks.</p>
        </div>
        <p className="flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-[14px] font-semibold text-[var(--healtech-slate)]">
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Last updated: Just now
        </p>
      </div>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`min-h-[176px] rounded-2xl border bg-[var(--surface-elevated)] p-5 shadow-[0_12px_32px_rgba(11,19,32,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(11,19,32,0.10)] ${stat.tone === "red" ? "border-[#efb7aa]" : "border-[var(--border)]"}`}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${adminToneClasses(stat.tone)}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-[13px] font-bold tracking-[0.10em] text-[var(--muted)]">{stat.label}</p>
            <div className="mt-2 flex items-end gap-3">
              <p className={`table-numeric text-[40px] font-bold leading-[44px] tracking-normal ${stat.tone === "red" ? "text-[var(--danger)]" : "text-[var(--healtech-ink)]"}`}>{stat.value}</p>
              {"helper" in stat ? <p className="pb-1 text-[14px] font-semibold text-[var(--primary)]">+{stat.helper}</p> : null}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <AdminChartCard title="Visits Trend" subtitle="(Last 30 Days)" type="line" />
        <AdminChartCard title="Visits by Department" type="bars" />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_386px]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-[0_12px_32px_rgba(11,19,32,0.06)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h2 className="text-[27px] font-semibold tracking-normal text-[var(--healtech-ink)]">Recent Activity</h2>
            <Link href="/admin/audit-logs" className="text-[17px] font-medium text-[var(--primary)]">View All</Link>
          </div>
          <AdminActivityRow icon={UserPlus} title="New Employee Added" text="Dr. Sarah Jenkins was added to General Medicine." time="10 mins ago" />
          <AdminActivityRow icon={Calendar} title="Leave Request Submitted" text="Nurse Mark O. requested 3 days of annual leave." time="45 mins ago" amber />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-[0_12px_32px_rgba(11,19,32,0.06)]">
          <h2 className="border-b border-[var(--border)] pb-4 text-[27px] font-semibold tracking-normal text-[var(--healtech-ink)]">Quick Actions</h2>
          <div className="mt-5 space-y-3">
            <AdminActionButton href="/admin/employees/new" icon={UserPlus} label="Add Employee" primary />
            <AdminActionButton href="/admin/departments" icon={Building2} label="Create Department" />
            <AdminActionButton href="/admin/leave-requests" icon={FileText} label="Review Leave Requests" amber />
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4">
        <h2 className="text-[22px] font-semibold tracking-normal text-[var(--healtech-ink)]">Operational Workspace</h2>
        <p className="mt-1 text-[15px] text-[var(--on-surface-variant)]">Live records and workflow forms remain connected below.</p>
      </div>
    </div>
  );
}

function AdminChartCard({ title, subtitle, type }: { title: string; subtitle?: string; type: "line" | "bars" }) {
  return (
    <div className="h-[384px] rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-[0_12px_32px_rgba(11,19,32,0.06)]">
      <div className="flex justify-between">
        <h2 className="text-[27px] font-semibold tracking-normal text-[var(--healtech-ink)]">
          {title} {subtitle ? <span className="text-[15px] font-normal text-[var(--on-surface-variant)]">{subtitle}</span> : null}
        </h2>
        <MoreVertical className="h-6 w-6 text-[var(--healtech-slate)]" />
      </div>
      {type === "line" ? (
        <div className="mt-7 grid h-[270px] grid-cols-[34px_1fr] text-[14px] text-[var(--on-surface-variant)]">
          <div className="flex flex-col justify-between pb-7 pt-0">
            <span>150</span>
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
          <div className="relative border-l border-[var(--border)] bg-[linear-gradient(to_bottom,transparent_0,transparent_11%,var(--surface-muted)_11%,transparent_12%,transparent_40%,var(--surface-muted)_40%,transparent_41%,transparent_69%,var(--surface-muted)_69%,transparent_70%)]">
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
            ["Gen", 200, 0.78, "var(--primary)"],
            ["Den", 200, 0.60, "var(--healtech-sage)"],
            ["Derma", 200, 0.40, "var(--primary)"],
            ["Peds", 200, 0.70, "var(--healtech-sage)"],
            ["Int", 200, 0.64, "var(--primary)"],
          ].map(([label, total, ratio, color]) => (
            <div key={String(label)} className="flex w-[88px] flex-col items-center gap-2">
              <div className="relative h-[200px] w-full overflow-hidden rounded-t-sm bg-[var(--surface-muted)]">
                <div className="absolute inset-x-0 top-0 h-[40px] bg-[var(--secondary-container)]" />
                <div className="absolute inset-x-0 bottom-0" style={{ height: Number(total) * Number(ratio), backgroundColor: String(color) }} />
              </div>
              <span className="text-[14px] text-[var(--healtech-slate)]">{label}</span>
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
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${amber ? "bg-[var(--warning-container)] text-[var(--warning)]" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[18px] font-semibold text-[var(--healtech-ink)]">{title}</p>
        <p className="text-[16px] text-[var(--on-surface-variant)]">{text}</p>
        <p className="mt-1 text-[14px] text-[var(--healtech-slate)]">{time}</p>
      </div>
    </div>
  );
}

function AdminActionButton({ href, icon: Icon, label, primary, amber }: { href: string; icon: typeof UserPlus; label: string; primary?: boolean; amber?: boolean }) {
  return (
    <Link href={href} className={`flex h-[52px] items-center gap-4 rounded-lg border px-6 text-[19px] font-semibold ${primary ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--healtech-ink)]"}`}>
      <Icon className={`h-6 w-6 ${amber ? "text-[var(--warning)]" : ""}`} />
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
  if (tone === "amber") return "bg-[var(--warning-container)] text-[var(--warning)]";
  if (tone === "red") return "bg-[var(--error-container)] text-[var(--danger)]";
  if (tone === "blue") return "bg-[var(--tertiary-container)] text-[#5b5797]";
  if (tone === "slate") return "bg-[var(--surface-muted)] text-[var(--muted)]";
  return "bg-[var(--secondary-container)] text-[var(--primary)]";
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
          <div className="flex h-44 items-end gap-2 rounded-xl border border-border bg-[var(--surface)] p-4">
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
    <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input className="h-11 rounded-xl border-[var(--border)] bg-[var(--surface-elevated)] pl-10 shadow-sm" placeholder="Search by name, status, code, or ID" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", "Today", "Pending", "Completed"] as QuickFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setQuickFilter(tab)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${quickFilter === tab ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[0_8px_18px_rgba(14,124,123,0.16)]" : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 font-semibold text-[var(--muted)]"><Filter className="h-3.5 w-3.5" /> Role-aware filters</span>
        <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 font-semibold text-[var(--muted)]"><CalendarDays className="h-3.5 w-3.5" /> Date range</span>
        <span className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 font-semibold text-[var(--muted)]">Columns</span>
        <span className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 font-semibold text-[var(--muted)]">Export</span>
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <Label htmlFor={field.name} className="text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{field.label}{field.required ? " *" : ""}</Label>
      <div className="mt-2">
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
      </div>
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
  return (
    <div className="relative">
      <input {...registration} value={value} readOnly className="sr-only" tabIndex={-1} />
      <Select
        id={id}
        value={value}
        placeholder={placeholder}
        options={options}
        allowEmptyOption
        onValueChange={onChange}
        triggerClassName="h-12 border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-[var(--on-surface)]"
      />
    </div>
  );
}

function buildSchema(fields: WorkspaceField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    let schema: z.ZodTypeAny;
    if (field.type === "number") {
      schema = z.preprocess((value) => value === "" ? undefined : value, field.required ? z.coerce.number() : z.coerce.number().optional());
    }
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
  if (config.action.kind === "function" && config.action.name === "create-patient" && !payload.student_id && !payload.mrn) {
    throw new Error("Student ID or MRN is required");
  }
  return payload;
}

function visitPrefillValues(params: URLSearchParams, fieldNames: Set<string>) {
  const out: Array<[string, string]> = [];
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const allowedPriority = new Set(["low", "normal", "high", "urgent"]);

  for (const name of ["patient_id", "doctor_id"]) {
    const value = params.get(name)?.trim();
    if (value && fieldNames.has(name) && uuidPattern.test(value)) out.push([name, value]);
  }

  const chiefComplaint = params.get("chief_complaint")?.trim();
  if (chiefComplaint && fieldNames.has("chief_complaint")) out.push(["chief_complaint", chiefComplaint]);

  const priority = params.get("priority")?.trim();
  if (priority && fieldNames.has("priority") && allowedPriority.has(priority)) out.push(["priority", priority]);

  return out;
}

function createVisitHref({
  patientId,
  chiefComplaint,
  priority,
}: {
  patientId?: string;
  chiefComplaint?: string;
  priority?: string;
}) {
  const params = new URLSearchParams();
  if (patientId && patientId !== "Not set") params.set("patient_id", patientId);
  if (chiefComplaint && chiefComplaint !== "Not set") params.set("chief_complaint", chiefComplaint);
  if (priority) params.set("priority", priority);
  const query = params.toString();
  return `/reception/visits/new${query ? `?${query}` : ""}`;
}

function extractCreateEmployeeSuccess(value: unknown): CreateEmployeeSuccess | null {
  const payload = unwrapFunctionData(value);
  if (!payload) return null;

  const employeeId = typeof payload.employee_id === "string" ? payload.employee_id : "";
  const profileId = typeof payload.profile_id === "string" ? payload.profile_id : "";
  const temporaryPassword = typeof payload.temporary_password === "string" ? payload.temporary_password : "";

  if (!employeeId || !profileId || !temporaryPassword) return null;

  return { employeeId, profileId, temporaryPassword };
}

async function getSupabaseErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return String(error);

  const response = "context" in error ? (error as { context?: unknown }).context : null;
  if (response instanceof Response) {
    const message = await readFunctionErrorResponse(response);
    if (message) return message;
  }

  if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }

  return String(error);
}

async function readFunctionErrorResponse(response: Response) {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = await response.clone().json();
      const message = extractErrorMessage(payload);
      if (message) return message;
    }

    const text = await response.clone().text();
    return text.trim() || null;
  } catch {
    return null;
  }
}

function extractErrorMessage(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  if (typeof record.error === "string") return record.error;
  if (typeof record.message === "string") return record.message;

  const nested = record.data;
  if (nested && typeof nested === "object") return extractErrorMessage(nested);

  return null;
}

function unwrapFunctionData(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  if ("employee_id" in record || "profile_id" in record || "temporary_password" in record) return record;

  const nested = record.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) return nested as Record<string, unknown>;

  return null;
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
    .filter((row) => key !== "departments" || (row as Record<string, unknown>).status === "active")
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

function normalizeRows(rows: unknown[], config?: WorkspaceConfig): ModuleRecord[] {
  return rows.map((row) => {
    const record = row as Record<string, unknown>;
    if (config?.table === "employees") return flattenEmployee(record);
    if (config?.table === "patients" && config.rowLink?.hrefBase === "/reception/patients") return flattenReceptionPatient(record);
    if (config?.table === "visits" && config.columnLabels?.patient_name) return flattenReceptionVisit(record);
    if (config?.table === "appointment_requests" && config.rowLink?.hrefBase === "/reception/appointment-requests") return flattenAppointmentRequest(record);
    if (config?.table === "store_items") return flattenStoreItem(record);
    if (config?.table === "store_item_batches") return flattenStoreItemBatch(record);
    if (config?.table === "store_requests") return flattenStoreRequest(record);
    return flatten(record);
  });
}

function asArray(value: unknown): unknown[] {
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

function flattenEmployee(row: Record<string, unknown>) {
  const profile = relationObject(row.profiles);
  const department = relationObject(row.departments);

  return {
    full_name: profile.full_name ?? "Not set",
    email: profile.email ?? "Not set",
    phone: profile.phone ?? "Not set",
    role: profile.role ?? "Not set",
    account_status: profile.status ?? "Not set",
    department: department.name ?? "Not set",
    job_title: row.job_title ?? "Not set",
    employee_code: row.employee_code ?? "Not set",
    hire_date: row.hire_date ?? "Not set",
    employee_status: row.status ?? "Not set",
    created_at: row.created_at,
    id: row.id,
  };
}

function flattenReceptionVisit(row: Record<string, unknown>) {
  const patient = relationObject(row.patients);
  const doctor = relationObject(row.doctor);

  return {
    visit_code: row.visit_code ?? "Not set",
    patient_name: patient.full_name ?? "Not set",
    mrn: patient.mrn ?? "Not set",
    student_id: patient.student_id ?? "Not set",
    patient_phone: patient.phone ?? "Not set",
    doctor_name: doctor.full_name ?? "Not set",
    status: row.status ?? "Not set",
    priority: row.priority ?? "Not set",
    chief_complaint: row.chief_complaint ?? "Not set",
    created_at: row.created_at,
    id: row.id,
    patient_id: row.patient_id,
    doctor_id: row.doctor_id,
  };
}

function flattenReceptionPatient(row: Record<string, unknown>) {
  const department = relationObject(row.departments);

  return {
    full_name: row.full_name ?? "Not set",
    mrn: row.mrn ?? "Not set",
    student_id: row.student_id ?? "Not set",
    gender: row.gender ?? "Not set",
    birth_date: row.birth_date ?? "Not set",
    phone: row.phone ?? "Not set",
    status: row.status ?? "Not set",
    created_at: row.created_at,
    id: row.id,
    profile_id: row.profile_id,
    department_id: row.department_id,
    department: department.name ?? "Not set",
    dorm_info: row.dorm_info ?? "Not set",
    emergency_phone: row.emergency_phone ?? "Not set",
    nationality: row.nationality ?? "Not set",
    blood_type: row.blood_type ?? "Not set",
    address: row.address ?? "Not set",
  };
}

function flattenPatientVisitHistory(row: Record<string, unknown>) {
  const doctor = relationObject(row.doctor);

  return {
    visit_code: row.visit_code ?? "Not set",
    doctor_name: doctor.full_name ?? "Not set",
    status: row.status ?? "Not set",
    priority: row.priority ?? "Not set",
    chief_complaint: row.chief_complaint ?? "Not set",
    created_at: row.created_at,
    id: row.id,
    doctor_id: row.doctor_id,
  };
}

function flattenAppointmentRequest(row: Record<string, unknown>) {
  const patient = relationObject(row.patients);
  const department = relationObject(row.requested_department);
  const reviewer = relationObject(row.reviewer);

  return {
    patient_name: patient.full_name ?? "Not set",
    mrn: patient.mrn ?? "Not set",
    student_id: patient.student_id ?? "Not set",
    patient_phone: patient.phone ?? "Not set",
    requested_department: department.name ?? "Not set",
    preferred_date: row.preferred_date ?? "Not set",
    reason: row.reason ?? "Not set",
    status: row.status ?? "Not set",
    admin_comment: row.admin_comment ?? "Not set",
    reviewed_by_name: reviewer.full_name ?? "Not set",
    reviewed_at: row.reviewed_at ?? "Not set",
    created_at: row.created_at,
    id: row.id,
    patient_id: row.patient_id,
    requested_department_id: row.requested_department_id,
    reviewed_by: row.reviewed_by,
  };
}

function flattenStoreItem(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name ?? "Not set",
    category: row.category ?? "Not set",
    manufacturer: row.manufacturer ?? "Not set",
    description: row.description ?? "Not set",
    status: row.status ?? "Not set",
    available_stock: row.available_stock ?? 0,
    created_at: row.created_at,
  };
}

function flattenStoreItemBatch(row: Record<string, unknown>) {
  const storeItem = relationObject(row.store_items);
  const createdBy = relationObject(row.profiles);

  return {
    id: row.id,
    store_item_id: row.store_item_id,
    store_item: storeItem.name ?? "Not set",
    category: storeItem.category ?? "Not set",
    quantity: row.quantity ?? 0,
    unit_price: row.unit_price ?? "Not set",
    receipt_number: row.receipt_number ?? "Not set",
    created_by: row.created_by,
    created_by_name: createdBy.full_name ?? "Not set",
    created_at: row.created_at,
  };
}

function flattenStoreRequest(row: Record<string, unknown>) {
  const requester = relationObject(row.requester);
  const reviewer = relationObject(row.reviewer);
  const storeItem = relationObject(row.store_items);

  return {
    requester_name: requester.full_name ?? "Not set",
    requester_email: requester.email ?? "Not set",
    store_item: storeItem.name ?? "Not set",
    category: storeItem.category ?? "Not set",
    quantity: row.quantity ?? 0,
    reason: row.reason ?? "Not set",
    status: row.status ?? "Not set",
    reviewed_by_name: reviewer.full_name ?? "Not set",
    reviewed_at: row.reviewed_at ?? "Not set",
    admin_comment: row.admin_comment ?? "Not set",
    created_at: row.created_at,
    id: row.id,
    requested_by: row.requested_by,
    store_item_id: row.store_item_id,
    reviewed_by: row.reviewed_by,
  };
}

async function enrichStoreItemsWithStock(client: SupabaseLike, rows: unknown[]) {
  return Promise.all(rows.map(async (row) => {
    const record = row as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id : null;
    if (!id) return record;

    const { data } = await client.rpc("get_available_store_stock", { target_store_item_id: id });
    return { ...record, available_stock: typeof data === "number" ? data : Number(data ?? 0) };
  }));
}

async function enrichStoreRequestsWithStock(client: SupabaseLike, rows: unknown[]) {
  return Promise.all(rows.map(async (row) => {
    const record = row as Record<string, unknown>;
    const storeItemId = typeof record.store_item_id === "string" ? record.store_item_id : null;
    if (!storeItemId) return record;

    const { data } = await client.rpc("get_available_store_stock", { target_store_item_id: storeItemId });
    return { ...record, available_stock: typeof data === "number" ? data : Number(data ?? 0) };
  }));
}

function storeRequestSummary(row: Record<string, unknown>) {
  const requester = relationObject(row.requester);
  const reviewer = relationObject(row.reviewer);
  const storeItem = relationObject(row.store_items);

  return {
    id: String(row.id ?? ""),
    requestedBy: String(row.requested_by ?? ""),
    requesterName: String(requester.full_name ?? "Not set"),
    requesterEmail: String(requester.email ?? "Not set"),
    storeItemId: String(row.store_item_id ?? ""),
    storeItem: String(storeItem.name ?? "Not set"),
    category: String(storeItem.category ?? "Not set"),
    quantity: Number(row.quantity ?? 0),
    reason: String(row.reason ?? "Not set"),
    status: String(row.status ?? "Not set"),
    reviewedByName: String(reviewer.full_name ?? "Not set"),
    reviewedAt: formatDateTime(row.reviewed_at),
    adminComment: String(row.admin_comment ?? "Not set"),
    createdAt: formatDateTime(row.created_at),
    availableStock: Number(row.available_stock ?? 0),
  };
}

function patientSummary(row: Record<string, unknown>) {
  const department = relationObject(row.departments);

  return {
    id: String(row.id ?? ""),
    fullName: String(row.full_name ?? "Not set"),
    mrn: String(row.mrn ?? "Not set"),
    studentId: String(row.student_id ?? "Not set"),
    gender: String(row.gender ?? "Not set"),
    birthDate: String(row.birth_date ?? "Not set"),
    phone: String(row.phone ?? "Not set"),
    emergencyPhone: String(row.emergency_phone ?? "Not set"),
    bloodType: String(row.blood_type ?? "Not set"),
    address: String(row.address ?? "Not set"),
    department: String(department.name ?? "Not set"),
    dormInfo: String(row.dorm_info ?? "Not set"),
    nationality: String(row.nationality ?? "Not set"),
    status: String(row.status ?? "Not set"),
    createdAt: formatDateTime(row.created_at),
  };
}

function appointmentRequestSummary(row: Record<string, unknown>) {
  const patient = relationObject(row.patients);
  const department = relationObject(row.requested_department);
  const reviewer = relationObject(row.reviewer);

  return {
    id: String(row.id ?? ""),
    patientId: String(row.patient_id ?? ""),
    patientName: String(patient.full_name ?? "Not set"),
    mrn: String(patient.mrn ?? "Not set"),
    studentId: String(patient.student_id ?? "Not set"),
    patientPhone: String(patient.phone ?? "Not set"),
    requestedDepartmentId: String(row.requested_department_id ?? ""),
    requestedDepartment: String(department.name ?? "Not set"),
    preferredDate: String(row.preferred_date ?? "Not set"),
    reason: String(row.reason ?? "Not set"),
    status: String(row.status ?? "Not set"),
    adminComment: String(row.admin_comment ?? "Not set"),
    reviewedByName: String(reviewer.full_name ?? "Not set"),
    reviewedAt: formatDateTime(row.reviewed_at),
    createdAt: formatDateTime(row.created_at),
  };
}

function employeeSummary(row: Record<string, unknown>) {
  const profile = relationObject(row.profiles);
  const department = relationObject(row.departments);

  return {
    id: String(row.id ?? ""),
    profileId: String(row.profile_id ?? ""),
    fullName: String(profile.full_name ?? "Not set"),
    email: String(profile.email ?? "Not set"),
    phone: String(profile.phone ?? "Not set"),
    role: String(profile.role ?? "Not set"),
    profileStatus: String(profile.status ?? "Not set"),
    departmentName: String(department.name ?? "Not set"),
    jobTitle: String(row.job_title ?? "Not set"),
    employeeCode: String(row.employee_code ?? "Not set"),
    hireDate: String(row.hire_date ?? "Not set"),
    employeeStatus: String(row.status ?? "Not set"),
    createdAt: formatDateTime(row.created_at),
  };
}

function employeeFormDefaults(row: Record<string, unknown>): FormValues {
  const profile = relationObject(row.profiles);

  return {
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    role: profile.role ?? "",
    profile_status: profile.status ?? "active",
    department_id: row.department_id ?? "",
    job_title: row.job_title ?? "",
    employee_code: row.employee_code ?? "",
    hire_date: row.hire_date ?? "",
    employee_status: row.status ?? "active",
  };
}

function clinicSettingsFormDefaults(row?: Record<string, unknown>): FormValues {
  const value = row && typeof row.value === "object" && row.value !== null && !Array.isArray(row.value)
    ? row.value as Partial<ClinicSettingsValues>
    : {};

  return {
    clinic_name: stringSetting(value.clinic_name, "HealTech Clinic"),
    clinic_phone: stringSetting(value.clinic_phone),
    clinic_email: stringSetting(value.clinic_email),
    clinic_address: stringSetting(value.clinic_address),
    working_hours_start: stringSetting(value.working_hours_start, "08:00"),
    working_hours_end: stringSetting(value.working_hours_end, "17:00"),
    default_appointment_duration_minutes: Number(value.default_appointment_duration_minutes ?? 30),
    allow_patient_appointment_requests: Boolean(value.allow_patient_appointment_requests ?? true),
    emergency_contact_number: stringSetting(value.emergency_contact_number),
    lab_results_visibility_mode: stringSetting(value.lab_results_visibility_mode, "doctor_approved_only"),
  };
}

function clinicSettingsLastUpdated(row: Record<string, unknown> | null) {
  const updatedBy = relationObject(row?.profiles);
  const updatedByLabel = updatedBy.full_name
    ? `${updatedBy.full_name}${updatedBy.email ? ` / ${updatedBy.email}` : ""}`
    : row?.updated_by;

  return {
    updatedAt: formatDateTime(row?.updated_at),
    updatedBy: updatedByLabel ?? "Not set",
  };
}

function stringSetting(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function relationObject(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) return value[0] && typeof value[0] === "object" ? value[0] as Record<string, unknown> : {};
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function formatDetailValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not set";
  return String(value);
}

function formatDateTime(value: unknown) {
  if (!value) return "Not set";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

function LoadingState() {
  return <SharedLoadingState label="Loading records" className="h-40" />;
}

function ReadOnlyNotice() {
  return <Notice tone="warning" text="This screen is intentionally read-only. Related updates must happen through the correct workflow action." />;
}

function Notice({ tone, text }: { tone: "success" | "warning" | "danger"; text: string }) {
  return <FeedbackAlert tone={tone} message={text} />;
}
