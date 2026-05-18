export type PublicSolutionCategory =
  | "Problem"
  | "Department"
  | "Role"
  | "Feature"
  | "Outcome"
  | "Patient Experience"
  | "Commercial";

export type PublicSolutionAudience = "clinic-teams" | "patients" | "both";

export type PublicSolution = {
  id: string;
  title: string;
  description: string;
  category: PublicSolutionCategory;
  audience: PublicSolutionAudience;
  roles: string[];
  departments: string[];
  features: string[];
  outcomes: string[];
  tags: string[];
  keywords: string[];
  path: string;
  primaryCta: string;
  secondaryCta?: string;
};

const defaultCtas = {
  primaryCta: "Explore solution",
  secondaryCta: "Request demo",
} as const;

// Public marketing metadata only. This file must stay disconnected from authenticated clinic data.
export const PUBLIC_SOLUTIONS: PublicSolution[] = [
  {
    id: "reception-queue",
    title: "Reception Queue",
    description: "Manage patient check-ins, waiting room status, visit readiness, and front-desk handoffs.",
    category: "Department",
    audience: "clinic-teams",
    roles: ["Receptionist", "Nurse", "Admin"],
    departments: ["Reception", "Front Desk"],
    features: ["Queue management", "Patient check-in", "Visit status", "Handoffs"],
    outcomes: ["Reduce waiting time", "Improve patient flow"],
    tags: ["Workflow", "Reception", "Operations"],
    keywords: ["reception", "queue", "check in", "waiting room", "front desk", "appointment arrival", "patient flow"],
    path: "#explore",
    ...defaultCtas,
  },
  {
    id: "doctor-workspace",
    title: "Doctor Workspace",
    description:
      "Give doctors one workspace to review patient context, manage consultations, order labs, prepare prescriptions, and coordinate care.",
    category: "Role",
    audience: "clinic-teams",
    roles: ["Doctor", "Nurse"],
    departments: ["Doctors", "Clinical"],
    features: ["Patient context", "Consultation", "Lab orders", "Prescriptions", "Care handoff"],
    outcomes: ["Faster consultations", "Better clinical coordination"],
    tags: ["Clinical", "Doctors", "Care coordination"],
    keywords: ["doctor", "physician", "consultation", "clinical notes", "patient record", "diagnosis", "treatment"],
    path: "#explore",
    ...defaultCtas,
  },
  {
    id: "lab-orders-results",
    title: "Lab Orders & Results",
    description: "Track lab requests from doctor order to sample collection, lab processing, result review, and patient notification.",
    category: "Department",
    audience: "clinic-teams",
    roles: ["Doctor", "Lab Technician", "Nurse", "Admin"],
    departments: ["Lab", "Doctors"],
    features: ["Lab orders", "Result review", "Sample status", "Result handoff"],
    outcomes: ["Reduce lost results", "Improve result turnaround"],
    tags: ["Lab", "Results", "Diagnostics"],
    keywords: ["lab", "laboratory", "blood test", "test results", "sample", "lab result", "investigations"],
    path: "#explore",
    ...defaultCtas,
  },
  {
    id: "pharmacy-stock",
    title: "Pharmacy Stock",
    description: "Help pharmacy teams manage medication availability, prescription fulfillment, refill needs, and medication handoffs.",
    category: "Department",
    audience: "clinic-teams",
    roles: ["Pharmacist", "Doctor", "Admin"],
    departments: ["Pharmacy"],
    features: ["Stock tracking", "Prescription fulfillment", "Medication handoff"],
    outcomes: ["Reduce medication delays", "Improve stock visibility"],
    tags: ["Pharmacy", "Inventory", "Medication"],
    keywords: ["pharmacy", "medicine", "medication", "stock", "drugs", "prescription", "refill"],
    path: "#explore",
    ...defaultCtas,
  },
  {
    id: "appointment-management",
    title: "Appointment Management",
    description: "Coordinate bookings, confirmations, visit status, and schedule changes across clinic teams and patients.",
    category: "Feature",
    audience: "both",
    roles: ["Receptionist", "Patient", "Admin"],
    departments: ["Reception", "Admin"],
    features: ["Appointments", "Confirmations", "Scheduling", "Reminders"],
    outcomes: ["Reduce no-shows", "Improve booking flow"],
    tags: ["Appointments", "Scheduling", "Patient flow"],
    keywords: ["appointment", "booking", "schedule", "calendar", "reservation", "visit"],
    path: "#how-it-works",
    ...defaultCtas,
  },
  {
    id: "patient-follow-up",
    title: "Patient Follow-up",
    description: "Track follow-up tasks after visits, lab results, prescriptions, and care plans.",
    category: "Outcome",
    audience: "both",
    roles: ["Doctor", "Nurse", "Patient", "Receptionist"],
    departments: ["Clinical", "Reception"],
    features: ["Follow-up reminders", "Tasks", "Care plan", "Patient notifications"],
    outcomes: ["Improve continuity of care", "Reduce missed follow-ups"],
    tags: ["Follow-up", "Care plan", "Continuity"],
    keywords: ["follow up", "reminder", "patient follow up", "care plan", "revisit", "next visit"],
    path: "#how-it-works",
    ...defaultCtas,
  },
  {
    id: "ai-clinical-assistant",
    title: "AI Clinical Assistant",
    description:
      "Support clinic teams with safe summaries, prepared drafts, suggested next steps, and coordinated work that stays reviewed by people.",
    category: "Feature",
    audience: "clinic-teams",
    roles: ["Doctor", "Nurse", "Admin"],
    departments: ["Clinical", "Admin"],
    features: ["AI summaries", "Draft preparation", "Workflow assistance", "Decision support"],
    outcomes: ["Save time", "Improve documentation", "Reduce manual work"],
    tags: ["AI", "Assistant", "Controlled workflow"],
    keywords: ["AI", "assistant", "automation", "summarize", "clinical AI", "chatbot", "agent"],
    path: "#security",
    ...defaultCtas,
  },
  {
    id: "patient-portal",
    title: "Patient Portal",
    description:
      "Give patients a simple way to access appointments, upload medical files, view visit summaries, receive lab result updates, and follow care instructions.",
    category: "Patient Experience",
    audience: "patients",
    roles: ["Patient"],
    departments: ["Patient Experience"],
    features: ["Patient access", "File upload", "Lab result updates", "Prescriptions", "Care plan"],
    outcomes: ["Improve patient communication", "Reduce phone calls"],
    tags: ["Portal", "Patient access", "Communication"],
    keywords: ["patient", "portal", "upload report", "prescription", "lab update", "care plan", "patient app"],
    path: "#explore",
    ...defaultCtas,
  },
  {
    id: "billing-admin",
    title: "Billing & Admin",
    description: "Support administrative teams with payment status, approvals, operational tasks, and clinic coordination.",
    category: "Department",
    audience: "clinic-teams",
    roles: ["Admin", "Receptionist", "Billing"],
    departments: ["Billing", "Admin"],
    features: ["Billing status", "Approvals", "Admin tasks"],
    outcomes: ["Improve operational visibility", "Reduce manual admin work"],
    tags: ["Billing", "Admin", "Finance"],
    keywords: ["billing", "payment", "invoice", "admin", "approval", "finance"],
    path: "#pricing",
    ...defaultCtas,
  },
  {
    id: "security-audit-trail",
    title: "Security & Audit Trail",
    description: "Protect clinic operations with role-based access, approvals, activity history, and audit visibility.",
    category: "Feature",
    audience: "clinic-teams",
    roles: ["Admin", "Owner", "Compliance"],
    departments: ["Admin", "Management"],
    features: ["Role permissions", "Audit trail", "Approval flow", "Secure access"],
    outcomes: ["Improve accountability", "Reduce unauthorized actions"],
    tags: ["Security", "Audit", "Compliance"],
    keywords: ["security", "permissions", "role", "audit", "compliance", "access", "approval"],
    path: "#security",
    ...defaultCtas,
  },
  {
    id: "pricing",
    title: "Pricing",
    description: "Explore plans based on clinic size, users, and operational needs.",
    category: "Commercial",
    audience: "both",
    roles: ["Owner", "Admin"],
    departments: ["Management", "Admin"],
    features: ["Plans", "Clinic rollout", "Module selection"],
    outcomes: ["Understand rollout options", "Plan clinic investment"],
    tags: ["Pricing", "Plans", "Commercial"],
    keywords: ["pricing", "price", "plan", "cost", "subscription"],
    path: "#pricing",
    primaryCta: "Explore pricing",
    secondaryCta: "Request demo",
  },
  {
    id: "request-demo",
    title: "Request a Demo",
    description: "Book a guided walkthrough to see how HealTech can fit your clinic operations.",
    category: "Commercial",
    audience: "both",
    roles: ["Owner", "Admin", "Doctor", "Receptionist"],
    departments: ["Management", "Admin"],
    features: ["Guided walkthrough", "Workflow review", "Rollout planning"],
    outcomes: ["Evaluate fit", "Plan next steps"],
    tags: ["Demo", "Sales", "Contact"],
    keywords: ["demo", "contact", "sales", "meeting", "walkthrough", "trial"],
    path: "#request-demo",
    primaryCta: "Request demo",
  },
];

export const POPULAR_PUBLIC_SEARCH_IDS = [
  "reception-queue",
  "doctor-workspace",
  "lab-orders-results",
  "pharmacy-stock",
  "patient-follow-up",
  "ai-clinical-assistant",
] as const;

export const FALLBACK_PUBLIC_SEARCH_IDS = ["appointment-management", "patient-follow-up", "ai-clinical-assistant"] as const;
