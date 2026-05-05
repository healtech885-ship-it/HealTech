"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeInfo,
  Bell,
  Brain,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ClipboardPlus,
  Download,
  Edit3,
  Eye,
  FlaskConical,
  Grid2X2,
  Heart,
  HelpCircle,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Microscope,
  Phone,
  Pill,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

type PatientScreen =
  | "dashboard"
  | "profile"
  | "visits"
  | "visit-details"
  | "lab-results"
  | "lab-result-details"
  | "medicines"
  | "appointments"
  | "appointment-new"
  | "settings"
  | "notifications";

type IconType = typeof Grid2X2;

const patientPhoto = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=220&q=80";
const doctorPhoto = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=160&q=80";

const visits = [
  { date: "Oct 24, 2023", status: "Completed", doctor: "Dr. Sarah Chen", dept: "Neurology", reason: "Persistent Migraines", tone: "blue" },
  { date: "Sep 12, 2023", status: "Pending Review", doctor: "Dr. Michael Torres", dept: "Cardiology", reason: "Annual Routine Checkup", tone: "gray" },
  { date: "Aug 05, 2023", status: "Completed", doctor: "Dr. Emily Watson", dept: "General Practice", reason: "Vaccination Update", tone: "blue" },
];

const labResults = [
  { title: "Comprehensive Metabolic Panel", doctor: "Dr. Sarah Chen", date: "Oct 24, 2023", status: "Ready" },
  { title: "Thyroid Panel", doctor: "Dr. Sarah Chen", date: "Oct 28, 2023", status: "Pending Review" },
  { title: "Lipid Panel", doctor: "Dr. Marcus Thorne", date: "Sep 15, 2023", status: "Ready" },
];

const medicines = [
  { name: "Sumatriptan 50mg", form: "Oral Tablet", dosage: "1 tablet", frequency: "At onset of migraine", note: "Do not exceed 2 tablets in 24 hours.", status: "Ready for Pickup", icon: Pill },
  { name: "Ibuprofen 400mg", form: "Tablet", dosage: "", frequency: "Every 6 hours as needed for pain", note: "", status: "Active", icon: ClipboardPlus },
];

const fieldInputClass = "h-12 w-full rounded-lg border border-[#b9c8d5] bg-white px-5 text-[20px] font-normal outline-none placeholder:text-[#65737e]";

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function resolveScreen(segments?: string[]): PatientScreen {
  const path = (segments ?? []).join("/");
  if (!path || path === "dashboard") return "dashboard";
  if (path === "profile") return "profile";
  if (path === "visits") return "visits";
  if (path.startsWith("visits/")) return "visit-details";
  if (path === "lab-results") return "lab-results";
  if (path.startsWith("lab-results/")) return "lab-result-details";
  if (path === "medicines") return "medicines";
  if (path === "appointment-requests") return "appointments";
  if (path === "appointment-requests/new") return "appointment-new";
  if (path === "account-settings") return "settings";
  if (path === "notifications") return "notifications";
  return "dashboard";
}

function isActive(screen: PatientScreen, href: string) {
  if (href === "/patient/dashboard") return screen === "dashboard";
  if (href === "/patient/profile") return screen === "profile" || screen === "settings";
  if (href === "/patient/visits") return screen === "visits" || screen === "visit-details";
  if (href === "/patient/lab-results") return screen === "lab-results" || screen === "lab-result-details";
  if (href === "/patient/medicines") return screen === "medicines";
  if (href === "/patient/appointment-requests") return screen === "appointments" || screen === "appointment-new";
  return false;
}

const navItems: Array<{ label: string; href: string; icon: IconType }> = [
  { label: "Dashboard", href: "/patient/dashboard", icon: Grid2X2 },
  { label: "My Profile", href: "/patient/profile", icon: UserRound },
  { label: "My Visits", href: "/patient/visits", icon: ClipboardList },
  { label: "Lab Results", href: "/patient/lab-results", icon: Microscope },
  { label: "Medicines", href: "/patient/medicines", icon: ClipboardPlus },
  { label: "Appointments", href: "/patient/appointment-requests", icon: CalendarDays },
];

