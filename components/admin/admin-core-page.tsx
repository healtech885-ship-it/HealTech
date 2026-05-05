/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  Activity,
  Barcode,
  Bell,
  Box,
  BriefcaseMedical,
  Building2,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleSlash,
  ClipboardPlus,
  Clock3,
  ClipboardCheck,
  Download,
  Edit3,
  Eye,
  Filter,
  FileCog,
  FileText,
  Grid2X2,
  FlaskConical,
  Home,
  Hospital,
  ImageIcon,
  Info,
  KeyRound,
  Laptop,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MoreVertical,
  PanelTop,
  Paperclip,
  Pencil,
  Phone,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Shirt,
  SlidersHorizontal,
  Stethoscope,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  WalletCards,
  Wrench,
  XCircle,
} from "lucide-react";

type AdminView =
  | "dashboard"
  | "employees"
  | "employee-form"
  | "departments"
  | "employee-details"
  | "leave-requests"
  | "leave-review"
  | "asset-inventory"
  | "store-item-details"
  | "store-assignments"
  | "assign-store-item"
  | "store-requests"
  | "store-request-review"
  | "patients-overview"
  | "visits-overview"
  | "reports-hub"
  | "system-settings"
  | "audit-logs";

type OperationActive = "Dashboard" | "Patients" | "Schedules" | "Inventory" | "Settings";

const employees = [
  {
    name: "Sarah Jenkins",
    email: "sarah.j@medcore.com",
    role: "Clinic Manager",
    dept: "Administration",
    phone: "+1 (555) 019-2834",
    avatar: "https://i.pravatar.cc/96?img=32",
    status: "Active",
    review: "Verified",
    initials: "SJ",
  },
  {
    name: "Dr. David Kim",
    email: "david.k@medcore.com",
    role: "Pediatrician",
    dept: "Pediatrics",
    phone: "+1 (555) 012-9931",
    avatar: "https://i.pravatar.cc/96?img=12",
    status: "Active",
    review: "Pending Review",
    initials: "DK",
  },
  {
    name: "Maria Rodriguez",
    email: "m.rodriguez@medcore.com",
    role: "Senior RN",
    dept: "Emergency",
    phone: "+1 (555) 018-4420",
    avatar: "",
    status: "On Leave",
    review: "Verified",
    initials: "MR",
  },
];

const departments = [
  { title: "General Medicine", icon: Stethoscope, tone: "cyan", status: "Active", description: "Primary care and internal medicine focusing on comprehensive adult...", employees: 42, doctors: 18 },
  { title: "Pediatrics", icon: UserCheck, tone: "amber", status: "Active", description: "Specialized medical care for infants, children, and adolescents.", employees: 28, doctors: 12 },
  { title: "Laboratory", icon: BriefcaseMedical, tone: "blue", status: "Under Review", description: "Diagnostic testing, pathology, and clinical research facilities.", employees: 15, doctors: 4 },
  { title: "Cardiology", icon: PanelTop, tone: "slate", status: "Active", description: "Diagnosis and treatment of heart and vascular system disorders.", employees: 22, doctors: 8 },
];

const assets = [
  { item: "Dell Latitude 5430", category: "IT Equipment", sku: "IT-LPT-0042", total: 45, assigned: 42, available: 3, status: "LOW STOCK", icon: Laptop },
  { item: "Littmann Classic III", category: "Medical Tools", sku: "MED-STH-0118", total: 120, assigned: 95, available: 25, status: "IN STOCK", icon: Stethoscope },
  { item: "Standard Lab Coat (M)", category: "Apparel", sku: "APP-LBC-002M", total: 85, assigned: 85, available: 0, status: "OUT OF STOCK", icon: Shirt },
  { item: "Ergonomic Office Chair", category: "Furniture", sku: "FUR-CHR-0091", total: 60, assigned: 52, available: 8, status: "IN STOCK", icon: BriefcaseMedical },
];

const assignments = [
  { employee: "Dr. Sarah Reynolds", initials: "DR", dept: "Cardiology", item: "Portable ECG Monitor", sku: "ECG-2023-045", assigned: "Oct 12, 2023", return: "Nov 12, 2023", condition: "Excellent", status: "Assigned", tone: "teal" },
  { employee: "Mark Kinsley, RN", initials: "MK", dept: "Pediatrics", item: "Digital Thermometer Kit", sku: "DTK-998-A", assigned: "Sep 01, 2023", return: "Oct 01, 2023", condition: "Good", status: "Overdue", tone: "amber" },
  { employee: "Dr. James Lin", initials: "JL", dept: "Neurology", item: "Reflex Hammer Set", sku: "RH-NEU-02", assigned: "Oct 20, 2023", return: "Dec 20, 2023", condition: "Fair", status: "Assigned", tone: "teal" },
  { employee: "Amanda Miller", initials: "AM", dept: "Admin", item: "Clinic Tablet iPad Pro", sku: "TAB-IPAD-101", assigned: "Jan 15, 2023", return: "Jan 15, 2024", condition: "Excellent", status: "Assigned", tone: "slate" },
];

const storeRequests = [
  { requester: "Sarah Jenkins", initials: "SJ", dept: "Emergency Ward", item: "Surgical Masks (N95)", sku: "MED-8821", qty: "500", priority: "Urgent", status: "Pending", tone: "blue" },
  { requester: "Dr. Mark Ruffalo", initials: "MR", dept: "Cardiology", item: "ECG Electrodes", sku: "CRD-102", qty: "200", priority: "High", status: "Pending", tone: "amber" },
  { requester: "Alicia Keys", initials: "AK", dept: "Pediatrics", item: "Latex Gloves (Medium)", sku: "GEN-404", qty: "1000", priority: "Normal", status: "Approved", tone: "teal" },
  { requester: "James Logan", initials: "JL", dept: "Facilities", item: "Hand Sanitizer Refills", sku: "FAC-011", qty: "24", priority: "Normal", status: "Pending", tone: "blue" },
];

const patientDirectory = [
  { name: "Sarah Jenkins", dob: "04/12/1980", mrn: "MRN-94821", phone: "(555) 123-4567", department: "Cardiology", lastVisit: "Oct 12, 2023", visits: "14", avatar: "https://i.pravatar.cc/80?img=32", tone: "blue" },
  { name: "Marcus Thorne", dob: "11/05/1992", mrn: "MRN-94822", phone: "(555) 987-6543", department: "Orthopedics", lastVisit: "Oct 24, 2023", visits: "3", avatar: "https://i.pravatar.cc/80?img=12", tone: "amber" },
  { name: "Elena Patel", dob: "02/18/1975", mrn: "MRN-94823", phone: "(555) 234-5678", department: "General", lastVisit: "Nov 01, 2023", visits: "8", avatar: "", initials: "EP", tone: "slate" },
  { name: "Chloe Bennett", dob: "08/30/2001", mrn: "MRN-94824", phone: "(555) 345-6789", department: "Neurology", lastVisit: "Nov 05, 2023", visits: "2", avatar: "https://i.pravatar.cc/80?img=44", tone: "blue" },
  { name: "Robert Johansson", dob: "01/22/1960", mrn: "MRN-94825", phone: "(555) 456-7890", department: "Cardiology", lastVisit: "Nov 08, 2023", visits: "24", avatar: "", initials: "RJ", tone: "slate" },
];

const visitRows = [
  { id: "#VN-8492", patient: "Eleanor Rigby", dob: "1954-08-12", initials: "ER", doctor: "Dr. A. Chen", department: "Cardiology", priority: "High", status: "In Progress" },
  { id: "#VN-8493", patient: "John Smith", dob: "1982-11-05", initials: "JS", doctor: "Dr. M. Rossi", department: "General Practice", priority: "Routine", status: "Waiting (12m)" },
  { id: "#VN-8494", patient: "Maria Kowalski", dob: "1990-03-22", initials: "MK", doctor: "Dr. S. Patel", department: "Orthopedics", priority: "Routine", status: "Completed" },
  { id: "#VN-8495", patient: "Liam Davis", dob: "2015-06-18", initials: "LD", doctor: "Dr. J. Lee", department: "Pediatrics", priority: "Urgent", status: "Waiting (4m)" },
];

const auditRows = [
  { timestamp: "Oct 24, 2023\n14:32:05 EDT", user: "Dr. Sarah Jenkins", role: "Physician", avatar: "https://i.pravatar.cc/80?img=13", action: "Deleted Billing Record", entity: "Invoice INV-9921", entityType: "Billing", ip: "192.168.1.45", severity: "Critical", icon: XCircle },
  { timestamp: "Oct 24, 2023\n14:28:12 EDT", user: "Mark Johnson", role: "Administrator", initials: "MJ", action: "Updated System Settings", entity: "Config_Global_v2", entityType: "System", ip: "10.0.0.12", severity: "Info", icon: FileText },
  { timestamp: "Oct 24, 2023\n14:15:00 EDT", user: "System Process", role: "Automated", initials: "SP", action: "API Sync Timeout", entity: "External Lab Portal", entityType: "Integration", ip: "Server_Node_04", severity: "Warning", icon: RefreshCw },
  { timestamp: "Oct 24, 2023\n13:55:22 EDT", user: "Alex Mercer, RN", role: "Nursing Staff", avatar: "https://i.pravatar.cc/80?img=52", action: "Accessed Patient File", entity: "PT-48291", entityType: "Patient Record", ip: "192.168.2.105", severity: "Info", icon: Eye },
  { timestamp: "Oct 24, 2023\n13:41:05 EDT", user: "Unknown User", role: "External", initials: "?", action: "Failed Login", entity: "Auth_Gateway", entityType: "Security", ip: "203.0.113.42", severity: "Warning", icon: KeyRound },
];

const leaveRequests = [
  { name: "Mark Torres", initials: "MT", role: "Staff Nurse", dept: "ER", type: "Sick Leave", dates: "Oct 14, 2024", duration: "1 Day", days: "1 Day", status: "Pending", submitted: "Oct 14, 08:30 AM", avatar: "", priority: "Normal" },
  { name: "Dr. Sarah Jenkins", initials: "SJ", role: "Lead Pediatrician", dept: "Pediatrics", type: "Annual Leave", dates: "Oct 20 - Oct 25, 2024", duration: "6 Days", days: "6 Days", status: "Approved", submitted: "Oct 01, 10:15 AM", avatar: "https://i.pravatar.cc/80?img=32", priority: "Normal" },
  { name: "Dr. Emily Chen", initials: "EC", role: "Orthopedic Surgeon", dept: "Surgery", type: "Conference", dates: "Nov 02 - Nov 05, 2024", duration: "4 Days", days: "4 Days", status: "Approved", submitted: "Oct 05, 02:40 PM", avatar: "", priority: "Normal" },
  { name: "James Wilson", initials: "JW", role: "Rad Tech", dept: "Radiology", type: "Personal", dates: "Oct 18 - Oct 19, 2024", duration: "2 Days", days: "2 Days", status: "Rejected", submitted: "Oct 10, 09:12 AM", avatar: "", priority: "Normal" },
  { name: "Anita Patel", initials: "AP", role: "Pharmacist", dept: "Pharmacy", type: "Annual Leave", dates: "Dec 01 - Dec 14, 2024", duration: "14 Days", days: "14 Days", status: "Pending", submitted: "Oct 12, 11:45 AM", avatar: "https://i.pravatar.cc/80?img=45", priority: "Normal" },
];

export function AdminCorePage({ segments }: { segments?: string[] }) {
  const view = getView(segments);
  const active = view === "departments" ? "Departments" : view === "employee-details" ? "Medical Records" : view === "employees" || view === "employee-form" ? "Employees" : "Dashboard";
  const compactHeader = view === "employees";
  const operationView = view === "leave-requests" || view === "leave-review" || view === "asset-inventory" || view === "store-item-details" || view === "store-assignments" || view === "assign-store-item" || view === "store-requests" || view === "store-request-review" || view === "patients-overview" || view === "visits-overview" || view === "reports-hub" || view === "system-settings" || view === "audit-logs";

  if (view === "employee-form") {
    return (
      <main className="min-h-screen bg-[#f1f6fa] font-[Manrope,Inter,sans-serif] text-[#0a1014]">
        <EmployeeFormView />
      </main>
    );
  }

  if (operationView) {
    const operationActive: OperationActive =
      view === "patients-overview" ? "Patients" :
      view === "leave-requests" || view === "leave-review" ? "Schedules" :
      view === "visits-overview" || view === "reports-hub" ? "Dashboard" :
      view === "system-settings" || view === "audit-logs" ? "Settings" :
      "Inventory";
    return (
      <OperationsShell landingHeader={view === "store-assignments" || view === "leave-review"} active={operationActive}>
        {view === "patients-overview" ? <PatientsOverviewView /> : null}
        {view === "visits-overview" ? <VisitsOverviewView /> : null}
        {view === "reports-hub" ? <ReportsHubView /> : null}
        {view === "system-settings" ? <SystemSettingsView /> : null}
        {view === "audit-logs" ? <AuditLogsView /> : null}
        {view === "leave-requests" ? <LeaveRequestsOperationsView /> : null}
        {view === "leave-review" ? <LeaveReviewOperationsView /> : null}
        {view === "asset-inventory" ? <AssetInventoryView /> : null}
        {view === "store-item-details" ? <StoreItemDetailsView /> : null}
        {view === "store-assignments" ? <StoreAssignmentsView /> : null}
        {view === "assign-store-item" ? <AssignStoreItemView /> : null}
        {view === "store-requests" ? <StoreRequestsView /> : null}
        {view === "store-request-review" ? <StoreRequestReviewView /> : null}
      </OperationsShell>
    );
  }

  return (
    <main className="min-h-screen bg-[#f1f6fa] font-[Manrope,Inter,sans-serif] text-[#0a1014]">
      <AdminSidebar active={active} bottomConsultation={view === "employee-details"} />
      <section className="min-h-screen pl-[320px]">
        <AdminTopbar
          brand={view === "dashboard"}
          search={!compactHeader}
          searchPlaceholder={view === "departments" ? "Search departments..." : view === "employee-details" ? "Search records, patients..." : "Search patients, records..."}
        />
        {view === "dashboard" ? <DashboardView /> : null}
        {view === "employees" ? <EmployeesView /> : null}
        {view === "departments" ? <DepartmentsView /> : null}
        {view === "employee-details" ? <EmployeeDetailsView /> : null}
      </section>
    </main>
  );
}

function getView(segments?: string[]): AdminView {
  const path = (segments ?? ["dashboard"]).join("/");
  if (path === "employees") return "employees";
  if (path === "employees/new" || path.startsWith("employees/edit")) return "employee-form";
  if (path === "departments") return "departments";
  if (path === "patients") return "patients-overview";
  if (path === "visits") return "visits-overview";
  if (path === "reports") return "reports-hub";
  if (path === "settings") return "system-settings";
  if (path === "audit-logs") return "audit-logs";
  if (path === "leave-requests") return "leave-requests";
  if (path.startsWith("leave-requests/")) return "leave-review";
  if (path === "store/items") return "asset-inventory";
  if (path.startsWith("store/items/")) return "store-item-details";
  if (path === "store/assignments/new") return "assign-store-item";
  if (path === "store/assignments") return "store-assignments";
  if (path === "store/requests") return "store-requests";
  if (path.startsWith("store/requests/")) return "store-request-review";
  if (path.startsWith("employees/")) return "employee-details";
  return "dashboard";
}

