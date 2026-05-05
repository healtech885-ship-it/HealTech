"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Archive,
  Ban,
  Bell,
  CalendarX,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Download,
  Edit3,
  Filter,
  FlaskConical,
  Grid2X2,
  HelpCircle,
  Info as InfoIcon,
  LogOut,
  PackagePlus,
  Pill,
  Plus,
  Printer,
  Search,
  Settings,
  ShieldPlus,
  TrendingDown,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type PharmacyShellProps = {
  segments?: string[];
};

const inventory = [
  { name: "Amoxicillin Clavulanate", brand: "Augmentin", form: "Tablet • 625mg", category: "Antibiotics", available: 450, total: 500, status: "In Stock", expiry: "Oct 2025" },
  { name: "Ibuprofen", brand: "Advil", form: "Syrup • 100mg/5ml", category: "Analgesics", available: 12, total: 150, status: "Low Stock", expiry: "Jan 2024" },
  { name: "Loratadine", brand: "Claritin", form: "Tablet • 10mg", category: "Antihistamines", available: 0, total: 200, status: "Out of Stock", expiry: "-" },
  { name: "Paracetamol", brand: "Panadol", form: "Capsule • 500mg", category: "Analgesics", available: 890, total: 1000, status: "In Stock", expiry: "May 2026" },
];

const medicineOrders = [
  { id: "#ORD-9021", patient: "Eleanor Vance", mrn: "482-991A", doctor: "Dr. J. Aris", visit: "V-1049", items: 3, stock: "Available", status: "New Order", action: "Dispense" },
  { id: "#ORD-9022", patient: "Marcus Thorne", mrn: "510-224B", doctor: "Dr. S. Chen", visit: "V-1050", items: 5, stock: "Partial", status: "Pending", action: "Dispense" },
  { id: "#ORD-9023", patient: "Lila Rossi", mrn: "102-887C", doctor: "Dr. M. Silva", visit: "V-1051", items: 1, stock: "Out of Stock", status: "Pending", action: "Hold" },
  { id: "#ORD-9018", patient: "James Holden", mrn: "773-001X", doctor: "Dr. J. Aris", visit: "V-1044", items: 2, stock: "Available", status: "Processing", action: "Review" },
];

const lowStock = [
  { medicine: "Amoxicillin", id: "MED-8921", form: "Capsule, 500mg", available: 0, threshold: 200, severity: "Out of Stock", expiry: "-", primary: true },
  { medicine: "Atorvastatin", id: "MED-3342", form: "Tablet, 20mg", available: 12, threshold: 100, severity: "Critical", expiry: "Oct 15, 2024" },
  { medicine: "Lisinopril", id: "MED-1109", form: "Tablet, 10mg", available: 45, threshold: 150, severity: "Low", expiry: "Dec 01, 2024" },
  { medicine: "Metformin HCL", id: "MED-5521", form: "Tablet, 500mg", available: 89, threshold: 250, severity: "Low", expiry: "Nov 22, 2025" },
  { medicine: "Ibuprofen", id: "MED-0982", form: "Suspension, 100mg/5mL", available: 5, threshold: 50, severity: "Critical", expiry: "Sep 30, 2024" },
];

const expired = [
  { med: "Amoxicillin Suspension", type: "Antibiotic", batch: "BX-7829-A", maker: "PharmaCorp Inc.", date: "Oct 12, 2023", ago: "14 days ago", qty: "12 bottles", status: "Pending", action: "Log Disposal" },
  { med: "Lidocaine HCl 2%", type: "Anesthetic", batch: "LD-441-B", maker: "MediDose Solutions", date: "Sep 30, 2023", ago: "26 days ago", qty: "5 vials", status: "In Transit", action: "Update Log" },
  { med: "Hematology Controls Level 1", type: "Lab Reagent", batch: "HC-990-Q", maker: "BioHealth Diagnostics", date: "Oct 20, 2023", ago: "6 days ago", qty: "2 packs", status: "Pending", action: "Log Disposal" },
  { med: "Ibuprofen 400mg", type: "NSAID", batch: "IB-112-X", maker: "GenericsIntl", date: "Aug 15, 2023", ago: "", qty: "0 tabs", status: "Disposed", action: "View Record" },
];

const completedOrders = [
  { id: "ORD-9921", patient: "Eleanor Vance", mrn: "MRN: 884-291", doctor: "Dr. Reynolds", summary: "Amoxicillin 500mg, Ibuprofen 400mg\n2 items", status: "Fully Dispensed", by: "Sarah Chen", time: "Oct 24, 14:30" },
  { id: "ORD-9920", patient: "Marcus Thorne", mrn: "MRN: 112-943", doctor: "Dr. Patel", summary: "Lisinopril 10mg, Atorvastatin 20mg, Metformin 5...\n3 items", status: "Partially Dispensed", by: "Michael Chang", time: "Oct 24, 11:15" },
  { id: "ORD-9918", patient: "Sophia Martinez", mrn: "MRN: 445-882", doctor: "Dr. Reynolds", summary: "Sertraline 50mg\n1 item", status: "Fully Dispensed", by: "Sarah Chen", time: "Oct 23, 16:45" },
  { id: "ORD-9915", patient: "James Wilson", mrn: "MRN: 773-109", doctor: "Dr. Kim", summary: "Omeprazole 20mg, Albuterol Inhaler\n2 items", status: "Fully Dispensed", by: "Sarah Chen", time: "Oct 23, 09:20" },
];

export function PharmacyShell({ segments = [] }: PharmacyShellProps) {
  const pathname = usePathname();
  const screen = resolveScreen(segments);

  return (
    <div className="min-h-screen bg-[#f3f8fc] text-[#101820]">
      <PharmacySidebar activePath={pathname} />
      <main className="min-h-screen lg:pl-[320px]">
        <PharmacyTopbar screen={screen} />
        {screen === "dashboard" && <PharmacyDashboard />}
        {screen === "add-batch" && <AddMedicineBatch />}
        {screen === "inventory" && <MedicineInventory />}
        {screen === "details" && <MedicineDetails />}
        {screen === "orders" && <MedicineOrdersQueue />}
        {screen === "dispense" && <DispenseMedicines />}
        {screen === "low-stock" && <LowStockMedicines />}
        {screen === "expired" && <ExpiredMedicines />}
        {screen === "out-of-stock" && <OutOfStockMedicines />}
        {screen === "completed" && <CompletedOrdersLog />}
      </main>
    </div>
  );
}

