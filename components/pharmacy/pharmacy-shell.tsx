"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileClock,
  Inbox,
  Loader2,
  LogOut,
  PackagePlus,
  Pill,
  Search,
  Settings,
} from "lucide-react";
import { Badge, badgeTone } from "@/components/ui/badge";
import { navigationByRole } from "@/lib/constants/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { AppProfile } from "@/types/app.types";

type PharmacyShellProps = {
  profile: AppProfile;
  segments?: string[];
};

type Screen = "dashboard" | "orders" | "medicines" | "new-medicine" | "low-stock" | "out-of-stock" | "expired";
type PrescriptionStatus = "ordered" | "partially_dispensed" | "dispensed" | "cancelled";
type PrescriptionItemStatus = "pending" | "dispensed" | "unavailable" | "cancelled";
type MedicineStatus = "active" | "inactive" | string;
type BatchStatus = "in_stock" | "out_of_stock" | "expired" | string;
type FilterValue = string | number | boolean;

type PatientSummary = {
  full_name: string;
  mrn: string | null;
  student_id: string | null;
};

type VisitSummary = {
  id: string;
  visit_code: string;
  chief_complaint: string | null;
  status: string;
  priority: string;
};

type DoctorSummary = {
  full_name: string;
  email: string;
};

type MedicineRecord = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  status: MedicineStatus;
  created_at: string;
  updated_at: string;
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
  medicines: Pick<MedicineRecord, "id" | "name" | "category" | "description" | "status"> | null;
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
  patients: PatientSummary | null;
  visits: VisitSummary | null;
  doctor: DoctorSummary | null;
  prescription_items: PrescriptionItemRecord[];
};

type BatchRecord = {
  id: string;
  medicine_id: string | null;
  batch_number: string | null;
  receipt_number: string | null;
  manufacturer: string | null;
  quantity: number;
  unit_price: number | null;
  expiry_date: string | null;
  status: BatchStatus;
  created_at: string;
  medicines: Pick<MedicineRecord, "id" | "name" | "category" | "description" | "status"> | null;
};

type BatchStockRecord = Pick<BatchRecord, "id" | "medicine_id" | "quantity" | "status" | "expiry_date">;
type DispenseContext = {
  prescription: PrescriptionRecord;
  item: PrescriptionItemRecord;
};

type QueryState<T> = {
  loading: boolean;
  data: T;
  error: string | null;
};

type DashboardCounts = {
  ordered: number;
  partiallyDispensed: number;
  dispensed: number;
  pendingItems: number;
  dispensedItems: number;
  activeMedicines: number;
  lowStockBatches: number;
  outOfStockBatches: number;
  expiredBatches: number;
};

type MedicineStockSummary = {
  totalQuantity: number;
  inStockBatches: number;
  expiredBatches: number;
};

type QueryError = { message: string };
type QueryResult<T> = { data: T[] | null; error: QueryError | null; count?: number | null };
type CountResult = { data: null; error: QueryError | null; count: number | null };
type SingleResult<T> = { data: T | null; error: QueryError | null };
type CountOptions = { count: "exact"; head: true };

type SupabaseQuery<T> = PromiseLike<QueryResult<T>> & {
  eq(column: string, value: FilterValue): SupabaseQuery<T>;
  gt(column: string, value: FilterValue): SupabaseQuery<T>;
  in(column: string, values: FilterValue[]): SupabaseQuery<T>;
  lt(column: string, value: FilterValue): SupabaseQuery<T>;
  lte(column: string, value: FilterValue): SupabaseQuery<T>;
  or(filters: string): SupabaseQuery<T>;
  order(column: string, options: { ascending: boolean }): SupabaseQuery<T>;
  limit(count: number): SupabaseQuery<T>;
};

type SupabaseCountQuery = PromiseLike<CountResult> & {
  eq(column: string, value: FilterValue): SupabaseCountQuery;
  lt(column: string, value: FilterValue): SupabaseCountQuery;
  lte(column: string, value: FilterValue): SupabaseCountQuery;
};

type InsertMedicinePayload = Pick<MedicineRecord, "name" | "category" | "description" | "status">;
type InsertQuery<T> = {
  select(columns: string): {
    single(): PromiseLike<SingleResult<T>>;
  };
};
type DispenseMedicinePayload = {
  prescription_item_id: string;
  quantity: number;
};
type FunctionResult = {
  data: unknown;
  error: QueryError | null;
};

type CanonicalPharmacyClient = {
  from(table: "prescriptions"): {
    select(columns: string): SupabaseQuery<PrescriptionRecord>;
    select(columns: string, options: CountOptions): SupabaseCountQuery;
  };
  from(table: "prescription_items"): {
    select(columns: string, options: CountOptions): SupabaseCountQuery;
  };
  from(table: "medicines"): {
    select(columns: string): SupabaseQuery<MedicineRecord>;
    select(columns: string, options: CountOptions): SupabaseCountQuery;
    insert(payload: InsertMedicinePayload): InsertQuery<MedicineRecord>;
  };
  from(table: "medicine_batches"): {
    select(columns: string): SupabaseQuery<BatchRecord>;
    select(columns: string, options: CountOptions): SupabaseCountQuery;
  };
  functions: {
    invoke(name: "dispense-medicine", options: { body: DispenseMedicinePayload }): PromiseLike<FunctionResult>;
  };
};