function AdminSidebar({ active, bottomConsultation = false }: { active: string; bottomConsultation?: boolean }) {
  const items = [
    { label: "Dashboard", href: "/admin/dashboard", icon: Grid2X2 },
    { label: "Patients", href: "/admin/patients", icon: Users },
    { label: "Appointments", href: "/admin/visits", icon: Calendar },
    { label: "Medical Records", href: "/admin/employees/eleanor-vance", icon: FileCog },
    { label: "Departments", href: "/admin/departments", icon: Building2 },
    { label: "Analytics", href: "/admin/reports", icon: PanelTop },
    { label: "Billing", href: "/admin/settings", icon: WalletCards },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[320px] flex-col border-r border-[#d7e1e7] bg-[#f7fbff] px-5 py-6">
      <div className="flex items-center gap-4">
        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-lg bg-[#006f87] text-[22px] font-bold text-white">
          {active === "Employees" ? "CG" : <BriefcaseMedical className="h-7 w-7" />}
        </div>
        <div>
          <p className="text-[27px] font-bold leading-8 tracking-[-0.03em] text-[#10171c]">City General</p>
          <p className="text-[16px] leading-5 text-[#51647c]">Admin Wing</p>
        </div>
      </div>

      {!bottomConsultation ? (
        <Link href="/admin/visits" className="mt-[50px] flex h-[49px] items-center justify-center gap-3 rounded-lg bg-[#0b9ab5] text-[17px] font-semibold text-white shadow-sm">
          <Plus className="h-5 w-5" />
          New Consultation
        </Link>
      ) : null}

      <nav className={bottomConsultation ? "mt-[62px] space-y-2" : "mt-5 space-y-2"}>
        {items.filter((item) => item.label !== "Departments" || active === "Departments").map((item) => {
          const selected = item.label === active || (active === "Employees" && item.label === "Dashboard" && false);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-[58px] items-center gap-5 rounded-lg px-5 text-[17px] font-medium transition ${
                selected ? "border border-[#d5e1e8] bg-white text-[#0089a8] shadow-sm" : "text-[#263a54] hover:bg-white"
              }`}
            >
              <item.icon className="h-[23px] w-[23px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#d7e1e7] pt-5">
        {bottomConsultation ? (
          <Link href="/admin/visits" className="mb-5 flex h-[52px] items-center justify-center gap-3 rounded-lg bg-[#00758d] text-[18px] font-semibold text-white">
            <Plus className="h-5 w-5" />
            New Consultation
          </Link>
        ) : null}
        <Link href="/admin/settings" className={`flex h-[58px] items-center gap-5 rounded-lg px-5 text-[17px] font-medium ${active === "Employees" ? "border border-[#d5e1e8] bg-white text-[#0089a8] shadow-sm" : "text-[#263a54]"}`}>
          <Settings className="h-[23px] w-[23px]" />
          Settings
        </Link>
        <button type="button" className="mt-2 flex h-[58px] w-full items-center gap-5 rounded-lg px-5 text-left text-[17px] font-medium text-[#263a54]">
          <LogOut className="h-[23px] w-[23px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}

function AdminTopbar({ brand, search, searchPlaceholder }: { brand?: boolean; search?: boolean; searchPlaceholder: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center border-b border-[#d9e3ea] bg-white px-8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {brand ? <p className="mr-8 text-[26px] font-bold tracking-[-0.03em] text-[#080d10]">HealTech</p> : null}
      {search ? (
        <div className="relative w-[398px]">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8293a8]" />
          <input className={`h-12 w-full border bg-[#f5f9fc] pl-14 pr-5 text-[17px] outline-none placeholder:text-[#8293a8] ${brand ? "rounded-full border-0" : "rounded-lg border-[#c8d5de]"}`} placeholder={searchPlaceholder} />
        </div>
      ) : null}
      <div className="flex-1" />
      <div className="ml-auto flex items-center gap-7 text-[#51647c]">
        <Bell className="h-6 w-6" />
        <Clock3 className="h-6 w-6" />
        <CircleHelp className="h-6 w-6" />
        <span className="h-8 w-px bg-[#d7e1e7]" />
        <button className="rounded-full border border-[#f5b8b8] px-8 py-2.5 text-[17px] font-medium text-[#d00000]">✱ Emergency</button>
        <img alt="" src="https://i.pravatar.cc/80?img=13" className="h-10 w-10 rounded-full border border-[#c7d5e0]" />
      </div>
    </header>
  );
}

function OperationsShell({ children, landingHeader = false, active = "Inventory" }: { children: React.ReactNode; landingHeader?: boolean; active?: OperationActive }) {
  if (landingHeader) {
    return (
      <main className="min-h-screen bg-[#f1f6fa] font-[Manrope,Inter,sans-serif] text-[#0a1014]">
        <MarketingHeader />
        <div className="flex">
          <OperationsSidebar offset active={active} />
          <section className="min-h-[1190px] flex-1 pl-[320px]">{children}</section>
        </div>
        <MarketingFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f1f6fa] font-[Manrope,Inter,sans-serif] text-[#0a1014]">
      <OperationsSidebar active={active} />
      <section className="min-h-screen pl-[320px]">{children}</section>
    </main>
  );
}

function MarketingHeader() {
  return (
    <header className="flex h-[86px] items-center border-b border-[#d7e1e7] bg-white px-[30px]">
      <Link href="/" className="text-[26px] font-bold tracking-[-0.03em] text-[#0089a8]">HealTech</Link>
      <nav className="mx-auto flex gap-8 text-[18px] font-medium text-[#263a54]">
        <Link href="/">Solutions</Link>
        <Link href="/">Roles</Link>
        <Link href="/">Workflow</Link>
        <Link href="/">Pricing</Link>
      </nav>
      <div className="flex items-center gap-5 text-[18px]">
        <Link href="/login">Sign In</Link>
        <Link href="/login" className="rounded-lg bg-[#00758d] px-6 py-3 font-semibold text-white">Request Demo</Link>
      </div>
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="flex h-[116px] items-center justify-between border-t border-[#d7e1e7] bg-white px-[30px] text-[14px] text-[#51647c]">
      <p>© 2026 HealTech. Clinic operations software.</p>
      <div className="flex gap-6 underline">
        <Link href="/">Privacy Policy</Link>
        <Link href="/">Terms of Service</Link>
        <Link href="/">Security Compliance</Link>
        <Link href="/">API Documentation</Link>
      </div>
    </footer>
  );
}

function OperationsSidebar({ offset = false, active = "Inventory" }: { offset?: boolean; active?: OperationActive }) {
  const items = [
    { label: "Dashboard", href: "/admin/dashboard", icon: Grid2X2 },
    { label: "Patients", href: "/admin/patients", icon: User },
    { label: "Schedules", href: "/admin/visits", icon: Calendar },
    { label: "Lab Results", href: "/admin/reports", icon: Stethoscope },
    { label: "Inventory", href: "/admin/store/items", icon: BriefcaseMedical },
    { label: "Billing", href: "/admin/settings", icon: WalletCards },
  ];

  return (
    <aside className={`${offset ? "top-[86px] h-[calc(100vh-86px)]" : "inset-y-0"} fixed left-0 z-20 flex w-[320px] flex-col border-r border-[#d7e1e7] bg-[#f7fbff] px-5 py-8`}>
      <div className="flex items-center gap-4">
        <img src="https://i.pravatar.cc/80?img=13" alt="" className="h-10 w-10 rounded-full border border-[#bfd0dc]" />
        <div>
          <p className="text-[24px] font-bold leading-7 tracking-[-0.03em]">Central Clinic</p>
          <p className="text-[16px] text-[#51647c]">Admin Portal</p>
        </div>
      </div>
      <Link href="/admin/visits" className="mt-10 flex h-[46px] items-center justify-center gap-3 rounded-lg bg-[#00758d] text-[18px] font-semibold text-white">
        <Plus className="h-5 w-5" />
        New Appointment
      </Link>
      <nav className="mt-9 space-y-3">
        {items.map((item) => {
          const selected = item.label === active;
          return (
            <Link key={item.label} href={item.href} className={`flex h-[48px] items-center gap-5 rounded-lg px-5 text-[17px] ${selected ? "border border-[#dbe5ec] bg-white text-[#0089a8] shadow-sm" : "text-[#51647c]"}`}>
              <item.icon className="h-[23px] w-[23px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[#d7e1e7] pt-5">
        <Link href="/admin/settings" className={`flex h-[52px] items-center gap-5 rounded-lg px-5 text-[18px] ${active === "Settings" ? "border border-[#dbe5ec] bg-white text-[#0089a8] shadow-sm" : "text-[#51647c]"}`}><Settings className="h-6 w-6" />Settings</Link>
        <Link href="/admin/reports" className="flex h-[52px] items-center gap-5 px-5 text-[18px] text-[#51647c]"><CircleHelp className="h-6 w-6" />Support</Link>
      </div>
    </aside>
  );
}

function AssetInventoryView() {
  return (
    <div className="px-[30px] py-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.03em]">Asset Inventory</h1>
          <p className="text-[18px] text-[#3d4950]">Manage and track non-medical clinic assets.</p>
        </div>
        <div className="flex gap-3">
          <SearchBox placeholder="Search assets, SKU..." width="320px" />
          <Link href="/admin/store/items/titanium-mayo-scissors" className="flex h-[45px] items-center gap-3 rounded-lg bg-[#00758d] px-6 text-[18px] font-semibold text-white"><Plus className="h-5 w-5" />Add Asset</Link>
        </div>
      </div>
      <div className="mt-11 grid grid-cols-4 gap-5">
        <InventoryStat title="Total Assets" value="1,248" helper="+12 this month" icon={PanelTop} />
        <InventoryStat title="Low Stock Warning" value="14" helper="Requires attention" icon={AlertTriangle} danger />
        <InventoryStat title="Currently Assigned" value="892" helper="71% utilization rate" icon={ClipboardPlus} />
        <InventoryStat title="In Repair / Damaged" value="23" helper="Pending maintenance" icon={Wrench} amber />
      </div>
      <InventoryTable />
    </div>
  );
}

function StoreAssignmentsView() {
  return (
    <div className="px-10 py-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.03em]">Store Assignments</h1>
          <p className="text-[18px] text-[#3d4950]">Manage and track clinic assets assigned to staff.</p>
        </div>
        <Link href="/admin/store/assignments/new" className="flex h-[46px] items-center gap-3 rounded-lg bg-[#00758d] px-6 text-[18px] font-semibold text-white"><ClipboardPlus className="h-5 w-5" />Assign Store Item</Link>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-5">
        <AssignmentStat title="Total Assigned Assets" value="142" icon={PanelTop} tone="blue" />
        <AssignmentStat title="Overdue Returns" value="7" icon={AlertTriangle} tone="amber" />
        <AssignmentStat title="Maintenance Required" value="3" icon={Wrench} tone="teal" />
      </div>
      <div className="mt-10 flex gap-5">
        <SearchBox placeholder="Search by employee, item, or SKU..." width="560px" />
        <button className="h-[48px] rounded-lg border border-[#b9c8d0] bg-white px-5 text-[17px]">All Departments⌄</button>
        <button className="h-[48px] rounded-lg border border-[#b9c8d0] bg-white px-5 text-[17px]">All Statuses⌄</button>
      </div>
      <AssignmentsTable />
    </div>
  );
}

function PatientsOverviewView() {
  return (
    <div className="px-10 py-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.03em]">Patients Overview</h1>
          <p className="text-[18px] text-[#51647c]">High-level view of patient records and clinic metrics.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex h-[46px] items-center gap-3 rounded-lg border border-[#b9c8d0] bg-white px-6 text-[18px]"><Download className="h-5 w-5" />Export List</button>
          <button className="flex h-[46px] items-center gap-3 rounded-lg bg-[#00758d] px-6 text-[18px] font-semibold text-white"><UserPlus className="h-5 w-5" />Add Patient</button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-8">
        <PatientMetric title="Total Patients" value="14,285" delta="+2.4%" helper="vs last month" icon={Users} tone="blue" />
        <PatientMetric title="New This Month" value="342" delta="+12.1%" helper="vs last month" icon={UserPlus} tone="amber" />
        <PatientMetric title="Active Visits" value="28" delta="-1.2%" helper="vs yesterday" icon={Hospital} tone="slate" />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-[#b9c8d0] bg-white">
        <div className="flex h-[88px] items-center justify-between px-8">
          <h2 className="text-[28px] font-semibold">Patient Directory</h2>
          <div className="flex gap-3">
            <SearchBox placeholder="Search name or MRN..." width="320px" />
            <button className="flex h-[48px] w-[48px] items-center justify-center rounded-lg border border-[#b9c8d0] bg-white"><Filter className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="grid h-[52px] grid-cols-[1.7fr_1fr_1.2fr_1.2fr_1.1fr_.9fr_.5fr] items-center border-y border-[#b9c8d0] bg-[#e8eef2] px-8 text-[15px] font-medium uppercase tracking-[0.06em] text-[#31465f]">
          <span>Patient Name</span><span>MRN</span><span>Phone</span><span>Department</span><span>Last Visit</span><span>Total Visits</span><span>Action</span>
        </div>
        {patientDirectory.map((patient) => (
          <div key={patient.mrn} className="grid min-h-[76px] grid-cols-[1.7fr_1fr_1.2fr_1.2fr_1.1fr_.9fr_.5fr] items-center border-t border-[#d7e1e7] px-8 text-[17px]">
            <div className="flex items-center gap-4">
              {patient.avatar ? <img src={patient.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <AvatarInitial initials={patient.initials ?? "PT"} tone={patient.tone} />}
              <span><b className="block text-[18px]">{patient.name}</b><span className="text-[14px] text-[#31465f]">DOB: {patient.dob}</span></span>
            </div>
            <span className="text-[#31465f]">{patient.mrn}</span>
            <span>{patient.phone}</span>
            <DepartmentBadge text={patient.department} />
            <span className="text-[#31465f]">{patient.lastVisit}</span>
            <span>{patient.visits}</span>
            <span className="text-[#64717a]">•••</span>
          </div>
        ))}
        <div className="flex h-[86px] items-center justify-between border-t border-[#b9c8d0] px-8 text-[16px]">
          <p>Showing 1 to 5 of 14,285 patients</p>
          <div className="flex gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded border border-[#d5dfe5] text-[#96a3ac]"><ChevronLeft className="h-5 w-5" /></button>
            <button className="h-10 w-10 rounded border border-[#00758d] text-[#00758d]">1</button>
            <button className="h-10 w-10 rounded border border-[#b9c8d0]">2</button>
            <button className="h-10 w-10 rounded border border-[#b9c8d0]">3</button>
            <span className="px-2 pt-2">...</span>
            <button className="flex h-10 w-10 items-center justify-center rounded border border-[#b9c8d0]"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisitsOverviewView() {
  return (
    <div>
      <div className="flex items-start justify-between border-b border-[#d7e1e7] px-10 py-10">
        <div>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.03em]">Visits Overview</h1>
          <p className="text-[18px] text-[#3d4950]">Monitor clinic-wide operational activity and patient flow.</p>
        </div>
        <div className="flex gap-5">
          <SearchBox placeholder="Search Visit ID or Patient..." width="320px" />
          <button className="flex h-[48px] items-center gap-3 rounded-lg border border-[#b9c8d0] bg-white px-6 text-[18px]"><Download className="h-5 w-5" />Export Report</button>
        </div>
      </div>

      <div className="px-10 py-10">
        <div className="grid grid-cols-4 gap-8">
          <VisitMetric title="Total Visits Today" value="248" helper="+12%" icon={Users} active />
          <VisitMetric title="Waiting" value="42" helper="Avg wait: 18m" icon={Clock3} amber />
          <VisitMetric title="In Progress" value="18" helper="Active rooms" icon={Stethoscope} />
          <VisitMetric title="Completed" value="188" helper="Cleared today" icon={Check} />
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#b9c8d0] bg-white">
          <div className="flex h-[88px] items-center justify-between px-8">
            <h2 className="text-[28px] font-semibold">Active & Upcoming Visits</h2>
            <div className="flex gap-6 text-[#64717a]"><Filter className="h-6 w-6" /><RefreshCw className="h-6 w-6" /></div>
          </div>
          <div className="grid h-[42px] grid-cols-[.85fr_1.45fr_1fr_1.15fr_.8fr_1.1fr_.55fr] items-center bg-[#52627a] px-8 text-[15px] font-medium uppercase tracking-[0.06em] text-white">
            <span>Visit ID</span><span>Patient</span><span>Doctor</span><span>Department</span><span>Priority</span><span>Status</span><span>Actions</span>
          </div>
          {visitRows.map((visit) => (
            <div key={visit.id} className="grid min-h-[86px] grid-cols-[.85fr_1.45fr_1fr_1.15fr_.8fr_1.1fr_.55fr] items-center border-t border-[#d7e1e7] px-8 text-[18px]">
              <span>{visit.id}</span>
              <span className="flex items-center gap-3"><AvatarInitial initials={visit.initials} tone="slate" /><span><b className="block">{visit.patient}</b><span className="text-[15px] text-[#51647c]">DOB: {visit.dob}</span></span></span>
              <span>{visit.doctor}</span>
              <span>{visit.department}</span>
              <PriorityBadge text={visit.priority} />
              <VisitStatusBadge text={visit.status} />
              <span className="text-[#64717a]">•••</span>
            </div>
          ))}
          <div className="flex h-[62px] items-center justify-between border-t border-[#b9c8d0] bg-[#f8fbfd] px-8 text-[16px] text-[#64717a]">
            <p>Showing 1-4 of 248 visits</p>
            <div className="flex items-center gap-6 text-[#0a1014]">
              <ChevronLeft className="h-5 w-5 text-[#96a3ac]" />
              <span className="flex h-10 w-10 items-center justify-center rounded bg-[#00758d] text-white">1</span>
              <span>2</span><span>3</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsHubView() {
  return (
    <div>
      <div className="flex items-start justify-between border-b border-[#b9c8d0] px-10 py-10">
        <div>
          <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.04em]">Operational Intelligence</h1>
          <p className="text-[20px] text-[#64717a]">Comprehensive overview of clinic performance and metrics.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex h-[48px] items-center gap-3 rounded-lg border border-[#b9c8d0] bg-[#eef3f7] px-6 text-[18px]"><Calendar className="h-5 w-5" />Last 30 Days <span className="text-[#64717a]">⌄</span></button>
          <button className="flex h-[48px] items-center gap-3 rounded-lg border border-[#b9c8d0] bg-[#eef3f7] px-6 text-[18px]"><Building2 className="h-5 w-5" />All Departments <span className="text-[#64717a]">⌄</span></button>
          <button className="flex h-[48px] w-[48px] items-center justify-center rounded-lg border border-[#b9c8d0] bg-white text-[#00758d]"><Download className="h-6 w-6" /></button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-8 px-10 py-10">
        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <div className="flex justify-between">
            <div><h2 className="flex items-center gap-2 text-[28px] font-semibold"><Activity className="h-6 w-6 text-[#00758d]" />Visit Reports</h2><p className="mt-2 text-[18px] text-[#64717a]">Patient intake trends across all facilities.</p></div>
            <div className="text-right"><p className="text-[40px] font-bold">12,450</p><p className="rounded-full bg-[#dff8ea] px-4 py-2 text-[14px] text-[#009a58]">↗ +14.2% vs last period</p></div>
          </div>
          <div className="mt-16 h-[210px] bg-[linear-gradient(to_bottom,transparent_0,transparent_24%,#e3e9ee_24%,transparent_25%,transparent_49%,#e3e9ee_49%,transparent_50%,transparent_74%,#e3e9ee_74%,transparent_75%)]">
            <svg viewBox="0 0 760 205" className="h-full w-full"><path d="M0 140 L75 150 L150 105 L225 130 L300 88 L375 112 L450 72 L525 95 L600 62 L675 80 L760 52" fill="none" stroke="#006f87" strokeWidth="7" /><path d="M0 140 L75 150 L150 105 L225 130 L300 88 L375 112 L450 72 L525 95 L600 62 L675 80 L760 52 L760 205 L0 205 Z" fill="#006f87" opacity=".14" /></svg>
          </div>
          <div className="mt-2 flex justify-between text-[15px] text-[#64717a]"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
        </section>

        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="flex items-center gap-2 text-[28px] font-semibold"><Users className="h-6 w-6 text-[#00758d]" />Staffing & Leave</h2>
          <p className="mt-2 text-[18px] text-[#64717a]">Current operational capacity.</p>
          <p className="mt-10 text-[42px] font-bold">94% <span className="text-[20px] font-normal text-[#64717a]">Active Roster</span></p>
          <ProgressLine label="Physicians" value="42/45" color="#00758d" width="93%" />
          <ProgressLine label="Nursing Staff" value="118/120" color="#62d4ef" width="98%" />
          <ProgressLine label="On Leave Today" value="12 Staff" color="#b46a09" width="8%" />
        </section>

        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="flex items-center gap-2 text-[28px] font-semibold"><FlaskConical className="h-6 w-6 text-[#00758d]" />Lab Diagnostics</h2>
          <div className="mt-8 grid grid-cols-2 gap-6">
            <p className="text-[18px] leading-7 text-[#64717a]">Processing volume and turnaround times.</p>
            <p className="text-right text-[40px] font-bold">4,820<br /><span className="text-[#64717a]">tests</span></p>
          </div>
          <div className="mt-7 overflow-hidden rounded-lg border border-[#d7e1e7]">
            <div className="grid grid-cols-[1.5fr_.7fr_.7fr] bg-[#edf3f7] px-5 py-3 text-[15px] uppercase tracking-[0.06em] text-[#31465f]"><span>Test Category</span><span>Volume</span><span>Avg TAT</span></div>
            {[
              ["Hematology", "2,105", "2.4 hrs", "#00758d"],
              ["Biochemistry", "1,840", "3.1 hrs", "#62d4ef"],
              ["Microbiology", "875", "4.8 hrs", "#b46a09"],
            ].map(([name, volume, tat, color]) => (
              <div key={name} className="grid grid-cols-[1.5fr_.7fr_.7fr] border-t border-[#d7e1e7] px-5 py-3 text-[17px]"><span className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{name}</span><span className="text-[#64717a]">{volume}</span><span className="w-fit rounded bg-[#e8fff1] px-3 text-[#009a58]">{tat}</span></div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <div className="flex justify-between"><h2 className="flex items-center gap-2 text-[28px] font-semibold"><Pill className="h-6 w-6 text-[#00758d]" />Pharmacy Dispensing</h2><span className="h-fit rounded-full bg-[#ffe9e8] px-4 py-2 text-[#d00000]">Inventory Alert</span></div>
          <p className="mt-6 text-[18px] text-[#64717a]">Prescription fulfillment across network.</p>
          <div className="mt-12 h-[230px] bg-[linear-gradient(to_bottom,transparent_0,transparent_24%,#e3e9ee_24%,transparent_25%,transparent_49%,#e3e9ee_49%,transparent_50%,transparent_74%,#e3e9ee_74%,transparent_75%)]" />
          <div className="mt-2 flex justify-around text-[15px] text-[#64717a]"><span>Antibiotics</span><span>Analgesics</span><span>Cardio</span><span>Endo</span><span>Neuro</span></div>
        </section>
      </div>
    </div>
  );
}

function SystemSettingsView() {
  return (
    <div className="px-10 py-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.04em]">Settings & Administration</h1>
          <p className="text-[20px] text-[#3d4950]">Manage global clinic preferences, system security, and user profiles.</p>
        </div>
        <button className="flex h-[46px] items-center gap-3 rounded-lg bg-[#00758d] px-6 text-[18px] font-semibold text-white"><Save className="h-5 w-5" />Save Changes</button>
      </div>

      <div className="mt-8 grid grid-cols-[380px_1fr] gap-8">
        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="flex items-center gap-3 text-[28px] font-semibold"><User className="h-6 w-6 text-[#00758d]" />Administrator Profile</h2>
          <div className="mt-8 text-center">
            <img src="https://i.pravatar.cc/160?img=47" alt="" className="mx-auto h-[116px] w-[116px] rounded-full object-cover shadow" />
            <h3 className="mt-7 text-[32px] font-semibold">Dr. Sarah Jenkins</h3>
            <p className="text-[18px]">Chief Medical Director</p>
            <span className="mt-3 inline-block rounded-full bg-[#bfeeff] px-4 py-1 text-[15px]">Super Admin</span>
          </div>
          <SettingsReadField label="Email Address" value="s.jenkins@centralclinic.com" icon={Mail} />
          <SettingsReadField label="Contact Number" value="+1 (555) 019-2834" icon={Phone} />
          <button className="mt-8 h-[48px] w-full rounded-lg border border-[#53626b] bg-white text-[18px]">Edit Profile Details</button>
        </section>

        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="flex items-center gap-3 border-b border-[#d7e1e7] pb-6 text-[28px] font-semibold"><Building2 className="h-6 w-6 text-[#00758d]" />System configuration</h2>
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <SettingsInput label="Clinic Registered Name" value="Central Clinic Internal Medicine" />
              <SettingsInput label="Facility License Number" value="MED-992-8472" />
              <label className="block"><span className="text-[18px] font-medium">System Timezone</span><button className="mt-2 flex h-[48px] w-full items-center justify-between rounded-lg border border-[#b9c8d0] px-4 text-[17px]">Eastern Time (ET) - US & Canada <span>⌄</span></button></label>
            </div>
            <div>
              <div className="flex h-[166px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#b9c8d0] bg-[#f3f7fa] text-center">
                <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white"><Upload className="h-7 w-7 text-[#00758d]" /></span>
                <p className="mt-3 text-[20px] text-[#00758d]">Upload new logo</p>
                <p className="text-[14px]">SVG, PNG, JPG (Max 2MB)</p>
              </div>
              <div className="mt-5 rounded-lg border border-[#b9c8d0] bg-[#eef3f7] p-5">
                <h3 className="flex items-center gap-2 text-[18px] font-semibold"><Clock3 className="h-5 w-5" />Standard Operating Hours</h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <SettingsSmallInput label="Opening" value="08:00 AM" />
                  <SettingsSmallInput label="Closing" value="06:00 PM" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_480px] gap-8">
        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="flex items-center gap-3 border-b border-[#d7e1e7] pb-6 text-[28px] font-semibold"><Bell className="h-6 w-6 text-[#00758d]" />Notification Protocols</h2>
          <NotificationRow title="Critical Lab Results" body="Immediate alerts for out-of-range pathological findings requiring urgent review." channels={["SMS", "App"]} />
          <NotificationRow title="Appointment Cancellations" body="Notify via email when a patient cancels within 24 hours of scheduled time." channels={["Email", "App"]} muted />
          <NotificationRow title="System Maintenance" body="Weekly digest of scheduled server updates and API deprecation notices." channels={["Email"]} />
        </section>

        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="flex items-center gap-3 border-b border-[#d7e1e7] pb-6 text-[28px] font-semibold"><ShieldCheck className="h-6 w-6 text-[#00758d]" />Security & Access</h2>
          <div className="mt-8 flex items-center justify-between rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] p-5">
            <div className="flex items-center gap-5"><span className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#c8f8dd] text-[#009a58]"><ShieldCheck className="h-7 w-7" /></span><div><p className="text-[20px] font-semibold">Two-Factor Authentication</p><p className="text-[#009a58]">Active (Authenticator App)</p></div></div>
            <button className="text-[18px] text-[#00758d]">Manage</button>
          </div>
          <div className="mt-6 rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] p-5">
            <h3 className="mb-5 flex items-center gap-3 text-[20px] font-semibold"><Clock3 className="h-5 w-5 text-[#64717a]" />Recent Activity</h3>
            <p className="flex justify-between text-[18px]"><span>Last Login</span><span>Today, 08:42 AM</span></p>
            <p className="mt-4 flex justify-between text-[18px]"><span>IP Address</span><span>192.168.1.45</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}

function AuditLogsView() {
  return (
    <div>
      <div className="flex items-start justify-between border-b border-[#b9c8d0] px-10 py-10">
        <div>
          <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.04em]">Audit Logs</h1>
          <p className="text-[18px] text-[#3d4950]">Detailed tracking of system activity and administrative oversight.</p>
        </div>
        <div className="flex gap-5">
          <button className="flex h-[50px] items-center gap-3 rounded-lg border border-[#53626b] bg-white px-7 text-[18px]"><Download className="h-5 w-5" />Export CSV</button>
          <button className="flex h-[50px] items-center gap-3 rounded-lg bg-[#00758d] px-7 text-[18px] font-semibold text-white"><RefreshCw className="h-5 w-5" />Refresh Data</button>
        </div>
      </div>

      <div className="px-10 py-10">
        <div className="grid grid-cols-3 gap-8">
          <AuditMetric title="TOTAL EVENTS (24H)" value="12,492" helper="↑ 4.2% from yesterday" icon={TrendingUp} />
          <AuditMetric title="CRITICAL ALERTS" value="3" helper="Requires immediate review" icon={AlertTriangle} danger />
          <AuditMetric title="ACTIVE ADMIN SESSIONS" value="14" helper="⊙ All IPs verified" icon={ShieldCheck} />
        </div>

        <div className="mt-10 rounded-xl border border-[#b9c8d0] bg-white p-6">
          <div className="grid grid-cols-[1.25fr_1fr_1fr_1.45fr] gap-5">
            <AuditFilter label="Search Events"><SearchBox placeholder="Search by ID, User, or IP..." width="100%" /></AuditFilter>
            <AuditFilter label="Role"><button className="flex h-[48px] w-full items-center justify-between rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] px-4 text-[17px]">All Roles <span>⌄</span></button></AuditFilter>
            <AuditFilter label="Action Type"><button className="flex h-[48px] w-full items-center justify-between rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] px-4 text-[17px]">All Actions <span>⌄</span></button></AuditFilter>
            <AuditFilter label="Severity"><div className="flex h-[48px] items-center gap-4 rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] px-2 text-[17px]"><button className="h-10 rounded-md border border-[#b9c8d0] bg-white px-5">All</button><span>Info</span><span>Warning</span><span>Critical</span></div></AuditFilter>
          </div>
          <button className="mt-5 flex h-[48px] items-center gap-3 rounded-lg border border-[#53626b] bg-white px-6 text-[18px]"><Filter className="h-5 w-5" />More Filters</button>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-[#b9c8d0] bg-white">
          <div className="grid h-[62px] grid-cols-[1fr_1.4fr_1.3fr_1.3fr_1.2fr_.8fr] items-center bg-[#e8eef2] px-8 text-[15px] font-medium uppercase tracking-[0.06em] text-[#202a30]">
            <span>Timestamp</span><span>User</span><span>Action</span><span>Entity</span><span>IP Address</span><span>Severity</span>
          </div>
          {auditRows.map((row) => (
            <div key={`${row.timestamp}-${row.action}`} className="grid min-h-[92px] grid-cols-[1fr_1.4fr_1.3fr_1.3fr_1.2fr_.8fr] items-center border-t border-[#d7e1e7] px-8 text-[18px]">
              <span className="whitespace-pre-line text-[#3d4950]">{row.timestamp}</span>
              <span className="flex items-center gap-4">{row.avatar ? <img src={row.avatar} alt="" className="h-10 w-10 rounded-full" /> : <AvatarInitial initials={row.initials ?? "U"} tone="slate" />}<span><b className="block">{row.user}</b><span className="text-[15px]">{row.role}</span></span></span>
              <span className="flex items-center gap-3"><row.icon className={`h-5 w-5 ${row.severity === "Critical" ? "text-[#d00000]" : row.severity === "Warning" ? "text-[#b46a09]" : "text-[#00758d]"}`} />{row.action}</span>
              <span><b className="block">{row.entity}</b><span className="text-[15px] text-[#64717a]">{row.entityType}</span></span>
              <span>{row.ip}</span>
              <SeverityBadge text={row.severity} />
            </div>
          ))}
          <TablePager text="Showing 1 to 5 of 12,492 entries" />
        </div>
      </div>
    </div>
  );
}

function StoreItemDetailsView() {
  const specRows = [
    ["Material", "Titanium Alloy"],
    ["Length", "17 cm (6.75 in)"],
    ["Blade Type", "Straight, Beveled"],
    ["Sterilization", "Autoclavable"],
    ["Manufacturer", "SurgiTech Pro"],
    ["Warranty", "Lifetime (Defects)"],
  ];

  return (
    <div>
      <div className="border-b border-[#b9c8d0] bg-white px-10 py-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[16px] text-[#0a1014]">Inventory <span className="mx-2">›</span> Surgical Supplies <span className="mx-2">›</span> Titanium Mayo Scissors</p>
            <div className="mt-6 flex items-center gap-4">
              <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.03em]">Titanium Mayo Scissors, 17cm Straight</h1>
              <StatusRect text="In Stock" tone="blue" />
            </div>
            <p className="mt-2 text-[18px] text-[#3d4950]">SKU: SURG-MAYO-17S-TI • Added Oct 12, 2023</p>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="flex h-[48px] items-center gap-3 rounded-lg border border-[#53626b] bg-white px-6 text-[18px]"><Barcode className="h-5 w-5" />Print Barcode</button>
            <button className="flex h-[48px] items-center gap-3 rounded-lg border border-[#53626b] bg-white px-6 text-[18px]"><ArrowLeftRight className="h-5 w-5" />Adjust Stock</button>
            <button className="flex h-[48px] items-center gap-3 rounded-lg bg-[#00758d] px-6 text-[18px] font-semibold text-white"><Pencil className="h-5 w-5" />Edit Item</button>
          </div>
        </div>
      </div>

      <div className="px-10 py-10">
        <div className="grid grid-cols-5 gap-5">
          <DetailStatCard title="Category" value="Surgical" icon={Building2} />
          <DetailStatCard title="Location" value="OR Supply Rm B" helper="Shelf 4, Bin 12" icon={MapPin} />
          <DetailStatCard title="Quantity on Hand" value="42" suffix="units" icon={ClipboardCheck} />
          <DetailStatCard title="Reorder Level" value="15" suffix="units" icon={AlertTriangle} />
          <DetailStatCard title="Unit Cost" value="$145.00" helper="Vendor: MedEquip Pro" icon={WalletCards} />
        </div>

        <div className="mt-10 flex gap-8 border-b border-[#b9c8d0] text-[18px] font-medium">
          <span className="border-b-2 border-[#00758d] pb-4 text-[#00647c]">Overview</span>
          <span className="pb-4">Assignment History</span>
          <span className="pb-4">Stock Movement</span>
        </div>

        <div className="mt-10 grid grid-cols-[1fr_374px] gap-10">
          <div>
            <div className="flex h-[442px] items-center justify-center rounded-xl border border-[#b9c8d0] bg-white">
              <ImageIcon className="h-16 w-16 text-[#d5dce1]" />
            </div>
            <section className="mt-5 rounded-xl border border-[#b9c8d0] bg-white p-8">
              <h2 className="text-[28px] font-semibold">Item Description</h2>
              <p className="mt-5 max-w-[760px] text-[21px] leading-9 text-[#202a30]">
                Premium grade titanium Mayo scissors designed for cutting dense tissues during surgical procedures. The straight blade configuration is ideal for suturing and superficial tissue dissection. Manufactured to exacting tolerances to ensure a smooth cutting action and exceptional longevity, even after repeated sterilization cycles.
              </p>
            </section>
          </div>

          <aside className="flex min-h-[732px] flex-col rounded-xl border border-[#b9c8d0] bg-white p-8">
            <h2 className="text-[28px] font-semibold">Specifications</h2>
            <div className="mt-7">
              {specRows.map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-[#e0e6ea] py-4 text-[18px]">
                  <span className="text-[#3d4950]">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
            <button className="mt-auto flex h-[48px] items-center justify-center gap-3 rounded-lg border border-[#7e8b93] bg-white text-[18px] text-[#31465f]"><Download className="h-5 w-5" />Download Tech Specs</button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AssignStoreItemView() {
  return (
    <div>
      <div className="border-b border-[#d7e1e7] px-10 py-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[16px] text-[#31465f]">Inventory <span className="mx-2">›</span> Assign Asset</p>
            <h1 className="mt-3 text-[40px] font-bold leading-[48px] tracking-[-0.04em]">Assign Store Item</h1>
          </div>
          <button className="h-[48px] rounded-lg border border-[#53626b] bg-white px-6 text-[18px] text-[#31465f]">Discard Draft</button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-8 px-10 py-8">
        <div className="space-y-8">
          <AssignPanel title="Assignee Details" icon={Users} tone="blue">
            <label className="block text-[18px] font-medium">Select Employee</label>
            <div className="relative mt-3">
              <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#64717a]" />
              <input className="h-[48px] w-full rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] pl-14 pr-5 text-[18px] outline-none placeholder:text-[#8a969e]" placeholder="Search by name or ID (e.g., Dr. Sarah Jenkins)" />
            </div>
            <p className="mt-4 text-[15px] text-[#31465f]">Assignment history will be logged to this profile.</p>
          </AssignPanel>

          <AssignPanel title="Asset Specification" icon={BriefcaseMedical} tone="amber">
            <label className="block text-[18px] font-medium">Store Item</label>
            <button className="mt-3 flex h-[48px] w-full items-center justify-between rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] px-5 text-left text-[18px]">Select an item category... <span>⌄</span></button>
            <div className="mt-5 grid grid-cols-2 gap-5">
              <label className="block"><span className="text-[18px] font-medium">Quantity</span><input className="mt-3 h-[48px] w-full rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] px-5 text-[18px]" defaultValue="1" /></label>
              <label className="block"><span className="text-[18px] font-medium">Serial Number (Optional)</span><input className="mt-3 h-[48px] w-full rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] px-5 text-[18px]" placeholder="e.g., SN-993821A" /></label>
            </div>
            <p className="mt-6 text-[18px] font-medium">Dispatched Condition</p>
            <div className="mt-3 flex gap-3">
              <button className="h-[52px] rounded-lg bg-[#00758d] px-6 text-[20px] text-white">New (Unboxed)</button>
              <button className="h-[52px] rounded-lg border border-[#b9c8d0] bg-white px-6 text-[20px] text-[#31465f]">Good (Used)</button>
              <button className="h-[52px] rounded-lg border border-[#b9c8d0] bg-white px-6 text-[20px] text-[#31465f]">Fair (Visible Wear)</button>
            </div>
          </AssignPanel>

          <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
            <label className="block text-[18px] font-medium">Assignment Notes & Authorization</label>
            <textarea className="mt-3 h-[98px] w-full resize-none rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] p-5 text-[18px] outline-none" placeholder="Add specific requirements, return dates, or departmental authorization codes..." />
          </section>
        </div>

        <aside className="space-y-8">
          <div className="rounded-xl border border-[#ffc6c0] bg-[#fff4f2] p-8 text-[#b00010]">
            <div className="flex gap-4">
              <AlertTriangle className="mt-1 h-8 w-8 shrink-0" />
              <div>
                <h2 className="text-[18px] font-semibold tracking-[0.08em]">Low Stock Warning</h2>
                <p className="mt-2 text-[18px] leading-7">The selected item &quot;Clinical Tablet (iPad Pro 11&quot;)&quot; has only 2 units remaining in central storage. Consider alternative allocation if not critical.</p>
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
            <h2 className="text-[28px] font-semibold">Summary</h2>
            <SummaryRow label="Assignee" value="Pending Selection" />
            <SummaryRow label="Item Count" value="1 Unit" />
            <SummaryRow label="Est. Return" value="Indefinite" />
            <button className="mt-8 flex h-[48px] w-full items-center justify-center gap-3 rounded-lg bg-[#00758d] text-[18px] font-semibold text-white"><Check className="h-5 w-5" />Confirm Assignment</button>
          </section>
        </aside>
      </div>
      <InlineClinicFooter />
    </div>
  );
}

function StoreRequestsView() {
  return (
    <div>
      <div className="border-b border-[#b9c8d0] px-10 py-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.04em]">Store Requests</h1>
            <p className="text-[20px] text-[#3d4950]">Review and manage internal supply requisitions across all departments.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex h-[48px] items-center gap-3 rounded-lg border border-[#53626b] bg-white px-6 text-[18px]"><Filter className="h-5 w-5" />Filter</button>
            <button className="flex h-[48px] items-center gap-3 rounded-lg border border-[#53626b] bg-white px-6 text-[18px]"><Download className="h-5 w-5" />Export</button>
          </div>
        </div>
      </div>

      <div className="px-10 py-10">
        <div className="grid grid-cols-4 gap-8">
          <RequestStat title="Pending Review" value="24" helper="+3 since yesterday" icon={Clock3} tone="blue" />
          <RequestStat title="Urgent Priority" value="5" helper="Requires immediate action" icon={AlertCircle} tone="red" />
          <RequestStat title="Fulfilled Today" value="18" helper="All departments" icon={Check} tone="teal" />
          <RequestStat title="Stock Alerts" value="2" helper="Low inventory detected" icon={AlertTriangle} tone="amber" />
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-[#b9c8d0] bg-white">
          <div className="flex h-[88px] items-center justify-between border-b border-[#d7e1e7] px-8">
            <h2 className="text-[28px] font-semibold">Active Requisitions</h2>
            <SearchBox placeholder="Search item or requester..." width="320px" />
          </div>
          <div className="grid h-[66px] grid-cols-[1.35fr_1.35fr_.55fr_.8fr_.8fr_.55fr] items-center bg-[#e8eef2] px-8 text-[18px] font-medium uppercase tracking-[0.06em] text-[#31465f]">
            <span>Requester</span><span>Requested Item</span><span>Qty</span><span>Priority</span><span>Status</span><span>Actions</span>
          </div>
          {storeRequests.map((request) => (
            <Link key={request.sku} href="/admin/store/requests/req-8274" className="grid min-h-[88px] grid-cols-[1.35fr_1.35fr_.55fr_.8fr_.8fr_.55fr] items-center border-t border-[#d7e1e7] px-8 text-[18px] hover:bg-[#f8fbfd]">
              <span className="flex items-center gap-4"><AvatarInitial initials={request.initials} tone={request.tone} /><span><b className="block">{request.requester}</b><span className="text-[15px] text-[#202a30]">{request.dept}</span></span></span>
              <span><b className="block">{request.item}</b><span className="text-[15px] text-[#202a30]">SKU: {request.sku}</span></span>
              <span>{request.qty}</span>
              <PriorityBadge text={request.priority} />
              <StatusRect text={request.status} tone={request.status === "Approved" ? "green" : "amber"} />
              <span className="text-[#64717a]">•••</span>
            </Link>
          ))}
          <div className="flex h-[82px] items-center justify-between border-t border-[#b9c8d0] px-8 text-[16px]">
            <p>Showing 1 to 4 of 24 requests</p>
            <div className="flex gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded border border-[#d5dfe5]"><ChevronLeft className="h-5 w-5" /></button>
              <button className="h-10 w-10 rounded bg-[#00758d] text-white">1</button>
              <button className="h-10 w-10 rounded border border-[#b9c8d0]">2</button>
              <button className="h-10 w-10 rounded border border-[#b9c8d0]">3</button>
              <button className="flex h-10 w-10 items-center justify-center rounded border border-[#b9c8d0]"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreRequestReviewView() {
  return (
    <div className="grid grid-cols-[1fr_380px] gap-8 px-10 py-10">
      <div>
        <Link href="/admin/store/requests" className="flex items-center gap-2 text-[18px] text-[#31465f]"><ChevronLeft className="h-5 w-5" />Back to Inventory</Link>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.04em]">Request #REQ-8274</h1>
            <StatusRect text="Pending Review" tone="amber" />
          </div>
          <p className="text-[18px] text-[#31465f]">Submitted on Oct 24, 2023</p>
        </div>

        <section className="mt-8 rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="border-b border-[#b9c8d0] pb-4 text-[28px] font-semibold">Request Summary</h2>
          <div className="mt-6 grid grid-cols-2 gap-8">
            <div>
              <p className="text-[18px] font-medium uppercase tracking-[0.06em] text-[#31465f]">Requested By</p>
              <div className="mt-4 flex items-center gap-5">
                <AvatarInitial initials="SJ" tone="blue" large />
                <p className="text-[18px]"><b className="block">Dr. Sarah Jenkins</b><span className="text-[#31465f]">Head of Cardiology</span></p>
              </div>
            </div>
            <div>
              <p className="text-[18px] font-medium uppercase tracking-[0.06em] text-[#31465f]">Delivery Requirements</p>
              <div className="mt-4 overflow-hidden rounded-lg border border-[#b9c8d0]">
                <div className="flex h-[48px] items-center justify-between border-b border-[#b9c8d0] bg-[#f7fbfe] px-4 text-[17px]"><span className="text-[#51647c]">Required Date</span><b>Oct 28, 2023</b></div>
                <div className="flex h-[48px] items-center justify-between bg-[#fff5f3] px-4 text-[17px] text-[#c10010]"><span>Urgency Level</span><b className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />High</b></div>
              </div>
            </div>
          </div>

          <hr className="my-8 border-[#b9c8d0]" />
          <p className="text-[18px] font-medium uppercase tracking-[0.06em] text-[#31465f]">Requested Items</p>
          <div className="mt-5 flex gap-8 rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] p-5">
            <div className="h-[120px] w-[120px] rounded-lg bg-[#dfe5e8]" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[26px] font-semibold">Surgical Scalpel Blades - Size 10</h3>
                  <p className="mt-1 text-[18px] text-[#51647c]">SKU: MED-SC-10-BX • Category: Surgical Supplies</p>
                </div>
                <div className="rounded bg-[#e8edf0] px-4 py-2 text-center text-[#00647c]"><span className="block text-[14px]">Qty Req.</span><b className="text-[18px]">50 Boxes</b></div>
              </div>
              <p className="mt-5 text-[18px] leading-7"><b>Justification:</b> Upcoming scheduled bypass surgeries for the first week of November require immediate restocking of size 10 blades.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="border-b border-[#b9c8d0] pb-4 text-[28px] font-semibold">Approval Workflow</h2>
          <div className="relative mt-7 space-y-8 border-l-2 border-[#b9c8d0] pl-8">
            <WorkflowStep icon={Check} title="Request Submitted" body="Oct 24, 09:15 AM • System" done />
            <WorkflowStep icon={CircleHelp} title="Inventory Manager Review" body="Awaiting stock confirmation and allocation decision." current />
            <WorkflowStep icon={Box} title="Fulfillment & Dispatch" body="Pending approval." muted />
          </div>
        </section>
      </div>

      <aside className="mt-[88px] space-y-8">
        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="flex items-center gap-3 border-b border-[#b9c8d0] pb-4 text-[28px] font-semibold"><ClipboardCheck className="h-7 w-7 text-[#00758d]" />Stock Availability</h2>
          <div className="mt-7 space-y-5 text-[20px]">
            <div className="flex justify-between"><span>Current Stock</span><b className="text-[28px]">120</b></div>
            <div className="flex justify-between border-b border-[#b9c8d0] pb-4 text-[#31465f]"><span>Requested Quantity</span><span>- 50</span></div>
            <div className="flex justify-between"><b>Projected Balance</b><b className="text-[28px] text-[#00758d]">70</b></div>
          </div>
          <div className="mt-7 h-4 overflow-hidden rounded-full bg-[#00758d]"><div className="h-full w-[42%] bg-[#ffdcc0]" /></div>
          <div className="mt-2 flex justify-between text-[16px]"><span className="text-[#b45a00]">42% Requested</span><span className="text-[#00647c]">58% Available</span></div>
          <div className="mt-7 flex gap-3 rounded border border-[#b9c8d0] bg-[#f7fbfe] p-4 text-[17px] leading-6"><Info className="mt-1 h-5 w-5 shrink-0 text-[#00758d]" />Projected balance remains above the critical minimum threshold (20 boxes). Fulfillment is safe.</div>
        </section>

        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="border-b border-[#b9c8d0] pb-4 text-[28px] font-semibold">Admin Decision</h2>
          <label className="mt-6 block text-[18px] font-medium">Reviewer Notes (Internal)</label>
          <textarea className="mt-3 h-[140px] w-full resize-none rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] p-4 text-[18px]" placeholder="Enter justification for approval, rejection, or requested changes..." />
          <div className="mt-8 space-y-3 border-t border-[#b9c8d0] pt-5">
            <button className="flex h-[46px] w-full items-center justify-center gap-3 rounded-lg bg-[#00758d] text-[18px] font-semibold text-white"><Check className="h-5 w-5" />Approve & Allocate</button>
            <button className="flex h-[46px] w-full items-center justify-center gap-3 rounded-lg border border-[#53626b] bg-white text-[18px]"><FileText className="h-5 w-5" />Request Modification</button>
            <button className="flex h-[46px] w-full items-center justify-center gap-3 rounded-lg bg-[#ffd5ce] text-[18px] font-semibold text-[#c10010]"><XCircle className="h-5 w-5" />Reject Request</button>
          </div>
        </section>
      </aside>
    </div>
  );
}

function PatientMetric({ title, value, delta, helper, icon: Icon, tone }: { title: string; value: string; delta: string; helper: string; icon: typeof Users; tone: "blue" | "amber" | "slate" }) {
  const toneClass = tone === "amber" ? "bg-[#f4eadf] text-[#a86516]" : tone === "slate" ? "bg-[#dfe9ff] text-[#536a8e]" : "bg-[#dff2f6] text-[#00758d]";
  const hazeClass = tone === "amber" ? "bg-[#f4eadf]" : tone === "slate" ? "bg-[#e9f0ff]" : "bg-[#dff2f6]";
  const deltaClass = delta.startsWith("-") ? "text-[#31465f]" : tone === "amber" ? "text-[#8a3d00]" : "text-[#00647c]";

  return (
    <article className="relative h-[228px] overflow-hidden rounded-xl border border-[#b9c8d0] bg-white p-8">
      <div className={`absolute -right-10 -top-12 h-[120px] w-[120px] rounded-full opacity-80 ${hazeClass}`} />
      <div className="relative flex items-start justify-between">
        <p className="text-[20px] font-medium text-[#31465f]">{title}</p>
        <span className={`flex h-[52px] w-[52px] items-center justify-center rounded-lg ${toneClass}`}><Icon className="h-6 w-6" /></span>
      </div>
      <p className="relative mt-7 text-[42px] font-bold tracking-[-0.04em]">{value}</p>
      <p className="relative mt-3 flex gap-3 text-[16px]"><b className={deltaClass}>↗ {delta}</b><span className="text-[#31465f]">{helper}</span></p>
    </article>
  );
}

function DepartmentBadge({ text }: { text: string }) {
  const cls = text === "Orthopedics" ? "border-[#e6c79b] bg-[#fff4e7] text-[#a45a00]" : text === "General" ? "border-[#bed0ef] bg-[#eef5ff] text-[#425579]" : "border-[#9ed7e4] bg-[#dff4f8] text-[#00647c]";
  return <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-[15px] ${cls}`}>{text}</span>;
}

function VisitMetric({ title, value, helper, icon: Icon, active, amber }: { title: string; value: string; helper: string; icon: typeof Users; active?: boolean; amber?: boolean }) {
  return (
    <article className="relative h-[172px] overflow-hidden rounded-lg border border-[#b9c8d0] bg-white p-8">
      <div className="flex items-start justify-between">
        <p className="text-[19px] font-medium">{title}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${amber ? "bg-[#f4eadf] text-[#a86516]" : "bg-[#dff2f6] text-[#00758d]"}`}><Icon className="h-5 w-5" /></span>
      </div>
      <div className="mt-9 flex items-end gap-3">
        <b className="text-[40px] leading-none tracking-[-0.04em]">{value}</b>
        <span className={`${helper.includes("+") ? "text-[#a05a00]" : "text-[#6b747a]"}`}>{helper}</span>
      </div>
      {active ? <div className="absolute bottom-0 left-0 h-1 w-[75%] rounded-r-full bg-[#00758d]" /> : null}
    </article>
  );
}

function VisitStatusBadge({ text }: { text: string }) {
  const cls = text === "In Progress" ? "bg-[#0089a8] text-white" : text.startsWith("Waiting") ? "border border-[#e1ad70] bg-[#fff0dc] text-[#a45a00]" : "bg-[#dce8ff] text-[#31465f]";
  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[15px] ${cls}`}>{text}</span>;
}

function ProgressLine({ label, value, color, width }: { label: string; value: string; color: string; width: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-[18px]"><span>{label}</span><span className="text-[#6b747a]">{value}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-[#dbe3e8]"><div className="h-full rounded-full" style={{ width, backgroundColor: color }} /></div>
    </div>
  );
}

function SettingsReadField({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Mail }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[18px] font-medium">{label}</p>
      <div className="flex h-[46px] items-center gap-3 rounded-lg bg-[#edf3f7] px-4 text-[18px]"><Icon className="h-5 w-5 text-[#5b6870]" />{value}</div>
    </div>
  );
}

function SettingsInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[18px] font-medium">{label}</span>
      <input className="h-[48px] w-full rounded-lg border border-[#b9c8d0] bg-white px-4 text-[18px] outline-none" defaultValue={value} />
    </label>
  );
}

function SettingsSmallInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px]">{label}</span>
      <div className="flex h-[38px] items-center justify-between rounded-md border border-[#b9c8d0] bg-white px-3 text-[16px]"><span>{value}</span><Clock3 className="h-4 w-4" /></div>
    </label>
  );
}

function NotificationRow({ title, body, channels, muted }: { title: string; body: string; channels: string[]; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-6 py-5">
      <div>
        <p className="text-[18px] font-medium">{title}</p>
        <p className="mt-1 max-w-[520px] text-[16px] leading-6 text-[#303b42]">{body}</p>
      </div>
      <div className="flex shrink-0 gap-3">
        {channels.map((channel) => <span key={channel} className="flex items-center gap-1 text-[14px]"><span className={`flex h-5 w-5 items-center justify-center rounded ${muted && channel === "App" ? "border border-[#b9c8d0] bg-white" : "bg-[#00758d] text-white"}`}>{muted && channel === "App" ? null : <Check className="h-3.5 w-3.5" />}</span>{channel}</span>)}
      </div>
    </div>
  );
}

function AuditMetric({ title, value, helper, icon: Icon, danger }: { title: string; value: string; helper: string; icon: typeof TrendingUp; danger?: boolean }) {
  return (
    <article className="relative h-[212px] overflow-hidden rounded-xl border border-[#b9c8d0] bg-white p-8">
      {danger ? <div className="absolute -right-16 -top-20 h-[180px] w-[180px] rounded-full bg-[#fff2f0]" /> : null}
      <div className="relative flex items-start justify-between">
        <p className="text-[18px] font-medium uppercase tracking-[0.04em]">{title}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${danger ? "bg-[#ffd8d5] text-[#c10010]" : "bg-[#e5ebef] text-[#53626b]"}`}><Icon className="h-5 w-5" /></span>
      </div>
      <p className={`relative mt-7 text-[42px] font-bold tracking-[-0.04em] ${danger ? "text-[#c10010]" : ""}`}>{value}</p>
      <p className="relative mt-3 text-[16px] text-[#31465f]">{helper}</p>
    </article>
  );
}

function AuditFilter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[18px] font-medium">{label}</span>
      {children}
    </label>
  );
}

function SeverityBadge({ text }: { text: string }) {
  const cls = text === "Critical" ? "border-[#ffaaa4] bg-[#ffd8d5] text-[#c10010]" : text === "Warning" ? "bg-[#b46a09] text-white" : "border-[#cbd5dc] bg-[#e2e7ea] text-[#53626b]";
  return <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-[15px] ${cls}`}>{text}</span>;
}

function DetailStatCard({ title, value, helper, suffix, icon: Icon }: { title: string; value: string; helper?: string; suffix?: string; icon: typeof PanelTop }) {
  return (
    <div className="flex h-[172px] flex-col justify-between rounded-lg border border-[#b9c8d0] bg-white p-6">
      <p className="flex items-center gap-2 text-[20px] font-medium"><Icon className="h-5 w-5" />{title}</p>
      <div>
        <p className="text-[26px] font-semibold leading-8">
          {value}
          {suffix ? <span className="ml-2 text-[17px] font-normal text-[#202a30]">{suffix}</span> : null}
        </p>
        {helper ? <p className="mt-3 text-[14px] text-[#202a30]">{helper}</p> : null}
      </div>
    </div>
  );
}

function AssignPanel({ title, icon: Icon, tone, children }: { title: string; icon: typeof Users; tone: "blue" | "amber"; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
      <h2 className="flex items-center gap-4 border-b border-[#d7e1e7] pb-5 text-[28px] font-semibold">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone === "amber" ? "bg-[#f4eadf] text-[#a86516]" : "bg-[#dff2f6] text-[#00758d]"}`}><Icon className="h-5 w-5" /></span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[#d7e1e7] py-5 text-[20px]">
      <span className="text-[#31465f]">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InlineClinicFooter() {
  return (
    <footer className="flex h-[116px] items-center justify-between border-t border-[#d7e1e7] bg-white px-[30px] text-[14px] text-[#51647c]">
      <p><b className="mr-2 text-[18px] text-[#0a1014]">HealTech</b> © 2026 HealTech. Clinic operations software.</p>
      <div className="flex gap-6 underline">
        <Link href="/">Privacy Policy</Link>
        <Link href="/">Terms of Service</Link>
        <Link href="/">Security Compliance</Link>
        <Link href="/">API Documentation</Link>
      </div>
    </footer>
  );
}

function RequestStat({ title, value, helper, icon: Icon, tone }: { title: string; value: string; helper: string; icon: typeof PanelTop; tone: "blue" | "red" | "teal" | "amber" }) {
  const iconClass = tone === "red" ? "bg-[#ffd8d5] text-[#c10010]" : tone === "amber" ? "bg-[#b46a09] text-white" : tone === "teal" ? "bg-[#0089a8] text-white" : "bg-[#dce8ff] text-[#52627a]";
  const valueClass = tone === "red" ? "text-[#c10010]" : "text-[#0a1014]";
  const helperClass = tone === "red" ? "text-[#d00000]" : tone === "amber" ? "text-[#924300]" : "text-[#00647c]";
  return (
    <div className="h-[192px] rounded-xl border border-[#b9c8d0] bg-white p-8">
      <div className="flex items-start justify-between">
        <p className="text-[20px] font-medium">{title}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClass}`}><Icon className="h-5 w-5" /></span>
      </div>
      <p className={`mt-8 text-[42px] font-bold leading-[46px] tracking-[-0.04em] ${valueClass}`}>{value}</p>
      <p className={`mt-3 text-[16px] ${helperClass}`}>{helper}</p>
    </div>
  );
}

function AvatarInitial({ initials, tone, large }: { initials: string; tone: string; large?: boolean }) {
  const toneClass = tone === "amber" ? "bg-[#ffd9b8] text-[#6a3b00]" : tone === "teal" ? "bg-[#bfeeff] text-[#005c73]" : "bg-[#dce8ff] text-[#31465f]";
  return <span className={`flex shrink-0 items-center justify-center rounded-full ${toneClass} ${large ? "h-[60px] w-[60px] text-[24px]" : "h-10 w-10 text-[16px]"}`}>{initials}</span>;
}

function PriorityBadge({ text }: { text: string }) {
  const cls = text === "Urgent" ? "bg-[#ffd9d5] text-[#c10010]" : text === "High" ? "bg-[#b46a09] text-white" : "bg-[#dfe5e8] text-[#202a30]";
  return <span className={`w-fit rounded-full px-3 py-1 text-[16px] ${cls}`}>{text === "Urgent" || text === "High" ? "• " : ""}{text}</span>;
}

function WorkflowStep({ icon: Icon, title, body, done, current, muted }: { icon: typeof Check; title: string; body: string; done?: boolean; current?: boolean; muted?: boolean }) {
  return (
    <div className={`relative ${muted ? "text-[#9aa6af]" : ""}`}>
      <span className={`absolute -left-[52px] top-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#b9c8d0] ${done ? "bg-[#00758d] text-white" : current ? "bg-[#fff4e8] text-[#a86516]" : "bg-[#e8edf0] text-[#52627a]"}`}><Icon className="h-5 w-5" /></span>
      <div className={current ? "rounded border border-[#b9c8d0] bg-[#f7fbfe] p-4" : ""}>
        <p className="text-[20px] font-semibold">{title}</p>
        <p className="mt-2 text-[18px] text-[#51647c]">{body}</p>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LeaveRequestsView() {
  return (
    <div className="px-[30px] py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.03em]">Leave Requests</h1>
          <p className="text-[18px] text-[#3d4950]">Review staff leave, approvals, and pending coverage decisions.</p>
        </div>
        <button className="flex h-[45px] items-center gap-3 rounded-lg bg-[#00758d] px-6 text-[18px] font-semibold text-white"><FileText className="h-5 w-5" />Export Report</button>
      </div>
      <div className="mt-8 grid grid-cols-4 gap-5">
        <InventoryStat title="Pending Review" value="18" helper="6 need action today" icon={Clock3} amber />
        <InventoryStat title="Approved This Month" value="42" helper="+8 from last month" icon={Check} />
        <InventoryStat title="Coverage Conflicts" value="5" helper="Requires attention" icon={AlertTriangle} danger />
        <InventoryStat title="Avg Review Time" value="1.6d" helper="Within SLA" icon={Calendar} />
      </div>
      <div className="mt-8 flex gap-4">
        <SearchBox placeholder="Search employees, department, leave type..." width="520px" />
        <button className="h-[48px] rounded-lg border border-[#b9c8d0] bg-white px-5 text-[17px]">All Departments</button>
        <button className="h-[48px] rounded-lg border border-[#b9c8d0] bg-white px-5 text-[17px]">All Statuses</button>
      </div>
      <div className="mt-8 overflow-hidden rounded-xl border border-[#b9c8d0] bg-white">
        <div className="grid h-[56px] grid-cols-[1.15fr_.8fr_.75fr_.75fr_.55fr_.75fr] items-center bg-[#e8eef2] px-8 text-[14px] font-medium uppercase tracking-[0.08em] text-[#31465f]">
          <span>Employee</span><span>Leave Type</span><span>Department</span><span>Dates</span><span>Days</span><span>Status</span>
        </div>
        {leaveRequests.map((request) => (
          <Link key={request.name} href="/admin/leave-requests/cme-review" className="grid min-h-[86px] grid-cols-[1.15fr_.8fr_.75fr_.75fr_.55fr_.75fr] items-center border-t border-[#d7e1e7] px-8 text-[16px] hover:bg-[#f8fbfd]">
            <span><b className="block text-[18px]">{request.name}</b><span className="text-[#51647c]">{request.priority} priority</span></span>
            <span>{request.type}</span>
            <span>{request.dept}</span>
            <span>{request.dates}</span>
            <span>{request.days}</span>
            <StatusRect text={request.status} tone={request.status.includes("Pending") ? "amber" : "green"} />
          </Link>
        ))}
        <TablePager text="Showing 1 to 3 of 18 requests" />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LeaveReviewView() {
  return (
    <div className="grid grid-cols-[1fr_385px] gap-8 px-[30px] py-8">
      <div>
        <div className="mb-7">
          <p className="text-[15px] text-[#51647c]">Leave Requests / Review</p>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.03em]">Leave Request Review</h1>
          <p className="text-[18px] text-[#3d4950]">Final administrative review for conference leave request.</p>
        </div>
        <section className="rounded-xl border border-[#b9c8d0] bg-white p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[28px] font-semibold">Dr. Emily Carter</h2>
              <p className="mt-1 text-[18px] text-[#31465f]">Senior Cardiologist • Cardiology Department</p>
            </div>
            <StatusRect text="Pending Admin Final Review" tone="amber" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-8 text-[20px]">
            <p className="flex items-center gap-3"><Calendar className="h-5 w-5 text-[#31465f]" />Oct 12, 2024 • 08:00 AM</p>
            <p className="flex items-center gap-3"><Calendar className="h-5 w-5 text-[#31465f]" />Oct 14, 2024 • 05:00 PM</p>
          </div>
          <div className="mt-10">
            <p className="mb-3 text-[14px] font-semibold uppercase tracking-[0.1em] text-[#202a30]">Reason & Remarks</p>
            <div className="rounded-lg border border-[#d5dfe5] bg-[#f7fbfe] p-5 text-[18px] leading-8">
              Attending the Annual Cardiology Symposium in Boston. This CME event is required for maintaining board certification and includes specialized workshops on advanced echocardiography techniques that will directly benefit our department&apos;s diagnostic capabilities. Documentation of registration attached.
            </div>
          </div>
          <p className="mt-8 flex items-center gap-3 text-[18px] text-[#00647c]"><Paperclip className="h-5 w-5" />CME_Registration_Receipt.pdf (1.2 MB)</p>
        </section>
        <section className="mt-8 rounded-xl border border-[#b9c8d0] bg-white p-8">
          <h2 className="text-[28px] font-semibold">Review & Decision</h2>
          <label className="mt-7 block text-[18px] font-medium">Admin Comments (Optional)</label>
          <textarea className="mt-3 h-[130px] w-full resize-none rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] p-4 text-[18px] outline-none" placeholder="Add a note regarding this decision..." />
          <div className="mt-6 flex gap-4">
            <button className="h-[48px] flex-1 rounded-lg border border-[#f2b7b7] bg-[#fff4f2] text-[18px] font-semibold text-[#c10010]">Reject Request</button>
            <button className="h-[48px] flex-1 rounded-lg bg-[#00758d] text-[18px] font-semibold text-white">Approve Request</button>
          </div>
        </section>
      </div>
      <aside className="rounded-xl border border-[#b9c8d0] bg-white p-8">
        <h2 className="text-[26px] font-semibold">Approval Timeline</h2>
        <div className="relative mt-8 space-y-12 border-l-2 border-[#d7e1e7] pl-8">
          <TimelineItem title="Request Submitted" time="Oct 1, 2024 • 09:15 AM" body="Submitted via Employee Portal." />
          <TimelineItem title="Department Head Approved" time="Oct 2, 2024 • 11:30 AM" body={'"Coverage arranged with Dr. Smith. Approved for CME."'} card />
          <TimelineItem title="Pending Admin Final Review" time="Current Status" amber />
        </div>
      </aside>
    </div>
  );
}

function LeaveRequestsOperationsView() {
  return (
    <div className="px-10 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.04em]">Leave Requests</h1>
          <p className="text-[20px] leading-7 text-[#3d4950]">Manage staff time-off, sick leave, and schedules.</p>
        </div>
        <button className="flex h-[48px] items-center gap-3 rounded-lg border border-[#b9c8d0] bg-white px-6 text-[18px] font-semibold text-[#0a1014]">
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-5">
        <LeaveStat title="Pending Requests" value="12" helper="+2 from yesterday" icon={Clock3} tone="amber" />
        <LeaveStat title="Approved (This Month)" value="45" helper="Normal volume" icon={Check} tone="blue" />
        <LeaveStat title="Rejected (This Month)" value="3" helper="-1 from last month" icon={AlertCircle} tone="red" />
        <LeaveStat title="On Leave Today" value="8" helper="Across 3 departments" icon={Calendar} tone="slate" />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-[#b9c8d0] bg-white">
        <div className="flex h-[88px] items-center justify-between gap-4 border-b border-[#d7e1e7] px-5">
          <SearchBox placeholder="Search employee, dept..." width="400px" />
          <div className="flex gap-3">
            <button className="h-[48px] rounded-lg bg-[#00758d] px-5 text-[17px] font-semibold text-white">All Requests</button>
            <button className="h-[48px] rounded-lg border border-[#b9c8d0] bg-white px-5 text-[17px]">Pending</button>
            <button className="h-[48px] rounded-lg border border-[#b9c8d0] bg-white px-5 text-[17px]">Approved</button>
            <button className="flex h-[48px] items-center gap-2 rounded-lg border border-[#b9c8d0] bg-white px-5 text-[17px]">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
        <div className="grid h-[40px] grid-cols-[1.65fr_.8fr_1fr_.65fr_.8fr_1fr_.45fr] items-center bg-[#52627a] px-8 text-[15px] font-medium uppercase tracking-[0.06em] text-white">
          <span>Employee</span><span>Leave Type</span><span>Date Range</span><span>Duration</span><span>Status</span><span>Submitted</span><span>Actions</span>
        </div>
        {leaveRequests.map((request) => (
          <Link key={request.name} href="/admin/leave-requests/cme-review" className="grid min-h-[96px] grid-cols-[1.65fr_.8fr_1fr_.65fr_.8fr_1fr_.45fr] items-center border-t border-[#d7e1e7] px-8 text-[18px] hover:bg-[#f8fbfd]">
            <span className="flex items-center gap-3">
              {request.avatar ? <img src={request.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className={`flex h-10 w-10 items-center justify-center rounded-full ${request.initials === "MT" ? "bg-[#0089a8] text-white" : "bg-[#dce8ff] text-[#1d2930]"}`}>{request.initials}</span>}
              <span><b className="block text-[18px]">{request.name}</b><span className="text-[15px] leading-5 text-[#0a1014]">{request.role} <span className="text-[#51647c]">•</span> {request.dept}</span></span>
            </span>
            <span>{request.type}</span>
            <span>{request.dates}</span>
            <span>{request.duration}</span>
            <StatusRect text={request.status} tone={request.status === "Approved" ? "blue" : request.status === "Rejected" ? "red" : "amber"} />
            <span>{request.submitted}</span>
            <span className="text-[#64717a]">•••</span>
          </Link>
        ))}
        <div className="flex h-[82px] items-center justify-between border-t border-[#b9c8d0] bg-[#f8fbfd] px-8 text-[16px]">
          <p>Showing 1 to 5 of 12 entries</p>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded border border-[#d5dfe5] text-[#96a3ac]"><ChevronLeft className="h-5 w-5" /></button>
            <button className="flex h-10 w-10 items-center justify-center rounded border border-[#b9c8d0]"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveReviewOperationsView() {
  return (
    <div className="grid grid-cols-[1fr_385px] gap-8 px-[30px] py-8">
      <div>
        <div className="mb-7">
          <Link href="/admin/leave-requests" className="flex items-center gap-2 text-[18px] text-[#31465f]"><ChevronLeft className="h-5 w-5" />Back to Schedules</Link>
          <div className="mt-3 flex items-center gap-4">
            <h1 className="text-[32px] font-semibold tracking-[-0.03em]">Leave Request Details</h1>
            <StatusRect text="Pending Review" tone="amber" />
          </div>
        </div>

        <section className="rounded-xl border border-[#b9c8d0] bg-[#f7fbfe] p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img src="https://i.pravatar.cc/120?img=32" alt="" className="h-[90px] w-[90px] rounded-full object-cover" />
              <div>
                <h2 className="text-[28px] font-semibold">Dr. Sarah Jenkins</h2>
                <p className="mt-1 text-[18px] text-[#202a30]">Senior Attending Physician <span className="text-[#51647c]">•</span> Cardiology Dept.</p>
                <div className="mt-5 flex gap-8 text-[16px] text-[#31465f]">
                  <span className="flex items-center gap-2"><Mail className="h-4 w-4" />s.jenkins@centralclinic.com</span>
                  <span className="flex items-center gap-2"><BriefcaseMedical className="h-4 w-4" />EMP-8402</span>
                </div>
              </div>
            </div>
            <Edit3 className="h-7 w-7 text-[#31465f]" />
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-[#b9c8d0] bg-[#f7fbfe] p-8">
          <h2 className="flex items-center gap-4 border-b border-[#d7e1e7] pb-6 text-[30px] font-semibold"><Calendar className="h-7 w-7 text-[#00758d]" />Request Information</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-9">
            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[#202a30]">Leave Type</p>
              <p className="mt-3 flex gap-3 text-[22px] leading-8"><span className="mt-3 h-3 w-3 rounded-full bg-[#00758d]" />Continuing Medical Education (CME)</p>
            </div>
            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[#202a30]">Duration</p>
              <p className="mt-3 text-[22px]">3 Days (24 Hours)</p>
            </div>
            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[#202a30]">Start Date</p>
              <p className="mt-3 flex items-center gap-3 text-[20px]"><Calendar className="h-5 w-5 text-[#31465f]" />Oct 12, 2024 • 08:00 AM</p>
            </div>
            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[#202a30]">End Date</p>
              <p className="mt-3 flex items-center gap-3 text-[20px]"><Calendar className="h-5 w-5 text-[#31465f]" />Oct 14, 2024 • 05:00 PM</p>
            </div>
          </div>
          <div className="mt-10">
            <p className="mb-3 text-[14px] font-semibold uppercase tracking-[0.1em] text-[#202a30]">Reason & Remarks</p>
            <div className="rounded-lg border border-[#d5dfe5] bg-[#f7fbfe] p-5 text-[18px] leading-8">
              Attending the Annual Cardiology Symposium in Boston. This CME event is required for maintaining board certification and includes specialized workshops on advanced echocardiography techniques that will directly benefit our department&apos;s diagnostic capabilities. Documentation of registration attached.
            </div>
          </div>
          <p className="mt-8 flex items-center gap-3 text-[18px] text-[#00647c]"><Paperclip className="h-5 w-5" />CME_Registration_Receipt.pdf (1.2 MB)</p>
        </section>

        <section className="mt-8 rounded-xl border border-[#b9c8d0] bg-[#f7fbfe] p-8">
          <h2 className="text-[28px] font-semibold">Review & Decision</h2>
          <label className="mt-7 block text-[18px] font-medium">Admin Comments (Optional)</label>
          <textarea className="mt-3 h-[130px] w-full resize-none rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] p-4 text-[18px] outline-none" placeholder="Add a note regarding this decision..." />
          <div className="mt-6 flex gap-4">
            <button className="h-[48px] flex-1 rounded-lg border border-[#f2b7b7] bg-[#fff4f2] text-[18px] font-semibold text-[#c10010]">Reject Request</button>
            <button className="h-[48px] flex-1 rounded-lg bg-[#00758d] text-[18px] font-semibold text-white">Approve Request</button>
          </div>
        </section>
      </div>

      <aside className="space-y-8">
        <section className="rounded-xl border border-[#b9c8d0] bg-[#f7fbfe] p-8">
          <h2 className="flex items-center gap-3 text-[18px] font-semibold uppercase tracking-[0.08em]"><WalletCards className="h-5 w-5" />Current Balances</h2>
          <BalanceRow label="CME Allowance" value="12 / 15 Days" color="#00758d" width="80%" />
          <BalanceRow label="Annual PTO" value="8 / 20 Days" color="#9a5a00" width="40%" />
          <BalanceRow label="Sick Leave" value="10 / 10 Days" color="#52627a" width="100%" />
        </section>
        <section className="rounded-xl border border-[#b9c8d0] bg-[#f7fbfe] p-8">
          <h2 className="flex items-center gap-3 text-[18px] font-semibold uppercase tracking-[0.08em]"><Clock3 className="h-5 w-5" />Request Timeline</h2>
          <div className="relative mt-8 space-y-12 border-l-2 border-[#d7e1e7] pl-8">
            <TimelineItem title="Request Submitted" time="Oct 1, 2024 • 09:15 AM" body="Submitted via Employee Portal." />
            <TimelineItem title="Department Head Approved" time="Oct 2, 2024 • 11:30 AM" body={'"Coverage arranged with Dr. Smith. Approved for CME."'} card />
            <TimelineItem title="Pending Admin Final Review" time="Current Status" amber />
          </div>
        </section>
      </aside>
    </div>
  );
}

function LeaveStat({ title, value, helper, icon: Icon, tone }: { title: string; value: string; helper: string; icon: typeof PanelTop; tone: "amber" | "blue" | "red" | "slate" }) {
  const iconClass = tone === "amber" ? "bg-[#fff0e3] text-[#a86516]" : tone === "red" ? "bg-[#ffe9e8] text-[#d00000]" : tone === "slate" ? "bg-[#eef3ff] text-[#31465f]" : "bg-[#e1f4fa] text-[#00758d]";
  const helperClass = tone === "amber" ? "text-[#a86516]" : tone === "red" ? "text-[#d00000]" : "text-[#202a30]";
  return (
    <div className="h-[222px] rounded-xl border border-[#b9c8d0] bg-white p-8">
      <div className="flex items-start justify-between">
        <p className="max-w-[170px] text-[20px] font-medium leading-7">{title}</p>
        <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClass}`}><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-7 text-[42px] font-bold leading-[46px] tracking-[-0.04em]">{value}</p>
      <p className={`mt-5 text-[15px] ${helperClass}`}>{helper}</p>
    </div>
  );
}

function BalanceRow({ label, value, color, width }: { label: string; value: string; color: string; width: string }) {
  return (
    <div className="mt-7">
      <div className="flex items-center justify-between text-[17px]">
        <span className="flex items-center gap-3"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-[#d7e1e7]">
        <div className="h-2 rounded-full" style={{ width, backgroundColor: color }} />
      </div>
    </div>
  );
}

function DashboardView() {
  const stats = [
    ["TOTAL EMPLOYEES", "128", ClipboardPlus, "cyan"],
    ["TOTAL DOCTORS", "42", Stethoscope, "cyan"],
    ["TOTAL PATIENTS", "1,240", User, "blue"],
    ["VISITS TODAY", "46", Users, "blue"],
    ["PENDING LEAVES", "7", Calendar, "amber"],
    ["LOW STOCK MEDS", "12", BriefcaseMedical, "amber"],
    ["EXPIRED MEDS", "3", AlertCircle, "red"],
    ["STORE REQUESTS", "5", FileText, "slate"],
  ] as const;

  return (
    <div className="px-8 py-9">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.03em]">Overview</h1>
          <p className="text-[18px] leading-7 text-[#3d4950]">Real-time metrics for clinic operations.</p>
        </div>
        <p className="mt-4 text-[14px] text-[#202a30]">〃 Last updated: Just now</p>
      </div>

      <section className="mt-8 grid grid-cols-4 gap-5">
        {stats.map(([label, value, Icon, tone]) => (
          <div key={label} className={`h-[168px] rounded-lg border bg-white p-5 ${tone === "red" ? "border-[#ffc3bd]" : "border-[#b9c8d0]"}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone === "amber" ? "bg-[#ffe0c5] text-[#a86516]" : tone === "red" ? "bg-[#ffd9d4] text-[#d00000]" : tone === "blue" ? "bg-[#d9e8ff] text-[#425b85]" : tone === "slate" ? "bg-[#e5eaed] text-[#56636a]" : "bg-[#cfeff7] text-[#00647c]"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-[14px] font-medium tracking-[0.08em] text-[#202a30]">{label}</p>
            <p className={`mt-2 text-[40px] font-bold leading-[44px] tracking-[-0.03em] ${tone === "red" ? "text-[#c10010]" : "text-[#080d10]"}`}>{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-2 gap-8">
        <ChartCard title="Visits Trend" subtitle="(Last 30 Days)" type="line" />
        <ChartCard title="Visits by Department" type="bars" />
      </section>

      <section className="mt-8 grid grid-cols-[1fr_386px] gap-8">
        <div className="rounded-xl border border-[#b9c8d0] bg-white p-5">
          <div className="flex items-center justify-between border-b border-[#d9e1e4] pb-4">
            <h2 className="text-[28px] font-semibold tracking-[-0.03em]">Recent Activity</h2>
            <Link href="/admin/audit-logs" className="text-[17px] font-medium text-[#00647c]">View All</Link>
          </div>
          <ActivityRow icon={UserPlus} title="New Employee Added" text="Dr. Sarah Jenkins was added to General Medicine." time="10 mins ago" />
          <ActivityRow icon={Calendar} title="Leave Request Submitted" text="Nurse Mark O. requested 3 days of annual leave." time="45 mins ago" amber />
        </div>
        <div className="rounded-xl border border-[#b9c8d0] bg-white p-5">
          <h2 className="border-b border-[#d9e1e4] pb-4 text-[28px] font-semibold tracking-[-0.03em]">Quick Actions</h2>
          <div className="mt-5 space-y-3">
            <ActionButton href="/admin/employees/new" icon={UserPlus} label="Add Employee" primary />
            <ActionButton href="/admin/departments" icon={Building2} label="Create Department" />
            <ActionButton href="/admin/leave-requests" icon={FileText} label="Review Leave Requests" amber />
          </div>
        </div>
      </section>
    </div>
  );
}

function EmployeesView() {
  return (
    <div className="px-10 py-10">
      <div className="mb-7 flex items-center gap-3 text-[15px]">
        <Home className="h-4 w-4" />
        <span>Home</span>
        <span>›</span>
        <span>Employees</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.04em]">Employees</h1>
          <p className="mt-1 text-[18px] text-[#3d4950]">Manage clinic staff, roles, and access permissions.</p>
        </div>
        <Link href="/admin/employees/new" className="flex h-[46px] items-center gap-3 rounded-lg bg-[#00758d] px-8 text-[18px] font-semibold text-white">
          <UserPlus className="h-5 w-5" />
          Add Employee
        </Link>
      </div>

      <div className="mt-8 flex h-[90px] items-center gap-5 rounded-xl border border-[#b9c8d0] bg-white px-5 shadow-[0_2px_5px_rgba(15,23,42,0.03)]">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#172228]" />
          <input className="h-[48px] w-full rounded-lg border border-[#b9c8d0] bg-white pl-[52px] pr-5 text-[18px] outline-none placeholder:text-[#64717a]" placeholder="Search employees by name, email, or role..." />
        </div>
        <button className="h-[48px] rounded-lg border border-[#b9c8d0] bg-white px-5 text-[16px]">All Roles</button>
        <button className="h-[48px] rounded-lg border border-[#b9c8d0] bg-white px-5 text-[16px]">All Departments</button>
        <button className="flex h-[48px] w-[48px] items-center justify-center rounded-lg border border-[#b9c8d0] bg-white">
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-[#b9c8d0] bg-white">
        <div className="grid h-[52px] grid-cols-[380px_195px_230px_330px_90px] items-center bg-[#e8eef2] px-8 text-[14px] font-medium uppercase tracking-[0.08em] text-[#31465f]">
          <span>Employee</span><span>Role & Dept</span><span>Contact</span><span>Status</span><span>Actions</span>
        </div>
        {employees.map((employee) => <EmployeeRow key={employee.email} employee={employee} />)}
        <div className="flex h-[74px] items-center justify-between border-t border-[#b9c8d0] px-8">
          <p className="text-[15px]">Showing 1 to 10 of 45 entries</p>
          <div className="flex gap-3 text-[16px]">
            <button className="h-10 rounded-lg border border-[#d5dfe5] px-4 text-[#9a9a9a]">Previous</button>
            <button className="h-10 w-10 rounded-lg bg-[#00758d] text-white">1</button>
            <button className="h-10 w-10 rounded-lg border border-[#b9c8d0]">2</button>
            <button className="h-10 w-10 rounded-lg border border-[#b9c8d0]">3</button>
            <button className="h-10 rounded-lg border border-[#b9c8d0] px-4">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeFormView() {
  return (
    <div className="mx-auto max-w-[828px] px-0 py-8">
      <div className="mb-8 flex items-start gap-6">
        <Link href="/admin/employees" className="mt-3"><span className="text-3xl">‹</span></Link>
        <div>
          <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.03em]">Add New Employee</h1>
          <p className="text-[14px] text-[#3d4950]">Enter the details for the new staff member. Required fields are marked with an asterisk.</p>
        </div>
      </div>
      <FormSection title="Personal Information" icon={User}>
        <div className="grid grid-cols-[104px_1fr] gap-6">
          <div className="pt-6 text-center">
            <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full border-2 border-dashed border-[#b9c8d0] text-[#26333a]"><Camera className="h-8 w-8" /></div>
            <p className="mt-2 text-[13px] text-[#29343a]">Upload Photo</p>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            <TextField label="First Name *" placeholder="e.g. Jane" />
            <TextField label="Last Name *" placeholder="e.g. Doe" />
            <div className="col-span-2">
              <TextField label="Email Address *" placeholder="jane.doe@medcore" error="Please enter a valid email address domain (e.g. @medcore.com)." />
            </div>
            <div className="col-span-2"><TextField label="Phone Number" placeholder="(555) 000-0000" /></div>
          </div>
        </div>
      </FormSection>
      <FormSection title="Work Information" icon={BriefcaseMedical}>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <SelectField label="System Role *" value="Select system role" />
          <SelectField label="Department" value="Select department" />
          <div className="col-span-2"><TextField label="Official Job Title" placeholder="e.g. Senior Pediatrician" /></div>
          <div className="col-span-2">
            <p className="mb-2 text-[15px] font-medium">Employment Status</p>
            <div className="flex gap-5 text-[14px]"><Radio label="Full-time" active /><Radio label="Part-time" /><Radio label="Contract" /></div>
          </div>
        </div>
      </FormSection>
      <FormSection title="Account Access" icon={UserCog}>
        <div className="flex h-[76px] items-center justify-between rounded-lg border border-[#b9c8d0] bg-[#f7fbfe] px-5">
          <div><p className="text-[15px] font-medium">System Access</p><p className="text-[12px]">Allow this user to log into the HealTech platform.</p></div>
          <span className="relative h-6 w-11 rounded-full bg-[#00758d]"><span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" /></span>
        </div>
        <label className="mt-6 flex items-start gap-4">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#00758d] text-white"><Check className="h-4 w-4" /></span>
          <span><span className="block text-[15px] font-medium">Send invitation email</span><span className="mt-2 block max-w-[690px] text-[14px] leading-5 text-[#2f3a40]">An email will be sent to the address provided above with a secure link to set up their password and configure two-factor authentication.</span></span>
        </label>
      </FormSection>
      <FormSection title="Internal Notes" icon={Menu}>
        <TextField label="Administrator Notes" textarea placeholder="Add any onboarding notes, locker assignments, or special accommodations here. This is not visible to the employee." />
        <p className="text-right text-[12px]">Visible only to Admin level roles.</p>
      </FormSection>
      <div className="mt-6 flex justify-end gap-4 border-t border-[#b9c8d0] pt-4">
        <button className="h-11 rounded-lg border border-[#8fa0a9] bg-white px-8 text-[15px]">Cancel</button>
        <button className="flex h-11 items-center gap-2 rounded-lg bg-[#00758d] px-8 text-[16px] font-semibold text-white"><Save className="h-4 w-4" /> Save Employee</button>
      </div>
    </div>
  );
}

function DepartmentsView() {
  return (
    <div className="px-[60px] py-[62px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px]">HealTech <span className="mx-2">›</span> Departments</p>
          <h1 className="mt-3 text-[40px] font-bold leading-[48px] tracking-[-0.04em]">Departments</h1>
        </div>
        <button className="flex h-11 items-center gap-2 rounded-lg bg-[#00758d] px-6 text-[18px] font-semibold text-white"><Plus className="h-5 w-5" />Create Department</button>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-8">
        {departments.map((dept) => <DepartmentCard key={dept.title} dept={dept} />)}
      </div>
    </div>
  );
}

function EmployeeDetailsView() {
  return (
    <div className="px-10 py-[58px]">
      <div className="flex items-center justify-between">
        <p className="text-[17px] text-[#202a30]">Medical Records <span className="mx-4">›</span> Staff <span className="mx-4">›</span> Eleanor Vance</p>
        <div className="flex gap-4">
          <button className="flex h-[52px] items-center gap-3 rounded-lg border border-[#7e8b93] bg-white px-6 text-[20px] text-[#31465f]"><CircleSlash className="h-5 w-5" />Deactivate</button>
          <button className="flex h-[52px] items-center gap-3 rounded-lg bg-[#00758d] px-6 text-[20px] font-semibold text-white"><Pencil className="h-5 w-5" />Edit Profile</button>
        </div>
      </div>
      <section className="mt-8 rounded-xl border border-[#d1dce3] bg-white p-8">
        <div className="grid grid-cols-[160px_1fr] gap-8">
          <div className="relative h-[156px] w-[156px]">
            <img src="https://i.pravatar.cc/220?img=47" alt="" className="h-[156px] w-[156px] rounded-xl object-cover shadow" />
            <span className="absolute -right-2 bottom-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#d9f8e8] text-[#009a58]"><Check className="h-5 w-5" /></span>
          </div>
          <div>
            <div className="flex items-start justify-between">
              <div><h1 className="text-[40px] font-bold tracking-[-0.04em]">Eleanor Vance</h1><p className="text-[22px] text-[#31465f]">Senior Nursing Supervisor <span className="mx-2">•</span><span className="text-[#202a30]">Pediatrics Dept.</span></p></div>
              <div className="flex gap-3"><StatusPill text="Active Full-Time" tone="green" /><StatusPill text="EMP-2049" tone="blue" /></div>
            </div>
            <div className="mt-6 border-t border-[#d9e1e4] pt-7 grid grid-cols-4 gap-8">
              <DetailMetric icon={Mail} label="Email Address" value="e.vance@medcore.com" />
              <DetailMetric icon={Clock3} label="Work Phone" value="+1 (555) 019-2837" />
              <DetailMetric icon={Calendar} label="Hire Date" value="Oct 12, 2018" />
              <DetailMetric icon={MapPin} label="Location" value="City General (West)" />
            </div>
          </div>
        </div>
      </section>
      <div className="mt-10 flex gap-11 border-b border-[#b9c8d0] text-[20px] text-[#31465f]">
        {["Overview", "Activity", "Leave History", "Assigned Assets", "Notes"].map((tab, i) => <span key={tab} className={`flex items-center gap-2 pb-6 ${i === 0 ? "border-b-2 border-[#00758d] text-[#00647c]" : ""}`}><User className="h-4 w-4" />{tab}</span>)}
      </div>
      <section className="mt-8 grid grid-cols-[380px_1fr] gap-8">
        <div className="space-y-8">
          <InfoCard title="Contact Information" edit>
            <p className="text-[#31465f]">Personal Email</p><p className="mt-2 text-[20px]">eleanor.v.private@email.com</p>
            <hr className="my-6" />
            <p className="text-[#31465f]">Home Address</p><p className="mt-2 text-[20px] leading-8">4829 Willow Creek Dr.<br />Apt 3B<br />Seattle, WA 98101</p>
            <hr className="my-6" />
            <p className="text-[#31465f]">Emergency Contact</p><p className="mt-2 text-[20px] leading-8">Michael Vance (Spouse)<br /><span className="text-[#31465f]">+1 (555) 902-1144</span></p>
          </InfoCard>
          <InfoCard title="Reporting Structure"><div className="rounded-lg border bg-[#f4f8fb] p-4">Dr. Sarah Jenkins<br /><span className="text-[#31465f]">Director of Pediatrics</span></div></InfoCard>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-5">
            <InfoCard title="Current Schedule"><p className="text-[20px]">Standard Day Shift</p><p className="mt-2 text-[20px] text-[#31465f]">Mon - Fri, 08:00 AM - 04:00 PM</p><hr className="my-6" /><p className="flex justify-between text-[20px]"><span className="text-[#31465f]">Weekly Hours</span>40.0 hrs</p></InfoCard>
            <InfoCard title="Contract Details"><p className="text-[20px]">Permanent Full-Time</p><p className="mt-2 text-[20px] text-[#31465f]">Pay Grade: Band 7 - Supervisor</p><hr className="my-6" /><p className="flex justify-between text-[20px]"><span className="text-[#31465f]">Next Review</span>Nov 15, 2024</p></InfoCard>
          </div>
          <InfoCard title="Certifications & Clearances" wideAction="Add New"><CertTable /></InfoCard>
        </div>
      </section>
    </div>
  );
}

function SearchBox({ placeholder, width }: { placeholder: string; width: string }) {
  return (
    <div className="relative" style={{ width }}>
      <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#64717a]" />
      <input className="h-[48px] w-full rounded-lg border border-[#b9c8d0] bg-white pl-12 pr-4 text-[18px] outline-none placeholder:text-[#64717a]" placeholder={placeholder} />
    </div>
  );
}

function InventoryStat({ title, value, helper, icon: Icon, danger, amber }: { title: string; value: string; helper: string; icon: typeof PanelTop; danger?: boolean; amber?: boolean }) {
  return (
    <div className="h-[168px] rounded-lg border border-[#d1dce3] bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-[20px] font-medium">{title}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${danger ? "bg-[#fff0f0] text-[#d00000]" : amber ? "bg-[#fff0e3] text-[#a86516]" : "bg-[#e5f2f5] text-[#00647c]"}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-6 text-[40px] font-bold tracking-[-0.04em]">{value}</p>
      <p className={`mt-1 text-[15px] ${danger ? "text-[#d00000]" : amber ? "text-[#a86516]" : "text-[#64717a]"}`}>{danger ? "• " : amber ? "" : "↗ "}{helper}</p>
    </div>
  );
}

function AssignmentStat({ title, value, icon: Icon, tone }: { title: string; value: string; icon: typeof PanelTop; tone: "blue" | "amber" | "teal" }) {
  const cls = tone === "amber" ? "bg-[#b46a09] text-white" : tone === "teal" ? "bg-[#0089a8] text-white" : "bg-[#dce8ff] text-[#52627a]";
  return (
    <div className="flex h-[142px] items-center gap-5 rounded-xl border border-[#b9c8d0] bg-white p-8">
      <span className={`flex h-[60px] w-[60px] items-center justify-center rounded-full ${cls}`}><Icon className="h-7 w-7" /></span>
      <div><p className="text-[18px] text-[#202a30]">{title}</p><p className={`text-[40px] font-bold ${tone === "teal" ? "text-[#00758d]" : tone === "amber" ? "text-[#874100]" : "text-[#080d10]"}`}>{value}</p></div>
    </div>
  );
}

function InventoryTable() {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-[#b9c8d0] bg-white">
      <div className="flex h-[86px] items-center justify-between px-5">
        <div className="flex gap-3">
          <button className="flex h-[42px] items-center gap-2 rounded border border-[#b9c8d0] px-4 text-[18px]"><Filter className="h-4 w-4" />Filter</button>
          <button className="flex h-[42px] items-center gap-2 rounded border border-[#b9c8d0] px-4 text-[18px]"><Building2 className="h-4 w-4" />Category</button>
          <button className="flex h-[42px] items-center gap-2 rounded border border-[#b9c8d0] px-4 text-[18px]"><ShieldCheck className="h-4 w-4" />Condition</button>
        </div>
        <div className="flex gap-5"><Download className="h-5 w-5" /><Printer className="h-5 w-5" /></div>
      </div>
      <div className="grid h-[50px] grid-cols-[1.7fr_.9fr_.7fr_.7fr_.7fr_1fr_.6fr] items-center bg-[#52627a] px-5 text-[15px] font-medium uppercase tracking-[0.06em] text-white">
        <span>Item Details</span><span>SKU / ID</span><span>Total Qty</span><span>Assigned</span><span>Available</span><span>Status</span><span>Actions</span>
      </div>
      {assets.map((asset) => (
        <Link key={asset.sku} href="/admin/store/items/titanium-mayo-scissors" className="grid min-h-[82px] grid-cols-[1.7fr_.9fr_.7fr_.7fr_.7fr_1fr_.6fr] items-center border-t border-[#d7e1e7] px-5 text-[16px] hover:bg-[#f8fbfd]">
          <div className="flex items-center gap-4"><span className="flex h-[50px] w-[50px] items-center justify-center rounded border border-[#b9c8d0] bg-[#e7eef2]"><asset.icon className="h-7 w-7" /></span><span><b className="block text-[18px]">{asset.item}</b><span>{asset.category}</span></span></div>
          <span>{asset.sku}</span><span>{asset.total}</span><span>{asset.assigned}</span><span className={asset.available === 0 ? "text-[#d00000]" : ""}>{asset.available}</span>
          <StatusRect text={asset.status} tone={asset.status === "IN STOCK" ? "blue" : "red"} />
          <span className="text-[#64717a]">•••</span>
        </Link>
      ))}
      <TablePager text="Showing 1-4 of 1,248 assets" />
    </div>
  );
}

function AssignmentsTable() {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-[#b9c8d0] bg-white">
      <div className="grid h-[62px] grid-cols-[1.25fr_.8fr_1.05fr_.9fr_.8fr_.9fr_.85fr_.8fr_.45fr] items-center bg-[#e8eef2] px-5 text-[15px] font-medium uppercase tracking-[0.06em] text-[#31465f]">
        <span>Employee</span><span>Dept</span><span>Item</span><span>Serial/SKU</span><span>Assigned Date</span><span>Expected Return</span><span>Condition</span><span>Status</span><span>Actions</span>
      </div>
      {assignments.map((assignment) => (
        <div key={assignment.sku} className="grid min-h-[88px] grid-cols-[1.25fr_.8fr_1.05fr_.9fr_.8fr_.9fr_.85fr_.8fr_.45fr] items-center border-t border-[#d7e1e7] px-5 text-[17px]">
          <div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${assignment.tone === "amber" ? "bg-[#b46a09]" : assignment.tone === "slate" ? "bg-[#dfe5e8] text-[#202a30]" : "bg-[#0089a8]"}`}>{assignment.initials}</span><span className="font-medium">{assignment.employee}</span></div>
          <span>{assignment.dept}</span><span>{assignment.item}</span><span>{assignment.sku}</span><span>{assignment.assigned}</span><span className={assignment.status === "Overdue" ? "text-[#d00000]" : ""}>{assignment.return}</span>
          <ConditionBadge text={assignment.condition} />
          <StatusRect text={assignment.status} tone={assignment.status === "Overdue" ? "red" : "green"} />
          <span className="text-[#64717a]">•••</span>
        </div>
      ))}
      <TablePager text="Showing 1 to 4 of 142 entries" />
    </div>
  );
}

function TablePager({ text }: { text: string }) {
  return (
    <div className="flex h-[78px] items-center justify-between border-t border-[#d7e1e7] px-8 text-[16px]">
      <p>{text}</p>
      <div className="flex items-center gap-6 text-[18px]">
        <ChevronLeft className="h-5 w-5 text-[#96a3ac]" />
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#c9edf4] text-[#00758d]">1</span>
        <span>2</span><span>3</span><span>...</span>
        <ChevronRight className="h-5 w-5" />
      </div>
    </div>
  );
}

function ConditionBadge({ text }: { text: string }) {
  const cls = text === "Excellent" ? "bg-[#d8e7ff] text-[#52627a]" : text === "Good" ? "bg-[#dfe5e8] text-[#202a30]" : "bg-[#fff7df] text-[#9a5a00]";
  return <span className={`w-fit rounded px-3 py-1 text-[15px] ${cls}`}>{text}</span>;
}

function StatusRect({ text, tone }: { text: string; tone: "green" | "blue" | "amber" | "red" }) {
  const cls = tone === "green" ? "bg-[#e1f8ed] text-[#006a3c]" : tone === "blue" ? "bg-[#ccecf4] text-[#00647c] border border-[#a5dbe7]" : tone === "amber" ? "bg-[#fff4dd] text-[#a85a00]" : "bg-[#ffe0dc] text-[#c10010]";
  return <span className={`w-fit rounded px-3 py-1 text-[15px] ${cls}`}>{text}</span>;
}

function TimelineItem({ title, time, body, card, amber }: { title: string; time: string; body?: string; card?: boolean; amber?: boolean }) {
  return (
    <div className="relative">
      <span className={`absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-white ${amber ? "bg-[#d28a2c]" : "bg-[#00758d]"}`} />
      <p className="text-[20px] font-semibold">{title}</p>
      <p className={`mt-1 text-[15px] ${amber ? "text-[#a85a00]" : "text-[#202a30]"}`}>{time}</p>
      {body && !card ? <p className="mt-2 text-[16px] text-[#51647c]">{body}</p> : null}
      {body && card ? <div className="mt-4 rounded border border-[#d7e1e7] bg-[#f7fbfe] p-4 text-[16px] leading-6"><p className="mb-2 text-[#31465f]">Dr. H. Vance (Head of Cardiology)</p><p className="italic">{body}</p></div> : null}
    </div>
  );
}

function ChartCard({ title, subtitle, type }: { title: string; subtitle?: string; type: "line" | "bars" }) {
  return (
    <div className="h-[384px] rounded-xl border border-[#b9c8d0] bg-white p-5">
      <div className="flex justify-between"><h2 className="text-[27px] font-semibold tracking-[-0.03em]">{title} {subtitle ? <span className="text-[15px] font-normal text-[#3d4950]">{subtitle}</span> : null}</h2><MoreVertical className="h-6 w-6" /></div>
      {type === "line" ? <div className="mt-7 h-[270px] rounded bg-[linear-gradient(to_bottom,transparent_0,transparent_24%,#edf1f4_24%,transparent_25%,transparent_49%,#edf1f4_49%,transparent_50%,transparent_74%,#edf1f4_74%,transparent_75%)]"><svg viewBox="0 0 520 260" className="h-full w-full"><path d="M20 220 C75 190 135 240 178 155 S270 170 310 100 S390 140 430 100 S490 70 510 125" fill="none" stroke="#00647c" strokeWidth="3"/><path d="M20 220 C75 190 135 240 178 155 S270 170 310 100 S390 140 430 100 S490 70 510 125 L510 260 L20 260 Z" fill="#00647c" opacity=".14"/></svg></div> : <div className="mt-16 flex h-[205px] items-end justify-center gap-5">{[160,125,92,140,130].map((h,i)=><div key={i} className="w-[88px] rounded-t-sm bg-[#52627a]" style={{height:h}}><div className="h-[40%] bg-[#006f87]" /></div>)}</div>}
    </div>
  );
}

function ActivityRow({ icon: Icon, title, text, time, amber }: { icon: typeof UserPlus; title: string; text: string; time: string; amber?: boolean }) {
  return <div className="flex gap-5 py-5"><span className={`flex h-10 w-10 items-center justify-center rounded-full ${amber ? "bg-[#fff0e3] text-[#a86516]" : "bg-[#e8edf0] text-[#56636a]"}`}><Icon className="h-5 w-5" /></span><div><p className="text-[18px] font-semibold">{title}</p><p className="text-[16px] text-[#3d4950]">{text}</p><p className="mt-1 text-[14px]">{time}</p></div></div>;
}

function ActionButton({ href, icon: Icon, label, primary, amber }: { href: string; icon: typeof UserPlus; label: string; primary?: boolean; amber?: boolean }) {
  return <Link href={href} className={`flex h-[52px] items-center gap-4 rounded-lg border px-6 text-[19px] font-semibold ${primary ? "border-[#00758d] bg-[#00758d] text-white" : "border-[#c7d2da] bg-[#f2f7fb] text-[#0a1014]"}`}><Icon className={`h-6 w-6 ${amber ? "text-[#a84f00]" : ""}`} />{label}</Link>;
}

function EmployeeRow({ employee }: { employee: (typeof employees)[number] }) {
  return (
    <div className="grid h-[91px] grid-cols-[380px_195px_230px_330px_90px] items-center border-t border-[#b9c8d0] px-8 text-[16px]">
      <Link href="/admin/employees/eleanor-vance" className="flex items-center gap-4">
        {employee.avatar ? <img src={employee.avatar} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dfe5e8] text-[18px]">MR</span>}
        <span><span className="block text-[18px] font-medium">{employee.name}</span><span className="text-[14px]">{employee.email}</span></span>
      </Link>
      <span>{employee.role}<br /><span className="text-[14px]">{employee.dept}</span></span>
      <span>{employee.phone}</span>
      <span className="flex gap-3"><StatusPill text={employee.status} tone={employee.status === "On Leave" ? "slate" : "green"} /><StatusPill text={employee.review} tone={employee.review === "Pending Review" ? "amber" : "blue"} /></span>
      <span className="text-[#64717a]">•••</span>
    </div>
  );
}

function StatusPill({ text, tone }: { text: string; tone: "green" | "blue" | "amber" | "slate" }) {
  const cls = tone === "green" ? "bg-[#c8f8dd] text-[#007a45] border-[#8be6b4]" : tone === "blue" ? "bg-[#d7e7ff] text-[#003ec8] border-[#accdff]" : tone === "amber" ? "bg-[#fff1be] text-[#934100] border-[#ffd978]" : "bg-[#f0f4f7] text-[#1d2930] border-[#e0e7eb]";
  return <span className={`rounded-full border px-3 py-1 text-[14px] ${cls}`}>{text}</span>;
}

function FormSection({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
  return <section className="mb-7 rounded-xl border border-[#b9c8d0] bg-white p-6"><h2 className="flex items-center gap-4 border-b border-[#b9c8d0] pb-5 text-[22px] font-semibold"><Icon className="h-5 w-5 text-[#00647c]" />{title}</h2><div className="mt-6">{children}</div></section>;
}

function TextField({ label, placeholder, error, textarea }: { label: string; placeholder: string; error?: string; textarea?: boolean }) {
  return <label className="block"><span className={`mb-2 block text-[15px] font-medium ${error ? "text-[#d00000]" : ""}`}>{label}</span>{textarea ? <textarea className="h-[106px] w-full resize-none rounded-lg border border-[#b9c8d0] px-4 py-3 text-[14px] outline-none" placeholder={placeholder} /> : <input className={`h-11 w-full rounded-lg border px-4 text-[14px] outline-none ${error ? "border-[#d00000]" : "border-[#b9c8d0]"}`} placeholder={placeholder} />}{error ? <p className="mt-2 text-[13px] text-[#d00000]">ⓘ {error}</p> : null}</label>;
}

function SelectField({ label, value }: { label: string; value: string }) {
  return <label className="block"><span className="mb-2 block text-[15px] font-medium">{label}</span><button className="flex h-11 w-full items-center justify-between rounded-lg border border-[#b9c8d0] px-4 text-[14px]">{value}<span>⌄</span></button></label>;
}

function Radio({ label, active }: { label: string; active?: boolean }) {
  return <span className="flex items-center gap-2"><span className={`h-4 w-4 rounded-full border ${active ? "border-[#00758d] bg-[#00758d] ring-4 ring-inset ring-white" : "border-[#b9c8d0]"}`} />{label}</span>;
}

function DepartmentCard({ dept }: { dept: (typeof departments)[number] }) {
  const tone = dept.tone === "amber" ? "bg-[#f4eadf] text-[#a86516]" : dept.tone === "blue" ? "bg-[#e9eef8] text-[#31465f]" : dept.tone === "slate" ? "bg-[#dfe5e8] text-[#56636a]" : "bg-[#dbf1f4] text-[#00647c]";
  const badge = dept.status === "Under Review" ? "border-[#ffd7d2] bg-[#fff0ee] text-[#c10010]" : "border-[#cbd5dc] bg-[#e9eef2] text-[#202a30]";
  return <article className="min-h-[400px] rounded-xl border border-[#b9c8d0] bg-white p-8"><div className="flex justify-between"><span className={`flex h-[60px] w-[60px] items-center justify-center rounded-lg ${tone}`}><dept.icon className="h-7 w-7" /></span><span className={`rounded-md border px-3 py-1.5 text-[15px] ${badge}`}>{dept.status}</span></div><h2 className="mt-7 text-[32px] font-semibold tracking-[-0.04em]">{dept.title}</h2><p className="mt-3 text-[18px] leading-7 text-[#3d4950]">{dept.description}</p><hr className="my-6" /><div className="flex gap-8"><p>Employees<br /><b>{dept.employees}</b></p><p>Doctors<br /><b>{dept.doctors}</b></p></div><div className="mt-8 grid grid-cols-2 gap-3"><button className="h-12 rounded-lg border border-[#b9c8d0] bg-white text-[19px]"><Pencil className="mr-2 inline h-5 w-5" />Edit</button><button className="h-12 rounded-lg border border-[#b9c8d0] bg-white text-[19px]"><Users className="mr-2 inline h-5 w-5" />Staff</button></div></article>;
}

function DetailMetric({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8edf0]"><Icon className="h-5 w-5" /></span><p><span className="block text-[20px] text-[#31465f]">{label}</span><span className="text-[20px] leading-8">{value}</span></p></div>;
}

function InfoCard({ title, children, edit, wideAction }: { title: string; children: React.ReactNode; edit?: boolean; wideAction?: string }) {
  return <div className="rounded-xl border border-[#d1dce3] bg-white p-6"><div className="mb-6 flex items-center justify-between"><h3 className="text-[22px] font-medium">{title}</h3>{edit ? <Edit3 className="h-5 w-5 text-[#31465f]" /> : wideAction ? <button className="text-[#00647c]">{wideAction}</button> : null}</div>{children}</div>;
}

function CertTable() {
  const rows = [["Registered Nurse (RN) License", "State Medical Board", "Jan 2020", "Jan 2025", "Valid"], ["Advanced Cardiac Life Support (ACLS)", "American Heart Assoc.", "Mar 2022", "Mar 2024", "Expiring Soon"], ["Pediatric Advanced Life Support (PALS)", "American Heart Assoc.", "Aug 2023", "Aug 2025", "Valid"]];
  return <div><div className="grid grid-cols-[1.5fr_.5fr_.5fr_.5fr] border-b pb-3 text-[19px] uppercase tracking-[0.08em] text-[#31465f]"><span>Credential</span><span>Issued</span><span>Expires</span><span>Status</span></div>{rows.map((r)=><div key={r[0]} className="grid grid-cols-[1.5fr_.5fr_.5fr_.5fr] border-b py-5 text-[20px]"><span>{r[0]}<br /><span className="text-[#31465f]">{r[1]}</span></span><span>{r[2]}</span><span>{r[3]}</span><span><StatusPill text={r[4]} tone={r[4] === "Valid" ? "green" : "amber"} /></span></div>)}</div>;
}
