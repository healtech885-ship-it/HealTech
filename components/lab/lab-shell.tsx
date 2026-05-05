"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Filter,
  FlaskConical,
  Grid2X2,
  HelpCircle,
  LayoutGrid,
  LogOut,
  MoreVertical,
  Plus,
  Printer,
  Save,
  Search,
  Send,
  Settings,
  SquarePen,
  Table2,
  User,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type LabShellProps = {
  segments?: string[];
};

const orders = [
  { id: "#ORD-8924", time: "08:45 AM", patient: "Eleanor Vance", dob: "12/05/1982", sex: "F", doctor: "Dr. J. Montague", tests: "3 Tests", detail: "CBC, CMP...", priority: "Urgent", status: "New" },
  { id: "#ORD-8923", time: "08:12 AM", patient: "Marcus Brody", dob: "03/22/1975", sex: "M", doctor: "Dr. H. Jones", tests: "1 Test", detail: "A1C", priority: "Normal", status: "New" },
  { id: "#ORD-8920", time: "Yesterday", patient: "Sarah Connor", dob: "09/14/1965", sex: "F", doctor: "Dr. P. Silberman", tests: "2 Tests", detail: "Thyroid Panel", priority: "Normal", status: "In Progress" },
];

const pending = [
  { id: "ORD-9281A", initials: "JS", patient: "Smith, John", mrn: "MRN-44291", priority: "STAT", done: 2, total: 5, status: "Draft Saved", updated: "10 mins ago", tone: "red" },
  { id: "ORD-9274B", initials: "AL", patient: "Lee, Amanda", mrn: "MRN-88123", priority: "Routine", done: 8, total: 9, status: "Needs Completion", updated: "1 hr ago", tone: "amber" },
  { id: "ORD-9260C", initials: "RC", patient: "Chen, Robert", mrn: "MRN-55410", priority: "Routine", done: 1, total: 3, status: "Draft Saved", updated: "3 hrs ago", tone: "blue" },
];

const completed = [
  { id: "ORD-9021A", initials: "ES", patient: "Eleanor Shellstrop", mrn: "MRN: 443-82-991", doctor: "Dr. M. Akim", count: "3", tests: "(CBC, BMP, Lipid)", flags: "Normal", time: "10:42 AM Today", status: "Submitted" },
  { id: "ORD-9022B", initials: "CD", patient: "Chidi Anagonye", mrn: "MRN: 882-11-042", doctor: "Dr. T. Al-Jamil", count: "1", tests: "(Thyroid Panel)", flags: "1 High", time: "09:15 AM Today", status: "Reviewed" },
  { id: "ORD-9018C", initials: "TJ", patient: "Tahani Al-Jamil", mrn: "MRN: 771-44-320", doctor: "Dr. S. Mendoza", count: "2", tests: "(CMP, Urinalysis)", flags: "2 Low", time: "08:05 AM Today", status: "Submitted" },
  { id: "ORD-8995D", initials: "JM", patient: "Jason Mendoza", mrn: "MRN: 112-99-883", doctor: "Dr. M. Akim", count: "4", tests: "(Hep Panel, HIV, Syphilis)", flags: "Normal", time: "Yesterday, 4:30 PM", status: "Reviewed" },
];

const catalog = [
  { name: "Complete Blood Count (CBC)", code: "HEM-1001", category: "Hematology", sample: "Blood (Whole)", unit: "Various\nSee individual parameters", turnaround: "2-4 Hours", status: "Active" },
  { name: "Fasting Blood Sugar (FBS)", code: "CHE-2045", category: "Chemistry", sample: "Blood (Serum)", unit: "mg/dL\n70 - 99", turnaround: "1 Hour", status: "Active" },
  { name: "Lipid Profile", code: "CHE-2088", category: "Chemistry", sample: "Blood (Serum)", unit: "mg/dL\nSee parameters", turnaround: "2 Hours", status: "Active" },
  { name: "Urinalysis (Routine)", code: "MIC-3012", category: "Microbiology", sample: "Urine", unit: "Various\n-", turnaround: "1 Hour", status: "Inactive" },
];

const resultRows = [
  { name: "Glucose", category: "Chemistry", unit: "mg/dL", range: "70 - 99" },
  { name: "BUN", category: "Chemistry", unit: "mg/dL", range: "6 - 20" },
  { name: "Creatinine", category: "Chemistry", unit: "mg/dL", range: "0.57 - 1.00" },
  { name: "Sodium", category: "Electrolytes", unit: "mmol/L", range: "134 - 144" },
];

export function LabShell({ segments = [] }: LabShellProps) {
  const pathname = usePathname();
  const screen = resolveLabScreen(segments);

  return (
    <div className="min-h-screen bg-[#f3f8fc] text-[#101820]">
      <LabSidebar activePath={pathname} />
      <main className="min-h-screen lg:pl-[320px]">
        <LabTopbar screen={screen} />
        {screen === "dashboard" && <LabDashboard />}
        {screen === "orders" && <LabOrdersQueue />}
        {screen === "details" && <LabOrderDetails />}
        {screen === "enter" && <EnterLabResults />}
        {screen === "pending" && <PendingResults />}
        {screen === "completed" && <CompletedResults />}
        {screen === "catalog" && <LabTestCatalog />}
      </main>
    </div>
  );
}

