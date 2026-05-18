"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FlaskConical,
  LockKeyhole,
  Menu,
  MonitorCog,
  PackagePlus,
  ShieldCheck,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Apple,
  Facebook,
  Instagram,
  Linkedin,
  Smartphone,
  Twitter,
  UserRound,
  Youtube,
  X,
} from "lucide-react";
import {
  NavbarPublicSearch,
  PublicSearchResults,
  PublicSolutionSearch,
} from "@/components/public/public-solution-search";
import { searchPublicSolutions, trackPublicSearchEvent } from "@/lib/public-solution-search";
import type { PublicSolutionAudience } from "@/lib/public-search-data";

type HeroMode = {
  id: "teams" | "patients";
  label: string;
  headlineSupport: string;
  helperText: string;
  chips: string[];
};

type Category = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  keywords: string[];
};

const heroModes: HeroMode[] = [
  {
    id: "teams",
    label: "For clinic teams",
    headlineSupport: "Manage reception, care, labs, pharmacy, and admin handoffs in one place.",
    helperText: "For reception, doctors, labs, pharmacy, admin, and care teams.",
    chips: ["Reception", "Doctors", "Lab results", "Pharmacy", "Appointments", "AI assistant", "Billing"],
  },
  {
    id: "patients",
    label: "For patients",
    headlineSupport: "Give patients one clear path to visits, results, medicines, and follow-up.",
    helperText: "For booking, reports, prescriptions, follow-ups, and care access.",
    chips: ["Book appointment", "Upload reports", "Prescriptions", "Lab updates", "Follow-up", "Care plan"],
  },
];

const exploreGroups = [
  {
    title: "Popular workflows",
    links: [
      { label: "Reception queue", href: "#explore" },
      { label: "Doctor workspace", href: "#explore" },
      { label: "Lab orders", href: "#explore" },
      { label: "Pharmacy inventory", href: "#explore" },
    ],
  },
  {
    title: "Operations",
    links: [
      { label: "Patient portal", href: "#explore" },
      { label: "Reports and audit", href: "#explore" },
      { label: "Secure access", href: "#security" },
    ],
  },
];

const trendingWorkflows = [
  { label: "Visit queues", change: "+42%", positive: true },
  { label: "Lab results", change: "+31%", positive: true },
  { label: "Patient portal", change: "+54%", positive: true },
  { label: "Pharmacy stock", change: "+28%", positive: true },
  { label: "Audit logs", change: "+19%", positive: true },
  { label: "Appointment flow", change: "+46%", positive: true },
  { label: "Inventory review", change: "-12%", positive: false },
  { label: "Secure access", change: "+36%", positive: true },
];

const trustLogos = [
  "Reception",
  "Doctors",
  "Labs",
  "Pharmacy",
  "Patients",
  "Admin",
  "Audit",
];

const emergingClinicRoles = [
  {
    title: "Care coordinator",
    description: "Keeps visit queues, follow-ups, and patient handoffs aligned.",
    change: "+24%",
    positive: true,
  },
  {
    title: "Clinic operations lead",
    description: "Reviews throughput, approvals, inventory, and daily reports.",
    change: "+18%",
    positive: true,
  },
  {
    title: "Lab workflow owner",
    description: "Tracks test orders, result submission, and doctor review loops.",
    change: "+15%",
    positive: true,
  },
  {
    title: "Pharmacy stock controller",
    description: "Monitors batches, dispensing, low stock, and expiry risk.",
    change: "+12%",
    positive: true,
  },
  {
    title: "Manual paper handoff",
    description: "Shrinks as role-based digital queues replace scattered notes.",
    change: "-21%",
    positive: false,
  },
];