export function PatientShell({ segments }: { segments?: string[] }) {
  const screen = resolveScreen(segments);

  return (
    <div className="min-h-screen bg-[#f3f8fc] text-[#111820]">
      <Sidebar screen={screen} />
      <div className="min-h-screen pl-[320px]">
        <Topbar screen={screen} />
        <main className="mx-auto w-full max-w-[1240px] px-10 py-10">
          {screen === "dashboard" ? <DashboardView /> : null}
          {screen === "profile" ? <ProfileView /> : null}
          {screen === "visits" ? <VisitsView /> : null}
          {screen === "visit-details" ? <VisitDetailsView /> : null}
          {screen === "lab-results" ? <LabResultsView /> : null}
          {screen === "lab-result-details" ? <LabResultDetailsView /> : null}
          {screen === "medicines" ? <MedicinesView /> : null}
          {screen === "appointments" ? <AppointmentRequestsView /> : null}
          {screen === "appointment-new" ? <CreateAppointmentView /> : null}
          {screen === "settings" ? <SettingsView /> : null}
          {screen === "notifications" ? <NotificationsView /> : null}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ screen }: { screen: PatientScreen }) {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[320px] flex-col border-r border-[#d8e2eb] bg-[#f7fbff]">
      <div className="px-10 py-9">
        <Link href="/patient/dashboard" className="text-[26px] font-bold text-[#0088a8]">ClinicConnect</Link>
        <div className="mt-8 flex items-center gap-4">
          <img src={patientPhoto} alt="" className="h-[58px] w-[58px] rounded-full border border-[#c9d7e0] object-cover" />
          <div>
            <p className="text-[15px] text-[#51647c]">Welcome back</p>
            <p className="text-[20px] font-semibold">Alex Johnson</p>
          </div>
        </div>
      </div>

      <nav className="space-y-3 px-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-[52px] items-center gap-4 rounded-sm px-7 text-[18px] text-[#263b57]",
                isActive(screen, item.href) && "bg-[#e5fbfb] font-semibold text-[#00799a]",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#d8e2eb] px-10 py-7">
        <Link href="#" className="mb-8 flex items-center gap-4 text-[17px] text-[#263b57]"><HelpCircle className="h-5 w-5" />Help Center</Link>
        <Link href="/login" className="flex items-center gap-4 text-[17px] text-[#263b57]"><LogOut className="h-5 w-5" />Logout</Link>
      </div>
    </aside>
  );
}

function Topbar({ screen }: { screen: PatientScreen }) {
  const placeholder = screen === "lab-result-details" ? "Search..." : screen === "profile" ? "Search records..." : screen === "medicines" ? "Search..." : "Search records...";
  return (
    <header className="flex h-[88px] items-center justify-between border-b border-[#d8e2eb] bg-white px-10">
      <Link href="/patient/dashboard" className="text-[26px] font-bold text-[#0088a8]">ClinicConnect</Link>
      <div className="flex items-center gap-7">
        <label className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7890aa]" />
          <input className="h-12 w-[340px] rounded-full bg-[#eef4f8] pl-12 pr-5 text-[18px] outline-none placeholder:text-[#718199]" placeholder={placeholder} />
        </label>
        <Link href="/patient/notifications" aria-label="Notifications" className="relative text-[#344966]">
          <Bell className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#c8171f]" />
        </Link>
        <Link href="/patient/account-settings" aria-label="Account settings" className="text-[#344966]"><Settings className="h-7 w-7" /></Link>
        <img src={patientPhoto} alt="" className="h-11 w-11 rounded-full object-cover" />
      </div>
    </header>
  );
}

function Header({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-6">
      <div>
        <h1 className="text-[42px] font-semibold leading-tight tracking-normal">{title}</h1>
        <p className="mt-2 text-[18px] text-[#3d4855]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-xl border border-[#b9c8d5] bg-white shadow-sm", className)}>{children}</section>;
}

function SectionTitle({ icon: Icon, title }: { icon: IconType; title: string }) {
  return <h2 className="flex items-center gap-3 text-[28px] font-semibold"><Icon className="h-7 w-7 text-[#006d86]" />{title}</h2>;
}

function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "outline" }) {
  return (
    <Link href={href} className={cn("inline-flex h-12 items-center justify-center rounded-lg px-6 text-[18px] font-semibold", variant === "primary" ? "bg-[#006d86] text-white" : "border border-[#263b57] bg-white text-[#111820]")}>
      {children}
    </Link>
  );
}

function PillLabel({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "teal" | "gray" | "amber" | "green" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-[15px]",
      tone === "blue" && "bg-[#d7e6ff] text-[#31465f]",
      tone === "teal" && "bg-[#daf8ff] text-[#006d86]",
      tone === "gray" && "bg-[#e6ebef] text-[#26313b]",
      tone === "amber" && "bg-[#f6e2c7] text-[#9d5200]",
      tone === "green" && "bg-[#dff4e8] text-[#00843d]",
    )}>
      {children}
    </span>
  );
}