function resolveLabScreen(segments: string[]) {
  const path = segments.join("/");
  if (!path || path === "dashboard") return "dashboard";
  if (path === "orders") return "orders";
  if (path === "orders/pending") return "pending";
  if (path === "orders/completed") return "completed";
  if (path === "tests") return "catalog";
  if (path.includes("enter") || path.includes("results")) return "enter";
  if (path.startsWith("orders/")) return "details";
  return "dashboard";
}

function LabSidebar({ activePath }: { activePath: string }) {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const nav = [
    { label: "Dashboard", href: "/lab/dashboard", icon: Grid2X2 },
    { label: "Lab Orders Queue", href: "/lab/orders", icon: ClipboardList },
    { label: "Pending Results", href: "/lab/orders/pending", icon: ClipboardCheck },
    { label: "Completed Results", href: "/lab/orders/completed", icon: CheckCircle2 },
    { label: "Lab Test Catalog", href: "/lab/tests", icon: FlaskConical },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[320px] border-r border-[#d5dee7] bg-[#f7fbff] lg:flex lg:flex-col">
      <div className="px-10 py-7">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#078aa1] text-white shadow-sm">
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
            (item.href === "/lab/orders" && activePath.startsWith("/lab/orders/") && !activePath.includes("pending") && !activePath.includes("completed"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-[50px] items-center gap-5 rounded-md border-r-2 border-transparent px-5 text-[18px] text-[#243853]",
                active && "border-[#008db0] bg-white font-medium text-[#0082a1] shadow-sm",
              )}
            >
              <item.icon className="h-6 w-6" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[#d5dee7] px-10 py-7">
        <div className="mb-7 flex items-center gap-5 text-[18px] text-[#243853]">
          <HelpCircle className="h-6 w-6" /> Support
        </div>
        <button onClick={handleLogout} className="flex items-center gap-5 text-[18px] text-[#243853]">
          <LogOut className="h-6 w-6" /> Logout
        </button>
      </div>
    </aside>
  );
}

function LabTopbar({ screen }: { screen: string }) {
  const placeholder = screen === "catalog" ? "Search tests, categories, or keywords..." : screen === "dashboard" ? "Search patients, tests..." : "Search orders, patients...";
  const showCenterTitle = ["orders", "details", "enter"].includes(screen);
  return (
    <header className="sticky top-0 z-20 h-[88px] border-b border-[#d9e2ea] bg-white">
      <div className="flex h-full items-center gap-8 px-8">
        {showCenterTitle && <p className="text-[28px] font-semibold">CliniSync Lab</p>}
        <div className={cn("relative", showCenterTitle ? "w-[320px]" : "w-[410px]")}>
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#7d91a8]" />
          <input className="h-12 w-full rounded-lg border border-[#c5d1de] bg-[#f6f9fc] pl-12 text-[18px] outline-none focus:border-[#00758d]" placeholder={placeholder} />
        </div>
        {!showCenterTitle && <div className="flex-1" />}
        {showCenterTitle && <div className="flex-1" />}
        <div className="flex items-center gap-7 text-[#344b69]">
          <Bell className="h-6 w-6" />
          <Settings className="h-7 w-7" />
          <span className="h-8 border-l border-[#d6e0ea]" />
          <div className="flex items-center gap-3">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="text-right">
              <p className="text-[18px]">Lab Technician</p>
              {screen === "catalog" && <p className="text-[15px] text-[#40536c]">Lab Technician</p>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function LabDashboard() {
  return (
    <section className="px-10 py-12">
      <PageHeader title="Lab Dashboard" subtitle="Overview of today's laboratory operations and priorities.">
        <button onClick={() => window.print()} className="h-12 rounded-lg border border-[#b9c8d5] bg-white px-6 text-[18px]"><Printer className="mr-2 inline h-5 w-5" />Print Summary</button>
        <Link href="/lab/orders" className="flex h-12 items-center rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Plus className="mr-2 h-5 w-5" />New Order</Link>
      </PageHeader>

      <div className="mt-10 grid grid-cols-4 gap-5">
        <StatCard title="New Lab Orders" value="18" icon={FileText} tone="blue" />
        <StatCard title="Pending Results" value="9" icon={Clock} tone="amber" />
        <StatCard title="Completed Today" value="27" icon={CheckCircle2} tone="green" />
        <StatCard title="Urgent Orders" value="3" icon={AlertTriangle} tone="red" />
      </div>

      <div className="mt-10 grid grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          <div className="rounded-[14px] border border-[#c6d6e2] bg-[#eafbff] p-8 shadow-sm">
            <h2 className="text-[28px] font-semibold">Quick Actions</h2>
            <div className="mt-6 grid grid-cols-4 gap-5">
              <QuickAction href="/lab/orders" icon={ClipboardList} label="Queue" />
              <QuickAction href="/lab/orders/ord-992-xyz/enter" icon={SquarePen} label="Enter Results" />
              <QuickAction href="/lab/orders/completed" icon={FileText} label="Completed" />
              <QuickAction href="/lab/tests" icon={FlaskConical} label="Catalog" />
            </div>
          </div>
          <NewOrdersTable />
        </div>
        <PendingCard />
      </div>
    </section>
  );
}

function PageHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[40px] font-semibold">{title}</h1>
        <p className="mt-2 text-[20px] text-[#2f3d4c]">{subtitle}</p>
      </div>
      {children && <div className="flex gap-3">{children}</div>}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, tone }: { title: string; value: string; icon: typeof FileText; tone: "blue" | "amber" | "green" | "red" }) {
  const toneClass = {
    blue: "bg-[#e9faff] text-[#006d86]",
    amber: "bg-[#fff1e8] text-[#9a4b00]",
    green: "bg-[#d8f8e3] text-[#007b2a]",
    red: "bg-[#ffd8d5] text-[#a00000]",
  }[tone];
  return (
    <div className={cn("min-h-[220px] rounded-[14px] border bg-white p-8", tone === "red" ? "border-[#f2b7b3]" : "border-[#b9c8d5]")}>
      <div className={cn("flex h-[58px] w-[58px] items-center justify-center rounded-lg", toneClass)}>
        <Icon className="h-7 w-7" />
      </div>
      <p className="mt-7 text-[19px]">{title}</p>
      <p className={cn("mt-3 text-[42px] font-semibold", tone === "red" && "text-[#c00000]")}>{value}</p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof ClipboardList; label: string }) {
  return (
    <Link href={href} className="flex h-[136px] flex-col items-center justify-center rounded-lg border border-[#b9c8d5] bg-white text-[20px] shadow-sm">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8eef2]"><Icon className="h-7 w-7 text-[#33485f]" /></span>
      {label}
    </Link>
  );
}

function NewOrdersTable() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#b9c8d5] bg-white">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-[28px] font-semibold">New Lab Orders</h2>
        <Link href="/lab/orders" className="flex items-center gap-2 text-[18px] font-semibold text-[#006d86]">View All <ChevronRight className="h-5 w-5" /></Link>
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_90px] bg-[#52657f] px-6 py-4 text-[16px] font-semibold uppercase tracking-[0.04em] text-white">
        <span>Patient</span><span>Doctor</span><span>Tests</span><span>Priority</span><span>Action</span>
      </div>
      {[
        ["Sarah Jenkins\nID: P-4492", "Dr. Reynolds", "CBC, Lipid\nPanel", "ROUTINE"],
        ["Marcus\nChen\nID: P-8120", "Dr. Hayes", "Troponin,\nBMP", "URGENT"],
        ["Elena\nRodriguez\nID: P-3315", "Dr. Smith", "Thyroid Panel", "ROUTINE"],
      ].map((row, index) => (
        <div key={row[0]} className={cn("grid min-h-[102px] grid-cols-[1fr_1fr_1fr_1fr_90px] items-center border-t border-[#e1e6eb] px-6 text-[17px]", index === 1 && "border-l-4 border-l-[#d00000]")}>
          <span className="whitespace-pre-line">{row[0]}</span><span>{row[1]}</span><span className="whitespace-pre-line">{row[2]}</span>
          <span><PriorityBadge value={row[3]} /></span>
          <Link href="/lab/orders/ord-992-xyz"><Send className="h-5 w-5 text-[#00758d]" /></Link>
        </div>
      ))}
    </div>
  );
}

function PendingCard() {
  return (
    <aside className="rounded-[14px] border border-[#b9c8d5] bg-white p-8">
      <div className="flex items-center justify-between border-b border-[#b9c8d5] pb-4">
        <h2 className="text-[28px] font-semibold">Pending Results</h2>
        <span className="rounded-full bg-[#e1e6eb] px-3 py-2 text-[14px]">9 Total</span>
      </div>
      <div className="mt-5 space-y-3">
        <div className="rounded-lg border border-[#ffc799] bg-[#fffaf7] p-5">
          <div className="flex justify-between"><p className="text-[20px]">O-2291: Urinalysis</p><span className="text-[#9a4b00]">• Draft</span></div>
          <p className="mt-3 text-[17px] text-[#3e4b5a]">Patient: J. Doe</p>
          <div className="mt-4 h-1 rounded bg-[#e5edf2]"><div className="h-full w-3/4 bg-[#9a4b00]" /></div>
          <Link href="/lab/orders/ord-992-xyz/enter" className="mt-6 block text-center text-[18px] font-medium text-[#8a3b00]">Continue Entry</Link>
        </div>
        {["O-2288: CMP|Patient: A. Smith|Awaiting analyzer data", "O-2285: HbA1c|Patient: T. Wong|Processing"].map((item) => {
          const [title, patient, status] = item.split("|");
          return <div key={title} className="rounded-lg border border-[#b9c8d5] p-5"><p className="text-[20px]">{title}</p><p className="mt-3 text-[17px] text-[#3e4b5a]">{patient}</p><p className="mt-4 text-[15px]"><Clock className="mr-1 inline h-4 w-4" />{status}</p></div>;
        })}
      </div>
      <Link href="/lab/orders/pending" className="mt-[120px] block rounded-lg border border-[#b9c8d5] py-3 text-center text-[18px]">View All Pending</Link>
    </aside>
  );
}

function LabOrdersQueue() {
  const [tab, setTab] = useState("New Orders");
  const rows = useMemo(() => (tab === "New Orders" ? orders : orders.filter((order) => order.status === "In Progress")), [tab]);
  return (
    <section className="px-8 py-10">
      <PageHeader title="Lab Orders Queue" subtitle="Manage and process incoming laboratory test requests.">
        <button className="h-12 rounded-md border border-[#40536c] bg-white px-6 text-[18px]"><Download className="mr-2 inline h-5 w-5" />Export</button>
        <button className="h-12 rounded-md bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Plus className="mr-2 inline h-5 w-5" />New Order</button>
      </PageHeader>
      <div className="mt-8 overflow-hidden rounded-lg border border-[#b9c8d5] bg-white">
        <div className="flex h-[70px] items-end gap-8 border-b border-[#d6e0ea] px-5">
          {["New Orders", "In Progress", "Results Drafted", "Submitted", "Cancelled"].map((item, index) => (
            <button key={item} onClick={() => setTab(item)} className={cn("h-full border-b-2 border-transparent px-3 text-[18px]", tab === item && "border-[#00758d] text-[#006d86]")}>
              {item} {index < 3 && <span className="ml-2 rounded-md bg-[#d7e6ef] px-2 py-1 text-[12px]">{[12, 8, 3][index]}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-5 p-5">
          <SearchBox placeholder="Search by Order ID or Patient..." className="w-[405px]" />
          <div className="ml-auto flex gap-3">
            <FilterButton icon={Calendar} label="Today" />
            <FilterButton icon={AlertTriangle} label="Priority" />
            <FilterButton icon={Activity} label="Doctor" />
            <X className="mt-3 h-6 w-6" />
          </div>
        </div>
        <div className="grid grid-cols-[170px_1.3fr_1fr_0.8fr_0.8fr_0.8fr_0.7fr] bg-[#40536c] px-5 py-3 text-[15px] uppercase tracking-[0.04em] text-white">
          <span>Lab Order ID</span><span>Patient</span><span>Doctor</span><span>Tests</span><span>Priority</span><span>Status</span><span className="text-right">Actions</span>
        </div>
        {rows.map((order) => (
          <div key={order.id} className="grid min-h-[92px] grid-cols-[170px_1.3fr_1fr_0.8fr_0.8fr_0.8fr_0.7fr] items-center border-b border-[#d6e0ea] px-5 text-[17px]">
            <span><Link href="/lab/orders/ord-992-xyz" className="text-[19px] font-semibold text-[#006d86]">{order.id}</Link><br />{order.time}</span>
            <span>{order.patient}<br /><span className="text-[15px]">DOB: {order.dob} • {order.sex}</span></span>
            <span>{order.doctor}</span>
            <span><FlaskConical className="mr-1 inline h-4 w-4" />{order.tests}<br /><span className="text-[15px]">{order.detail}</span></span>
            <span>{order.priority === "Urgent" ? <span className="rounded bg-[#ffd8d5] px-3 py-1 text-[#c00000]"><AlertTriangle className="mr-1 inline h-4 w-4" />Urgent</span> : "Normal"}</span>
            <span><span className={cn("rounded-md px-3 py-1", order.status === "New" ? "border border-[#80d5ff] text-[#0090ca]" : "bg-[#fff0df] text-[#9a4b00]")}>{order.status}</span></span>
            <span className="text-right"><Link href="/lab/orders/ord-992-xyz" className={cn("rounded-md px-4 py-2", order.status === "New" ? "bg-[#006d86] text-white" : "border border-[#6b7b8d]")}>{order.status === "New" ? "Process" : "View"}</Link></span>
          </div>
        ))}
        <TableFooter text="Showing 1-3 of 12 orders" />
      </div>
    </section>
  );
}

function LabOrderDetails() {
  return (
    <section className="px-8 py-9">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[40px] font-semibold">ORD-992-XYZ <span className="ml-5 align-middle rounded-sm border border-[#f8b2b2] bg-[#ffdada] px-3 py-1 text-[18px] text-[#9b0000]">* STAT</span></h1>
          <p className="mt-3 text-[20px]"><User className="mr-2 inline h-5 w-5" />Sarah Jenkins <span className="mx-5 text-[#b6c0ca]">•</span><ClipboardCheck className="mr-2 inline h-5 w-5" />MRN: 45890-AB <span className="mx-5 text-[#b6c0ca]">•</span><Clock className="mr-2 inline h-5 w-5" />Ordered: Today, 08:30 AM</p>
        </div>
        <button onClick={() => window.print()} className="h-12 border border-[#40536c] bg-white px-6 text-[18px] text-[#00627c]"><Printer className="mr-2 inline h-5 w-5" />Print Labels</button>
      </div>
      <div className="mt-8 grid grid-cols-[1fr_385px] gap-8">
        <PatientSummaryCard />
        <OrderInfoCard />
      </div>
      <div className="mt-8 overflow-hidden rounded-lg border border-[#b9c8d5] bg-white">
        <h2 className="p-7 text-[28px] font-semibold"><FlaskConical className="mr-3 inline h-7 w-7 text-[#00758d]" />Ordered Tests (2)</h2>
        <div className="grid grid-cols-[100px_1.4fr_0.9fr_1.6fr_0.6fr] bg-[#52657f] px-5 py-4 text-[16px] uppercase tracking-[0.04em] text-white">
          <span>Test<br />Code</span><span>Test Description</span><span>Specimen</span><span>Doctor Notes</span><span className="text-right">Status</span>
        </div>
        {[
          ["TST-101", "Complete Blood Count (CBC)", "Whole Blood (Purple Top)", "Check for anemia related to recent fatigue."],
          ["TST-204", "Comprehensive Metabolic Panel", "Serum (SST)", "Fasting since 10pm. Ensure sample is spun within 2hrs."],
        ].map((row) => (
          <div key={row[0]} className="grid min-h-[92px] grid-cols-[100px_1.4fr_0.9fr_1.6fr_0.6fr] items-center border-b border-[#d6e0ea] px-5 text-[18px]">
            <span className="text-[#006d86]">{row[0]}</span><span>{row[1]}</span><span><span className="rounded bg-[#e7ecef] px-3 py-2 text-[14px]">{row[2]}</span></span><span className="italic">{row[3]}</span><span className="text-right"><span className="rounded-full bg-[#ffdcbf] px-3 py-1 text-[16px]">☻ Pending</span></span>
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-end">
        <Link href="/lab/orders/ord-992-xyz/enter" className="flex h-[70px] items-center bg-[#00758d] px-11 text-[20px] font-semibold text-white shadow-md"><SquarePen className="mr-3 h-7 w-7" />Start Entering Results</Link>
      </div>
    </section>
  );
}

function PatientSummaryCard() {
  return (
    <div className="rounded-lg border border-[#b9c8d5] bg-white p-8">
      <h2 className="border-b border-[#d6e0ea] pb-4 text-[28px] font-semibold"><Activity className="mr-3 inline h-7 w-7 text-[#00758d]" />Patient Summary</h2>
      <div className="mt-6 grid grid-cols-4 gap-8 text-[17px]">
        <Info label="Date of Birth (Age)" value="10/12/1985 (38y)" />
        <Info label="Gender" value="Female" />
        <Info label="Blood Type" value="A+" />
        <Info label="Primary Contact" value="(555) 019-9283" />
      </div>
      <p className="mt-7 text-[16px]">Known Allergies</p>
      <span className="mt-2 inline-block rounded bg-[#eef3f7] px-3 py-2 text-[18px]">Penicillin, Latex</span>
    </div>
  );
}

function OrderInfoCard() {
  return (
    <div className="rounded-lg border border-[#b9c8d5] bg-white p-8">
      <h2 className="border-b border-[#d6e0ea] pb-4 text-[28px] font-semibold"><ClipboardCheck className="mr-3 inline h-7 w-7 text-[#00758d]" />Order Info</h2>
      <InfoLine label="Ordering Doctor" value="Dr. Emily Chen" />
      <InfoLine label="Department" value="Oncology" />
      <InfoLine label="Visit ID" value="VIS-8812" />
    </div>
  );
}

function EnterLabResults() {
  const [message, setMessage] = useState("");
  return (
    <section className="px-8 py-10">
      <PageHeader title="Enter Lab Results" subtitle="Order #ORD-2023-8921 • Accession #ACC-4491">
        <button onClick={() => setMessage("Draft saved.")} className="h-12 rounded-lg border border-[#40536c] bg-white px-6 text-[18px]">Save Draft</button>
        <button onClick={() => setMessage("Results submitted for physician review.")} className="h-12 rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white">Submit Results</button>
      </PageHeader>
      <div className="mt-7 grid grid-cols-4 gap-8 rounded-[14px] border border-[#d6e0ea] bg-white p-8 text-[18px] shadow-sm">
        <Info label="Patient" value={"Sarah Jenkins\nDOB: 12/04/1985 (38y) • F"} />
        <Info label="Ordering Physician" value={"Dr. Robert Chen\nInternal Medicine"} />
        <Info label="Collection Info" value={"Collected: 10/26/2023 08:15 AM\nFasting: Yes • Blood/Serum"} />
        <Info label="Panel Requested" value="Comprehensive Metabolic Panel (CMP)" pill />
      </div>
      <div className="mt-8 overflow-hidden rounded-[14px] border border-[#d6e0ea] bg-white">
        <h2 className="p-8 text-[28px] font-semibold">Test Results Entry</h2>
        <div className="grid grid-cols-[1fr_1.7fr_1fr_1.4fr_1.7fr] bg-[#eef3f7] px-5 py-4 text-[15px] uppercase tracking-[0.04em] text-[#40536c]">
          <span>Test Name</span><span>Result Value</span><span>Flag</span><span>Reference Range</span><span>Notes</span>
        </div>
        {resultRows.map((row) => <ResultEntryRow key={row.name} row={row} />)}
        <div className="border-t border-[#d6e0ea] p-8">
          <label className="text-[20px]">General Lab Notes (Optional)</label>
          <textarea className="mt-3 h-[125px] w-full resize-none rounded-lg border border-[#7b8997] bg-white p-4 text-[17px]" placeholder="Enter any overall observations or internal notes regarding this accession..." />
        </div>
      </div>
      {message && <p className="mt-4 text-[17px] text-[#00758d]">{message}</p>}
    </section>
  );
}

function ResultEntryRow({ row }: { row: { name: string; category: string; unit: string; range: string } }) {
  return (
    <div className="grid min-h-[86px] grid-cols-[1fr_1.7fr_1fr_1.4fr_1.7fr] items-center border-t border-[#d6e0ea] px-5 text-[18px]">
      <span>{row.name}<br /><span className="text-[15px]">{row.category}</span></span>
      <span><input className="h-11 w-[120px] rounded border border-[#6b7b8d] px-3 text-right" placeholder="Enter" /> <span className="ml-2">{row.unit}</span></span>
      <span><select className="h-11 w-[140px] rounded border border-[#6b7b8d] px-3"><option>Select...</option><option>Normal</option><option>High</option><option>Low</option></select></span>
      <span>{row.range}</span>
      <input className="h-11 rounded border border-[#6b7b8d] px-3" placeholder="Optional notes..." />
    </div>
  );
}

function PendingResults() {
  return (
    <section className="px-10 py-12">
      <PageHeader title="Pending Results" subtitle="Complete data entry for lab tests currently in progress.">
        <button className="h-12 rounded-lg border border-[#40536c] bg-white px-6 text-[18px]"><Filter className="mr-2 inline h-5 w-5" />Filter</button>
      </PageHeader>
      <div className="mt-8 overflow-hidden rounded-[14px] border border-[#b9c8d5] bg-white">
        <div className="grid grid-cols-[120px_1.2fr_110px_120px_160px_190px_135px_170px] bg-[#e6ebef] px-5 py-4 text-[15px] uppercase tracking-[0.04em] text-[#40536c]">
          <span>Lab<br />Order ID</span><span>Patient</span><span>MRN</span><span>Priority</span><span>Progress</span><span>Status</span><span>Last<br />Updated</span><span className="text-right">Action</span>
        </div>
        {pending.map((row, index) => (
          <div key={row.id} className="grid min-h-[112px] grid-cols-[120px_1.2fr_110px_120px_160px_190px_135px_170px] items-center border-t border-[#cbd6df] px-5 text-[18px]">
            <span>{row.id}</span>
            <span className="flex items-center gap-3"><Avatar initials={row.initials} tone={row.tone} />{row.patient}</span>
            <span>{row.mrn}</span>
            <span>{row.priority === "STAT" ? <span className="rounded-full bg-[#ffd8d5] px-3 py-2 text-[#c00000]"><AlertTriangle className="mr-1 inline h-4 w-4" />STAT</span> : <span className="rounded-full bg-[#e6ebef] px-3 py-2">Routine</span>}</span>
            <span>Tests <span className="ml-10 text-[14px]">{row.done}/{row.total}</span><br /><span className="mt-2 block h-1 w-[120px] rounded bg-[#dfe6ec]"><span className="block h-full rounded bg-[#00758d]" style={{ width: `${(row.done / row.total) * 100}%` }} /></span></span>
            <span>{row.status === "Needs Completion" ? <span className="rounded border border-[#ffad68] bg-[#fff0df] px-4 py-2"><AlertTriangle className="mr-1 inline h-4 w-4" />Needs Completion</span> : <span className="rounded bg-[#e1e6eb] px-4 py-2"><Save className="mr-1 inline h-4 w-4" />Draft Saved</span>}</span>
            <span>{row.updated}</span>
            <span className="text-right"><Link href="/lab/orders/ord-992-xyz/enter" className={cn("inline-flex min-h-[70px] items-center rounded-lg px-7 text-center text-[20px] font-semibold", index < 2 ? "bg-[#006d86] text-white" : "border border-[#006d86] text-[#006d86]")}>Continue<br />Entry</Link></span>
          </div>
        ))}
        <TableFooter text="Showing 1-3 of 12 pending results" />
      </div>
    </section>
  );
}

function CompletedResults() {
  return (
    <section className="px-10 py-10">
      <PageHeader title="Completed Results" subtitle="Review finalized laboratory test reports.">
        <button className="h-12 rounded-lg bg-white px-6 text-[18px] shadow"><Filter className="mr-2 inline h-5 w-5" />Filter</button>
        <button className="h-12 rounded-lg bg-white px-6 text-[18px] shadow"><Download className="mr-2 inline h-5 w-5" />Export</button>
      </PageHeader>
      <div className="mt-8 grid grid-cols-3 gap-5">
        <SummaryMetric title="Total Completed Today" value="142" helper="↗ 12% vs yesterday" icon={CheckCircle2} />
        <SummaryMetric title="Flagged Abnormalities" value="28" helper="Requires physician review" icon={AlertTriangle} red />
        <SummaryMetric title="Avg Turnaround Time" value="4h 15m" helper="↘ -30m vs average" icon={Clock} />
      </div>
      <div className="mt-8 overflow-hidden rounded-[14px] border border-[#b9c8d5] bg-white">
        <div className="grid grid-cols-[110px_1.35fr_1fr_0.8fr_1fr_1fr_1fr_120px] bg-[#f3f6f9] px-5 py-4 text-[15px] uppercase tracking-[0.04em] text-[#40536c]">
          <span>Lab<br />Order ID</span><span>Patient &amp; MRN</span><span>Doctor</span><span>Tests</span><span>Result<br />Flags</span><span>Submitted<br />Time</span><span>Status</span><span className="text-right">Actions</span>
        </div>
        {completed.map((row) => (
          <div key={row.id} className="grid min-h-[122px] grid-cols-[110px_1.35fr_1fr_0.8fr_1fr_1fr_1fr_120px] items-center border-t border-[#e1e6eb] px-5 text-[18px]">
            <span className="text-[#006d86]">{row.id}</span>
            <span className="flex items-center gap-3"><Avatar initials={row.initials} tone="blue" /> <span>{row.patient}<br /><span className="text-[14px] text-[#324c71]">{row.mrn}</span></span></span>
            <span className="text-[#344b69]">{row.doctor}</span>
            <span>{row.count} <span className="text-[14px] text-[#324c71]">{row.tests}</span></span>
            <FlagBadge value={row.flags} />
            <span className="text-[#344b69]">{row.time}</span>
            <span><span className={cn("rounded-md px-3 py-2 text-[15px]", row.status === "Reviewed" ? "bg-[#fbf0ff] text-[#7b00c8]" : "bg-[#eef5ff] text-[#0055ff]")}>{row.status}</span></span>
            <span className="text-right"><button className="rounded-lg border border-[#b9c8d5] px-5 py-3 text-[#00627c]">View<br />Results</button></span>
          </div>
        ))}
        <div className="flex h-[72px] items-center justify-between border-t border-[#b9c8d5] px-6 text-[16px]">
          <span>Showing 1-4 of 142 results</span><span className="flex items-center gap-7"><ChevronLeft className="text-[#9aa8b6]" />Page 1 of 36<ChevronRight /></span>
        </div>
      </div>
    </section>
  );
}

function LabTestCatalog() {
  const [query, setQuery] = useState("");
  const filtered = catalog.filter((item) => `${item.name} ${item.code} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="px-8 py-10">
      <PageHeader title="Lab Test Catalog" subtitle="Manage and configure available laboratory tests and parameters.">
        <button className="h-12 rounded-lg border border-[#40536c] bg-white px-6 text-[18px]"><Download className="mr-2 inline h-5 w-5" />Export</button>
        <button className="h-12 rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Plus className="mr-2 inline h-5 w-5" />Add Lab Test</button>
      </PageHeader>
      <div className="mt-8 flex items-center gap-3 rounded-lg border border-[#b9c8d5] bg-white p-3">
        <FilterSelect label="All Categories" />
        <FilterSelect label="All Sample Types" icon={FlaskConical} />
        <div className="ml-auto flex items-center gap-3"><span>View:</span><button className="rounded bg-[#dfe5ea] p-3"><Table2 /></button><button className="p-3"><LayoutGrid /></button></div>
      </div>
      <SearchBox value={query} onChange={setQuery} placeholder="Filter catalog..." className="mt-5 w-[420px]" />
      <div className="mt-5 overflow-hidden rounded-[14px] border border-[#b9c8d5] bg-white">
        <div className="grid grid-cols-[60px_1.6fr_1fr_1fr_1.1fr_1fr_0.8fr_0.7fr] bg-[#f3f6f9] px-5 py-4 text-[15px] uppercase tracking-[0.04em]">
          <span className="h-5 w-5 rounded border border-[#b9c8d5]" /><span>Test Name / Code</span><span>Category</span><span>Sample Type</span><span>Unit &amp; Range</span><span>Turnaround</span><span>Status</span><span>Actions</span>
        </div>
        {filtered.map((item) => (
          <div key={item.code} className="grid min-h-[124px] grid-cols-[60px_1.6fr_1fr_1fr_1.1fr_1fr_0.8fr_0.7fr] items-center border-t border-[#d6e0ea] px-5 text-[18px]">
            <span className="h-5 w-5 rounded border border-[#b9c8d5]" />
            <span>{item.name}<br /><span className="text-[15px] text-[#40536c]">{item.code}</span></span>
            <span><CategoryBadge value={item.category} /></span>
            <span><FlaskConical className="mr-2 inline h-5 w-5 text-[#4f5e6b]" />{item.sample}</span>
            <span className="whitespace-pre-line">{item.unit}</span>
            <span>{item.turnaround}</span>
            <span><span className={cn("rounded-full px-3 py-2 text-[15px]", item.status === "Active" ? "bg-[#d8f3df] text-[#00802b]" : "bg-[#e1e6eb] text-[#5e6974]")}>{item.status}</span></span>
            <span className="flex gap-5 text-[#6b7b8d]"><SquarePen /><MoreVertical /></span>
          </div>
        ))}
        <div className="flex h-[84px] items-center justify-between border-t border-[#b9c8d5] px-5 text-[16px]">
          <span>Showing 1-4 of 128 tests</span><span className="flex items-center gap-6"><button className="rounded border border-[#d6e0ea] p-3 text-[#b1bfca]"><ChevronLeft /></button><b>1 / 32</b><button className="rounded border border-[#d6e0ea] p-3"><ChevronRight /></button></span>
        </div>
      </div>
    </section>
  );
}

function SearchBox({ placeholder, className, value, onChange }: { placeholder: string; className?: string; value?: string; onChange?: (value: string) => void }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2" />
      <input value={value} onChange={(event) => onChange?.(event.target.value)} className="h-12 w-full rounded-md border border-[#b9c8d5] bg-white pl-12 text-[18px]" placeholder={placeholder} />
    </div>
  );
}

function FilterButton({ icon: Icon, label }: { icon: typeof Calendar; label: string }) {
  return <button className="h-11 rounded-md border border-[#b9c8d5] bg-white px-4 text-[18px]"><Icon className="mr-2 inline h-5 w-5" />{label} <ChevronDown className="ml-2 inline h-4 w-4" /></button>;
}

function FilterSelect({ label, icon: Icon = Filter }: { label: string; icon?: typeof Filter }) {
  return <button className="flex h-11 w-[320px] items-center justify-between rounded-lg bg-[#eef3f7] px-5 text-[18px]"><span><Icon className="mr-3 inline h-5 w-5 text-[#687887]" />{label}</span><ChevronDown className="h-5 w-5 text-[#687887]" /></button>;
}

function Info({ label, value, pill }: { label: string; value: string; pill?: boolean }) {
  return <div><p className="text-[15px] uppercase tracking-[0.04em] text-[#2f3d4c]">{label}</p><p className={cn("mt-2 whitespace-pre-line text-[18px]", pill && "rounded-full bg-[#d8e5ff] px-4 py-2 text-[16px]")}>{value}</p></div>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-[#e1e6eb] py-5 text-[17px] last:border-0"><span>{label}</span><b className="font-medium">{value}</b></div>;
}

function TableFooter({ text }: { text: string }) {
  return <div className="flex h-[78px] items-center justify-between border-t border-[#d6e0ea] bg-[#f7fbff] px-5 text-[16px]"><span>{text}</span><span className="flex gap-6"><ChevronLeft className="text-[#9aa8b6]" /><ChevronRight /></span></div>;
}

function PriorityBadge({ value }: { value: string }) {
  return <span className={cn("rounded-full px-3 py-2 text-[13px]", value === "URGENT" ? "bg-[#ffd8d5] text-[#c00000]" : "bg-[#fff08a] text-[#9a6b00]")}>{value}</span>;
}

function Avatar({ initials, tone }: { initials: string; tone: string }) {
  const classes: Record<string, string> = { red: "bg-[#d8e4ff]", amber: "bg-[#b86b00] text-white", blue: "bg-[#d8e4ff]", default: "bg-[#d8e4ff]" };
  return <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", classes[tone] ?? classes.default)}>{initials}</span>;
}

function SummaryMetric({ title, value, helper, icon: Icon, red }: { title: string; value: string; helper: string; icon: typeof CheckCircle2; red?: boolean }) {
  return <div className="rounded-[14px] border border-[#b9c8d5] bg-white p-8"><div className="flex justify-between"><p className="text-[19px]">{title}</p><span className={cn("flex h-10 w-10 items-center justify-center rounded-full", red ? "bg-[#ffd8d5] text-[#c00000]" : "bg-[#d8e4ff] text-[#00758d]")}><Icon /></span></div><p className="mt-6 text-[42px] font-semibold">{value}</p><p className={cn("mt-2", helper.includes("↘") || helper.includes("↗") ? "text-[#00802b]" : "text-[#324c71]")}>{helper}</p></div>;
}

function FlagBadge({ value }: { value: string }) {
  if (value === "Normal") return <span className="w-fit rounded-md bg-[#e2faeb] px-4 py-2 text-[15px] text-[#00802b]"><Check className="mr-1 inline h-4 w-4" />Normal</span>;
  if (value.includes("High")) return <span className="w-fit rounded-md bg-[#fff0f0] px-4 py-2 text-[15px] text-[#c00000]">! {value}</span>;
  return <span className="w-fit rounded-md bg-[#fff4e8] px-4 py-2 text-[15px] text-[#c24c00]">⌄ {value}</span>;
}

function CategoryBadge({ value }: { value: string }) {
  const style = value === "Hematology" ? "bg-[#e8f0ff] text-[#40536c]" : value === "Chemistry" ? "bg-[#e8d7c6] text-white" : "bg-[#e1e6eb] text-[#687887]";
  return <span className={cn("rounded-md px-3 py-2 text-[15px]", style)}>• {value}</span>;
}