const emptyCounts: DashboardCounts = {
  ordered: 0,
  partiallyDispensed: 0,
  dispensed: 0,
  pendingItems: 0,
  dispensedItems: 0,
  activeMedicines: 0,
  lowStockBatches: 0,
  outOfStockBatches: 0,
  expiredBatches: 0,
};

const prescriptionSelect =
  "id,visit_id,patient_id,doctor_id,status,doctor_notes,created_at,updated_at,completed_at,patients(full_name,mrn,student_id),visits(id,visit_code,chief_complaint,status,priority),doctor:profiles!prescriptions_doctor_id_fkey(full_name,email),prescription_items(id,prescription_id,medicine_id,requested_quantity,dispensed_quantity,dosage_instructions,status,dispensed_at,created_at,medicines(id,name,category,description,status))";

const medicineSelect = "id,name,category,description,status,created_at,updated_at";
const batchStockSelect = "id,medicine_id,quantity,status,expiry_date";
const batchSelect = "id,medicine_id,batch_number,receipt_number,manufacturer,quantity,unit_price,expiry_date,status,created_at,medicines(id,name,category,description,status)";

export function PharmacyShell({ profile, segments = [] }: PharmacyShellProps) {
  const pathname = usePathname();
  const screen = resolvePharmacyScreen(segments);

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#17212f]">
      <PharmacySidebar activePath={pathname} profile={profile} />
      <main className="min-h-screen lg:pl-[290px]">
        <PharmacyTopbar profile={profile} />
        {screen === "dashboard" ? <PharmacyDashboard /> : null}
        {screen === "orders" ? <PharmacyOrders /> : null}
        {screen === "medicines" ? <MedicineCatalog /> : null}
        {screen === "new-medicine" ? <NewMedicineForm profile={profile} /> : null}
        {screen === "low-stock" ? <BatchList mode="low-stock" /> : null}
        {screen === "out-of-stock" ? <BatchList mode="out-of-stock" /> : null}
        {screen === "expired" ? <BatchList mode="expired" /> : null}
      </main>
    </div>
  );
}

function resolvePharmacyScreen(segments: string[]): Screen {
  const path = segments.join("/");
  if (!path || path === "dashboard") return "dashboard";
  if (path === "orders") return "orders";
  if (path === "medicines") return "medicines";
  if (path === "medicines/new") return "new-medicine";
  if (path === "medicines/low-stock") return "low-stock";
  if (path === "medicines/out-of-stock") return "out-of-stock";
  if (path === "medicines/expired") return "expired";
  return "dashboard";
}