function DashboardView() {
  return (
    <div>
      <Header title="Welcome back, Alex." subtitle="Here is a summary of your recent health activities and upcoming needs." />
      <div className="grid grid-cols-4 gap-8">
        <MetricCard icon={Calendar} label="Total Visits" value="12" />
        <MetricCard icon={Calendar} label="Latest Visit" value="Oct 24" />
        <MetricCard icon={Microscope} label="Ready Labs" value="1" active />
        <MetricCard icon={Pill} label="Active Meds" value="2" />
      </div>

      <div className="mt-8 grid grid-cols-[2fr_0.95fr] gap-8">
        <Card className="p-8">
          <div className="flex items-center justify-between">
            <SectionTitle icon={ClipboardPlus} title="Latest Visit" />
            <PillLabel tone="gray"><CheckCircle2 className="mr-1 h-4 w-4" />Completed</PillLabel>
          </div>
          <div className="mt-6 flex items-center gap-5 rounded-lg bg-[#eef4f8] p-6">
            <img src={doctorPhoto} alt="" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <p className="text-[20px] font-semibold">Dr. Sarah Chen</p>
              <p className="text-[17px] text-[#51647c]">Neurology Department</p>
            </div>
          </div>
          <p className="mt-7 text-[14px] uppercase tracking-wide text-[#344966]">Reason for Visit</p>
          <p className="mt-3 text-[21px]">Follow-up for Persistent Migraines</p>
          <p className="mt-3 max-w-[760px] text-[18px] leading-8 text-[#343d48]">Patient reports mild improvement with current medication regimen. Next follow-up recommended in 3 months.</p>
          <div className="mt-8 border-t border-[#d8e2eb] pt-5 text-right">
            <ButtonLink href="/patient/visits/oct-24-2023">View Details <ChevronRight className="ml-2 h-5 w-5" /></ButtonLink>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-center justify-between">
            <SectionTitle icon={FlaskConical} title="Lab Results" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d7757c]" />
          </div>
          <div className="mt-6 border-l-4 border-[#0088a8] rounded-lg bg-[#eef4f8] p-6">
            <p className="text-[18px] font-medium">Comprehensive Metabolic Panel</p>
            <p className="mt-3 text-[15px] text-[#263b57]"><Calendar className="mr-2 inline h-4 w-4" />Oct 24, 2023</p>
            <PillLabel tone="amber"><Bell className="mr-1 h-4 w-4" />Status: Ready</PillLabel>
          </div>
          <ButtonLink href="/patient/lab-results/cmp" variant="outline"><span className="flex items-center">View Results <Eye className="ml-2 h-5 w-5" /></span></ButtonLink>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <Card className="p-8">
          <SectionTitle icon={ClipboardPlus} title="Active Medicines" />
          <div className="mt-6 space-y-4">
            {medicines.map((med) => <MedicineMini key={med.name} med={med} />)}
          </div>
          <Link href="/patient/medicines" className="mt-7 inline-flex items-center text-[18px] font-semibold text-[#006d86]">View all medicines <ChevronRight className="ml-1 h-5 w-5" /></Link>
        </Card>
        <Card className="p-8">
          <h2 className="text-[28px] font-semibold">Quick Actions</h2>
          <div className="mt-7 space-y-5">
            <QuickAction href="/patient/appointment-requests/new" icon={CalendarDays} title="Request Appointment" desc="Schedule a new visit with a provider" />
            <QuickAction href="/patient/profile" icon={UserRound} title="My Profile" desc="Update insurance and personal info" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, active }: { icon: IconType; label: string; value: string; active?: boolean }) {
  return (
    <Card className={cn("p-8", active && "border-[#34bdd1] bg-[#078aa3] text-white")}>
      <div className={cn("mb-8 flex h-10 w-10 items-center justify-center rounded-full", active ? "bg-white/20" : "bg-[#dbe9ff]")}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[14px] uppercase tracking-wide">{label}</p>
      <p className="mt-3 text-[32px] font-semibold">{value}</p>
    </Card>
  );
}