function resolveScreen(segments: string[]) {
  const path = segments.join("/");
  if (!path || path === "dashboard") return "dashboard";
  if (path === "orders") return "orders";
  if (path === "orders/completed") return "completed";
  if (path.startsWith("orders/")) return "dispense";
  if (path === "medicines") return "inventory";
  if (path === "medicines/new") return "add-batch";
  if (path === "medicines/low-stock") return "low-stock";
  if (path === "medicines/out-of-stock") return "out-of-stock";
  if (path === "medicines/expired") return "expired";
  if (path.startsWith("medicines/")) return "details";
  return "dashboard";
}

function PharmacySidebar({ activePath }: { activePath: string }) {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const nav = [
    { label: "Dashboard", href: "/pharmacy/dashboard", icon: Grid2X2 },
    { label: "Lab Orders Queue", href: "/pharmacy/orders", icon: ClipboardList },
    { label: "Pending Results", href: "/pharmacy/medicines/low-stock", icon: PackagePlus },
    { label: "Completed Results", href: "/pharmacy/orders/completed", icon: CheckCircle2 },
    { label: "Lab Test Catalog", href: "/pharmacy/medicines", icon: FlaskConical },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[320px] border-r border-[#d5dee7] bg-[#f7fbff] lg:flex lg:flex-col">
      <div className="px-10 py-7">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#078aa1] text-white">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[26px] font-bold text-[#00758d]">CliniSync</p>
            <p className="text-[16px] text-[#243853]">Lab Management</p>
          </div>
        </div>
      </div>
      <nav className="mt-5 space-y-3 px-5">
        {nav.map((item) => {
          const active =
            activePath === item.href ||
            (item.href === "/pharmacy/orders" && activePath.startsWith("/pharmacy/orders/") && !activePath.includes("completed")) ||
            (item.href === "/pharmacy/medicines" && activePath.startsWith("/pharmacy/medicines/") && !activePath.includes("low-stock"));
          return (
            <Link key={item.href} href={item.href} className={cn("flex h-[50px] items-center gap-5 rounded-md border-r-2 border-transparent px-5 text-[18px] text-[#243853]", active && "border-[#008db0] bg-white font-medium text-[#0082a1] shadow-sm")}>
              <item.icon className="h-6 w-6" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[#d5dee7] px-10 py-7">
        <div className="mb-7 flex items-center gap-5 text-[18px] text-[#243853]"><HelpCircle className="h-6 w-6" /> Support</div>
        <button onClick={handleLogout} className="flex items-center gap-5 text-[18px] text-[#243853]"><LogOut className="h-6 w-6" /> Logout</button>
      </div>
    </aside>
  );
}

function PharmacyTopbar({ screen }: { screen: string }) {
  const centerTitle = ["add-batch", "details", "orders", "dispense", "expired", "completed"].includes(screen);
  const placeholder = screen === "orders" ? "Search orders, patients..." : screen === "out-of-stock" ? "Search medicines..." : screen === "inventory" || screen === "details" || screen === "low-stock" ? "Search inventory..." : "Search...";
  return (
    <header className="sticky top-0 z-20 h-[80px] border-b border-[#d9e2ea] bg-white">
      <div className="flex h-full items-center gap-8 px-8">
        {centerTitle && <p className="text-[28px] font-semibold">CliniSync Lab</p>}
        <div className={cn("relative", centerTitle ? "w-[405px]" : "w-[320px]")}>
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#7d91a8]" />
          <input className="h-12 w-full rounded-lg border border-[#c5d1de] bg-[#f6f9fc] pl-12 text-[18px] outline-none" placeholder={placeholder} />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-7 text-[#344b69]">
          <span className="text-[18px]">Lab Technician</span>
          <Bell className="h-6 w-6" />
          <Settings className="h-7 w-7" />
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="h-10 w-10 rounded-full object-cover" />
        </div>
      </div>
    </header>
  );
}

function PharmacyDashboard() {
  return (
    <section className="px-10 py-12">
      <Header title="Pharmacy Overview" subtitle="Real-time inventory and dispensing metrics">
        <button onClick={() => window.print()} className="h-12 rounded-lg bg-white px-6 text-[18px] shadow"><Download className="mr-2 inline h-5 w-5" />Export Report</button>
      </Header>
      <div className="mt-8 grid grid-cols-[1fr_1fr_1fr_380px] gap-7">
        <Metric value="14" label="New Medicine Orders" tag="New" icon={ShieldPlus} />
        <Metric value="8" label="Pending Dispensing" tag="Pending" icon={Archive} amber />
        <Metric value="32" label="Completed Today" tag="Today" icon={CheckCircle2} green />
        <QuickActions />
      </div>
      <div className="mt-8 grid grid-cols-[1fr_380px] gap-7">
        <div className="space-y-8">
          <InventoryHealth />
          <DashboardOrders />
        </div>
        <InventoryAlerts />
      </div>
    </section>
  );
}

function Header({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[32px] font-semibold">{title}</h1>
        <p className="mt-2 text-[18px] text-[#40536c]">{subtitle}</p>
      </div>
      <div className="flex gap-3">{children}</div>
    </div>
  );
}

function Metric({ value, label, tag, icon: Icon, amber, green }: { value: string; label: string; tag: string; icon: typeof ShieldPlus; amber?: boolean; green?: boolean }) {
  return (
    <div className="min-h-[192px] rounded-lg border border-[#d7e1ea] bg-white p-6 shadow-sm">
      <div className="flex justify-between">
        <span className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f5f8] text-[#006d86]", amber && "bg-[#fff0df] text-[#b36200]", green && "bg-[#dff8eb] text-[#00824a]")}><Icon className="h-6 w-6" /></span>
        <span className="h-fit rounded-full bg-[#eef3f7] px-3 py-1">{tag}</span>
      </div>
      <p className="mt-7 text-[40px] font-semibold">{value}</p>
      <p className="text-[19px]">{label}</p>
    </div>
  );
}

function QuickActions() {
  const actions = [
    ["Open Orders", "/pharmacy/orders", ClipboardList],
    ["Add Batch", "/pharmacy/medicines/new", Plus],
    ["View Low\nStock", "/pharmacy/medicines/low-stock", TrendingDown],
    ["View Expired", "/pharmacy/medicines/expired", CalendarX],
  ] as const;
  return (
    <div className="rounded-lg border border-[#d7e1ea] bg-white shadow-sm">
      <h2 className="border-b border-[#d7e1ea] p-6 text-[26px] font-semibold"><AlertTriangle className="mr-3 inline h-6 w-6 text-[#687887]" />Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 p-3">
        {actions.map(([label, href, Icon]) => <Link key={label} href={href} className="flex h-[106px] flex-col items-center justify-center whitespace-pre-line rounded-md border border-[#d7e1ea] text-center text-[18px]"><Icon className="mb-3 h-6 w-6 text-[#8da0ba]" />{label}</Link>)}
      </div>
    </div>
  );
}

function InventoryHealth() {
  return (
    <div className="rounded-lg border border-[#d7e1ea] bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-[28px] font-semibold"><Archive className="mr-3 inline h-7 w-7 text-[#687887]" />Inventory Health</h2>
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "LOW STOCK", value: "9", tone: "text-[#b25b00]", icon: AlertTriangle },
          { label: "OUT OF\nSTOCK", value: "2", tone: "text-[#c00000]", icon: Ban },
          { label: "EXPIRING\nSOON", value: "11", tone: "text-[#b25b00]", icon: CalendarX },
          { label: "EXPIRED", value: "4", tone: "text-[#c00000]", icon: CalendarX },
        ].map((item) => <div key={item.label} className="rounded-lg bg-[#eef3f7] p-6"><p className={cn("whitespace-pre-line text-[16px]", item.tone)}><item.icon className="mr-2 inline h-5 w-5" />{item.label}</p><p className="mt-5 text-[32px] font-semibold">{item.value}</p></div>)}
      </div>
    </div>
  );
}

function DashboardOrders() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d7e1ea] bg-white shadow-sm">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-[28px] font-semibold">New Medicine Orders</h2>
        <Link href="/pharmacy/orders" className="text-[18px] font-semibold text-[#006d86]">View All <ChevronRight className="inline h-5 w-5" /></Link>
      </div>
      <TableHeader cols="grid-cols-[1.2fr_0.9fr_0.9fr_0.6fr_0.8fr_0.8fr]" labels={["Patient", "MRN", "Doctor", "Items", "Status", "Action"]} light />
      {[
        ["JD", "John Doe", "#MRN-0921", "Dr. Smith", "3"],
        ["SJ", "Sarah Jenkins", "#MRN-1045", "Dr. Adams", "1"],
        ["MW", "Michael Wong", "#MRN-0833", "Dr. Patel", "2"],
      ].map((row) => <div key={row[1]} className="grid min-h-[92px] grid-cols-[1.2fr_0.9fr_0.9fr_0.6fr_0.8fr_0.8fr] items-center border-t border-[#e1e8ee] px-5 text-[17px]"><span className="flex items-center gap-3"><Avatar initials={row[0]} />{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span><span>{row[4]}</span><StatusPill value="New" /><Link href="/pharmacy/orders/ord-9021" className="rounded-md bg-[#006d86] px-5 py-2 text-center font-semibold text-white">Dispense</Link></div>)}
    </div>
  );
}

function InventoryAlerts() {
  return (
    <aside className="rounded-lg border border-[#d7e1ea] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d7e1ea] p-6">
        <h2 className="text-[28px] font-semibold"><Bell className="mr-3 inline h-7 w-7 text-[#687887]" />Inventory<br />Alerts</h2>
        <span className="rounded-full border border-[#f5b5b5] bg-[#fff0f0] px-4 py-2 text-[#c00000]">Action<br />Required</span>
      </div>
      {[
        { title: "Amoxicillin 500mg", body: "Out of stock. 3 pending orders blocked.", time: "10 mins ago", icon: Ban },
        { title: "Lisinopril 10mg", body: "Low stock warning. Only 15 units remaining.", time: "45 mins ago", icon: AlertTriangle },
        { title: "Insulin Glargine Pen", body: "Batch #IG-882 expiring in 7 days.", time: "2 hours ago", icon: CalendarX },
      ].map((item) => <div key={item.title} className="flex gap-4 border-b border-[#edf1f5] p-6 last:border-0"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#c00000]"><item.icon className="h-5 w-5" /></span><p><b className="text-[18px]">{item.title}</b><br /><span className="text-[17px] text-[#2f3d4c]">{item.body}</span><br /><span className="text-[15px] text-[#8da0ba]">{item.time}</span></p></div>)}
    </aside>
  );
}

function AddMedicineBatch() {
  const [message, setMessage] = useState("");
  return (
    <section className="px-8 py-6">
      <Link href="/pharmacy/medicines" className="text-[18px] text-[#006d86]">← Back to Inventory</Link>
      <Header title="Add Medicine Batch" subtitle="Enter details for new stock arriving at the facility.">
        <Link href="/pharmacy/medicines" className="flex h-12 items-center rounded-lg border border-[#40536c] bg-white px-6 text-[18px]">Cancel</Link>
        <button onClick={() => setMessage("Batch saved. Ready for another entry.")} className="h-12 rounded-lg border border-[#40536c] bg-white px-6 text-[18px]">Save &amp; Add Another</button>
        <button onClick={() => setMessage("Medicine batch saved.")} className="h-12 rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white">Save Batch</button>
      </Header>
      <div className="mt-10 grid grid-cols-[1fr_385px] gap-8">
        <div className="space-y-8">
          <div className="rounded-lg border border-[#ff8d8d] bg-[#fff3f3] p-6 text-[#c00000]">
            <p className="text-[19px] font-semibold"><AlertTriangle className="mr-4 inline h-7 w-7" />Warning: Short Expiry Detected</p>
            <p className="ml-11 mt-2 text-[17px] text-[#2f3d4c]">The expiry date entered is within the next 3 months. Please ensure immediate rotation in stock.</p>
          </div>
          <FormCard title="Medicine Information" icon={ShieldPlus}>
            <label className="col-span-2 text-[17px]">Medicine Name *<SearchInput placeholder="Search database or type new..." /></label>
            <InputField label="Generic Name" value="Amoxicillin" />
            <InputField label="Manufacturer" value="PharmaCorp Inc." />
            <InputField label="Form" value="Capsule" select />
            <div className="grid grid-cols-[1fr_1fr] gap-3"><InputField label="Strength" value="500" /><InputField label="Unit" value="mg" select /></div>
          </FormCard>
          <FormCard title="Batch Information" icon={Archive}>
            <InputField label="Batch Number *" placeholder="E.G. BTH-2023-891" />
            <InputField label="Receipt / PO Number" placeholder="E.G. PO-5542" />
            <InputField label="Quantity Received *" value="0" suffix="units" />
            <InputField label="Unit Price" placeholder="$  0.00" />
            <hr className="col-span-2 border-[#d7e1ea]" />
            <InputField label="Received Date" placeholder="mm/dd/yyyy" />
            <InputField label="Expiry Date *" value="12/15/2023" danger helper="Date is within 3 months." />
          </FormCard>
          {message && <p className="text-[17px] text-[#006d86]">{message}</p>}
        </div>
        <aside className="space-y-8">
          <FormCard title="Stock Settings" icon={Settings}>
            <InputField label="Storage Location" value="Main Pharmacy - Shelf A1" select full />
            <InputField label="Low Stock Threshold" value="50" suffix="units" full />
            <label className="col-span-2 text-[18px]">Internal Notes<textarea className="mt-2 h-[122px] w-full resize-none rounded-lg border border-[#b9c8d5] p-4" placeholder="Add any special handling instructions or notes..." /></label>
          </FormCard>
          <div className="rounded-lg border border-[#d7e1ea] bg-[#eef3f7] p-6">
            <h3 className="text-[20px] font-semibold"><InfoIcon className="mr-2 inline h-6 w-6" />Batch Tracking</h3>
            <p className="mt-4 text-[17px] leading-7 text-[#2f3d4c]">Accurate batch and expiry tracking ensures compliance with clinical safety standards. FIFO (First-In, First-Out) rules will be automatically applied based on the expiry date entered here.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function MedicineInventory() {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => inventory.filter((item) => `${item.name} ${item.brand}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <section className="px-8 py-9">
      <div className="flex items-start justify-between">
        <div><h1 className="text-[22px]">Medicine Inventory</h1><p className="mt-3 text-[20px] text-[#40536c]">Manage stock levels, track expirations, and update pharmacy inventory.</p></div>
        <Link href="/pharmacy/medicines/new" className="flex h-12 items-center rounded-lg bg-[#006d86] px-5 text-[22px] text-white"><Plus /></Link>
      </div>
      <div className="mt-8 rounded-lg border border-[#d7e1ea] bg-white p-5 shadow-sm">
        <div className="flex gap-4"><SearchBox value={query} onChange={setQuery} placeholder="Search by name, generic..." className="w-[320px]" /><FilterSelect label="Category: All" /><FilterSelect label="Stock: All" /></div>
      </div>
      <div className="mt-8 overflow-hidden rounded-lg border border-[#d7e1ea] bg-white shadow-sm">
        <TableHeader cols="grid-cols-[1.6fr_1.5fr_1.2fr_1.4fr_1.2fr_1fr]" labels={["Medicine (Generic)", "Form / Strength", "Category", "Available / Total", "Stock Status", "Nearest Expiry"]} light />
        {rows.map((item) => <Link key={item.name} href="/pharmacy/medicines/amoxicillin-500mg" className="grid min-h-[92px] grid-cols-[1.6fr_1.5fr_1.2fr_1.4fr_1.2fr_1fr] items-center border-t border-[#e1e8ee] px-5 text-[18px]"><span>{item.name}<br /><span className="text-[14px] text-[#40536c]">{item.brand}</span></span><span>{item.form}</span><span>{item.category}</span><span><b className={item.available < 20 ? "text-[#c74400]" : ""}>{item.available}</b> / <span className="text-[14px] text-[#40536c]">{item.total}</span></span><StockBadge value={item.status} /><span className={item.expiry === "Jan 2024" ? "text-[#c74400]" : ""}>{item.expiry}</span></Link>)}
        <div className="flex h-[72px] items-center justify-between border-t border-[#d7e1ea] px-5 text-[18px] text-[#40536c]"><span>Showing 1 to 4 of 124 entries</span><ChevronLeft className="text-[#b7c3cf]" /></div>
      </div>
    </section>
  );
}

function MedicineDetails() {
  return (
    <section className="px-10 py-12">
      <Link href="/pharmacy/medicines" className="text-[18px]">← Back to Inventory</Link>
      <div className="mt-12 flex items-end justify-between border-b border-[#b9c8d5] pb-8">
        <div><h1 className="text-[32px] font-semibold">Amoxicillin 500mg Capsules <span className="ml-4 rounded-full bg-[#ffd8d5] px-3 py-2 text-[15px] text-[#9b0000]"><AlertTriangle className="mr-1 inline h-4 w-4" />Low Stock</span><span className="ml-2 rounded-full bg-[#b46600] px-3 py-2 text-[15px] text-white"><CalendarX className="mr-1 inline h-4 w-4" />1 Batch Expires Soon</span></h1><p className="mt-4 text-[17px] text-[#2f3d4c]">NDC: 00093-3109-05 <span className="mx-5 text-[#b6c0ca]">•</span> Manufacturer: Teva Pharmaceuticals <span className="mx-5 text-[#b6c0ca]">•</span> Category: Antibiotics</p></div>
        <div className="flex gap-5"><button className="h-12 rounded-lg border border-[#40536c] bg-white px-6 text-[18px]"><Edit3 className="mr-2 inline h-5 w-5" />Edit Details</button><Link href="/pharmacy/medicines/new" className="flex h-12 items-center rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Plus className="mr-2 h-5 w-5" />Receive Stock</Link></div>
      </div>
      <div className="mt-10 grid grid-cols-[475px_1fr] gap-8">
        <div className="space-y-3">
          <div className="rounded-lg border border-[#b9c8d5] bg-white p-6"><p className="text-[20px]"><Archive className="mr-2 inline h-5 w-5" />Total Stock</p><p className="mt-2 text-[42px] font-semibold">1,240</p><p className="text-[#d00000]">↓ Below reorder point (1,500)</p></div>
          <div className="grid grid-cols-2 gap-3"><MiniCard title="Available" value="1,100" helper="Ready for dispense" /><MiniCard title="Active Batches" value="3" helper="In current inventory" /></div>
          <InfoPanel />
        </div>
        <div className="space-y-8">
          <BatchesTable />
          <MovementTable />
        </div>
      </div>
    </section>
  );
}

function MedicineOrdersQueue() {
  const [tab, setTab] = useState("New Orders");
  return (
    <section className="px-8 py-10">
      <Header title="Medicine Orders Queue" subtitle="Manage and dispense prescriptions for pending patient visits.">
        <button className="h-12 rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Plus className="mr-2 inline h-5 w-5" />Manual Entry</button>
      </Header>
      <div className="mt-8 overflow-hidden rounded-lg border border-[#b9c8d5] bg-white">
        <div className="flex h-[50px] items-end gap-4 border-b border-[#b9c8d5] px-5">
          {["New Orders", "Pending Dispense", "Partially Dispensed", "Completed"].map((item) => <button key={item} onClick={() => setTab(item)} className={cn("h-full border-b-2 border-transparent px-5 text-[18px]", tab === item && "border-[#00758d] text-[#006d86]")}>{item}{item === "New Orders" && <span className="ml-2 rounded-full bg-[#0089a5] px-2 text-sm text-white">12</span>}</button>)}
        </div>
        <TableHeader cols="grid-cols-[130px_1.3fr_1fr_0.8fr_0.5fr_1fr_0.9fr_0.8fr]" labels={["Order ID", "Patient Details", "Prescribing Doctor", "Visit ID", "Items", "Stock Availability", "Status", "Action"]} light />
        {medicineOrders.map((order) => <div key={order.id} className="grid min-h-[94px] grid-cols-[130px_1.3fr_1fr_0.8fr_0.5fr_1fr_0.9fr_0.8fr] items-center border-t border-[#eef2f5] px-5 text-[18px]"><span>{order.id}</span><span>{order.patient}<br /><span className="text-[14px]">MRN: {order.mrn}</span></span><span>{order.doctor}</span><span>{order.visit}</span><span>{order.items}</span><StockAvail value={order.stock} /><StatusPill value={order.status} /><Link href="/pharmacy/orders/ord-9021" className={cn("rounded-md px-5 py-3 text-center font-semibold", order.action === "Dispense" ? "bg-[#006d86] text-white" : "border border-[#d7e1ea] text-[#006d86]")}>{order.action}</Link></div>)}
        <div className="flex h-[90px] items-center justify-between border-t border-[#b9c8d5] px-5"><span>Showing 1 to 4 of 12 orders</span><span className="flex gap-7"><ChevronLeft /><ChevronRight /></span></div>
      </div>
    </section>
  );
}

function DispenseMedicines() {
  const [message, setMessage] = useState("");
  return (
    <section className="px-8 py-8">
      <div className="flex items-start justify-between"><div><p className="text-[18px] text-[#344b69]">← Back to Queue <span className="mx-2">/</span> <b className="text-black">Order #ORD-2023-8942</b></p><h1 className="mt-2 text-[32px] font-semibold">Dispense Medicines</h1></div><button onClick={() => window.print()} className="h-12 rounded-lg border border-[#40536c] bg-white px-6 text-[18px]"><Printer className="mr-2 inline h-5 w-5" />Print Labels</button></div>
      <div className="mt-8 flex items-center justify-between rounded-[14px] border border-[#d7e1ea] bg-white p-8 shadow-sm"><div className="flex items-center gap-5"><Avatar initials="EJ" large /><div><h2 className="text-[26px] font-semibold">Eleanor Jenkins</h2><p className="text-[#40536c]">DOB: 14 May 1968 (55y) <span className="mx-5">|</span> # MRN: PT-99214</p></div></div><InfoField label="Prescribing Doctor" value="Dr. Sarah Chen (Cardiology)" /><InfoField label="Order Date" value="Today, 09:45 AM" /></div>
      <div className="mt-8 grid grid-cols-[1fr_385px] gap-8">
        <div><h2 className="mb-6 text-[28px] font-semibold">Requested Items (3)</h2><DispenseItem name="Atorvastatin Calcium" meta="40mg Tablet • Oral" qty="30" ok /><DispenseItem name="Lisinopril" meta="20mg Tablet • Oral" qty="90" warning /><DispenseItem name="Aspirin" meta="81mg Chewable • Oral" qty="30" disabled /></div>
        <aside className="h-fit rounded-[14px] border border-[#d7e1ea] bg-white p-6 shadow-sm"><h2 className="border-b border-[#d7e1ea] pb-5 text-[28px] font-semibold">Dispense Summary</h2>{[["Total Items Requested","3"],["Items to Dispense Fully","1"],["Items Partially Filled","1"],["Items Out of Stock","1"]].map(([a,b],i)=><p key={a} className="mt-5 flex justify-between text-[18px] text-[#40536c]"><span>{a}</span><b className={i===1?"text-[#00802b]":i>1?"text-[#c74400]":"text-black"}>{b}</b></p>)}<div className="mt-8 rounded-lg bg-[#e9eef3] p-5"><p className="text-[18px] font-semibold"><InfoIcon className="mr-2 inline h-6 w-6 text-[#006d86]" />Partial Order Fulfillment</p><p className="ml-8 mt-2 text-[17px] leading-6 text-[#40536c]">Proceeding will create a backorder for 45x Lisinopril and 30x Aspirin. Patient will be notified.</p></div><button onClick={()=>setMessage("Available medicines dispensed.")} className="mt-8 h-14 w-full rounded-lg bg-[#006d86] text-[18px] font-semibold text-white">Dispense Available (2 items)</button><button onClick={()=>setMessage("Order placed on hold.")} className="mt-4 h-14 w-full rounded-lg border border-[#40536c] bg-white text-[18px]">Hold Entire Order</button>{message && <p className="mt-4 text-[#006d86]">{message}</p>}</aside>
      </div>
    </section>
  );
}

function LowStockMedicines() {
  return (
    <section className="px-10 py-12">
      <Header title="Low Stock Medicines" subtitle="Monitor and replenish critical inventory items."><button className="h-12 rounded-lg border border-[#40536c] bg-white px-6 text-[18px]">Filters</button><button className="h-12 rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Download className="mr-2 inline h-5 w-5" />Export Report</button></Header>
      <div className="mt-8 grid grid-cols-3 gap-5"><BigMetric title="Low Stock Items" value="42" /><BigMetric title="Critical Stock" value="18" red /><BigMetric title="Out of Stock" value="3" darkRed /></div>
      <div className="mt-10 overflow-hidden rounded-lg border border-[#b9c8d5] bg-white"><TableHeader cols="grid-cols-[1.5fr_1.8fr_0.9fr_0.9fr_1.1fr_1.2fr_1fr]" labels={["Medicine","Form / Strength","Available","Threshold","Severity","Nearest Expiry","Action"]} dark />{lowStock.map((row)=><div key={row.id} className={cn("grid min-h-[86px] grid-cols-[1.5fr_1.8fr_0.9fr_0.9fr_1.1fr_1.2fr_1fr] items-center border-t border-[#b9c8d5] px-5 text-[17px]", row.primary && "bg-[#fff7f7]")}><span>{row.medicine}<br /><span className="text-[14px] text-[#324c71]">ID: {row.id}</span></span><span>{row.form}</span><span className={row.available < 20 ? "font-semibold text-[#c00000]" : "text-[#b25b00]"}>{row.available}</span><span>{row.threshold}</span><SeverityBadge value={row.severity} /><span>{row.expiry}</span><Link href="/pharmacy/medicines/new" className={cn("rounded-md px-4 py-2 text-center font-semibold", row.primary || row.severity==="Critical" ? "bg-[#006d86] text-white" : "border border-[#40536c]")}>⊕ Add Batch</Link></div>)}<Pagination text="Showing 1 to 5 of 63 entries" /></div>
    </section>
  );
}

function ExpiredMedicines() {
  return (
    <section className="px-8 py-10">
      <Header title="Expired Medicines" subtitle="Manage and log the disposal of expired laboratory reagents and medications."><button onClick={() => window.print()} className="h-12 rounded-lg border border-[#40536c] bg-white px-6 text-[18px]"><Printer className="mr-2 inline h-5 w-5" />Print Manifest</button></Header>
      <div className="mt-8 rounded-lg border border-[#ff8d8d] bg-[#ffd8d5] p-6 text-[#a00000]"><p className="text-[28px] font-semibold"><AlertTriangle className="mr-5 inline h-7 w-7" />Critical Safety Protocol <X className="float-right h-6 w-6" /></p><p className="ml-12 mt-2 text-[18px]">Expired medicines must not be dispensed. All items listed below require immediate secure disposal according to biohazard protocols. Ensure disposal is logged before removing items from the secure hold area.</p></div>
      <div className="mt-8 overflow-hidden rounded-lg border border-[#d7e1ea] bg-white"><div className="flex justify-between p-5"><span className="rounded-full border border-[#f5b5b5] bg-[#fff0f0] px-4 py-2 text-[18px] text-[#c00000]">12 Items Pending Disposal</span><FilterSelect label="All Manufacturers" /></div><TableHeader cols="grid-cols-[1.4fr_0.8fr_1.2fr_1fr_0.8fr_1fr_1fr]" labels={["Medicine / Reagent","Batch #","Manufacturer","Expired Date","Qty Remaining","Disposal Status","Actions"]} dark />{expired.map((row)=><div key={row.med} className="grid min-h-[102px] grid-cols-[1.4fr_0.8fr_1.2fr_1fr_0.8fr_1fr_1fr] items-center border-t border-[#d7e1ea] px-5 text-[17px]"><span>{row.med}<br /><span className="text-[14px]">{row.type}</span></span><span>{row.batch}</span><span>{row.maker}</span><span className={row.ago ? "text-[#c00000]" : "text-[#687887]"}>{row.date}<br /><span className="text-[13px] text-black">{row.ago}</span></span><span>{row.qty}</span><DisposalBadge value={row.status} /><span>{row.action.includes("Log") ? <button className="rounded-lg bg-[#006d86] px-6 py-3 text-white">{row.action}</button> : <button className="rounded-lg border bg-[#e9eef3] px-6 py-3">{row.action}</button>}</span></div>)}<Pagination text="Showing 1-4 of 12 items" /></div>
    </section>
  );
}

function OutOfStockMedicines() {
  return (
    <section className="px-[60px] py-16">
      <div className="flex items-start justify-between"><div><h1 className="text-[32px] font-semibold">Out of Stock Medicines</h1><p className="mt-2 text-[18px]">Review unavailable inventory and prioritize replenishment based on pending patient orders.</p></div><Link href="/pharmacy/medicines/new" className="flex h-12 items-center rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Plus className="mr-2 h-5 w-5" />Add Batch</Link></div>
      <div className="mt-14 grid grid-cols-3 gap-8"><BigMetric title="TOTAL OUT OF STOCK" value="24 items" darkRed /><BigMetric title="PENDING ORDERS AFFECTED" value="156 orders" /><BigMetric title="AWAITING DELIVERY" value="8 batches" /></div>
      <div className="mt-16 overflow-hidden rounded-lg border border-[#d7e1ea] bg-white"><div className="flex items-center justify-between p-8"><h2 className="text-[28px] font-semibold">Critical Shortages</h2><Filter className="h-6 w-6 text-[#344b69]" /></div><TableHeader cols="grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr]" labels={["Medicine","Form","Strength","Last Stocked","Last Dispensed","Pending Orders","Action"]} light />{[["Amoxicillin","Capsule","500mg","Oct 12, 2023","Nov 05, 2023","42 Affected","Order Now"],["Lisinopril","Tablet","20mg","Sep 28, 2023","Nov 06, 2023","28 Affected","Order Now"],["Metformin","Tablet","1000mg","Oct 01, 2023","Nov 04, 2023","15 Affected","Ordered (Nov 07)"],["Albuterol","Inhaler","90mcg","Sep 15, 2023","Nov 06, 2023","5 Affected","Order Now"]].map((row,i)=><div key={row[0]} className="grid min-h-[92px] grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center border-t border-[#e1e8ee] px-8 text-[17px]"><span><span className={cn("mr-4 inline-flex h-10 w-10 items-center justify-center rounded-full", i===0?"bg-[#fff0f0] text-[#c00000]":"bg-[#eef3f7]")}><Pill className="h-5 w-5" /></span>{row[0]}</span><span>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span><span>{row[4]}</span><span><span className={cn("rounded-full px-3 py-2 text-[15px]", i<2?"bg-[#ffd8d5] text-[#c00000]":"bg-[#dfe5ea]")}>{row[5]}</span></span><span className={row[6].startsWith("Order")?"text-[#006d86]":"text-[#8da0ba]"}>{row[6]}</span></div>)}</div>
    </section>
  );
}

function CompletedOrdersLog() {
  return (
    <section className="px-10 py-12">
      <Header title="Completed Medicine Orders" subtitle="Historical log of all dispensed prescriptions."><button className="h-12 rounded-lg border border-[#b9c8d5] bg-white px-6 text-[18px]"><Download className="mr-2 inline h-5 w-5" />Export Log</button><button onClick={() => window.print()} className="h-12 rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Printer className="mr-2 inline h-5 w-5" />Print Summary</button></Header>
      <div className="mt-10 grid grid-cols-4 gap-5 rounded-lg border border-[#b9c8d5] bg-white p-6"><InputField label="Date Range" value="Last 7 Days" /><InputField label="Prescribing Doctor" value="All Doctors" select /><InputField label="Dispensed By" value="All Dispensers" select /><InputField label="Status" value="All Completed" select /></div>
      <div className="mt-8 overflow-hidden rounded-lg border border-[#b9c8d5] bg-white"><TableHeader cols="grid-cols-[110px_1.2fr_0.8fr_2fr_1.1fr_1.2fr_0.8fr]" labels={["Order ID","Patient / MRN","Doctor","Medicines Summary","Status","Dispensed By","Completed"]} light />{completedOrders.map(row=><div key={row.id} className="grid min-h-[112px] grid-cols-[110px_1.2fr_0.8fr_2fr_1.1fr_1.2fr_0.8fr] items-center border-t border-[#b9c8d5] px-5 text-[17px]"><span className="text-[#006d86]">{row.id}</span><span>{row.patient}<br /><span className="text-[14px]">{row.mrn}</span></span><span>{row.doctor}</span><span className="whitespace-pre-line">{row.summary}</span><CompleteBadge value={row.status} /><span>{row.by}</span><span>{row.time}</span></div>)}<Pagination text="Showing 1 to 4 of 128 entries" pages /></div>
    </section>
  );
}

function FormCard({ title, icon: Icon, children }: { title: string; icon: typeof ShieldPlus; children: ReactNode }) {
  return <div className="rounded-lg border border-[#d7e1ea] bg-white p-8 shadow-sm"><h2 className="border-b border-[#d7e1ea] pb-4 text-[28px] font-semibold"><Icon className="mr-3 inline h-6 w-6 text-[#00758d]" />{title}</h2><div className="mt-8 grid grid-cols-2 gap-6">{children}</div></div>;
}

function InputField({ label, value, placeholder, select, suffix, danger, helper, full }: { label: string; value?: string; placeholder?: string; select?: boolean; suffix?: string; danger?: boolean; helper?: string; full?: boolean }) {
  return <label className={cn("text-[17px]", full && "col-span-2")}>{label}<span className={cn("mt-2 flex h-12 items-center justify-between rounded-lg border bg-white px-4 text-[17px]", danger ? "border-[#d00000] bg-[#fff3f3] text-[#c00000]" : "border-[#b9c8d5]")}><span className={!value ? "text-[#687887]" : ""}>{value ?? placeholder}</span>{suffix && <span className="text-[#b1bfca]">{suffix}</span>}{select && <ChevronDown className="h-5 w-5 text-[#687887]" />}</span>{helper && <p className="mt-2 text-[14px] text-[#d00000]">{helper}</p>}</label>;
}

function SearchInput({ placeholder }: { placeholder: string }) {
  return <span className="relative mt-2 block"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b1bfca]" /><input className="h-12 w-full rounded-lg border border-[#b9c8d5] pl-12 text-[17px]" placeholder={placeholder} /></span>;
}

function SearchBox({ placeholder, className, value, onChange }: { placeholder: string; className?: string; value: string; onChange: (value: string) => void }) {
  return <span className={cn("relative block", className)}><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8da0ba]" /><input value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full rounded-lg border border-[#d7e1ea] bg-[#f1f5f9] pl-12 text-[18px]" placeholder={placeholder} /></span>;
}

function FilterSelect({ label }: { label: string }) {
  return <button className="h-12 rounded-lg border border-[#d7e1ea] bg-white px-5 text-[18px]">{label} <ChevronDown className="ml-3 inline h-5 w-5" /></button>;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[15px] uppercase tracking-[0.04em] text-[#40536c]">{label}</p><p className="mt-2 text-[18px]">{value}</p></div>;
}

function TableHeader({ cols, labels, dark, light }: { cols: string; labels: string[]; dark?: boolean; light?: boolean }) {
  return <div className={cn("grid px-5 py-4 text-[15px] uppercase tracking-[0.04em]", cols, dark ? "bg-[#34465d] text-white" : light ? "bg-[#eef3f7] text-[#40536c]" : "bg-[#eef3f7] text-[#40536c]")}>{labels.map((label) => <span key={label}>{label}</span>)}</div>;
}

function StatusPill({ value }: { value: string }) {
  return <span className={cn("w-fit rounded-full px-3 py-2 text-[15px]", value === "New" || value === "New Order" ? "bg-[#e7f8fc] text-[#00758d]" : value === "Processing" ? "bg-[#7bdcff] text-[#00627c]" : "bg-[#dfe5ea] text-[#2f3d4c]")}>• {value}</span>;
}

function StockBadge({ value }: { value: string }) {
  return <span className={cn("w-fit rounded-full px-3 py-1 text-[15px]", value === "In Stock" ? "bg-[#d8f3df] text-[#00802b]" : value === "Low Stock" ? "bg-[#fff0df] text-[#b25b00]" : "bg-[#ffd8d5] text-[#c00000]")}>{value}</span>;
}

function StockAvail({ value }: { value: string }) {
  return <span className={cn("w-fit rounded-full px-3 py-2 text-[15px]", value === "Available" ? "bg-[#0089a5] text-white" : value === "Partial" ? "bg-[#b46600] text-white" : "bg-[#ffd8d5] text-[#c00000]")}>{value}</span>;
}

function SeverityBadge({ value }: { value: string }) {
  return <span className={cn("w-fit rounded-md px-3 py-2 text-[15px]", value === "Out of Stock" ? "bg-[#c91419] text-white" : value === "Critical" ? "bg-[#ffd8d5] text-[#c00000]" : "bg-[#fff0df] text-[#b25b00]")}>{value}</span>;
}

function DisposalBadge({ value }: { value: string }) {
  return <span className={cn("w-fit rounded-md px-3 py-2 text-[15px]", value === "Pending" ? "bg-[#fff0f0] text-[#c00000] border border-[#f5b5b5]" : value === "In Transit" ? "bg-[#fff0df] text-[#9a4b00] border border-[#e3bd83]" : "bg-[#dfe5ea] text-[#687887]")}>{value}</span>;
}

function CompleteBadge({ value }: { value: string }) {
  return <span className={cn("w-fit rounded-full px-4 py-3 text-[16px]", value.startsWith("Fully") ? "bg-[#d8f3df] text-[#00802b]" : "bg-[#e1e6eb] text-[#2f3d4c]")}>• {value}</span>;
}

function Avatar({ initials, large }: { initials: string; large?: boolean }) {
  return <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-[#d8e4ff] text-[#324c71]", large ? "h-[60px] w-[60px] text-[24px]" : "h-10 w-10")}>{initials}</span>;
}

function MiniCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return <div className="rounded-lg border border-[#b9c8d5] bg-white p-6"><p className="text-[20px]">{title}</p><p className="mt-3 text-[30px] font-semibold">{value}</p><p className="mt-2 text-[15px]">{helper}</p></div>;
}

function InfoPanel() {
  const rows = [["Generic Name", "Amoxicillin"], ["Dosage Form", "Capsule, Oral"], ["Strength", "500 mg"], ["Storage", "Room Temp (20-25°C)"], ["Rx Required", "Yes"]];
  return <div className="rounded-lg border border-[#b9c8d5] bg-white p-8"><h2 className="mb-6 text-[28px] font-semibold"><InfoIcon className="mr-3 inline h-7 w-7 text-[#00758d]" />Medicine Information</h2>{rows.map(([a,b]) => <p key={a} className="flex justify-between border-b border-[#d7e1ea] py-4 text-[17px] last:border-0"><span>{a}</span><b>{b}</b></p>)}</div>;
}

function BatchesTable() {
  const rows = [["AMX-2023-88A","Shelf A-12","800","Nov 2025","Optimal"],["AMX-2023-42B","Shelf B-04","300","Dec 2023","Expires Soon"],["AMX-2022-19C","Quarantine Bin","140","Aug 2023","Expired"]];
  return <div className="overflow-hidden rounded-lg border border-[#b9c8d5] bg-white"><div className="flex justify-between p-6"><h2 className="text-[28px] font-semibold">Current Batches</h2><button className="text-[18px] text-[#006d86]">View All Batches</button></div><TableHeader cols="grid-cols-[1.3fr_1.3fr_0.5fr_1fr_1fr]" labels={["Batch #","Location","Qty","Expiry Date","Status"]} light />{rows.map(row=><div key={row[0]} className="grid min-h-[72px] grid-cols-[1.3fr_1.3fr_0.5fr_1fr_1fr] items-center border-t border-[#d7e1ea] px-5 text-[17px]"><span className="text-[#006d86]">{row[0]}</span><span>{row[1]}</span><span className={row[4]==="Expired"?"text-[#c00000]":""}>{row[2]}</span><span className={row[4]!=="Optimal"?"text-[#a44b00]":""}>{row[3]}</span><span><SeverityBadge value={row[4]} /></span></div>)}</div>;
}

function MovementTable() {
  const rows = [["Oct 24, 2023 - 14:30","↑ Dispense","-30","RX-99201","J. Smith"],["Oct 24, 2023 - 09:15","↑ Dispense","-60","RX-99184","M. Davis"],["Oct 22, 2023 - 11:00","↓ Receive","+800","PO-2023-114","A. Wilson"],["Oct 20, 2023 - 16:45","↑ Dispense","-45","RX-99012","J. Smith"]];
  return <div className="overflow-hidden rounded-lg border border-[#b9c8d5] bg-white"><h2 className="p-6 text-[28px] font-semibold">Recent Stock Movement</h2><TableHeader cols="grid-cols-[1.7fr_1fr_0.5fr_1fr_1fr]" labels={["Date & Time","Type","Qty","Reference / Rx","User"]} light />{rows.map(row=><div key={row[0]} className="grid min-h-[68px] grid-cols-[1.7fr_1fr_0.5fr_1fr_1fr] items-center border-t border-[#d7e1ea] px-5 text-[17px]"><span>{row[0]}</span><span className={row[1].includes("Dispense")?"text-[#d00000]":"text-[#006d86]"}>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span><span>{row[4]}</span></div>)}</div>;
}

function DispenseItem({ name, meta, qty, ok, warning, disabled }: { name: string; meta: string; qty: string; ok?: boolean; warning?: boolean; disabled?: boolean }) {
  return <div className={cn("mb-5 rounded-lg border bg-white p-5", warning && "border-[#d00000] bg-[#fff8f8]", disabled && "opacity-55")}><div className="flex justify-between"><div><h3 className="text-[26px] font-semibold"><span className="mr-3 rounded bg-[#bdf3ff] px-3 py-1 text-[13px]">RX</span>{name}</h3><p className="mt-2 text-[18px] text-[#40536c]">{meta}</p></div><p className="text-right uppercase text-[#40536c]">Requested Qty<br /><b className="text-[30px] text-black">{qty}</b> tabs</p></div><div className="mt-5 border-t border-[#d7e1ea] pt-5"><p className="mb-2 uppercase tracking-[0.04em] text-[#40536c]">Dosage Instructions</p><div className="rounded-lg bg-[#eef3f7] p-4">{warning ? "Take 1 tablet by mouth daily in the morning." : disabled ? "Cannot dispense. Only available batch is expired (Oct 2023). Item requires restock." : "Take 1 tablet daily by mouth in the evening. Do not take with grapefruit juice."}</div>{warning && <div className="mt-5 rounded-lg bg-[#ffd8d5] p-4 text-[#c00000]"><AlertTriangle className="mr-2 inline h-5 w-5" />Insufficient stock across all active batches. Maximum available to dispense is 45 tabs.</div>}<div className="mt-5 grid grid-cols-[1fr_120px_50px] gap-5"><InputField label="Select Batch" value={disabled ? "No valid batches available" : warning ? "Batch #LS-992-X • Exp: Jan 2025 • Stock: 45 (LOW)" : "Batch #AT-2023-A • Exp: Dec 2024 • Stock: 150"} select /><InputField label="Dispense" value={warning ? "45" : ok ? "30" : "0"} danger={warning} />{ok && <CheckCircle2 className="mt-9 h-10 w-10 text-[#00a844]" />}{warning && <CircleAlert className="mt-9 h-8 w-8 text-[#d00000]" />}</div></div></div>;
}

function BigMetric({ title, value, red, darkRed }: { title: string; value: string; red?: boolean; darkRed?: boolean }) {
  return <div className="rounded-lg border border-[#b9c8d5] bg-white p-8"><span className={cn("mb-7 flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-[#eef3f7]", red && "bg-[#ffd8d5] text-[#c00000]", darkRed && "bg-[#c91419] text-white")}><AlertTriangle className="h-7 w-7" /></span><p className="uppercase tracking-[0.04em] text-[#40536c]">{title}</p><p className={cn("mt-3 text-[40px] font-semibold", darkRed && "text-[#c00000]")}>{value}</p></div>;
}

function Pagination({ text, pages }: { text: string; pages?: boolean }) {
  return <div className="flex h-[80px] items-center justify-between border-t border-[#d7e1ea] px-5 text-[17px]"><span>{text}</span>{pages ? <span className="flex items-center gap-6"><ChevronLeft className="text-[#b1bfca]" /><b className="rounded bg-[#006d86] px-4 py-3 text-white">1</b>2 3 ... <ChevronRight /></span> : <span className="flex gap-3"><button className="rounded border border-[#d7e1ea] p-3 text-[#b1bfca]"><ChevronLeft /></button><button className="rounded border border-[#d7e1ea] p-3"><ChevronRight /></button></span>}</div>;
}
