"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  Beaker,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardPlus,
  ClipboardPen,
  Cloud,
  Download,
  Edit3,
  Eye,
  Filter,
  Grid2X2,
  Heart,
  HelpCircle,
  Hospital,
  Info,
  ListFilter,
  Microscope,
  Printer,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  LogOut,
  SquareActivity,
  Stethoscope,
  Thermometer,
  UserRound,
  UsersRound,
  Wind,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type DoctorShellProps = {
  segments?: string[];
};

type VisitStatus = "Queued" | "In Progress" | "Waiting for Lab" | "Ready for Review" | "Completed";

const assignedVisits = [
  {
    queue: "#104",
    patient: "Eleanor Pena",
    initials: "EP",
    mrn: "948-221-0",
    ageSex: "62 / F",
    complaint: "Severe Chest Pain, SOB",
    priority: "High",
    status: "Queued" as VisitStatus,
    wait: "45m",
    action: "Start Visit",
  },
  {
    queue: "#108",
    patient: "Robert Fox",
    initials: "RF",
    mrn: "112-845-3",
    ageSex: "45 / M",
    complaint: "Routine Follow-up (HTN)",
    priority: "Standard",
    status: "Queued" as VisitStatus,
    wait: "12m",
    action: "Review Chart",
  },
  {
    queue: "#112",
    patient: "Kristin Watson",
    initials: "KW",
    mrn: "773-091-2",
    ageSex: "28 / F",
    complaint: "Migraine assessment",
    priority: "Standard",
    status: "Queued" as VisitStatus,
    wait: "5m",
    action: "Review Chart",
  },
];

const dashboardVisits = [
  { no: "01", patient: "Marcus Reeves", initials: "MR", mrn: "849201", complaint: "Severe Chest Pain", status: "Urgent", action: "Start" },
  { no: "02", patient: "Sarah Lin", initials: "SL", mrn: "394021", complaint: "Follow-up: Hypertension", status: "In Progress", action: "Open" },
  { no: "03", patient: "James Dawson", initials: "JD", mrn: "110293", complaint: "Persistent Cough", status: "Queued", action: "Start" },
  { no: "04", patient: "Elena Petrova", initials: "EP", mrn: "558102", complaint: "Migraine Assessment", status: "Queued", action: "Start" },
];

const completedVisits = [
  { id: "#VST-8492", patient: "Sarah Jenkins", mrn: "MRN-10042", diagnosis: "Acute Pharyngitis; Prescribed Amoxicillin", lab: "N/A", medicine: "Dispensed", time: "Today, 14:30" },
  { id: "#VST-8491", patient: "Michael Chen", mrn: "MRN-09381", diagnosis: "Routine Annual Physical; Blood panel ordered", lab: "Completed", medicine: "N/A", time: "Today, 11:15" },
  { id: "#VST-8490", patient: "Elena Rodriguez", mrn: "MRN-11205", diagnosis: "Hypertension follow-up; Medication adjusted", lab: "N/A", medicine: "Dispensed", time: "Yesterday, 16:45" },
  { id: "#VST-8489", patient: "David Thompson", mrn: "MRN-08552", diagnosis: "Sprained ankle; X-ray clear, brace provided", lab: "Completed", medicine: "Dispensed", time: "Yesterday, 09:20" },
  { id: "#VST-8488", patient: "Anita Patel", mrn: "MRN-12944", diagnosis: "Type 2 Diabetes quarterly check; A1C requested", lab: "Completed", medicine: "N/A", time: "Oct 24, 13:00" },
];

const labCategories = [
  {
    name: "Hematology",
    icon: Hospital,
    tests: [
      { id: "cbc", name: "Complete Blood Count (CBC)", subtitle: "Includes diff/PLT" },
      { id: "a1c", name: "Hemoglobin A1c", subtitle: "Glycated hemoglobin" },
      { id: "rh", name: "Blood Group & Rh Type", subtitle: "ABO grouping and Rho(D) typing" },
    ],
  },
  {
    name: "Chemistry",
    icon: Beaker,
    tests: [
      { id: "lipid", name: "Lipid Profile", subtitle: "Cholesterol, Triglycerides, HDL, LDL" },
      { id: "cmp", name: "Comprehensive Metabolic Panel (CMP)", subtitle: "14 specific tests" },
      { id: "tsh", name: "TSH (Thyroid Stimulating Hormone)", subtitle: "High sensitivity" },
    ],
  },
  {
    name: "Urinalysis",
    icon: DropletIcon,
    tests: [{ id: "urinalysis", name: "Routine Urinalysis", subtitle: "Macroscopic and microscopic exam" }],
  },
];

const labResults = [
  { test: "White Blood Cells (WBC)", result: "7.2", unit: "x10^3/uL", range: "4.5 - 11.0", flag: "Normal" },
  { test: "Red Blood Cells (RBC)", result: "4.8", unit: "x10^6/uL", range: "4.2 - 5.4", flag: "Normal" },
  { test: "Hemoglobin", result: "8.4", unit: "g/dL", range: "12.0 - 15.5", flag: "Critical Low", critical: true },
  { test: "Hematocrit", result: "32.1", unit: "%", range: "37.0 - 47.0", flag: "Low" },
  { test: "Platelets", result: "245", unit: "x10^3/uL", range: "150 - 450", flag: "Normal" },
];

function DropletIcon({ className }: { className?: string }) {
  return <Beaker className={className} />;
}

export function DoctorShell({ segments = [] }: DoctorShellProps) {
  const pathname = usePathname();
  const screen = resolveScreen(segments);

  return (
    <div className="min-h-screen bg-[#f3f8fc] text-[#111820]">
      <DoctorSidebar activePath={pathname} compactBrand={screen === "visit-overview"} />
      <main className="min-h-screen lg:pl-[320px]">
        <DoctorTopbar wideSearch={screen === "lab-results" || screen === "completed"} />
        {screen === "dashboard" && <DashboardScreen />}
        {screen === "visits" && <AssignedVisitsScreen />}
        {screen === "visit-overview" && <VisitDetailsScreen initialTab="overview" />}
        {screen === "diagnosis" && <VisitDetailsScreen initialTab="diagnosis" />}
        {screen === "lab-order" && <OrderLabTestsScreen />}
        {screen === "lab-results" && <LabResultsReviewScreen />}
        {screen === "completed" && <CompletedVisitsScreen />}
        {screen === "prescribe" && <PrescribeMedicineScreen />}
      </main>
    </div>
  );
}

function resolveScreen(segments: string[]) {
  const path = segments.join("/");
  if (!path || path === "dashboard") return "dashboard";
  if (path === "visits") return "visits";
  if (path === "visits/completed") return "completed";
  if (path === "lab-orders") return "lab-order";
  if (path === "lab-results") return "lab-results";
  if (path === "medicine-orders") return "prescribe";
  if (path.includes("diagnosis")) return "diagnosis";
  if (path.startsWith("visits/")) return "visit-overview";
  return "dashboard";
}