function MedicineMini({ med }: { med: typeof medicines[number] }) {
  const Icon = med.icon;
  return (
    <div className="flex items-center gap-4 rounded-lg bg-[#eef4f8] p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded bg-[#e0e6ea]"><Icon className="h-5 w-5 text-[#344966]" /></span>
      <div>
        <p className="text-[18px] font-semibold">{med.name.replace("50mg", "").replace("400mg", "")}</p>
        <p className="text-[15px] text-[#263b57]">{med.name.includes("Sumatriptan") ? "50mg - As needed" : "400mg - Every 6 hours"}</p>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, title, desc }: { href: string; icon: IconType; title: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-xl border border-[#b9c8d5] p-5 text-[18px]">
      <span className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d9f3fb]"><Icon className="h-6 w-6 text-[#006d86]" /></span><span><b className="block">{title}</b><span className="text-[15px] text-[#343d48]">{desc}</span></span></span>
      <ChevronRight className="h-7 w-7 text-[#65737e]" />
    </Link>
  );
}

function ProfileView() {
  const [message, setMessage] = useState("");
  return (
    <div>
      <Header title="Patient Profile" subtitle="Manage your personal information and clinic preferences.">
        <button onClick={() => setMessage("Profile update request has been sent for review.")} className="mt-2 inline-flex h-12 items-center rounded-lg border border-[#263b57] bg-white px-6 text-[18px] font-semibold"><Edit3 className="mr-2 h-5 w-5" />Request Profile Update</button>
      </Header>
      {message ? <div className="mb-5 rounded-lg border border-[#b9c8d5] bg-white px-5 py-3 text-[#006d86]">{message}</div> : null}

      <div className="grid grid-cols-[2fr_1fr] gap-8">
        <Card className="p-8">
          <div className="flex items-center gap-8">
            <div className="relative rounded-xl border border-[#b9c8d5] bg-[#f5f7f9] p-4">
              <img src={patientPhoto} alt="" className="h-[118px] w-[118px] rounded object-cover" />
              <span className="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#0088a8] text-white"><ShieldCheck className="h-6 w-6" /></span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4"><h2 className="text-[32px] font-semibold">Alex Johnson</h2><PillLabel tone="gray">MRN: P-9482</PillLabel></div>
              <p className="mt-1 text-[17px] text-[#343d48]">Patient since 2021</p>
              <div className="mt-8 grid grid-cols-4 gap-8">
                <ProfileFact label="Date of Birth" value="Dec 04, 1991" icon={Calendar} />
                <ProfileFact label="Blood Type" value="O+" icon={Heart} red />
                <ProfileFact label="Sex" value="Male" />
                <ProfileFact label="Status" value="Active" dot />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <SectionTitle icon={Building2} title="Organization" />
          <InfoLine label="Patient Type" value={<PillLabel tone="gray">Student</PillLabel>} />
          <InfoLine label="Student ID" value="2021-9948" />
          <InfoLine label="Department" value="Engineering" />
        </Card>

        <Card className="p-8">
          <SectionTitle icon={BadgeInfo} title="Contact Information" />
          <div className="mt-8 space-y-8">
            <ContactLine icon={Phone} label="Primary Phone" value="(555) 019-2834" />
            <ContactLine icon={Mail} label="Email Address" value="a.johnson@email.com" />
            <ContactLine icon={MapPin} label="Residential Address" value={"1240 Willow Creek Rd\nApt 4B, Metro City, ST 12345"} />
          </div>
        </Card>

        <Card className="border-l-4 border-l-[#b56a0d] p-8">
          <SectionTitle icon={Plus} title="Emergency Contact" />
          <div className="mt-8 rounded-lg bg-[#eef4f8] p-6">
            <p className="text-[24px] font-semibold">Michael Johnson</p>
            <PillLabel tone="amber">Husband</PillLabel>
            <p className="mt-5 text-[18px]"><Phone className="mr-3 inline h-5 w-5 text-[#6c7a80]" />(555) 867-5309</p>
            <p className="mt-4 text-[17px] text-[#343d48]"><BadgeInfo className="mr-3 inline h-5 w-5 text-[#6c7a80]" />Primary contact for medical emergencies.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProfileFact({ label, value, icon: Icon, red, dot }: { label: string; value: string; icon?: IconType; red?: boolean; dot?: boolean }) {
  return <div><p className="mb-2 text-[14px] uppercase tracking-wide text-[#344966]">{label}</p><p className="text-[18px]">{Icon ? <Icon className={cn("mr-2 inline h-4 w-4", red && "text-[#d20d16]")} /> : null}{dot ? <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#00758d]" /> : null}{value}</p></div>;
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="mt-7 flex items-center justify-between border-b border-[#e2e8ee] pb-5 text-[18px]"><span className="text-[#3d4855]">{label}</span><span className="font-medium">{value}</span></div>;
}

function ContactLine({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return <div className="grid grid-cols-[34px_1fr] gap-4"><Icon className="mt-1 h-6 w-6 text-[#65737e]" /><div><p className="text-[14px] uppercase tracking-wide text-[#344966]">{label}</p><p className="whitespace-pre-line text-[18px] leading-7">{value}</p></div></div>;
}

function VisitsView() {
  const [query, setQuery] = useState("");
  const filtered = visits.filter((visit) => `${visit.doctor} ${visit.reason}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <Header title="Visit History" subtitle="Review your past appointments and consultation details." />
        <div className="mb-8 flex gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="Search doctor or reason..." />
          <SelectBox label="All Dates" />
          <SelectBox label="All Statuses" />
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((visit) => (
          <Card key={visit.date} className="grid min-h-[126px] grid-cols-[240px_1fr_180px] items-center px-8">
            <div><p className="text-[18px] font-medium">{visit.date}</p><PillLabel tone={visit.tone === "blue" ? "blue" : "gray"}>{visit.status}</PillLabel></div>
            <div><p className="text-[28px] font-semibold">{visit.doctor}</p><p className="mt-2 text-[17px]"><span className="font-semibold text-[#006d86]">{visit.dept}</span><span className="mx-3 text-[#aab5bd]">-</span><Stethoscope className="mr-2 inline h-5 w-5" />{visit.reason}</p></div>
            <ButtonLink href="/patient/visits/oct-24-2023" variant="outline">View Details</ButtonLink>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="relative block"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#65737e]" /><input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-[320px] rounded-lg border border-[#b9c8d5] bg-white pl-12 pr-4 text-[18px] outline-none" placeholder={placeholder} /></label>;
}

function SelectBox({ label }: { label: string }) {
  return <button className="inline-flex h-12 min-w-[150px] items-center justify-between rounded-lg border border-[#b9c8d5] bg-white px-5 text-[17px]">{label}<ChevronDown className="ml-4 h-5 w-5 text-[#51647c]" /></button>;
}

function VisitDetailsView() {
  return (
    <div>
      <Link href="/patient/visits" className="mb-10 inline-flex items-center text-[18px] font-semibold text-[#006d86]">Back to My Visits</Link>
      <Card className="mb-10 flex min-h-[172px] items-center justify-between p-10">
        <div>
          <h1 className="text-[42px] font-semibold">Visit Details</h1>
          <p className="mt-5 flex items-center gap-6 text-[21px] text-[#343d48]"><span><Calendar className="mr-2 inline h-5 w-5" />Oct 24, 2023</span><span>Dr. Sarah Chen</span><span>Neurology</span></p>
        </div>
        <PillLabel tone="gray"><CheckCircle2 className="mr-2 h-5 w-5 text-[#006d86]" />Completed</PillLabel>
      </Card>
      <div className="grid grid-cols-[2fr_0.95fr] gap-10">
        <div className="space-y-10">
          <DetailCard icon={ClipboardList} title="Visit Summary"><p className="text-[16px] font-medium">Reason for Visit</p><p className="mt-3 text-[21px]">Persistent Migraines</p></DetailCard>
          <DetailCard icon={ClipboardPlus} title="Diagnosis"><p className="text-[21px]">Chronic Tension-type Headache</p></DetailCard>
          <DetailCard icon={ClipboardList} title="Doctor's Instructions"><Instruction icon={Heart} text="Stay hydrated throughout the day." /><Instruction icon={Bell} text="Maintain regular, consistent sleep patterns." /><Instruction icon={Pill} text="Use Sumatriptan strictly as prescribed at the onset of migraine symptoms." /></DetailCard>
        </div>
        <div className="space-y-10">
          <DetailCard icon={Microscope} title="Lab Results"><div className="rounded-lg bg-[#eef4f8] p-5"><div className="flex items-start justify-between"><p className="text-[18px] font-medium">Comprehensive Metabolic Panel</p><PillLabel tone="teal">READY</PillLabel></div><Link href="/patient/lab-results/cmp" className="mt-8 inline-flex items-center text-[18px] font-semibold text-[#006d86]">View Details <ChevronRight className="ml-1 h-5 w-5" /></Link></div></DetailCard>
          <DetailCard icon={ClipboardPlus} title="Medicines Prescribed"><MedicineMini med={medicines[0]} /><div className="mt-4"><MedicineMini med={medicines[1]} /></div></DetailCard>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon: Icon, title, children }: { icon: IconType; title: string; children: React.ReactNode }) {
  return <Card className="p-8"><SectionTitle icon={Icon} title={title} /><div className="mt-5 border-t border-[#d8e2eb] pt-7">{children}</div></Card>;
}

function Instruction({ icon: Icon, text }: { icon: IconType; text: string }) {
  return <p className="mt-6 text-[20px]"><Icon className="mr-5 inline h-6 w-6 text-[#65737e]" />{text}</p>;
}

function LabResultsView() {
  const [tab, setTab] = useState<"All Results" | "Ready" | "Pending">("All Results");
  const visible = labResults.filter((item) => tab === "All Results" || (tab === "Pending" ? item.status !== "Ready" : item.status === "Ready"));
  return (
    <div>
      <Header title="Your Lab Results" subtitle="Here is a straightforward overview of your recent tests. We are keeping an eye on your health.">
        <SelectBox label="Last 6 Months" />
      </Header>
      <div className="mb-8 flex gap-3">
        {(["All Results", "Ready", "Pending"] as const).map((name) => <button key={name} onClick={() => setTab(name)} className={cn("h-11 rounded-full border border-[#b9c8d5] px-6 text-[17px]", tab === name && "border-transparent bg-[#dbe9ff] font-semibold")}>{name}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-8">
        {visible.map((result) => <LabResultCard key={result.title} result={result} />)}
      </div>
    </div>
  );
}

function LabResultCard({ result }: { result: typeof labResults[number] }) {
  const ready = result.status === "Ready";
  return (
    <Card className="min-h-[260px] p-8">
      <div className="flex items-start justify-between"><h2 className="text-[26px] font-semibold">{result.title}</h2><span className="text-[#263b57]">{result.date}</span></div>
      <p className="mt-4 text-[17px] text-[#263b57]"><Stethoscope className="mr-2 inline h-5 w-5" />{result.doctor}</p>
      <div className="mt-6">{ready ? <PillLabel tone="blue"><CheckCircle2 className="mr-1 h-4 w-4" />Ready</PillLabel> : <span className="bg-[#a75c0a] px-4 py-2 text-[17px] font-semibold text-white">Pending Review</span>}</div>
      <div className="mt-16 border-t border-[#d8e2eb] pt-5">{ready ? <ButtonLink href="/patient/lab-results/cmp">View Details <ChevronRight className="ml-2 h-5 w-5" /></ButtonLink> : <div className="rounded-lg bg-[#eef4f8] p-5 text-[17px] text-[#343d48]"><BadgeInfo className="mr-2 inline h-5 w-5" />This result will appear after your doctor reviews it. We will notify you once it is ready.</div>}</div>
    </Card>
  );
}

function MedicinesView() {
  return (
    <div>
      <Header title="Active Prescriptions" subtitle="Manage your current medications and treatment plans.">
        <button className="inline-flex h-12 items-center rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Plus className="mr-2 h-5 w-5" />Request Refill</button>
      </Header>
      <div className="grid grid-cols-2 gap-8">
        {medicines.map((med) => <PrescriptionCard key={med.name} med={med} />)}
      </div>
    </div>
  );
}

function PrescriptionCard({ med }: { med: typeof medicines[number] }) {
  const Icon = med.icon;
  return (
    <Card className="min-h-[380px] p-8">
      <div className="flex items-start gap-6"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e5f8fb]"><Icon className="h-7 w-7 text-[#0088a8]" /></span><div><h2 className="text-[28px] font-semibold">{med.name}</h2><p className="text-[#263b57]">{med.form}</p></div></div>
      <div className="mt-6 rounded-lg border border-[#d4dee7] bg-[#eef4f8] p-5">
        {med.dosage ? <div className="grid grid-cols-2 border-b border-[#d8e2eb] pb-4"><span><b className="block text-[#65737e]">Dosage</b>{med.dosage}</span><span><b className="block text-[#65737e]">Frequency</b>{med.frequency}</span></div> : <div><b className="block text-[#65737e]">Frequency</b>{med.frequency}</div>}
        {med.note ? <p className="mt-4"><b className="block text-[#65737e]">Instructions</b><span className="inline-flex rounded-lg bg-[#f5e7d2] px-3 py-2 text-[#a35300]"><BadgeInfo className="mr-2 h-5 w-5" />{med.note}</span></p> : null}
      </div>
      <div className="mt-20 flex items-center justify-between text-[#263b57]"><span><Stethoscope className="mr-2 inline h-5 w-5" />{med.name.startsWith("Sumatriptan") ? "Prescribed by Dr. Chen - Oct 24" : "Last filled on Oct 10"}</span><PillLabel tone={med.status === "Active" ? "gray" : "teal"}>{med.status}</PillLabel></div>
    </Card>
  );
}

function LabResultDetailsView() {
  const rows = [
    ["Glucose", "92", "mg/dL", "70-99", "Normal"],
    ["BUN (Blood Urea Nitrogen)", "14", "mg/dL", "6-20", "Normal"],
    ["Creatinine", "1.1", "mg/dL", "0.6-1.2", "Normal"],
    ["Sodium", "146", "mEq/L", "135-145", "Slightly High"],
  ];
  return (
    <div className="mx-auto max-w-[1120px]">
      <Link href="/patient/lab-results" className="mb-8 inline-flex items-center text-[18px] text-[#344966]">Back to all results</Link>
      <Card className="p-10">
        <div className="flex items-start justify-between">
          <div><PillLabel tone="gray"><FlaskConical className="mr-2 h-4 w-4" />Blood Panel</PillLabel><h1 className="mt-6 text-[42px] font-semibold">Comprehensive Metabolic Panel</h1><p className="mt-4 border-t border-[#d8e2eb] pt-4 text-[17px]"><Calendar className="mr-2 inline h-5 w-5" />Collected: Oct 24, 2023 <Stethoscope className="ml-6 mr-2 inline h-5 w-5" />Ordered by: Dr. Sarah Jenkins</p></div>
          <button className="inline-flex h-12 items-center rounded-lg bg-[#006d86] px-6 text-[18px] font-semibold text-white"><Download className="mr-2 h-5 w-5" />Download PDF</button>
        </div>
      </Card>
      <Card className="mt-8 border-l-4 border-l-[#006d86] p-8"><p className="text-[20px] font-semibold">Doctor&apos;s Note</p><p className="mt-2 text-[19px]">&quot;All values are within normal ranges. No immediate concerns.&quot;</p></Card>
      <h2 className="mt-10 text-[28px] font-semibold">Detailed Results</h2>
      <Card className="mt-6 overflow-hidden">
        <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr] bg-[#eef4f8] px-8 py-4 text-[14px] uppercase tracking-wide text-[#344966]"><span>Test Name</span><span>Result</span><span>Range</span><span>Status</span></div>
        {rows.map((row) => <div key={row[0]} className="grid min-h-[82px] grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr] items-center border-t border-[#d8e2eb] px-8 text-[18px]"><span>{row[0]}</span><span><b className="text-[30px]">{row[1]}</b> <span className="text-[14px]">{row[2]}</span></span><span className="text-[#344966]">{row[3]}</span><PillLabel tone={row[4] === "Normal" ? "gray" : "blue"}>{row[4]}</PillLabel></div>)}
      </Card>
      <p className="mt-12 text-center text-[17px] text-[#343d48]"><BadgeInfo className="mx-auto mb-3 h-8 w-8 text-[#9aa7b0]" />Please discuss these results with your doctor during your next follow-up.</p>
    </div>
  );
}

function AppointmentRequestsView() {
  return (
    <div>
      <Header title="Appointment Requests" subtitle="Manage your past and upcoming appointment inquiries.">
        <ButtonLink href="/patient/appointment-requests/new"><Plus className="mr-2 h-5 w-5" />Request New Appointment</ButtonLink>
      </Header>
      <div className="grid grid-cols-[2fr_0.95fr] gap-8">
        <div className="space-y-6">
          <AppointmentCard icon={Brain} title="Neurology" date="Oct 30, 2023" status="Approved" reason="Follow-up on recent test results and medication adjustment." tone="teal" />
          <AppointmentCard icon={Heart} title="Dental" date="Nov 12, 2023" status="Pending Review" reason="Routine 6-month cleaning and general checkup." tone="amber" />
        </div>
        <div className="space-y-8">
          <Card className="bg-[#d8e7ff] p-8"><h2 className="text-[20px] font-semibold text-[#51647c]"><BadgeInfo className="mr-3 inline h-6 w-6" />Response Time</h2><p className="mt-5 text-[18px] leading-7 text-[#65737e]">Our scheduling team typically reviews new requests within 24-48 business hours. You will receive a notification once your appointment is confirmed.</p></Card>
          <Card className="p-8"><h2 className="text-[20px] font-semibold">Your Activity</h2><InfoLine label="Total Requests This Year" value="4" /><InfoLine label="Upcoming Visits" value="1" /><InfoLine label="Pending Approvals" value="1" /></Card>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ icon: Icon, title, date, status, reason, tone }: { icon: IconType; title: string; date: string; status: string; reason: string; tone: "teal" | "amber" }) {
  return (
    <Card className={cn("border-l-4 p-8", tone === "teal" ? "border-l-[#0088a8]" : "border-l-[#b56a0d]")}>
      <div className="flex items-start justify-between"><div className="flex gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4f8]"><Icon className="h-6 w-6 text-[#006d86]" /></span><div><h2 className="text-[28px] font-semibold">{title}</h2><p className="text-[17px]"><Calendar className="mr-2 inline h-5 w-5" />{date}</p></div></div><PillLabel tone={tone}>{status}</PillLabel></div>
      <div className="mt-6 rounded-lg border border-[#d8e2eb] bg-[#f5f9fc] p-5"><p className="text-[18px] font-medium">Reason for visit</p><p className="mt-3 text-[17px]">{reason}</p></div>
      <p className="mt-5 border-t border-[#d8e2eb] pt-4 text-[15px]">Submitted on {title === "Neurology" ? "Oct 25, 2023" : "Nov 05, 2023"}</p>
    </Card>
  );
}

function CreateAppointmentView() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="mx-auto max-w-[960px]">
      <Header title="Request an Appointment" subtitle="Fill out the form below to schedule your next visit. We will confirm the details via email." />
      {submitted ? <Card className="mb-6 border-l-4 border-l-[#0088a8] p-5 text-[18px] text-[#006d86]">Appointment request submitted. We will confirm the details via email.</Card> : null}
      <Card className="p-10">
        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="space-y-7">
          <Field label="Department"><SelectControl text="Select a department..." /></Field>
          <div className="grid grid-cols-2 gap-8"><Field label="Preferred Date"><input type="text" placeholder="mm/dd/yyyy" className={fieldInputClass} /></Field><Field label="Preferred Time"><div className="grid h-12 grid-cols-3 rounded-lg border border-[#b9c8d5] bg-[#eef4f8] text-center text-[16px] font-semibold leading-[46px]"><span>Morning</span><span>Afternoon</span><span>Evening</span></div></Field></div>
          <Field label="Reason for Visit"><textarea required className={cn(fieldInputClass, "min-h-[110px] py-3")} placeholder="Briefly describe your symptoms or reason for scheduling..." /></Field>
          <Field label="Additional Notes (Optional)"><textarea className={cn(fieldInputClass, "min-h-[82px] py-3")} /></Field>
          <div className="flex items-center justify-between border-t border-[#d8e2eb] pt-8"><p className="text-[#344966]"><BadgeInfo className="mr-2 inline h-5 w-5" />Our team will review your request and get back to you shortly.</p><div className="flex gap-5"><Link href="/patient/appointment-requests" className="inline-flex h-12 items-center rounded-lg border border-[#263b57] px-8 text-[17px] font-semibold">Cancel</Link><button className="h-12 rounded-lg bg-[#006d86] px-8 text-[17px] font-semibold text-white">Submit Request</button></div></div>
        </form>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-[17px] font-semibold">{label}<div className="mt-2">{children}</div></label>;
}

function SelectControl({ text }: { text: string }) {
  return <button type="button" className={cn(fieldInputClass, "flex items-center justify-between text-left")}><span>{text}</span><ChevronDown className="h-5 w-5" /></button>;
}

function SettingsView() {
  return (
    <div className="mx-auto max-w-[900px]">
      <Header title="Account Settings" subtitle="Manage your personal information, security preferences, and notifications." />
      <div className="space-y-8">
        <Card className="overflow-hidden"><div className="p-8"><SectionTitle icon={BadgeInfo} title="Account Information" /></div><div className="border-t border-[#b9c8d5] p-8"><SettingRow label="Email Address" value="a.johnson@email.com" /><SettingRow label="Phone Number" value="(555) 019-2834" /></div></Card>
        <Card className="flex items-center justify-between p-8"><div><SectionTitle icon={LockKeyhole} title="Password" /><p className="mt-2">Ensure your account uses a strong, secure password.</p></div><button className="inline-flex h-12 items-center rounded-lg border border-[#738394] px-6 text-[17px] font-semibold text-[#263b57]"><KeyRound className="mr-2 h-5 w-5" />Change Password</button></Card>
        <Card className="overflow-hidden"><div className="p-8"><SectionTitle icon={Bell} title="Notification Preferences" /><p className="mt-2">Control how and where you receive updates.</p></div><div className="grid grid-cols-[1fr_110px_110px] border-t border-[#b9c8d5] bg-[#eef4f8] px-6 py-4 text-[14px] uppercase tracking-wide text-[#344966]"><span>Update Type</span><span>Email</span><span>Portal</span></div>{["Appointments", "Lab Results", "Medicines"].map((name, index) => <div key={name} className="grid min-h-[78px] grid-cols-[1fr_110px_110px] items-center border-t border-[#e2e8ee] px-6 text-[18px]"><span>{name}</span><Toggle defaultOn={index !== 1} /><Toggle defaultOn={index !== 2} /></div>)}</Card>
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return <div className="mb-5 flex items-center justify-between rounded-lg bg-[#f3f8fc] p-6 text-[18px] last:mb-0"><span><b className="block text-[14px] uppercase tracking-wide text-[#344966]">{label}</b>{value}</span><button className="text-[#006d86]"><Edit3 className="mr-2 inline h-5 w-5" />Edit</button></div>;
}

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(Boolean(defaultOn));
  return <button aria-pressed={on} onClick={() => setOn(!on)} className={cn("relative h-8 w-14 rounded-full transition", on ? "bg-[#006d86]" : "bg-[#d4dde4]")}><span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white transition", on ? "left-7" : "left-1 bg-[#7a8b96]")} /></button>;
}

function NotificationsView() {
  const [read, setRead] = useState(false);
  const list = useMemo(() => [
    { icon: Microscope, time: read ? "Read" : "NEW - 2 hours ago", title: "Lab results for Comprehensive Metabolic Panel are ready to view", body: "Your recent lab work has been processed and reviewed by your care team.", href: "/patient/lab-results/cmp", action: "View Results", active: !read },
    { icon: CalendarDays, time: "1 day ago", title: "Your appointment request for Neurology has been approved", body: "Please review the preparation instructions before your visit.", href: "/patient/appointment-requests", action: "View Details" },
    { icon: ClipboardPlus, time: "Yesterday", title: "Prescription for Sumatriptan is ready for pickup", body: "Available at Main Street Pharmacy. Please bring your ID.", href: "/patient/medicines", action: "View Details" },
  ], [read]);
  return (
    <div>
      <div className="mb-10 flex items-end justify-between"><Header title="Notifications" subtitle="Stay updated on your health journey." /><button onClick={() => setRead(true)} className="mb-8 text-[18px] font-semibold text-[#006d86]">Mark all as read</button></div>
      <div className="space-y-6">
        {list.map((item) => <NotificationCard key={item.title} item={item} />)}
      </div>
    </div>
  );
}

function NotificationCard({ item }: { item: { icon: IconType; time: string; title: string; body: string; href: string; action: string; active?: boolean } }) {
  const Icon = item.icon;
  return (
    <Card className={cn("flex min-h-[150px] items-center justify-between p-8", item.active && "border-l-4 border-l-[#0088a8]")}>
      <div className="flex items-center gap-8"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f8fb]"><Icon className="h-7 w-7 text-[#006d86]" /></span><div><p className="text-[14px] uppercase tracking-wide text-[#006d86]">{item.time}</p><h2 className="mt-2 text-[25px] font-semibold">{item.title}</h2><p className="mt-2 text-[17px] text-[#343d48]">{item.body}</p></div></div>
      <Link href={item.href} className={cn("inline-flex items-center rounded-lg px-7 py-3 text-[17px] font-semibold", item.active ? "bg-[#006d86] text-white" : "text-[#006d86]")}>{item.action}<ChevronRight className="ml-2 h-5 w-5" /></Link>
    </Card>
  );
}