const demandWorkflowGroups = [
  {
    title: "Front desk",
    skills: ["Patient intake", "Appointments", "Visit queue", "Triage"],
  },
  {
    title: "Clinical care",
    skills: ["Diagnosis", "Lab requests", "Prescriptions", "Visit history"],
  },
  {
    title: "Operations",
    skills: ["Inventory", "Store requests", "Reports", "Audit logs"],
  },
  {
    title: "Patient experience",
    skills: ["Portal access", "Lab results", "Medicines", "Follow-up"],
  },
];

const impactStats = [
  { value: "6", label: "role workspaces connected" },
  { value: "24h", label: "demo-ready workflow review" },
  { value: "8", label: "core clinic modules covered" },
  { value: "1", label: "secure patient record path" },
];

const categories: Category[] = [
  {
    title: "Reception",
    description: "Register patients, schedule appointments, create visits, and manage the active queue.",
    href: "#how-it-works",
    icon: ClipboardCheck,
    keywords: ["front desk", "queue", "appointments", "registration", "visit"],
  },
  {
    title: "Doctor workspace",
    description: "Review visits, add diagnoses, request labs, prescribe medicines, and close encounters.",
    href: "#how-it-works",
    icon: Stethoscope,
    keywords: ["doctor", "diagnosis", "clinical", "prescription", "encounter"],
  },
  {
    title: "Lab orders",
    description: "Receive requests, submit results, and route approved findings back to care teams.",
    href: "#how-it-works",
    icon: FlaskConical,
    keywords: ["lab", "tests", "results", "approval", "orders"],
  },
  {
    title: "Pharmacy inventory",
    description: "Track stock, batches, low inventory, expiry risk, and prescription dispensing.",
    href: "#how-it-works",
    icon: PackagePlus,
    keywords: ["pharmacy", "inventory", "stock", "medicine", "dispense"],
  },
  {
    title: "Patient portal",
    description: "Let patients view visits, lab results, medicines, appointments, and profile details.",
    href: "#how-it-works",
    icon: UserRound,
    keywords: ["patient", "portal", "records", "appointments", "profile"],
  },
  {
    title: "Admin controls",
    description: "Manage employees, departments, leave requests, settings, and operational access.",
    href: "#security",
    icon: MonitorCog,
    keywords: ["admin", "employees", "departments", "settings", "access"],
  },
  {
    title: "Reports & audit",
    description: "Keep operational reports, audit logs, and financial visibility close to daily work.",
    href: "#security",
    icon: Activity,
    keywords: ["reports", "audit", "finance", "analytics", "logs"],
  },
  {
    title: "Secure access",
    description: "Separate work by role with guarded routes, focused permissions, and protected workflows.",
    href: "#security",
    icon: LockKeyhole,
    keywords: ["security", "roles", "permissions", "auth", "protected"],
  },
];

const steps = [
  {
    title: "Register or find a patient",
    description: "Start from reception with a patient profile, visit reason, appointment context, and queue status.",
  },
  {
    title: "Complete care workflows",
    description: "Doctors, lab teams, and pharmacy staff work from role-specific queues with the right next action.",
  },
  {
    title: "Review, dispense, and follow up",
    description: "Results, prescriptions, medicines, and patient history stay connected after the visit closes.",
  },
];

const pricingPlans = [
  {
    name: "Starter demo",
    subtitle: "For teams evaluating the workflow",
    price: "Demo access",
    featured: false,
    bullets: ["Role cards and guided login", "Sample clinic workflows", "No setup cost to explore"],
    cta: "Open demo",
  },
  {
    name: "Clinic plan",
    subtitle: "For active clinics ready to run operations",
    price: "Custom clinic quote",
    featured: true,
    bullets: ["Reception, doctor, lab, and pharmacy modules", "Patient portal and secure records", "Configuration before go-live"],
    cta: "Request a demo",
  },
  {
    name: "Operations plan",
    subtitle: "For growing multi-role teams",
    price: "Scoped with your team",
    featured: false,
    bullets: ["Advanced admin controls", "Reports, audit logs, and store requests", "Workflow review before rollout"],
    cta: "Talk to us",
  },
];