function DoctorSidebar({ activePath, compactBrand }: { activePath: string; compactBrand?: boolean }) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const items = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: Grid2X2 },
    { label: "My Assigned Visits", href: "/doctor/visits", icon: ClipboardPlus },
    { label: "Lab Results Review", href: "/doctor/lab-results", icon: Microscope },
    { label: "Completed Visits", href: "/doctor/visits/completed", icon: CheckCircle2 },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[320px] border-r border-[#d4dde6] bg-white lg:flex lg:flex-col">
      <div className={cn("px-8", compactBrand ? "py-8" : "py-5")}>
        {compactBrand ? (
          <div className="flex items-center gap-4">
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#0085a0] text-xl text-white">C</div>
            <p className="text-[24px] font-semibold">ClinicFlow</p>
          </div>
        ) : (
          <DoctorIdentity />
        )}
      </div>
      {compactBrand && (
        <div className="px-8 pb-9">
          <DoctorIdentity />
        </div>
      )}
      <nav className="space-y-3 px-3">
        {items.map((item) => {
          const active =
            activePath === item.href ||
            (item.href === "/doctor/visits" && activePath.startsWith("/doctor/visits/") && !activePath.includes("completed")) ||
            (item.href === "/doctor/lab-results" && activePath === "/doctor/lab-results");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-[50px] items-center gap-4 rounded-lg border border-transparent px-5 text-[18px] text-[#243853]",
                active && "border-r-2 border-[#008aae] bg-[#e7fbfd] font-semibold text-[#007390]",
                item.href === "/doctor/lab-results" && activePath === "/doctor/lab-results" && "bg-[#078aa1] text-white",
                item.href === "/doctor/visits/completed" && activePath === "/doctor/visits/completed" && "bg-[#078aa1] text-white",
              )}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[#d4dde6] px-8 py-7">
        <button onClick={handleSignOut} className="flex items-center gap-4 text-[18px] text-[#243853]">
          <LogOut className="h-6 w-6" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function DoctorIdentity() {
  return (
    <div className="flex items-center gap-4">
      <img
        src="https://randomuser.me/api/portraits/men/32.jpg"
        alt=""
        className="h-[50px] w-[50px] rounded-full border border-[#d7e2ea] object-cover"
      />
      <div>
        <p className="text-[22px] font-semibold leading-7">Dr. Clinic Manager</p>
        <p className="text-[16px] text-[#51647c]">Doctor Role</p>
      </div>
    </div>
  );
}

function DoctorTopbar({ wideSearch }: { wideSearch?: boolean }) {
  return (
    <header className="sticky top-0 z-20 h-[80px] border-b border-[#d9e2ea] bg-white">
      <div className="flex h-full items-center gap-8 px-8">
        <Link href="/doctor/dashboard" className="text-[28px] font-bold text-[#00758d]">
          ClinicFlow
        </Link>
        <div className={cn("relative", wideSearch ? "w-[560px]" : "w-[405px]")}>
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#758aa3]" />
          <input
            aria-label="Search"
            placeholder={wideSearch ? "Search patient records, IDs..." : "Search patient, MRN..."}
            className="h-[46px] w-full rounded-[14px] border border-[#c6d2de] bg-[#f1f5f9] pl-11 pr-4 text-[18px] outline-none focus:border-[#00758d]"
          />
        </div>
        <div className="ml-auto flex items-center gap-8 text-[#344b69]">
          <Bell className="h-6 w-6" />
          <Settings className="h-7 w-7" />
          <HelpCircle className="h-7 w-7" />
          {wideSearch && <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="h-10 w-10 rounded-full object-cover" />}
        </div>
      </div>
    </header>
  );
}

function DashboardScreen() {
  return (
    <section className="px-10 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-semibold">Overview</h1>
          <p className="mt-2 text-[18px] text-[#283646]">Current clinical workload and critical metrics.</p>
        </div>
        <p className="text-[18px] font-semibold text-[#40536c]">Tuesday, Oct 24 • Shift: 08:00 - 16:00</p>
      </div>

      <div className="grid grid-cols-[2.1fr_1fr_1fr_1fr_1fr] gap-5">
        <MetricCard title="Assigned Visits Today" value="24" icon={ClipboardPlus} large />
        <MetricCard title="Queued" value="8" icon={UsersRound} />
        <MetricCard title="In Progress" value="3" icon={SquareActivity} />
        <MetricCard title="Waiting Labs" value="5" icon={Beaker} mutedValue />
        <MetricCard title="Completed" value="12" icon={CheckCircle2} tealValue />
      </div>

      <div className="mt-6 flex items-center justify-between rounded-[14px] border-2 border-[#f1c2c2] bg-[#fff8f8] px-6 py-5">
        <div className="flex items-center gap-5">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#ffd8d5] text-[42px] font-bold text-[#9b0000]">*</div>
          <div>
            <p className="text-[26px] font-semibold text-[#990000]">2 Urgent Priority Visits</p>
            <p className="mt-1 text-[18px] text-[#d00000]">Requires immediate attention in Triage Bay 1.</p>
          </div>
        </div>
        <Link href="/doctor/visits" className="rounded-lg bg-[#c91419] px-7 py-3 text-[18px] font-semibold text-white">
          Review Now
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-[2fr_0.96fr] gap-8">
        <div className="overflow-hidden rounded-[14px] border border-[#b9c8d5] bg-white">
          <div className="flex items-center justify-between border-b border-[#b9c8d5] px-8 py-6">
            <h2 className="text-[26px] font-semibold">Today&apos;s Assigned Visits</h2>
            <Link href="/doctor/visits" className="flex items-center gap-2 text-[18px] font-semibold text-[#00627c]">
              View All <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-[80px_1.5fr_1.5fr_1fr_100px] bg-[#eef3f7] px-7 py-4 text-[15px] font-semibold uppercase tracking-[0.04em] text-[#40536c]">
            <span>No.</span><span>Patient</span><span>Chief Complaint</span><span>Status</span><span>Action</span>
          </div>
          {dashboardVisits.map((visit) => (
            <div key={visit.no} className="grid min-h-[82px] grid-cols-[80px_1.5fr_1.5fr_1fr_100px] items-center border-t border-[#cbd6df] px-7 text-[17px]">
              <span className="text-[#283e5c]">{visit.no}</span>
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8e4ff] text-[#54627a]">{visit.initials}</span>
                <div>
                  <p>{visit.patient}</p>
                  <p className="text-[14px] text-[#324c71]">MRN: {visit.mrn}</p>
                </div>
              </div>
              <span>{visit.complaint}</span>
              <StatusPill status={visit.status} />
              <Link href="/doctor/visits/sarah-jenkins" className={cn("rounded-md px-5 py-2 text-center font-semibold", visit.action === "Open" ? "border border-[#627487]" : "bg-[#006d86] text-white")}>
                {visit.action}
              </Link>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="rounded-[14px] border border-[#b9c8d5] bg-white p-5">
            <h2 className="mb-3 text-[17px] uppercase tracking-[0.04em] text-[#34465d]">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="h-32 rounded-lg bg-[#e9eef3] text-[18px]">
                <ClipboardPlus className="mx-auto mb-3 h-8 w-8 text-[#00758d]" /> New Chart<br />Note
              </button>
              <Link href="/doctor/medicine-orders" className="flex h-32 flex-col items-center justify-center rounded-lg bg-[#e9eef3] text-center text-[18px]">
                <ClipboardPen className="mb-3 h-8 w-8 text-[#00758d]" /> Rx Renewal
              </Link>
            </div>
          </div>
          <PendingLabsCard />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ title, value, icon: Icon, large, mutedValue, tealValue }: { title: string; value: string; icon: typeof ClipboardPlus; large?: boolean; mutedValue?: boolean; tealValue?: boolean }) {
  return (
    <div className={cn("rounded-[14px] border border-[#b9c8d5] bg-white p-8", large ? "min-h-[218px]" : "min-h-[218px]")}>
      <div className="flex items-start gap-4">
        {large ? <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0089a5] text-white"><Icon className="h-7 w-7" /></span> : <Icon className="mt-1 h-6 w-6" />}
        <p className="text-[19px] font-semibold">{title}</p>
      </div>
      <p className={cn("mt-11 text-[36px] font-bold", mutedValue && "text-[#40536c]", tealValue && "text-[#007d9b]", large && "text-[#006d86]")}>{value}</p>
      {large && <div className="mt-5 h-1.5 rounded-full bg-[#e2e9ef]"><div className="h-full w-1/2 rounded-full bg-[#00758d]" /></div>}
    </div>
  );
}

function PendingLabsCard() {
  return (
    <div className="rounded-[14px] border border-[#b9c8d5] bg-white">
      <div className="flex items-center gap-3 border-b border-[#b9c8d5] px-6 py-6">
        <Beaker className="h-7 w-7 text-[#40536c]" />
        <h2 className="text-[27px] font-semibold">Pending Labs (5)</h2>
      </div>
      <div className="space-y-3 p-5">
        <Link href="/doctor/lab-results" className="block rounded-lg border-l-4 border-[#c91419] bg-[#f5f9fd] p-4">
          <div className="flex gap-3">
            <Info className="mt-1 h-5 w-5 text-[#d00000]" />
            <div>
              <p className="text-[18px] font-semibold">STAT Bloodwork Ready</p>
              <p className="mt-1 text-[17px] leading-6 text-[#40536c]">Patient: Marcus Reeves. Troponin levels elevated.</p>
              <p className="mt-2 text-[17px] font-semibold text-[#d00000]">Review Results</p>
            </div>
          </div>
        </Link>
        {["Lipid Panel|Patient: David Chen", "Comprehensive Metabolic|Patient: Sarah Lin"].map((item) => {
          const [title, body] = item.split("|");
          return (
            <Link key={title} href="/doctor/lab-results" className="flex items-center justify-between rounded-lg border border-[#b9c8d5] px-4 py-3">
              <span><b className="text-[18px] font-medium">{title}</b><br /><span className="text-[17px] text-[#40536c]">{body}</span></span>
              <ChevronRight className="h-6 w-6 text-[#687887]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AssignedVisitsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<VisitStatus>("Queued");
  const filtered = assignedVisits.filter((visit) => (tab === "Queued" ? visit.status === "Queued" : visit.status === tab));

  return (
    <section className="px-8 py-9">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-semibold">My Assigned Visits</h1>
          <p className="mt-2 text-[18px] text-[#343d48]">Manage and track your patient queue for today.</p>
        </div>
        <button className="flex h-12 items-center gap-2 rounded-md border border-[#b9c8d5] bg-white px-4 text-[17px]">
          <ListFilter className="h-5 w-5" /> All Priorities <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-8 inline-flex rounded-lg border border-[#b9c8d5] bg-white p-1 text-[19px]">
        {(["Queued", "In Progress", "Waiting for Lab", "Ready for Review", "Completed"] as VisitStatus[]).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={cn("h-12 min-w-[155px] rounded-md px-5", tab === item && "bg-[#e5ebf1] shadow-sm")}>
            {item} {item === "Queued" && <span className="ml-2 rounded-full bg-[#d4dce3] px-2 py-0.5 text-sm">3</span>}
            {item === "Ready for Review" && <span className="ml-2 rounded-full bg-[#c71920] px-2 py-0.5 text-sm text-white">1</span>}
          </button>
        ))}
      </div>
      <div className="mt-8 overflow-hidden rounded-lg border border-[#b9c8d5] bg-white">
        <div className="grid grid-cols-[100px_1.4fr_0.55fr_1.3fr_0.75fr_0.75fr_0.65fr_1fr] bg-[#e9eef3] px-6 py-4 text-[15px] font-semibold uppercase tracking-[0.04em] text-[#40536c]">
          <span>Queue<br />No</span><span>Patient</span><span>Age/Sex</span><span>Chief Complaint</span><span>Priority</span><span>Status</span><span>Wait Time</span><span className="text-right">Action</span>
        </div>
        {filtered.map((visit) => (
          <div key={visit.queue} className="grid min-h-[88px] grid-cols-[100px_1.4fr_0.55fr_1.3fr_0.75fr_0.75fr_0.65fr_1fr] items-center border-t border-[#cbd6df] px-6 text-[18px]">
            <span>{visit.queue}</span>
            <span><b className="font-medium">{visit.patient}</b><br /><span className="text-[14px] text-[#324c71]">MRN: {visit.mrn}</span></span>
            <span>{visit.ageSex}</span>
            <span>{visit.complaint}</span>
            <span className={cn("flex items-center gap-2 text-[16px]", visit.priority === "High" && "text-[#d00000]")}>{visit.priority === "High" ? <AlertTriangle className="h-5 w-5" /> : <span className="h-5 w-5 rounded-full border-2 border-[#344b69]" />} {visit.priority}</span>
            <StatusPill status={visit.status} />
            <span className={cn("flex items-center gap-2 text-[17px]", visit.wait === "45m" && "text-[#d00000]")}><ClockIcon /> {visit.wait}</span>
            <button onClick={() => router.push("/doctor/visits/sarah-jenkins")} className={cn("ml-auto h-[43px] rounded-md px-6 font-semibold", visit.action === "Start Visit" ? "bg-[#006d86] text-white" : "border border-[#677889] bg-white text-[#00627c]")}>
              {visit.action}
            </button>
          </div>
        ))}
        <div className="flex h-[62px] items-center justify-between border-t border-[#cbd6df] bg-[#e9eef3] px-8 text-[16px] text-[#40536c]">
          <span>Showing 1-3 of 3 patients</span>
          <span className="flex gap-6 text-[#99a7b3]"><ChevronLeft /><ChevronRight /></span>
        </div>
      </div>
    </section>
  );
}

function VisitDetailsScreen({ initialTab }: { initialTab: "overview" | "diagnosis" }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <section className="px-8 py-8">
      {tab === "overview" ? (
        <>
          <PatientHero />
          <VisitTabs tab={tab} setTab={setTab} />
          <div className="mt-8 grid grid-cols-[400px_1fr] gap-8">
            <PatientSummary />
            <div>
              <ChiefComplaint />
              <h2 className="mt-10 text-[21px]">Current Vitals</h2>
              <VitalsGrid />
              <ClinicalNotes />
            </div>
          </div>
        </>
      ) : (
        <DiagnosisNotesScreen setTab={setTab} />
      )}
    </section>
  );
}

function PatientHero() {
  return (
    <div className="rounded-[14px] border border-[#d6e0ea] bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="" className="h-24 w-24 rounded-full border-4 border-[#e6eef3] object-cover" />
          <div>
            <h1 className="text-[24px] leading-8">Sarah<br />Jenkins</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3 text-[18px]">
              <span className="rounded-md bg-[#f6ead9] px-3 py-1 text-[16px] text-[#a55500]">High<br />Priority</span>
              <span className="rounded-md border border-[#b8dbe8] bg-[#e7f8fc] px-3 py-2 text-[16px] text-[#00758d]">In<br />Progress</span>
              <span>MRN-94821</span>
              <span>32y (DOB: 12/04/1991)</span>
              <span>Female</span>
            </div>
          </div>
        </div>
        <div className="flex max-w-[560px] flex-wrap justify-end gap-4">
          <button className="h-[52px] rounded-lg border border-[#c4d1df] bg-white px-6 text-[20px] text-[#344b69]"><Save className="mr-2 inline h-5 w-5" />Save Progress</button>
          <Link href="/doctor/lab-orders" className="flex h-[52px] items-center rounded-lg border border-[#c4d1df] bg-white px-6 text-[20px] text-[#344b69]"><Microscope className="mr-2 h-5 w-5" />Order Lab</Link>
          <Link href="/doctor/medicine-orders" className="flex h-[52px] items-center rounded-lg border border-[#c4d1df] bg-white px-6 text-[20px] text-[#344b69]"><ClipboardPen className="mr-2 h-5 w-5" />Prescribe</Link>
          <button className="h-[52px] rounded-lg bg-[#006d86] px-6 text-[20px] text-white"><CheckCircle2 className="mr-2 inline h-5 w-5" />Complete Visit</button>
        </div>
      </div>
    </div>
  );
}

function VisitTabs({ tab, setTab }: { tab: string; setTab: (value: "overview" | "diagnosis") => void }) {
  const tabs = [
    { label: "Overview", key: "overview", icon: Eye },
    { label: "Symptoms", key: "diagnosis", icon: Stethoscope },
    { label: "Diagnosis", key: "diagnosis", icon: ClipboardPlus },
    { label: "Lab", key: "overview", icon: Beaker },
    { label: "Medicines", key: "overview", icon: Hospital },
    { label: "History", key: "overview", icon: ClockIcon },
  ] as const;
  return (
    <div className="mt-10 flex gap-9 border-b border-[#ccd8e2]">
      {tabs.map((item) => (
        <button key={item.label} onClick={() => setTab(item.key)} className={cn("flex h-[56px] items-center gap-3 px-1 text-[20px] text-[#5a6d86]", tab === item.key && item.label === "Overview" && "border-b-2 border-[#00758d] text-[#00758d]")}>
          <item.icon className="h-5 w-5" /> {item.label}
        </button>
      ))}
    </div>
  );
}

function PatientSummary() {
  return (
    <div className="rounded-[14px] border border-[#d6e0ea] bg-white p-8 shadow-sm">
      <h2 className="mb-8 flex items-center gap-4 text-[23px] font-medium"><ClipboardPlus className="h-6 w-6 text-[#40536c]" />Patient Summary</h2>
      <SummaryRow title="Blood Type" value="O+" tone="red" />
      <div className="border-b border-[#e4ebf1] py-7">
        <p className="mb-3 text-[16px] text-[#40536c]"><AlertTriangle className="mr-2 inline h-4 w-4 text-[#d00000]" />Allergies</p>
        <span className="mr-2 rounded-md border border-[#f4b8b8] bg-[#ffd8d5] px-3 py-2 text-[16px] text-[#990000]">Penicillin</span>
        <span className="rounded-md border border-[#f4b8b8] bg-[#ffd8d5] px-3 py-2 text-[16px] text-[#990000]">Latex (Mild)</span>
      </div>
      <SummaryRow title="Emergency Contact" value={"Michael Jenkins (Husband)\n+1 (555) 867-5309"} icon />
      <SummaryRow title="Insurance" value={"BlueCross Shield\nID: BC19284756"} icon />
    </div>
  );
}

function SummaryRow({ title, value, tone, icon }: { title: string; value: string; tone?: "red"; icon?: boolean }) {
  return (
    <div className="border-b border-[#e4ebf1] py-6 last:border-0">
      <div className="flex justify-between">
        <p className="text-[17px] text-[#40536c]">{icon && <Shield className="mr-2 inline h-4 w-4 text-[#00758d]" />}{title}</p>
        {tone && <span className="rounded-md border border-[#ffd1d1] bg-[#fff2f2] px-3 py-2 text-[17px] text-[#d00000]">{value}</span>}
      </div>
      {!tone && <p className="mt-4 whitespace-pre-line text-[18px] leading-6">{value}</p>}
    </div>
  );
}

function ChiefComplaint() {
  return (
    <div className="rounded-[14px] border border-[#d6e0ea] border-l-4 border-l-[#b15e00] bg-white p-8 shadow-sm">
      <h2 className="mb-3 flex items-center gap-3 text-[23px] font-medium"><UsersRound className="h-6 w-6 text-[#b15e00]" />Chief Complaint</h2>
      <p className="text-[22px]">&quot;Persistent Migraines&quot;</p>
      <p className="mt-3 text-[18px] leading-7 text-[#51647c]">Patient reports severe throbbing pain on the right side of the head, accompanied by photophobia and nausea, persisting for the last 48 hours. Pain level 8/10.</p>
    </div>
  );
}

function VitalsGrid() {
  const vitals = [
    { label: "Heart Rate", value: "78", unit: "bpm", state: "Normal", icon: Heart, color: "text-[#d00000]" },
    { label: "Blood Pressure", value: "120/80", unit: "mmHg", state: "Optimal", icon: SquareActivity, color: "text-[#00758d]" },
    { label: "Temperature", value: "98.6", unit: "°F", state: "Baseline", icon: Thermometer, color: "text-[#9a4b00]" },
    { label: "SpO2", value: "99", unit: "%", state: "Normal", icon: Wind, color: "text-[#0089a5]" },
  ];
  return (
    <div className="mt-8 grid grid-cols-4 gap-5">
      {vitals.map((vital) => (
        <div key={vital.label} className="rounded-[14px] border border-[#d6e0ea] bg-white p-5 shadow-sm">
          <p className="flex items-center gap-3 text-[18px] text-[#5a6d86]"><vital.icon className={cn("h-6 w-6", vital.color)} />{vital.label}</p>
          <p className="mt-7 text-[20px]">{vital.value} <span className="text-[14px] text-[#5a6d86]">{vital.unit}</span></p>
          <p className="mt-6 text-[15px] text-[#00912b]"><CheckCircle2 className="mr-1 inline h-4 w-4" />{vital.state}</p>
        </div>
      ))}
    </div>
  );
}

function ClinicalNotes() {
  return (
    <div className="mt-10 rounded-[14px] border border-[#d6e0ea] bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-[23px] font-medium"><ClipboardPlus className="h-7 w-7 text-[#00758d]" />Clinical Notes (Initial Assessment)</h2>
        <button className="text-[17px] text-[#00758d]"><Edit3 className="mr-2 inline h-4 w-4" />Edit</button>
      </div>
      <p className="mt-6 rounded-lg bg-[#eef3f7] p-6 text-[18px] leading-7 text-[#343d48]">Patient appears in moderate distress, preferring a darkened room. Neurological exam is unremarkable; no focal deficits noted. Neck is supple, no nuchal rigidity. Given history of episodic migraines, current presentation is consistent with a severe acute attack. Will consider acute abortive therapy and evaluate need for prophylactic management depending on frequency of future episodes.</p>
    </div>
  );
}

function DiagnosisNotesScreen({ setTab }: { setTab: (value: "overview" | "diagnosis") => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px]"><span className="rounded bg-[#dcecf2] px-3 py-1 text-[#006d86]">IN PROGRESS</span> <span className="ml-2 text-[#5a6d86]">Visit ID: V-84729</span></p>
          <h1 className="mt-3 text-[31px] font-semibold">Sarah Jenkins</h1>
          <p className="mt-1 text-[18px] text-[#343d48]">32 yrs • Female • Routine Checkup • Dr. Clinic Manager</p>
        </div>
        <div className="flex rounded-lg bg-[#e9eef3] p-1 text-[18px]">
          <button onClick={() => setTab("overview")} className="h-[46px] rounded-md px-7">Vitals</button>
          <button className="h-[46px] rounded-md bg-white px-7 text-[#006d86] shadow-sm">Diagnosis &amp; Notes</button>
          <Link href="/doctor/medicine-orders" className="flex h-[46px] items-center rounded-md px-7">Prescriptions</Link>
        </div>
      </div>
      <hr className="my-7 border-[#cbd6df]" />
      <div className="grid grid-cols-[0.82fr_1.18fr] gap-8">
        <div className="space-y-5">
          <div className="rounded-lg border border-[#d6e0ea] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-3 text-[28px] font-semibold"><Stethoscope className="h-7 w-7 text-[#00758d]" />Symptoms</h2>
            <label className="text-[19px] font-medium">Reported Symptoms</label>
            <div className="relative mt-2">
              <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#a7b6c2]" />
              <input className="h-12 w-full rounded-md border border-[#b9c8d5] bg-[#f5f9fd] pl-12 text-[18px]" placeholder="Search and add symptoms..." />
            </div>
            <div className="mt-5 flex gap-2">
              {["Fever", "Cough", "Fatigue"].map((symptom, index) => <span key={symptom} className={cn("rounded-full px-4 py-2 text-[15px]", index === 0 ? "bg-[#ffd8d5] text-[#990000]" : index === 1 ? "bg-[#dbe9ff] text-[#40536c]" : "bg-[#e1e6eb]")} >{symptom} ×</span>)}
            </div>
          </div>
          <div className="min-h-[640px] rounded-lg border border-[#d6e0ea] bg-white p-8 shadow-sm">
            <h2 className="mb-7 flex items-center gap-3 text-[28px] font-semibold"><ClipboardPlus className="h-7 w-7 text-[#00758d]" />Diagnosis</h2>
            <label className="text-[19px] font-medium">Primary Diagnosis (ICD-10)</label>
            <div className="mt-2 rounded-md border border-[#b9c8d5] bg-[#f5f9fd] px-4 py-3 text-[17px] text-[#222]"><Search className="mr-2 inline h-5 w-5 text-[#b1bfca]" />J01.90 - Acute sinusitis, unspecified</div>
            <p className="mt-5 text-[19px] font-medium">Condition Type</p>
            <div className="mt-3 flex gap-5 text-[17px]"><span><span className="mr-2 inline-block h-5 w-5 rounded-full border-[6px] border-[#00758d]" />Acute</span><span><span className="mr-2 inline-block h-5 w-5 rounded-full border border-[#b9c8d5]" />Chronic</span></div>
            <label className="mt-6 block text-[19px] font-medium">Secondary Diagnosis <span className="font-normal text-[#687887]">(Optional)</span></label>
            <div className="mt-2 rounded-md border border-[#b9c8d5] bg-[#f5f9fd] px-4 py-3 text-[17px] text-[#687887]"><Search className="mr-2 inline h-5 w-5 text-[#b1bfca]" />Search ICD-10 codes...</div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-lg border border-[#d6e0ea] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-3 text-[28px] font-semibold"><ClipboardPen className="h-7 w-7 text-[#00758d]" />Clinical Notes</h2>
              <button className="text-[18px] text-[#00627c]"><ClockIcon /> View History</button>
            </div>
            <label className="text-[19px] font-medium">Doctor&apos;s Notes (Internal)</label>
            <textarea className="mt-2 h-[250px] w-full resize-none rounded-md border border-[#b9c8d5] bg-[#f5f9fd] p-4 text-[18px]" placeholder="Enter objective findings, assessment details..." />
            <label className="mt-8 block text-[19px] font-medium">Patient Instructions (Visible to Patient)</label>
            <textarea className="mt-2 h-[210px] w-full resize-none rounded-md border border-[#b9c8d5] bg-[#f5f9fd] p-4 text-[18px]" placeholder="Enter care instructions, dietary restrictions..." />
            <p className="mt-2 text-[15px] text-[#687887]"><Eye className="mr-1 inline h-4 w-4" />These notes will appear on the patient&apos;s portal and printout.</p>
          </div>
          <div className="rounded-lg border border-[#d6e0ea] bg-white p-8 shadow-sm">
            <h2 className="mb-7 flex items-center gap-3 text-[28px] font-semibold"><Calendar className="h-7 w-7 text-[#00758d]" />Follow-up Recommendation</h2>
            <div className="grid grid-cols-2 gap-5">
              <label className="text-[18px] font-medium">Timeframe<input defaultValue="1 Week" className="mt-2 h-12 w-full rounded-md border border-[#b9c8d5] bg-[#f5f9fd] px-3" /></label>
              <label className="text-[18px] font-medium">Reason for Follow-up<input placeholder="e.g., Check symptom progression" className="mt-2 h-12 w-full rounded-md border border-[#b9c8d5] bg-[#f5f9fd] px-3" /></label>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-[320px] right-0 z-20 flex h-[88px] items-center justify-between border-t border-[#d6e0ea] bg-white px-8">
        <p className="text-[16px] text-[#687887]"><Cloud className="mr-2 inline h-5 w-5" />{saved ? "Saved just now" : "Auto-saved 2 mins ago"}</p>
        <div className="flex gap-4">
          <button onClick={() => setSaved(true)} className="h-12 rounded-lg border border-[#687887] bg-white px-8 text-[18px] text-[#243853]">Save Draft</button>
          <button onClick={() => setSaved(true)} className="h-12 rounded-lg bg-[#006d86] px-8 text-[18px] font-semibold text-white">Complete Documentation <ChevronRight className="ml-2 inline h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
}

function OrderLabTestsScreen() {
  const [selected, setSelected] = useState(["cbc", "lipid", "tsh"]);
  const [message, setMessage] = useState("");
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const selectedTests = labCategories.flatMap((category) => category.tests.map((test) => ({ ...test, category: category.name }))).filter((test) => selected.includes(test.id));

  return (
    <section className="relative min-h-[calc(100vh-80px)]">
      <div className="absolute inset-y-0 left-0 w-[220px] bg-black/30 backdrop-blur-[2px]" />
      <div className="ml-[220px] mr-[375px] px-8 py-8">
        <div className="mb-6">
          <h1 className="text-[32px] font-semibold">Order Lab Tests</h1>
          <p className="mt-1 text-[18px] text-[#343d48]">Select tests for the current patient visit.</p>
        </div>
        <PatientMiniCard />
        <div className="relative mt-8">
          <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2" />
          <input className="h-12 w-full rounded-lg border border-[#b9c8d5] bg-white pl-16 text-[18px]" placeholder="Search tests by name, code, or panel..." />
        </div>
        <div className="mt-8 overflow-hidden rounded-[14px] border border-[#b9c8d5] bg-white">
          {labCategories.map((category) => {
            const categorySelected = category.tests.filter((test) => selected.includes(test.id)).length;
            return (
              <div key={category.name}>
                <div className="flex h-[52px] items-center justify-between border-b border-[#d6e0ea] bg-[#e9eef3] px-6 text-[18px]">
                  <span className="flex items-center gap-3"><category.icon className="h-6 w-6 text-[#00758d]" />{category.name}</span>
                  {categorySelected > 0 && <span className="text-[15px]">{categorySelected} selected</span>}
                </div>
                {category.tests.map((test) => (
                  <button key={test.id} onClick={() => toggle(test.id)} className="flex h-[86px] w-full items-center gap-5 border-b border-[#e2e9ef] px-6 text-left">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded border border-[#b9c8d5]", selected.includes(test.id) && "border-[#00758d] bg-[#00758d] text-white")}><Check className="h-4 w-4" /></span>
                    <span><b className="text-[19px] font-medium">{test.name}</b><br /><span className="text-[15px]">{test.subtitle}</span></span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <aside className="fixed bottom-0 right-0 top-[80px] w-[375px] border-l border-[#d6e0ea] bg-white">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[19px] font-medium">Selected Tests</h2>
          <span className="rounded-full bg-[#0089a5] px-3 py-1 text-white">{selectedTests.length}</span>
        </div>
        <div className="space-y-2 px-6">
          {selectedTests.map((test) => (
            <div key={test.id} className="flex items-start justify-between rounded-lg border border-[#cbd6df] bg-[#eef3f7] p-3">
              <span><b className="text-[18px] font-medium">{test.name.replace("Complete Blood Count (CBC)", "CBC").replace("Lipid Profile", "Lipid Profile").replace("TSH (Thyroid Stimulating Hormone)", "TSH")}</b><br /><span>{test.category}</span></span>
              <button onClick={() => toggle(test.id)}><X /></button>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#d6e0ea] p-5">
          <label className="text-[17px] font-medium">Notes for Lab Technician</label>
          <textarea className="mt-2 h-[122px] w-full resize-none rounded-lg border border-[#b9c8d5] bg-[#e9eef3] p-3 text-[16px]" placeholder="Add specific instructions, urgency context, or clinical notes here..." />
          {message && <p className="mt-2 text-[15px] text-[#00758d]">{message}</p>}
          <button onClick={() => setMessage("Lab order saved for Sarah Jenkins.")} className="mt-5 h-11 w-full rounded-lg bg-[#00758d] text-[18px] font-semibold text-white"><Send className="mr-2 inline h-5 w-5" />Submit Lab Order</button>
          <button onClick={() => setMessage("Draft lab order saved.")} className="mt-3 h-11 w-full rounded-lg border border-[#111] bg-white text-[18px]">Save as Draft</button>
        </div>
      </aside>
      <Link href="/doctor/visits/sarah-jenkins" className="fixed right-7 top-7 z-30"><X className="h-7 w-7" /></Link>
    </section>
  );
}

function PatientMiniCard() {
  return (
    <div className="rounded-[14px] border border-[#b9c8d5] bg-white p-6">
      <div className="flex items-center gap-6">
        <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="" className="h-[74px] w-[74px] rounded-full object-cover" />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[18px]">
          <h2 className="basis-full text-[27px] font-semibold">Sarah Jenkins</h2>
          <span className="rounded bg-[#e6ebef] px-3 py-1 text-[14px]">ID: PT-84729</span>
          <span><Calendar className="mr-2 inline h-4 w-4" />34 yrs (DOB: 12/05/1989)</span>
          <span><UserRound className="mr-2 inline h-4 w-4" />Female</span>
        </div>
      </div>
    </div>
  );
}

function LabResultsReviewScreen() {
  const [portal, setPortal] = useState(true);
  const [message, setMessage] = useState("");
  return (
    <section className="px-8 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[40px] font-semibold">Lab Results Review</h1>
          <p className="mt-1 text-[18px]">Comprehensive Metabolic Panel &amp; CBC</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="h-12 rounded-lg border border-[#687887] bg-white px-6 text-[18px]"><Printer className="mr-2 inline h-5 w-5" />Print Report</button>
          <button onClick={() => setMessage("Result marked as reviewed.")} className="h-12 rounded-lg bg-[#00758d] px-6 text-[18px] font-semibold text-white"><CheckCircle2 className="mr-2 inline h-5 w-5" />Mark Reviewed</button>
        </div>
      </div>
      <div className="mt-5 rounded-[14px] border border-[#b9c8d5] bg-white p-8">
        <div className="grid grid-cols-[260px_1fr_1fr_1fr] items-center gap-8">
          <div className="flex items-center gap-5 border-r border-[#d6e0ea]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d8e4ff] text-[30px] font-bold text-[#51647c]">SJ</div>
            <div><h2 className="text-[28px] font-semibold">Sarah<br />Jenkins</h2><p>DOB: 12/05/1984<br />(39y)</p></div>
          </div>
          <InfoBlock title="Patient ID" value="MRN-998-442-1" />
          <InfoBlock title="Collection Date" value="Oct 24, 2023 - 08:30 AM" />
          <InfoBlock title="Ordering Provider" value="Dr. E. Reynolds" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-[1fr_0.48fr] gap-8">
        <div className="overflow-hidden rounded-[14px] border border-[#b9c8d5] bg-white">
          <div className="flex items-center justify-between p-8">
            <h2 className="text-[28px] font-semibold">Complete Blood Count (CBC)</h2>
            <span className="rounded bg-[#e6ebef] px-3 py-2">Status: Final</span>
          </div>
          <div className="grid grid-cols-[1.3fr_0.65fr_0.7fr_0.9fr_0.7fr] border-y border-[#cbd6df] bg-[#eef3f7] px-8 py-4 text-[15px] uppercase tracking-[0.04em] text-[#40536c]">
            <span>Test Name</span><span>Result</span><span>Unit</span><span>Normal<br />Range</span><span>Flag</span>
          </div>
          {labResults.map((row) => (
            <div key={row.test} className={cn("grid min-h-[92px] grid-cols-[1.3fr_0.65fr_0.7fr_0.9fr_0.7fr] items-center border-b border-[#d6e0ea] px-8 text-[18px]", row.critical && "bg-[#fff7f7]")}>
              <span>{row.critical && <AlertTriangle className="mr-2 inline h-5 w-5 text-[#d00000]" />}{row.test}</span>
              <span className={row.critical ? "font-bold text-[#d00000]" : ""}>{row.result}</span>
              <span>{row.unit}</span>
              <span>{row.range}</span>
              <Flag value={row.flag} critical={row.critical} />
            </div>
          ))}
        </div>
        <aside className="space-y-8">
          <div className="rounded-[14px] border border-[#b9c8d5] bg-white p-8">
            <h2 className="mb-6 flex items-center gap-3 text-[28px] font-semibold"><ClipboardPlus className="h-7 w-7 text-[#00758d]" />Clinical Context</h2>
            <p className="text-[18px] leading-7">Patient reported increased fatigue and mild shortness of breath over the past two weeks. History of iron-deficiency anemia noted in chart (diagnosed 2019). Current findings correlate with presenting symptoms.</p>
            <div className="mt-6 rounded-lg border border-[#d6e0ea] bg-[#f5f9fd] p-5">
              <p className="text-[15px] uppercase tracking-[0.04em] text-[#40536c]">Previous Hemoglobin (3 mos ago)</p>
              <p className="mt-3 text-[28px] font-semibold">11.2 <span className="text-[16px] font-normal">g/dL</span></p>
              <div className="mt-4 h-1 rounded bg-[#e1e6eb]"><div className="h-full w-[40%] bg-[#d00000]" /></div>
            </div>
          </div>
          <div className="rounded-[14px] border border-[#b9c8d5] bg-white p-8">
            <h2 className="mb-6 text-[28px] font-semibold">Review Actions</h2>
            <label className="text-[18px] font-medium">Add Interpretation Note</label>
            <textarea className="mt-2 h-[120px] w-full resize-none rounded-lg border border-[#b9c8d5] bg-[#f5f9fd] p-3 text-[17px]" placeholder="Type internal clinical notes here..." />
            <button onClick={() => setPortal((value) => !value)} className="mt-7 flex h-[52px] w-full items-center justify-between rounded-lg border border-[#b9c8d5] bg-white px-4 text-[17px]">
              <span><Eye className="mr-2 inline h-6 w-6 text-[#40536c]" />Show in Patient Portal</span>
              <span className={cn("flex h-8 w-16 items-center rounded-full p-1", portal ? "justify-end bg-[#0089a5]" : "justify-start bg-[#d6e0ea]")}><span className="h-6 w-6 rounded-full bg-white" /></span>
            </button>
            {message && <p className="mt-3 text-[15px] text-[#00758d]">{message}</p>}
            <button onClick={() => setMessage("Review submitted.")} className="mt-5 h-16 w-full rounded-lg bg-[#00758d] text-[18px] font-semibold text-white">Submit Review</button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function CompletedVisitsScreen() {
  const [query, setQuery] = useState("");
  const filtered = completedVisits.filter((visit) => `${visit.patient} ${visit.diagnosis}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="px-8 py-9">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-semibold">Completed Visits</h1>
          <p className="mt-2 text-[18px] text-[#51647c]">Archival log of finalized patient encounters and treatments.</p>
        </div>
        <div className="flex gap-3">
          <button className="h-12 rounded-lg border border-[#b9c8d5] bg-white px-5 text-[18px]"><Filter className="mr-2 inline h-5 w-5" />Last 7 Days <ChevronDown className="ml-4 inline h-5 w-5" /></button>
          <button className="h-12 rounded-lg border border-[#b9c8d5] bg-white px-5 text-[18px]"><Download className="mr-2 inline h-5 w-5" />Export Log</button>
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-lg border border-[#b9c8d5] bg-white">
        <div className="flex items-center gap-8 border-b border-[#b9c8d5] p-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#687887]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded bg-[#eef3f7] pl-12 text-[18px] outline-none" placeholder="Filter by patient name or diagnosis keyword..." />
          </div>
          <button className="text-[18px] text-[#243853]"><ListFilter className="mr-2 inline h-5 w-5" />Sort by: <b>Date</b></button>
        </div>
        <div className="grid grid-cols-[120px_170px_120px_1fr_160px_170px_130px] bg-[#eef3f7] px-5 py-4 text-[15px] uppercase tracking-[0.04em] text-[#40536c]">
          <span>Visit ID</span><span>Patient</span><span>MRN</span><span>Diagnosis Summary</span><span>Lab Status</span><span>Medicine</span><span className="text-right">Completed<br />Time</span>
        </div>
        {filtered.map((visit) => (
          <div key={visit.id} className="grid min-h-[92px] grid-cols-[120px_170px_120px_1fr_160px_170px_130px] items-center border-t border-[#d6e0ea] px-5 text-[18px]">
            <span className="text-[#324c71]">{visit.id}</span>
            <span className="font-medium">{visit.patient}</span>
            <span className="text-[#687887]">{visit.mrn}</span>
            <span>{visit.diagnosis}</span>
            <CompleteBadge value={visit.lab} />
            <CompleteBadge value={visit.medicine} />
            <span className="text-right text-[#40536c]">{visit.time}</span>
          </div>
        ))}
        <div className="flex h-[64px] items-center justify-between border-t border-[#d6e0ea] bg-[#eef3f7] px-6 text-[16px] text-[#40536c]">
          <span>Showing 1-5 of 142 completed visits</span>
          <span className="flex items-center gap-7"><ChevronLeft className="text-[#99a7b3]" />1<ChevronRight /></span>
        </div>
      </div>
    </section>
  );
}

function PrescribeMedicineScreen() {
  const [submitted, setSubmitted] = useState("");
  return (
    <section className="relative min-h-[calc(100vh-80px)]">
      <div className="absolute inset-y-0 left-0 w-[442px] bg-black/25 backdrop-blur-[3px]" />
      <aside className="ml-[442px] min-h-[calc(100vh-80px)] bg-[#f3f8fc]">
        <div className="flex h-[100px] items-center justify-between border-b border-[#cbd6df] bg-white px-8">
          <h1 className="flex items-center gap-3 text-[22px]"><ClipboardPen className="h-7 w-7 text-[#00758d]" />Prescribe Medicine</h1>
          <Link href="/doctor/visits/sarah-jenkins"><X className="h-7 w-7" /></Link>
        </div>
        <div className="p-8">
          <label className="text-[20px]">Search Database</label>
          <div className="relative mt-3">
            <Search className="absolute left-4 top-1/2 h-7 w-7 -translate-y-1/2 text-[#687887]" />
            <input defaultValue="Sumatriptan" className="h-[54px] w-full rounded-lg border border-[#b9c8d5] bg-white pl-13 text-[22px]" />
          </div>
          <div className="mt-10 rounded-[14px] border border-[#b9c8d5] bg-white p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[22px] font-medium">Sumatriptan</h2>
                <p className="mt-3 text-[21px]">Serotonin (5-HT1B/1D) receptor agonist</p>
              </div>
              <span className="rounded-full border border-[#f4aaa5] bg-[#ffd8d5] px-5 py-3 text-[20px] font-semibold text-[#990000]"><AlertTriangle className="mr-2 inline h-5 w-5" />Low Pharmacy Stock</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-5">
              <InputLike label="Dosage" value="50mg" dropdown />
              <InputLike label="Quantity (Tablets)" value="10" />
            </div>
            <InputLike label="Frequency" value="Once daily as needed" dropdown full />
            <div className="mt-5 flex items-end gap-3">
              <InputLike label="Duration" value="5" small />
              <span className="pb-3 text-[18px]">days</span>
            </div>
            <InputLike label="Specific Instructions" value="at onset of migraine" full />
          </div>
          {submitted && <p className="mt-4 text-[#00758d]">{submitted}</p>}
        </div>
        <div className="fixed bottom-0 left-[762px] right-0 flex h-[92px] items-center justify-end gap-5 border-t border-[#cbd6df] bg-white px-8">
          <Link href="/doctor/visits/sarah-jenkins" className="flex h-12 items-center rounded-lg border border-[#687887] bg-white px-6 text-[18px] text-[#243853]">Cancel</Link>
          <button onClick={() => setSubmitted("Prescription submitted for Sarah Jenkins.")} className="h-12 rounded-lg bg-[#006d86] px-7 text-[20px] text-white"><Send className="mr-2 inline h-5 w-5" />Submit Prescription</button>
        </div>
      </aside>
    </section>
  );
}

function InputLike({ label, value, dropdown, full, small }: { label: string; value: string; dropdown?: boolean; full?: boolean; small?: boolean }) {
  return (
    <label className={cn("mt-5 block text-[20px]", full && "col-span-2", small && "w-[120px]")}>
      {label}
      <div className="mt-2 flex h-[52px] items-center justify-between rounded-lg border border-[#b9c8d5] bg-white px-4 text-[20px]">
        <span>{value}</span>
        {dropdown && <ChevronDown className="h-5 w-5 text-[#687887]" />}
      </div>
    </label>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return <div className="border-r border-[#d6e0ea] last:border-0"><p className="text-[15px] uppercase tracking-[0.04em] text-[#40536c]">{title}</p><p className="mt-2 text-[17px]">{value}</p></div>;
}

function Flag({ value, critical }: { value: string; critical?: boolean }) {
  if (critical) return <span className="w-fit rounded bg-[#c91419] px-3 py-2 text-[16px] font-semibold text-white">Critical<br />Low</span>;
  if (value === "Low") return <span className="w-fit rounded bg-[#fff4e8] px-3 py-2 text-[16px] text-[#9a4b00]">Low</span>;
  return <span className="w-fit rounded bg-[#e1e6eb] px-3 py-2 text-[16px]">Normal</span>;
}

function CompleteBadge({ value }: { value: string }) {
  if (value === "N/A") return <span className="w-fit rounded-full border border-[#b9c8d5] bg-[#eef3f7] px-4 py-2 text-[16px]">− N/A</span>;
  return <span className="w-fit rounded-full bg-[#078aa1] px-4 py-2 text-[16px] text-white"><CheckCircle2 className="mr-1 inline h-4 w-4" />{value}</span>;
}

function StatusPill({ status }: { status: string }) {
  if (status === "Urgent") return <span className="w-fit rounded-full bg-[#c91419] px-3 py-1 text-[14px] font-semibold text-white">• Urgent</span>;
  if (status === "In Progress") return <span className="w-fit rounded-full bg-[#0089a5] px-4 py-2 text-[15px] text-white">In<br />Progress</span>;
  if (status === "Queued") return <span className="w-fit rounded-md bg-[#dfe5ea] px-4 py-2 text-[14px]">Queued</span>;
  return <span className="w-fit rounded-md bg-[#dfe5ea] px-4 py-2 text-[14px]">{status}</span>;
}

function ClockIcon({ className }: { className?: string }) {
  return <span className={cn("inline-block h-4 w-4 rounded-full border-2 border-current align-[-2px]", className)} />;
}