function PharmacySidebar({ activePath, profile }: { activePath: string; profile: AppProfile }) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[290px] border-r border-[#d4e0e8] bg-white lg:flex lg:flex-col">
      <div className="border-b border-[#d4e0e8] px-6 py-6">
        <Link href="/pharmacy/dashboard" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#00758d] text-white">
            <Pill className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-semibold text-[#00758d]">HealTech</p>
            <p className="text-sm text-[#607084]">Pharmacy Workspace</p>
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
        {navigationByRole.pharmacy.map((item) => {
          const active = isActivePharmacyPath(activePath, item.href);
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

function isActivePharmacyPath(activePath: string, href: string) {
  if (activePath === href) return true;
  if (href === "/pharmacy/orders") return activePath.startsWith("/pharmacy/orders");
  if (href === "/pharmacy/medicines") return activePath === "/pharmacy/medicines";
  return false;
}

function PharmacyTopbar({ profile }: { profile: AppProfile }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d4e0e8] bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-5 lg:px-8">
        <Link href="/pharmacy/dashboard" className="font-semibold text-[#00758d] lg:hidden">
          HealTech
        </Link>
        <div className="relative hidden w-full max-w-md sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8ca1]" />
          <input
            aria-label="Search pharmacy workspace"
            className="h-10 w-full rounded-lg border border-[#cbd8e2] bg-[#f4f8fb] pl-10 pr-3 text-sm outline-none focus:border-[#00758d]"
            placeholder="Search prescriptions, patients, or medicines"
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

function PharmacyDashboard() {
  const supabase = useMemo(() => createClient() as unknown as CanonicalPharmacyClient, []);
  const [counts, setCounts] = useState<DashboardCounts>(emptyCounts);
  const [state, setState] = useState<QueryState<PrescriptionRecord[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setState((current) => ({ ...current, loading: true, error: null }));
      const today = todayIso();
      const [ordered, partial, dispensed, pendingItems, dispensedItems, activeMedicines, lowStock, outOfStock, expired, recent] = await Promise.all([
        countRows(supabase, "prescriptions", "status", "ordered"),
        countRows(supabase, "prescriptions", "status", "partially_dispensed"),
        countRows(supabase, "prescriptions", "status", "dispensed"),
        countRows(supabase, "prescription_items", "status", "pending"),
        countRows(supabase, "prescription_items", "status", "dispensed"),
        countRows(supabase, "medicines", "status", "active"),
        supabase.from("medicine_batches").select("id", { count: "exact", head: true }).eq("status", "in_stock").lte("quantity", 10),
        countRows(supabase, "medicine_batches", "status", "out_of_stock"),
        supabase.from("medicine_batches").select("id", { count: "exact", head: true }).lt("expiry_date", today),
        supabase.from("prescriptions").select(prescriptionSelect).eq("status", "ordered").order("created_at", { ascending: false }).limit(6),
      ]);

      if (!active) return;

      const error = [ordered, partial, dispensed, pendingItems, dispensedItems, activeMedicines, lowStock, outOfStock, expired, recent].find((result) => result.error)?.error;
      if (error) {
        setState({ loading: false, data: [], error: error.message });
        return;
      }

      setCounts({
        ordered: ordered.count ?? 0,
        partiallyDispensed: partial.count ?? 0,
        dispensed: dispensed.count ?? 0,
        pendingItems: pendingItems.count ?? 0,
        dispensedItems: dispensedItems.count ?? 0,
        activeMedicines: activeMedicines.count ?? 0,
        lowStockBatches: lowStock.count ?? 0,
        outOfStockBatches: outOfStock.count ?? 0,
        expiredBatches: expired.count ?? 0,
      });
      setState({ loading: false, data: recent.data ?? [], error: null });
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [supabase]);

  return (
    <section className="space-y-6 px-5 py-6 lg:px-8">
      <PageHeader title="Pharmacy Dashboard" description="Live prescription, item, medicine, and stock status from the canonical pharmacy tables." />
      {state.error ? <ErrorState message={state.error} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Ordered Prescriptions" value={counts.ordered} icon={ClipboardList} />
        <StatCard title="Partially Dispensed" value={counts.partiallyDispensed} icon={FileClock} tone="warning" />
        <StatCard title="Dispensed Prescriptions" value={counts.dispensed} icon={CheckCircle2} tone="success" />
        <StatCard title="Pending Items" value={counts.pendingItems} icon={PackagePlus} tone="warning" />
        <StatCard title="Dispensed Items" value={counts.dispensedItems} icon={BadgeCheck} tone="success" />
        <StatCard title="Active Medicines" value={counts.activeMedicines} icon={Pill} />
        <StatCard title="Low Stock Batches" value={counts.lowStockBatches} icon={AlertTriangle} tone="warning" />
        <StatCard title="Out / Expired Batches" value={counts.outOfStockBatches + counts.expiredBatches} icon={Inbox} tone="danger" />
      </div>

      <DataCard
        title="Recent Pending Prescriptions"
        action={
          <Link href="/pharmacy/orders" className="text-sm font-semibold text-[#006d86]">
            View all
          </Link>
        }
      >
        {state.loading ? <LoadingState label="Loading pending prescriptions" /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No pending prescriptions" description="There are no ordered prescriptions awaiting pharmacy review." /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? <PrescriptionCompactList prescriptions={state.data} /> : null}
      </DataCard>
    </section>
  );
}

function PharmacyOrders() {
  const supabase = useMemo(() => createClient() as unknown as CanonicalPharmacyClient, []);
  const [state, setState] = useState<QueryState<PrescriptionRecord[]>>({ loading: true, data: [], error: null });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dispenseContext, setDispenseContext] = useState<DispenseContext | null>(null);

  const loadOrders = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setState((current) => ({ ...current, loading: true, error: null }));
      const result = await supabase.from("prescriptions").select(prescriptionSelect).order("created_at", { ascending: false });
      if (result.error) {
        setState((current) => ({ loading: false, data: silent ? current.data : [], error: result.error?.message ?? "Could not load prescriptions." }));
        return false;
      }
      setState({ loading: false, data: result.data ?? [], error: null });
      return true;
    },
    [supabase],
  );

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      const ok = await loadOrders();
      if (!active || !ok) return;
    }

    void initialLoad();
    return () => {
      active = false;
    };
  }, [loadOrders]);

  async function handleDispensed(quantity: number) {
    setDispenseContext(null);
    await loadOrders({ silent: true });
    setSuccessMessage(`${quantity} unit(s) dispensed successfully. Prescription status refreshed.`);
  }

  return (
    <section className="space-y-6 px-5 py-6 lg:px-8">
      <PageHeader title="Prescription Orders" description="Canonical prescriptions with patient, visit, doctor, item, and medicine context." />
      {successMessage ? <SuccessState message={successMessage} /> : null}
      {state.loading ? <LoadingState label="Loading prescriptions" /> : null}
      {state.error ? <ErrorState message={state.error} /> : null}
      {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No prescriptions" description="No prescriptions are currently visible to this pharmacy profile." /> : null}
      {!state.loading && !state.error && state.data.length > 0 ? (
        <PrescriptionList
          prescriptions={state.data}
          onDispense={(prescription, item) => {
            setSuccessMessage(null);
            setDispenseContext({ prescription, item });
          }}
        />
      ) : null}
      {dispenseContext ? (
        <DispenseModal
          context={dispenseContext}
          supabase={supabase}
          onClose={() => setDispenseContext(null)}
          onDispensed={handleDispensed}
        />
      ) : null}
    </section>
  );
}

function MedicineCatalog() {
  const supabase = useMemo(() => createClient() as unknown as CanonicalPharmacyClient, []);
  const [query, setQuery] = useState("");
  const [stock, setStock] = useState<Record<string, MedicineStockSummary>>({});
  const [state, setState] = useState<QueryState<MedicineRecord[]>>({ loading: true, data: [], error: null });

  useEffect(() => {
    let active = true;

    async function loadMedicines() {
      setState((current) => ({ ...current, loading: true, error: null }));
      const [medicinesResult, batchesResult] = await Promise.all([
        supabase.from("medicines").select(medicineSelect).order("name", { ascending: true }),
        supabase.from("medicine_batches").select(batchStockSelect).order("created_at", { ascending: false }),
      ]);

      if (!active) return;
      const error = medicinesResult.error ?? batchesResult.error;
      if (error) {
        setState({ loading: false, data: [], error: error.message });
        return;
      }

      setStock(buildStockSummary((batchesResult.data ?? []) as BatchStockRecord[]));
      setState({ loading: false, data: medicinesResult.data ?? [], error: null });
    }

    void loadMedicines();
    return () => {
      active = false;
    };
  }, [supabase]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return state.data;
    return state.data.filter((medicine) => [medicine.name, medicine.category, medicine.description, medicine.status].some((value) => value?.toLowerCase().includes(text)));
  }, [query, state.data]);

  return (
    <section className="space-y-6 px-5 py-6 lg:px-8">
      <PageHeader
        title="Medicine Catalog"
        description="Canonical medicines available to doctor prescriptions and pharmacy stock."
        action={
          <Link href="/pharmacy/medicines/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#006d86] px-4 text-sm font-semibold text-white">
            <PackagePlus className="h-4 w-4" />
            Add Medicine
          </Link>
        }
      />

      <DataCard title="Medicines">
        <div className="mb-4 max-w-md">
          <SearchInput value={query} onChange={setQuery} placeholder="Search medicines by name, category, or status" />
        </div>
        {state.loading ? <LoadingState label="Loading medicines" /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title="No medicines" description="No canonical medicines are visible to this pharmacy profile." /> : null}
        {!state.loading && !state.error && state.data.length > 0 && filtered.length === 0 ? <EmptyState title="No matching medicines" description="Try a different medicine name, category, or status." /> : null}
        {!state.loading && !state.error && filtered.length > 0 ? <MedicineTable medicines={filtered} stock={stock} /> : null}
      </DataCard>
    </section>
  );
}

function NewMedicineForm({ profile }: { profile: AppProfile }) {
  const supabase = useMemo(() => createClient() as unknown as CanonicalPharmacyClient, []);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<MedicineStatus>("active");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload: InsertMedicinePayload = {
      name: name.trim(),
      category: category.trim() || null,
      description: description.trim() || null,
      status,
    };

    if (!payload.name) {
      setSaving(false);
      setError("Medicine name is required.");
      return;
    }

    const result = await supabase.from("medicines").insert(payload).select(medicineSelect).single();
    setSaving(false);

    if (result.error) {
      setError(`Could not create medicine. ${result.error.message}`);
      return;
    }

    setName("");
    setCategory("");
    setDescription("");
    setStatus("active");
    setMessage(`Medicine created by ${profile.full_name}.`);
  }

  return (
    <section className="space-y-6 px-5 py-6 lg:px-8">
      <PageHeader title="Add Medicine" description="Create a canonical medicine record. Stock batches are managed separately through batch workflows." />
      <DataCard title="Medicine Details">
        <form onSubmit={handleSubmit} className="grid max-w-3xl gap-5">
          {error ? <ErrorState message={error} /> : null}
          {message ? <SuccessState message={message} /> : null}
          <label className="grid gap-2 text-sm font-medium">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-lg border border-[#cbd8e2] px-3 outline-none focus:border-[#00758d]" placeholder="Medicine name" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Category
            <input value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-lg border border-[#cbd8e2] px-3 outline-none focus:border-[#00758d]" placeholder="Optional category" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 rounded-lg border border-[#cbd8e2] px-3 py-2 outline-none focus:border-[#00758d]"
              placeholder="Optional description"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-[#cbd8e2] px-3 outline-none focus:border-[#00758d]">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="flex items-center gap-3">
            <button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#006d86] px-5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
              Create Medicine
            </button>
            <Link href="/pharmacy/medicines" className="text-sm font-semibold text-[#006d86]">
              Back to catalog
            </Link>
          </div>
        </form>
      </DataCard>
    </section>
  );
}

function BatchList({ mode }: { mode: "low-stock" | "out-of-stock" | "expired" }) {
  const supabase = useMemo(() => createClient() as unknown as CanonicalPharmacyClient, []);
  const [state, setState] = useState<QueryState<BatchRecord[]>>({ loading: true, data: [], error: null });
  const meta = batchPageMeta(mode);

  useEffect(() => {
    let active = true;

    async function loadBatches() {
      setState((current) => ({ ...current, loading: true, error: null }));
      let query = supabase.from("medicine_batches").select(batchSelect).order("created_at", { ascending: false });
      if (mode === "low-stock") query = query.eq("status", "in_stock").lte("quantity", 10);
      if (mode === "out-of-stock") query = query.eq("status", "out_of_stock");
      if (mode === "expired") query = query.lt("expiry_date", todayIso());

      const result = await query;
      if (!active) return;
      if (result.error) {
        setState({ loading: false, data: [], error: result.error.message });
        return;
      }
      setState({ loading: false, data: result.data ?? [], error: null });
    }

    void loadBatches();
    return () => {
      active = false;
    };
  }, [mode, supabase]);

  return (
    <section className="space-y-6 px-5 py-6 lg:px-8">
      <PageHeader title={meta.title} description={meta.description} />
      <DataCard title={meta.cardTitle}>
        {state.loading ? <LoadingState label={meta.loadingLabel} /> : null}
        {state.error ? <ErrorState message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? <EmptyState title={meta.emptyTitle} description={meta.emptyDescription} /> : null}
        {!state.loading && !state.error && state.data.length > 0 ? <BatchTable batches={state.data} /> : null}
      </DataCard>
    </section>
  );
}

function PrescriptionCompactList({ prescriptions }: { prescriptions: PrescriptionRecord[] }) {
  return (
    <div className="divide-y divide-[#dce6ee]">
      {prescriptions.map((prescription) => (
        <div key={prescription.id} className="grid gap-3 py-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center">
          <div>
            <p className="font-semibold">{prescription.patients?.full_name ?? "Unknown patient"}</p>
            <p className="text-sm text-[#607084]">{patientIdentifier(prescription.patients)} / {prescription.visits?.visit_code ?? prescription.visit_id}</p>
          </div>
          <div>
            <p className="text-sm text-[#607084]">Doctor</p>
            <p className="font-medium">{prescription.doctor?.full_name ?? prescription.doctor_id}</p>
          </div>
          <div>
            <Badge tone={badgeTone(prescription.status)}>{formatLabel(prescription.status)}</Badge>
            <p className="mt-1 text-sm text-[#607084]">{prescription.prescription_items.length} item(s)</p>
          </div>
          <Link href="/pharmacy/orders" className="text-sm font-semibold text-[#006d86]">
            Review
          </Link>
        </div>
      ))}
    </div>
  );
}

function PrescriptionList({
  prescriptions,
  onDispense,
}: {
  prescriptions: PrescriptionRecord[];
  onDispense: (prescription: PrescriptionRecord, item: PrescriptionItemRecord) => void;
}) {
  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <DataCard key={prescription.id} title={prescription.patients?.full_name ?? "Unknown patient"} action={<Badge tone={badgeTone(prescription.status)}>{formatLabel(prescription.status)}</Badge>}>
          <div className="grid gap-4 lg:grid-cols-4">
            <InfoBlock label="MRN / Student ID" value={patientIdentifier(prescription.patients)} />
            <InfoBlock label="Visit" value={prescription.visits?.visit_code ?? prescription.visit_id} helper={prescription.visits?.chief_complaint ?? "No chief complaint recorded"} />
            <InfoBlock label="Doctor" value={prescription.doctor?.full_name ?? prescription.doctor_id} helper={prescription.doctor?.email ?? undefined} />
            <InfoBlock label="Created" value={formatDateTime(prescription.created_at)} helper={prescription.completed_at ? `Completed ${formatDateTime(prescription.completed_at)}` : "Not completed"} />
          </div>
          {prescription.doctor_notes ? <p className="mt-4 rounded-lg bg-[#edf6f8] p-3 text-sm text-[#2d4058]">{prescription.doctor_notes}</p> : null}
          <div className="mt-5 overflow-hidden rounded-lg border border-[#d4e0e8]">
            <div className="grid grid-cols-[1.3fr_0.65fr_0.65fr_1.35fr_0.75fr_0.8fr] bg-[#eef4f8] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#607084]">
              <span>Medicine</span>
              <span>Requested</span>
              <span>Dispensed</span>
              <span>Dosage</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {prescription.prescription_items.length === 0 ? (
              <div className="px-4 py-5 text-sm text-[#607084]">No prescription items are attached.</div>
            ) : (
              prescription.prescription_items.map((item) => (
                <div key={item.id} className="grid min-h-16 grid-cols-[1.3fr_0.65fr_0.65fr_1.35fr_0.75fr_0.8fr] items-center border-t border-[#e5edf3] px-4 py-3 text-sm">
                  <span>
                    <span className="font-medium">{item.medicines?.name ?? item.medicine_id}</span>
                    <br />
                    <span className="text-xs text-[#607084]">{item.medicines?.category ?? "Uncategorized"}</span>
                  </span>
                  <span>{item.requested_quantity}</span>
                  <span>{item.dispensed_quantity}</span>
                  <span>{item.dosage_instructions ?? "No dosage instructions"}</span>
                  <span><Badge tone={badgeTone(item.status)}>{formatLabel(item.status)}</Badge></span>
                  <span>
                    {canDispenseItem(item) ? (
                      <button onClick={() => onDispense(prescription, item)} className="rounded-lg bg-[#006d86] px-3 py-2 text-xs font-semibold text-white">
                        Dispense
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-[#607084]">{item.status === "pending" ? "No remaining" : "Read-only"}</span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </DataCard>
      ))}
    </div>
  );
}

function DispenseModal({
  context,
  supabase,
  onClose,
  onDispensed,
}: {
  context: DispenseContext;
  supabase: CanonicalPharmacyClient;
  onClose: () => void;
  onDispensed: (quantity: number) => Promise<void>;
}) {
  const { prescription, item } = context;
  const remaining = remainingQuantity(item);
  const [quantity, setQuantity] = useState(remaining > 0 ? String(remaining) : "");
  const [stockState, setStockState] = useState<QueryState<BatchStockRecord[]>>({ loading: true, data: [], error: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availableStock = useMemo(() => stockState.data.reduce((total, batch) => total + batch.quantity, 0), [stockState.data]);

  useEffect(() => {
    let active = true;

    async function loadStock() {
      setStockState({ loading: true, data: [], error: null });
      const result = await supabase
        .from("medicine_batches")
        .select(batchStockSelect)
        .eq("medicine_id", item.medicine_id)
        .eq("status", "in_stock")
        .gt("quantity", 0)
        .or(`expiry_date.is.null,expiry_date.gte.${todayIso()}`)
        .order("expiry_date", { ascending: true });

      if (!active) return;
      if (result.error) {
        setStockState({ loading: false, data: [], error: result.error.message });
        return;
      }
      setStockState({ loading: false, data: (result.data ?? []) as BatchStockRecord[], error: null });
    }

    void loadStock();
    return () => {
      active = false;
    };
  }, [item.medicine_id, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validation = validateDispenseQuantity(quantity, item);
    if (validation) {
      setError(validation);
      return;
    }

    const parsedQuantity = Number(quantity);
    setSubmitting(true);
    const result = await supabase.functions.invoke("dispense-medicine", {
      body: {
        prescription_item_id: item.id,
        quantity: parsedQuantity,
      },
    });
    setSubmitting(false);

    if (result.error) {
      setError(`Could not dispense medicine. ${result.error.message}`);
      return;
    }

    await onDispensed(parsedQuantity);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17212f]/45 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#d4e0e8] px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">Dispense Prescription Item</h2>
            <p className="mt-1 text-sm text-[#607084]">Stock is checked for active, unexpired batches. Final stock reduction is handled by the backend RPC.</p>
          </div>
          <button onClick={onClose} disabled={submitting} className="rounded-lg border border-[#cbd8e2] px-3 py-2 text-sm font-semibold text-[#41546b] disabled:opacity-60">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error ? <ErrorState message={error} /> : null}
          {stockState.error ? <ErrorState message={`Could not load stock. ${stockState.error}`} /> : null}

          <div className="grid gap-4 md:grid-cols-3">
            <InfoBlock label="Patient" value={prescription.patients?.full_name ?? "Unknown patient"} helper={patientIdentifier(prescription.patients)} />
            <InfoBlock label="Visit" value={prescription.visits?.visit_code ?? prescription.visit_id} helper={prescription.visits?.chief_complaint ?? undefined} />
            <InfoBlock label="Doctor" value={prescription.doctor?.full_name ?? prescription.doctor_id} helper={prescription.doctor?.email ?? undefined} />
            <InfoBlock label="Medicine" value={item.medicines?.name ?? item.medicine_id} helper={item.medicines?.category ?? "Uncategorized"} />
            <InfoBlock label="Requested" value={String(item.requested_quantity)} helper={`${item.dispensed_quantity} already dispensed`} />
            <InfoBlock label="Remaining" value={String(remaining)} helper={`Item status: ${formatLabel(item.status)}`} />
          </div>

          <div className="rounded-lg border border-[#d4e0e8] bg-[#f8fbfd] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#607084]">Dosage Instructions</p>
            <p className="mt-2 text-sm text-[#2d4058]">{item.dosage_instructions ?? "No dosage instructions"}</p>
          </div>

          <div className="rounded-lg border border-[#d4e0e8] p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold">Available Stock</p>
                <p className="text-sm text-[#607084]">
                  {stockState.loading ? "Loading stock..." : `${availableStock} unit(s) available across ${stockState.data.length} eligible batch(es).`}
                </p>
              </div>
              {!stockState.loading && availableStock < remaining ? (
                <Badge tone="warning">Available stock is below remaining quantity</Badge>
              ) : null}
            </div>
          </div>

          <label className="grid max-w-xs gap-2 text-sm font-medium">
            Quantity to dispense
            <input
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              inputMode="numeric"
              className="h-11 rounded-lg border border-[#cbd8e2] px-3 outline-none focus:border-[#00758d]"
              placeholder="Enter quantity"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#d4e0e8] pt-5">
            <button disabled={submitting || stockState.loading} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#006d86] px-5 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pill className="h-4 w-4" />}
              Confirm Dispense
            </button>
            <button type="button" onClick={onClose} disabled={submitting} className="h-11 rounded-lg border border-[#cbd8e2] px-5 text-sm font-semibold text-[#41546b] disabled:opacity-60">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MedicineTable({ medicines, stock }: { medicines: MedicineRecord[]; stock: Record<string, MedicineStockSummary> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d4e0e8]">
      <div className="grid grid-cols-[1.5fr_1fr_1.8fr_0.9fr_0.9fr_0.9fr_1fr] bg-[#eef4f8] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#607084]">
        <span>Name</span>
        <span>Category</span>
        <span>Description</span>
        <span>Status</span>
        <span>Total Qty</span>
        <span>Batches</span>
        <span>Updated</span>
      </div>
      {medicines.map((medicine) => {
        const summary = stock[medicine.id] ?? { totalQuantity: 0, inStockBatches: 0, expiredBatches: 0 };
        return (
          <div key={medicine.id} className="grid min-h-20 grid-cols-[1.5fr_1fr_1.8fr_0.9fr_0.9fr_0.9fr_1fr] items-center border-t border-[#e5edf3] px-4 py-3 text-sm">
            <span>
              <span className="font-semibold">{medicine.name}</span>
              <br />
              <span className="text-xs text-[#607084]">{medicine.id}</span>
            </span>
            <span>{medicine.category ?? "Uncategorized"}</span>
            <span className="line-clamp-2 text-[#41546b]">{medicine.description ?? "No description"}</span>
            <span><Badge tone={badgeTone(medicine.status)}>{formatLabel(medicine.status)}</Badge></span>
            <span>{summary.totalQuantity}</span>
            <span>{summary.inStockBatches} in stock{summary.expiredBatches ? `, ${summary.expiredBatches} expired` : ""}</span>
            <span>{formatDate(medicine.updated_at)}</span>
          </div>
        );
      })}
    </div>
  );
}

function BatchTable({ batches }: { batches: BatchRecord[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d4e0e8]">
      <div className="grid grid-cols-[1.3fr_0.9fr_1fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr] bg-[#eef4f8] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#607084]">
        <span>Medicine</span>
        <span>Category</span>
        <span>Batch</span>
        <span>Receipt</span>
        <span>Qty</span>
        <span>Unit Price</span>
        <span>Expiry</span>
        <span>Status</span>
      </div>
      {batches.map((batch) => (
        <div key={batch.id} className="grid min-h-20 grid-cols-[1.3fr_0.9fr_1fr_1fr_0.8fr_0.8fr_0.9fr_0.9fr] items-center border-t border-[#e5edf3] px-4 py-3 text-sm">
          <span>
            <span className="font-semibold">{batch.medicines?.name ?? batch.medicine_id ?? "Unlinked medicine"}</span>
            <br />
            <span className="text-xs text-[#607084]">{batch.manufacturer ?? "No manufacturer"}</span>
          </span>
          <span>{batch.medicines?.category ?? "Uncategorized"}</span>
          <span>{batch.batch_number ?? "No batch number"}</span>
          <span>{batch.receipt_number ?? "No receipt"}</span>
          <span>{batch.quantity}</span>
          <span>{batch.unit_price == null ? "Not set" : formatCurrency(batch.unit_price)}</span>
          <span>{batch.expiry_date ? formatDate(batch.expiry_date) : "No expiry"}</span>
          <span><Badge tone={badgeTone(batch.status)}>{formatLabel(batch.status)}</Badge></span>
        </div>
      ))}
    </div>
  );
}

function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-[#607084]">{description}</p>
      </div>
      {action}
    </div>
  );
}

function DataCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#d4e0e8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d4e0e8] px-5 py-4">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function StatCard({ title, value, icon: Icon, tone = "info" }: { title: string; value: number; icon: typeof ClipboardList; tone?: "info" | "success" | "warning" | "danger" }) {
  const toneClass = {
    info: "bg-[#e3f7fa] text-[#006d86]",
    success: "bg-[#e4f7e9] text-[#087a35]",
    warning: "bg-[#fff5d9] text-[#9b6400]",
    danger: "bg-[#ffe8e5] text-[#b42318]",
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

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-[#607084]">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#cbd8e2] bg-[#f8fbfd] p-8 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-[#607084]">{description}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#f2aaa4] bg-[#fff1f0] p-4 text-sm text-[#b42318]">
      <AlertTriangle className="mr-2 inline h-4 w-4" />
      {message}
    </div>
  );
}

function SuccessState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#a7dfb7] bg-[#edf8ef] p-4 text-sm text-[#087a35]">
      <CheckCircle2 className="mr-2 inline h-4 w-4" />
      {message}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <span className="relative block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8ca1]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-[#cbd8e2] bg-[#f4f8fb] pl-10 pr-3 text-sm outline-none focus:border-[#00758d]"
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

function Avatar({ name, small }: { name: string; small?: boolean }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-[#d9eef3] font-semibold text-[#006d86]", small ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm")}>
      {initials(name)}
    </span>
  );
}

function countRows(client: CanonicalPharmacyClient, table: "prescriptions", column: string, value: FilterValue): PromiseLike<CountResult>;
function countRows(client: CanonicalPharmacyClient, table: "prescription_items", column: string, value: FilterValue): PromiseLike<CountResult>;
function countRows(client: CanonicalPharmacyClient, table: "medicines", column: string, value: FilterValue): PromiseLike<CountResult>;
function countRows(client: CanonicalPharmacyClient, table: "medicine_batches", column: string, value: FilterValue): PromiseLike<CountResult>;
function countRows(client: CanonicalPharmacyClient, table: "prescriptions" | "prescription_items" | "medicines" | "medicine_batches", column: string, value: FilterValue) {
  if (table === "prescriptions") return client.from("prescriptions").select("id", { count: "exact", head: true }).eq(column, value);
  if (table === "prescription_items") return client.from("prescription_items").select("id", { count: "exact", head: true }).eq(column, value);
  if (table === "medicines") return client.from("medicines").select("id", { count: "exact", head: true }).eq(column, value);
  return client.from("medicine_batches").select("id", { count: "exact", head: true }).eq(column, value);
}

function buildStockSummary(batches: BatchStockRecord[]) {
  const today = todayIso();
  return batches.reduce<Record<string, MedicineStockSummary>>((summary, batch) => {
    if (!batch.medicine_id) return summary;
    const current = summary[batch.medicine_id] ?? { totalQuantity: 0, inStockBatches: 0, expiredBatches: 0 };
    current.totalQuantity += batch.quantity;
    if (batch.status === "in_stock") current.inStockBatches += 1;
    if (batch.expiry_date && batch.expiry_date < today) current.expiredBatches += 1;
    summary[batch.medicine_id] = current;
    return summary;
  }, {});
}

function remainingQuantity(item: PrescriptionItemRecord) {
  return Math.max(item.requested_quantity - item.dispensed_quantity, 0);
}

function canDispenseItem(item: PrescriptionItemRecord) {
  return item.status === "pending" && remainingQuantity(item) > 0;
}

function validateDispenseQuantity(value: string, item: PrescriptionItemRecord) {
  const remaining = remainingQuantity(item);
  const trimmed = value.trim();
  const quantity = Number(trimmed);

  if (item.status !== "pending") return "This prescription item is not pending and cannot be dispensed.";
  if (remaining <= 0) return "This prescription item has no remaining quantity to dispense.";
  if (!trimmed) return "Quantity is required.";
  if (!Number.isInteger(quantity) || quantity <= 0) return "Quantity must be a positive whole number.";
  if (quantity > remaining) return `Quantity cannot exceed the remaining quantity of ${remaining}.`;
  return null;
}

function batchPageMeta(mode: "low-stock" | "out-of-stock" | "expired") {
  if (mode === "low-stock") {
    return {
      title: "Low Stock Batches",
      description: "In-stock batches with quantity at or below 10 units.",
      cardTitle: "Low Stock",
      loadingLabel: "Loading low stock batches",
      emptyTitle: "No low stock batches",
      emptyDescription: "No in-stock batches are currently at or below the low stock threshold.",
    };
  }
  if (mode === "out-of-stock") {
    return {
      title: "Out of Stock Batches",
      description: "Batches marked out of stock in the canonical stock table.",
      cardTitle: "Out of Stock",
      loadingLabel: "Loading out of stock batches",
      emptyTitle: "No out of stock batches",
      emptyDescription: "No out of stock batches are currently visible.",
    };
  }
  return {
    title: "Expired Batches",
    description: "Batches with expiry dates earlier than today.",
    cardTitle: "Expired Stock",
    loadingLabel: "Loading expired batches",
    emptyTitle: "No expired batches",
    emptyDescription: "No expired medicine batches are currently visible.",
  };
}

function patientIdentifier(patient: PatientSummary | null) {
  if (!patient) return "No patient identifier";
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(value);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