const proofCards = [
  {
    quote: "Designed outcome: reception can move from registration to visit creation without switching tools.",
    result: "Fewer front-desk handoff gaps",
    category: "Clinic operations",
  },
  {
    quote: "Designed outcome: lab and pharmacy teams work from queues instead of scattered requests.",
    result: "Clearer team accountability",
    category: "Role workflows",
  },
  {
    quote: "Designed outcome: patients can review records, lab results, medicines, and appointments in one portal.",
    result: "Better continuity after visits",
    category: "Patient experience",
  },
];

const footerColumns = [
  {
    title: "For clinics",
    links: [
      "How to start",
      "Clinic workspace",
      "Patient intake",
      "Appointment flow",
      "Visit management",
      "Lab coordination",
      "Pharmacy operations",
      "Admin controls",
      "Clinic reports",
      "Secure rollout",
    ],
  },
  {
    title: "For care teams",
    links: [
      "Reception desk",
      "Doctor workspace",
      "Lab orders",
      "Pharmacy stock",
      "Patient portal",
      "Role permissions",
      "Follow-up care",
      "Audit visibility",
    ],
  },
  {
    title: "Resources",
    links: [
      "Help and support",
      "Success workflows",
      "HealTech reviews",
      "Resources",
      "Blog",
      "Implementation guide",
      "Release notes",
      "Security model",
    ],
  },
  {
    title: "Company",
    links: [
      "About us",
      "Leadership",
      "Our impact",
      "Careers",
      "Press",
      "Contact us",
      "Partners",
      "Trust and security",
      "Compliance statement",
    ],
  },
];

const mobileNavItems = [
  { label: "Solutions", href: "#explore" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Security", href: "#security" },
  { label: "Resources", href: "#resources" },
];

function footerLinkHref(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("start") || normalized.includes("guide") || normalized.includes("success")) return "#how-it-works";
  if (normalized.includes("security") || normalized.includes("secure") || normalized.includes("audit") || normalized.includes("protection") || normalized.includes("compliance")) return "#security";
  if (normalized.includes("pricing") || normalized.includes("review")) return "#pricing";
  if (normalized.includes("contact") || normalized.includes("partner")) return "#request-demo";
  if (
    normalized.includes("clinic")
    || normalized.includes("patient")
    || normalized.includes("appointment")
    || normalized.includes("visit")
    || normalized.includes("lab")
    || normalized.includes("pharmacy")
    || normalized.includes("admin")
    || normalized.includes("role")
    || normalized.includes("follow-up")
  ) {
    return "#explore";
  }
  return "#resources";
}

export function HomepageClient() {
  const [activeMode, setActiveMode] = useState<HeroMode["id"]>("teams");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedChip, setSelectedChip] = useState("");
  const [visibleSolutionCount, setVisibleSolutionCount] = useState(6);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  const mode = heroModes.find((item) => item.id === activeMode) ?? heroModes[0];
  const audience: PublicSolutionAudience = activeMode === "teams" ? "clinic-teams" : "patients";
  const solutionSearchResponse = useMemo(
    () => searchPublicSolutions(submittedQuery, audience, { includeAllMatches: true }),
    [audience, submittedQuery],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExploreOpen(false);
        setMobileOpen(false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  function runPublicSearch(value: string) {
    setQuery(value);
    setSubmittedQuery(value);
    setVisibleSolutionCount(6);
    window.requestAnimationFrame(() => {
      document.getElementById("recommended-solutions")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function applySuggestion(value: string) {
    setSelectedChip(value);
    runPublicSearch(value);
  }

  return (
    <main className="min-h-screen bg-white font-sans text-[#181818]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#14a800] focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#181818]/96 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-[min(1440px,calc(100%_-_32px))] items-center justify-between gap-4 sm:w-[min(1440px,calc(100%_-_48px))]">
          <div className="flex items-center gap-7">
            <Link href="/" className="shrink-0 text-[28px] font-bold leading-none tracking-normal text-white sm:text-[30px]">
              HealTech
            </Link>
            <nav aria-label="Primary navigation" className="hidden items-center gap-6 whitespace-nowrap text-[15px] font-semibold lg:flex">
              <div ref={exploreRef} className="relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full px-2 py-2 text-white transition hover:text-[#b7f4ad] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b7f4ad]"
                  aria-expanded={exploreOpen}
                  aria-controls="explore-menu"
                  onClick={() => setExploreOpen((value) => !value)}
                >
                  Workflows <ChevronDown className={`h-4 w-4 transition ${exploreOpen ? "rotate-180" : ""}`} />
                </button>
                {exploreOpen ? (
                  <div
                    id="explore-menu"
                    className="absolute left-0 top-12 grid w-[520px] grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
                  >
                    {exploreGroups.map((group) => (
                      <div key={group.title}>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/55">{group.title}</p>
                        <div className="mt-4 grid gap-2">
                          {group.links.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              className="rounded-lg px-3 py-2 text-sm text-white/82 transition hover:bg-white/10 hover:text-[#b7f4ad]"
                              onClick={() => setExploreOpen(false)}
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <a href="#how-it-works" className="hover:text-[#b7f4ad]">
                Outcomes
              </a>
              <a href="#explore" className="hover:text-[#b7f4ad]">
                Roles
              </a>
              <a href="#security" className="hover:text-[#b7f4ad]">
                Why HealTech
              </a>
              <a href="#pricing" className="hover:text-[#b7f4ad]">
                Pricing
              </a>
            </nav>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <NavbarPublicSearch audience={audience} onSubmit={runPublicSearch} />
            <Link href="/login" className="whitespace-nowrap text-[15px] font-semibold text-white hover:text-[#b7f4ad]">
              Log in
            </Link>
            <Link
              href="#request-demo"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-[#14a800] px-6 text-[15px] font-bold text-white shadow-[0_0_24px_rgba(20,168,0,0.28)] transition hover:bg-[#108a00]"
            >
              Request a demo
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 text-white lg:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#181818] px-6 py-5 text-white lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-[28px] font-bold text-white" onClick={() => setMobileOpen(false)}>
              HealTech
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25"
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-10 grid gap-3 text-2xl font-semibold">
            {mobileNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl border border-white/14 px-4 py-4 text-white"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <Link
              href="#request-demo"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#14a800] text-base font-bold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Request a demo
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/22 text-base font-bold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
          </div>
        </div>
      ) : null}

      <section id="main-content" className="relative isolate flex min-h-[calc(100svh-80px)] overflow-hidden bg-[#181818]">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src="/homepage/mp_ (1).mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.74)_0%,rgba(0,0,0,0.58)_34%,rgba(0,0,0,0.22)_68%,rgba(0,0,0,0.30)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-[linear-gradient(0deg,rgba(0,0,0,0.82),rgba(0,0,0,0))]" />

        <div className="mx-auto flex w-[min(1200px,calc(100%_-_32px))] items-start pt-20 pb-12 md:pt-24 lg:pt-28">
          <div className="max-w-[760px] text-white">
            <div className="grid w-full max-w-[560px] grid-cols-2 rounded-full bg-white/35 p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur-md sm:inline-grid">
              {heroModes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={activeMode === item.id}
                  className={`min-h-11 rounded-full px-3 text-sm font-bold transition sm:px-8 md:px-16 ${
                    activeMode === item.id ? "bg-[#181818] text-white shadow-sm" : "text-white hover:bg-white/18"
                  }`}
                  onClick={() => {
                    setActiveMode(item.id);
                    setSelectedChip("");
                    setVisibleSolutionCount(6);
                    trackPublicSearchEvent("public_search_tab_changed", {
                      audience: item.id === "teams" ? "clinic-teams" : "patients",
                    });
                  }}
                >
                  {item.id === "teams" ? "Clinic teams" : "Patients"}
                </button>
              ))}
            </div>

            <h1 className="mt-7 max-w-[780px] text-balance font-[var(--font-hero)] text-[42px] font-semibold leading-[1.04] tracking-normal text-white [text-shadow:0_8px_30px_rgba(0,0,0,0.34)] sm:text-[58px] lg:text-[72px]">
              Connect clinic workflows in one secure workspace
            </h1>
            <p className="mt-6 max-w-[620px] font-[var(--font-hero)] text-lg font-medium leading-7 text-white/92 [text-shadow:0_4px_18px_rgba(0,0,0,0.30)] md:text-[23px] md:leading-[1.34]">
              {mode.headlineSupport}
            </p>

            <PublicSolutionSearch
              audience={audience}
              query={query}
              selectedChip={selectedChip}
              helperText={mode.helperText}
              chips={mode.chips}
              onQueryChange={(value) => {
                setQuery(value);
                if (selectedChip && selectedChip.toLowerCase() !== value.toLowerCase()) {
                  setSelectedChip("");
                }
              }}
              onSubmit={(value) => {
                setSelectedChip("");
                runPublicSearch(value);
              }}
              onChipSelect={applySuggestion}
            />
          </div>
        </div>
      </section>

      <PublicSearchResults
        response={solutionSearchResponse}
        visibleCount={visibleSolutionCount}
        onShowMore={() => setVisibleSolutionCount((count) => count + 6)}
      />

      <section aria-label="Trending clinic workflows" className="-mt-px overflow-hidden bg-[#181818] text-white">
        <style>{`
          @keyframes healtech-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }

          @media (prefers-reduced-motion: reduce) {
            .healtech-marquee {
              animation: none !important;
              transform: none !important;
            }
          }
        `}</style>
        <div className="mx-auto w-[min(1200px,calc(100%_-_32px))] pt-18 pb-14 md:pt-24 md:pb-20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <p className="flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-[#14a800]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#14a800]" />
              Trending workflows
            </p>
            <div className="relative min-w-0 flex-1 overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#181818] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#181818] to-transparent" />
              <div className="healtech-marquee flex w-max gap-5 [animation:healtech-marquee_30s_linear_infinite]">
                {[...trendingWorkflows, ...trendingWorkflows].map((item, index) => (
                  <button
                    key={`${item.label}-${index}`}
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-white/12 px-5 text-base font-semibold text-white transition hover:bg-white/18"
                    onClick={() => applySuggestion(item.label)}
                  >
                    <span>{item.label}</span>
                    {item.positive ? (
                      <TrendingUp className="h-4 w-4 text-[#14a800]" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-[#f2c94c]" aria-hidden="true" />
                    )}
                    <span>{item.change}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 overflow-hidden">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/42">Trusted across daily clinic operations</p>
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-6 text-xl font-bold text-white/92 sm:grid-cols-3 sm:text-2xl lg:grid-cols-7">
              {trustLogos.map((logo) => (
                <span key={logo} className="min-w-0 break-words tracking-normal">
                  {logo}
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-[780px] text-center">
            <h2 className="text-[34px] font-bold leading-tight tracking-normal text-white md:text-[46px]">Operate for where care is headed</h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-white/82">
              From front desk queues to pharmacy stock, see the key workflows that keep every clinic role aligned.
            </p>
            <Link
              href="#request-demo"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[#14a800] px-7 text-sm font-bold text-white shadow-[0_0_22px_rgba(20,168,0,0.24)] transition hover:bg-[#108a00]"
            >
              Start clinic demo
            </Link>
          </div>

          <div className="mt-20 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <article className="rounded-[26px] bg-[radial-gradient(circle_at_78%_18%,rgba(20,168,0,0.25),transparent_34%),linear-gradient(135deg,#102518,#0f3a1f_44%,#101b14)] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.28)] md:p-10">
              <h3 className="text-[28px] font-bold tracking-normal text-white">Emerging clinic roles</h3>
              <div className="mt-8 divide-y divide-white/28">
                {emergingClinicRoles.map((role) => (
                  <button
                    key={role.title}
                    type="button"
                    className="grid w-full gap-3 py-5 text-left transition hover:bg-white/[0.03] sm:grid-cols-[1fr_auto]"
                    onClick={() => applySuggestion(role.title)}
                  >
                    <span>
                      <span className="block text-base font-bold text-white">{role.title}</span>
                      <span className="mt-2 block text-sm leading-6 text-white/58">{role.description}</span>
                    </span>
                    <span className={`inline-flex items-center gap-2 text-sm font-bold ${role.positive ? "text-[#66e45b]" : "text-[#f2c94c]"}`}>
                      {role.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {role.change}
                    </span>
                  </button>
                ))}
              </div>
            </article>

            <article className="py-4 lg:py-10">
              <h3 className="text-[28px] font-bold tracking-normal text-white">In-demand workflows</h3>
              <div className="mt-8 grid gap-8">
                {demandWorkflowGroups.map((group) => (
                  <div key={group.title}>
                    <h4 className="text-base font-bold text-white">{group.title}</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white/58 transition hover:bg-white/16 hover:text-white"
                          onClick={() => applySuggestion(skill)}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="mt-24">
            <div className="grid gap-8 lg:grid-cols-[1.9fr_0.9fr]">
              <article className="grid min-h-[360px] overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(20,168,0,0.16))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.30)] md:grid-cols-[0.9fr_1.1fr] md:p-9">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <h3 className="max-w-[320px] text-[30px] font-bold leading-tight tracking-normal text-white">
                      Nimble clinics, notable impact
                    </h3>
                    <p className="mt-5 max-w-[320px] text-lg font-semibold leading-7 text-white/86">
                      See how a connected clinic workspace can scale daily operations without adding more manual follow-up.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Expand impact story"
                    className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/24 text-white transition hover:bg-white/10 md:flex"
                  >
                    <ArrowRight className="h-5 w-5 rotate-45" />
                  </button>
                </div>
                <div className="relative mt-6 min-h-[260px] overflow-hidden rounded-[22px] md:mt-0">
                  <video className="h-full min-h-[260px] w-full object-cover" autoPlay muted loop playsInline aria-label="Clinic operations video preview">
                    <source src="/homepage/mp_ (1).mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.18))]" />
                </div>
              </article>

              <article className="flex min-h-[360px] flex-col justify-between rounded-[24px] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(20,168,0,0.12))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.24)] md:p-9">
                <div>
                  <div className="flex items-center gap-5">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_20%,#8af17d,#13544e_72%)] text-2xl font-bold text-white">
                      HT
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">Operations story</p>
                      <p className="mt-2 text-sm font-semibold leading-5 text-white/45">Example designed outcome</p>
                    </div>
                  </div>
                  <p className="mt-9 text-xl font-bold leading-8 text-white">
                    &ldquo;HealTech is built to close the gaps between reception, clinical care, lab, pharmacy, and patient follow-up.&rdquo;
                  </p>
                </div>
                <div className="mt-10 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Previous impact story"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                  >
                    <ArrowRight className="h-5 w-5 rotate-180" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next impact story"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </article>
            </div>

            <div className="mt-20 grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
              {impactStats.map((stat) => (
                <div key={stat.value}>
                  <p className="text-[44px] font-bold leading-none tracking-normal text-white md:text-[52px]">{stat.value}</p>
                  <p className="mx-auto mt-3 max-w-[170px] text-sm font-bold leading-5 text-white/45">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="explore" className="-mt-px bg-[#181818] py-16 text-white lg:py-24">
        <div className="mx-auto w-[min(1200px,calc(100%_-_32px))]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[32px] font-bold leading-tight text-white md:text-[42px]">Explore clinic workflow families</h2>
              <p className="mt-3 max-w-[660px] text-base font-semibold leading-7 text-white/58">
                Browse the operational areas HealTech connects from first patient contact to follow-up.
              </p>
            </div>
          </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a
                key={category.title}
                href={category.href}
                className="group flex min-h-[228px] flex-col rounded-[22px] border border-white/12 bg-white/[0.055] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-[#14a800] hover:bg-white/[0.075] hover:shadow-[0_28px_70px_rgba(0,0,0,0.26)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#b7f4ad] transition group-hover:bg-[#14a800] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-white">{category.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-white/58">{category.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#66e45b]">
                  View workflow <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            );
          })}
        </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#181818] py-16 text-white lg:py-24">
        <div className="mx-auto grid w-[min(1200px,calc(100%_-_32px))] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-[32px] font-bold leading-tight text-white md:text-[42px]">How HealTech keeps clinic work moving</h2>
            <p className="mt-4 text-base font-semibold leading-7 text-white/58">
              The system follows the real care path: intake, clinical decisions, lab and pharmacy actions, then patient follow-up.
            </p>
            <div className="mt-8 grid gap-4">
              {steps.map((step, index) => (
                <article key={step.title} className="grid grid-cols-[48px_1fr] gap-4 rounded-2xl border border-white/12 bg-white/[0.055] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#14a800] text-lg font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/58">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <Image
            src="/homepage/workflow-clinic-ops.webp"
            alt="Illustrated workflow board showing connected clinic operations from intake to follow-up."
            width={1400}
            height={900}
            loading="lazy"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto w-full rounded-[32px] border border-white/12 bg-white/[0.055] shadow-[0_30px_100px_rgba(0,0,0,0.32)]"
          />
        </div>
      </section>

      <section id="pricing" className="bg-[#181818] py-16 text-white lg:py-24">
        <div className="mx-auto w-[min(1200px,calc(100%_-_32px))]">
          <div className="max-w-[680px]">
            <h2 className="text-[32px] font-bold leading-tight text-white md:text-[42px]">Simple paths from demo to clinic rollout</h2>
            <p className="mt-4 text-base font-semibold leading-7 text-white/58">
              Pricing is scoped to your clinic setup, modules, and rollout needs. Start with demo access before making a commitment.
            </p>
          </div>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[24px] border bg-white/[0.055] p-7 shadow-[0_22px_70px_rgba(0,0,0,0.22)] ${
                  plan.featured ? "border-[#14a800] bg-[linear-gradient(145deg,rgba(20,168,0,0.18),rgba(255,255,255,0.06))] shadow-[0_28px_90px_rgba(20,168,0,0.14)]" : "border-white/12"
                }`}
              >
                {plan.featured ? (
                  <span className="rounded-full bg-[#14a800] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white">
                    Recommended
                  </span>
                ) : null}
                <h3 className="mt-5 text-2xl font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{plan.subtitle}</p>
                <p className="mt-6 text-[30px] font-bold text-[#b7f4ad]">{plan.price}</p>
                <ul className="mt-6 grid gap-3">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-6 text-white/72">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#14a800]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <a
                  href="#request-demo"
                  className={`mt-7 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-bold transition ${
                    plan.featured
                      ? "bg-[#14a800] text-white hover:bg-[#108a00]"
                      : "border border-white/70 text-white hover:border-[#14a800] hover:text-[#b7f4ad]"
                  }`}
                >
                  {plan.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#13544e] py-16 text-white lg:py-24">
        <div className="mx-auto grid w-[min(1200px,calc(100%_-_32px))] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <ShieldCheck className="h-12 w-12 text-[#b7f4ad]" />
            <h2 className="mt-5 text-[32px] font-bold leading-tight md:text-[42px]">Built around secure role-based clinic work</h2>
            <p className="mt-4 text-base leading-7 text-[#d9f5d5]">
              HealTech keeps sensitive workflows separated by role and designed around protected routes, clear permissions, and audit visibility.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {["Guarded role routes", "Patient-focused access", "Workflow approvals", "Audit-ready operations"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/14 bg-white/8 p-5">
                <CheckCircle2 className="h-6 w-6 text-[#b7f4ad]" />
                <h3 className="mt-4 text-lg font-bold">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-[#d9f5d5]">
                  Practical controls that support daily clinic work without exposing unrelated modules.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(1200px,calc(100%_-_32px))] py-16 lg:py-24">
        <div className="max-w-[760px]">
          <h2 className="text-[32px] font-bold leading-tight text-[#181818] md:text-[42px]">Proof points designed around real clinic outcomes</h2>
          <p className="mt-4 text-base leading-7 text-[#5e6d55]">
            These are example outcome cards that describe intended workflow improvements, not customer testimonials.
          </p>
        </div>
        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {proofCards.map((proof) => (
            <article key={proof.result} className="rounded-[24px] border border-[#d9d9d9] bg-white p-7">
              <p className="text-base leading-7 text-[#181818]">&ldquo;{proof.quote}&rdquo;</p>
              <p className="mt-6 text-sm font-bold text-[#108a00]">Result: {proof.result}</p>
              <p className="mt-1 text-sm text-[#5e6d55]">{proof.category}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="request-demo" className="bg-[#f2f7f2] py-14">
        <div className="mx-auto flex w-[min(1200px,calc(100%_-_32px))] flex-col gap-6 rounded-[32px] bg-[#13544e] p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="text-[30px] font-bold leading-tight md:text-[40px]">Ready to connect your clinic workflows?</h2>
            <p className="mt-3 max-w-[620px] text-base leading-7 text-[#d9f5d5]">
              Start with demo access, review the role workspaces, and choose the rollout path that fits your clinic.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#request-demo" className="inline-flex h-12 items-center justify-center rounded-full bg-[#14a800] px-7 text-base font-bold text-white hover:bg-[#108a00]">
              Request a demo
            </a>
            <a href="#explore" className="inline-flex h-12 items-center justify-center rounded-full border border-white/70 px-7 text-base font-bold text-white hover:bg-white/10">
              Browse workflows
            </a>
          </div>
        </div>
      </section>

      <footer id="resources" className="border-t border-white/10 bg-[#181818] text-white">
        <div className="mx-auto w-[min(1440px,calc(100%_-_64px))] py-16 md:py-20">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-sm font-medium text-white/34">{column.title}</h3>
                <ul className="mt-5 grid gap-4">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href={footerLinkHref(link)} className="text-sm font-semibold leading-none text-white transition hover:text-[#14a800]">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-16 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-6">
              <p className="text-sm font-medium text-white/34">Follow us</p>
              {[
                { label: "Facebook", icon: Facebook },
                { label: "LinkedIn", icon: Linkedin },
                { label: "X", icon: Twitter },
                { label: "YouTube", icon: Youtube },
                { label: "Instagram", icon: Instagram },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.label} href="#resources" aria-label={item.label} className="text-white transition hover:text-[#14a800]">
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <p className="text-sm font-medium text-white/34">Mobile app</p>
              <a href="#resources" aria-label="iOS app" className="text-white transition hover:text-[#14a800]">
                <Apple className="h-5 w-5" />
              </a>
              <a href="#resources" aria-label="Mobile app" className="text-white transition hover:text-[#14a800]">
                <Smartphone className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-5 border-t border-white/14 pt-5 text-sm md:flex-row md:items-center">
            <p className="text-white/32">Copyright 2026 HealTech Global LLC</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-white">
              <a href="#resources" className="hover:text-[#14a800]">
                Terms of Service
              </a>
              <a href="#resources" className="hover:text-[#14a800]">
                Privacy Policy
              </a>
              <a href="#resources" className="hover:text-[#14a800]">
                Data Protection
              </a>
              <a href="#security" className="hover:text-[#14a800]">
                Accessibility
              </a>
              <a href="#resources" className="hover:text-[#14a800]">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
