"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  LockKeyhole,
  Menu,
  MonitorCog,
  PackagePlus,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type HeroMode = {
  id: "teams" | "patients";
  label: string;
  headlineSupport: string;
  searchPlaceholder: string;
  primaryCta: string;
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
    searchPlaceholder: "Search clinic workflows or roles",
    primaryCta: "Request a demo",
    chips: ["Reception queue", "Doctor workspace", "Lab orders", "Pharmacy stock", "Admin reports"],
  },
  {
    id: "patients",
    label: "For patients",
    headlineSupport: "Give patients one clear path to visits, results, medicines, and follow-up.",
    searchPlaceholder: "Search patient services or records",
    primaryCta: "View patient portal",
    chips: ["Appointments", "Visit history", "Lab results", "Medicines", "Secure profile"],
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

const categories: Category[] = [
  {
    title: "Reception",
    description: "Register patients, schedule appointments, create visits, and manage the active queue.",
    href: "#workflow",
    icon: ClipboardCheck,
    keywords: ["front desk", "queue", "appointments", "registration", "visit"],
  },
  {
    title: "Doctor workspace",
    description: "Review visits, add diagnoses, request labs, prescribe medicines, and close encounters.",
    href: "#workflow",
    icon: Stethoscope,
    keywords: ["doctor", "diagnosis", "clinical", "prescription", "encounter"],
  },
  {
    title: "Lab orders",
    description: "Receive requests, submit results, and route approved findings back to care teams.",
    href: "#workflow",
    icon: FlaskConical,
    keywords: ["lab", "tests", "results", "approval", "orders"],
  },
  {
    title: "Pharmacy inventory",
    description: "Track stock, batches, low inventory, expiry risk, and prescription dispensing.",
    href: "#pricing",
    icon: PackagePlus,
    keywords: ["pharmacy", "inventory", "stock", "medicine", "dispense"],
  },
  {
    title: "Patient portal",
    description: "Let patients view visits, lab results, medicines, appointments, and profile details.",
    href: "#workflow",
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

const discoverySuggestions = ["appointment flow", "lab results", "medicine stock", "patient records", "admin reports"];

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
    title: "For clinic teams",
    links: ["Reception", "Doctors", "Lab teams", "Pharmacy", "Admins"],
  },
  {
    title: "Solutions",
    links: ["Appointments", "Visits", "Patient records", "Inventory", "Reports"],
  },
  {
    title: "Resources",
    links: ["How it works", "Pricing", "Security", "Demo mode", "Help"],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Privacy", "Terms", "Security"],
  },
];

export function HomepageClient() {
  const [activeMode, setActiveMode] = useState<HeroMode["id"]>("teams");
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  const mode = heroModes.find((item) => item.id === activeMode) ?? heroModes[0];
  const normalizedSearch = activeSearch.trim().toLowerCase();

  const categoryMatches = useMemo(() => {
    if (!normalizedSearch) return new Set<string>();
    return new Set(
      categories
        .filter((category) =>
          [category.title, category.description, ...category.keywords].some((value) =>
            value.toLowerCase().includes(normalizedSearch),
          ),
        )
        .map((category) => category.title),
    );
  }, [normalizedSearch]);

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

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveSearch(query);
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applySuggestion(value: string) {
    setQuery(value);
    setActiveSearch(value);
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-white font-sans text-[#181818]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[#14a800] focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#181818] text-white">
        <div className="mx-auto flex h-20 w-[min(1440px,calc(100%_-_48px))] items-center justify-between gap-5">
          <div className="flex items-center gap-7">
            <Link href="/" className="text-[30px] font-bold leading-none tracking-normal text-white">
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
            <a
              href="#explore"
              className="hidden h-12 min-w-[250px] items-center gap-3 rounded-full border border-white/36 px-5 text-base text-white/82 xl:flex"
            >
              <Search className="h-5 w-5" />
              Search clinic workflows
            </a>
            <Link href="/login" className="whitespace-nowrap text-[15px] font-semibold text-white hover:text-[#b7f4ad]">
              Log in
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-[#14a800] px-6 text-[15px] font-bold text-white shadow-[0_0_24px_rgba(20,168,0,0.28)] transition hover:bg-[#108a00]"
            >
              Request a demo
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white lg:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] bg-[#181818] px-6 py-5 text-white lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
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
            {["Explore", "How it works", "Pricing", "Security", "Resources"].map((item) => (
              <a
                key={item}
                href={item === "Explore" ? "#explore" : `#${item.toLowerCase().replaceAll(" ", "-")}`}
                className="rounded-xl border border-white/14 px-4 py-4 text-white"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </a>
            ))}
          </nav>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#14a800] text-base font-bold text-white"
            onClick={() => setMobileOpen(false)}
          >
            Request a demo
          </Link>
        </div>
      ) : null}

      <section id="main-content" className="relative isolate flex min-h-[calc(100svh-80px)] overflow-hidden bg-[#181818]">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/homepage/clinic-hero-video-poster.webp"
          aria-hidden="true"
        >
          <source src="/homepage/clinic-hero-loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.74)_0%,rgba(0,0,0,0.58)_34%,rgba(0,0,0,0.22)_68%,rgba(0,0,0,0.30)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-[linear-gradient(0deg,rgba(0,0,0,0.82),rgba(0,0,0,0))]" />

        <div className="mx-auto flex w-[min(1200px,calc(100%_-_32px))] items-start pt-20 pb-12 md:pt-24 lg:pt-28">
          <div className="max-w-[760px] text-white">
            <div className="inline-flex rounded-full bg-white/35 p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur-md">
              {heroModes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={activeMode === item.id}
                  className={`min-h-11 rounded-full px-9 text-sm font-bold transition md:px-16 ${
                    activeMode === item.id ? "bg-[#181818] text-white shadow-sm" : "text-white hover:bg-white/18"
                  }`}
                  onClick={() => setActiveMode(item.id)}
                >
                  {item.id === "teams" ? "Clinic teams" : "Patients"}
                </button>
              ))}
            </div>

            <h1 className="mt-6 max-w-[720px] text-[42px] font-bold leading-[1.02] tracking-normal text-white sm:text-[58px] lg:text-[68px]">
            Connect clinic workflows in one secure workspace
          </h1>
            <p className="mt-5 max-w-[580px] text-lg font-semibold leading-7 text-white md:text-[22px] md:leading-[1.28]">
              {mode.headlineSupport}
            </p>

          <form onSubmit={submitSearch} className="mt-6 max-w-[720px]">
            <label htmlFor="hero-search" className="sr-only">
              Search HealTech workflows
            </label>
            <div className="flex flex-col overflow-hidden rounded-[26px] bg-white p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:flex-row">
              <div className="flex min-h-14 flex-1 items-center gap-3 px-5">
                <Search className="h-5 w-5 text-[#7b8476]" aria-hidden="true" />
                <input
                  id="hero-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={mode.searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-base text-[#181818] outline-none placeholder:text-[#8a9287]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#14a800] px-9 text-lg font-bold text-white transition hover:bg-[#108a00]"
              >
                {activeMode === "teams" ? "Find workflows" : "Find services"}
              </button>
            </div>
          </form>

          <div className="mt-5 flex max-w-[640px] flex-wrap gap-2" aria-label="Popular searches">
            {mode.chips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded-full border border-white/24 bg-black/18 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[#b7f4ad] hover:bg-white/12"
                onClick={() => applySuggestion(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
          </div>
        </div>
      </section>

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
                    <span className={item.positive ? "text-[#14a800]" : "text-[#f2c94c]"}>{item.positive ? "↗" : "↘"}</span>
                    <span>{item.change}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/42">Trusted across daily clinic operations</p>
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 text-2xl font-bold text-white/92 sm:grid-cols-3 lg:grid-cols-7">
              {trustLogos.map((logo) => (
                <span key={logo} className="whitespace-nowrap tracking-[-0.02em]">
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
          </div>
        </div>
      </section>

      <section id="explore" className="mx-auto w-[min(1200px,calc(100%_-_32px))] py-16 lg:py-24">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[32px] font-bold leading-tight text-[#181818] md:text-[42px]">Explore clinic workflow families</h2>
            <p className="mt-3 max-w-[660px] text-base leading-7 text-[#5e6d55]">
              Browse the operational areas HealTech connects from first patient contact to follow-up.
            </p>
          </div>
          {activeSearch ? (
            <p className="rounded-full bg-[#f2f7f2] px-4 py-2 text-sm font-semibold text-[#13544e]">
              Highlighting: {activeSearch}
            </p>
          ) : null}
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isMatched = !normalizedSearch || categoryMatches.has(category.title);
            return (
              <a
                key={category.title}
                href={category.href}
                className={`group flex min-h-[228px] flex-col rounded-[20px] border bg-white p-6 transition ${
                  isMatched
                    ? "border-[#d9d9d9] shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:border-[#14a800] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
                    : "border-[#eef1ee] opacity-45"
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2f7f2] text-[#13544e] transition group-hover:bg-[#14a800] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-[#181818]">{category.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[#5e6d55]">{category.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#108a00]">
                  View workflow <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="bg-[#f2f7f2] py-14">
        <div className="mx-auto grid w-[min(1200px,calc(100%_-_32px))] gap-6 rounded-[28px] border border-[#cddfcb] bg-white p-6 md:grid-cols-[0.85fr_1.15fr] md:p-8">
          <div>
            <h2 className="text-[28px] font-bold text-[#181818]">Find workflows by need, category, or goal</h2>
            <p className="mt-3 text-base leading-7 text-[#5e6d55]">
              Search for a workflow and HealTech will highlight the matching areas on this page.
            </p>
          </div>
          <div>
            <form onSubmit={submitSearch}>
              <label htmlFor="discovery-search" className="sr-only">
                Search workflow categories
              </label>
              <div className="flex flex-col gap-3 rounded-full border border-[#d9d9d9] p-2 sm:flex-row">
                <input
                  id="discovery-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search workflows, roles, services, or reports"
                  className="min-h-12 flex-1 rounded-full px-5 text-base outline-none"
                />
                <button type="submit" className="min-h-12 rounded-full bg-[#14a800] px-6 text-sm font-bold text-white hover:bg-[#108a00]">
                  Find matches
                </button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {discoverySuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-full bg-[#f7f7f7] px-4 py-2 text-sm font-semibold text-[#13544e] hover:bg-[#e6f4e4]"
                  onClick={() => applySuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto grid w-[min(1200px,calc(100%_-_32px))] gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
        <div>
          <h2 className="text-[32px] font-bold leading-tight text-[#181818] md:text-[42px]">How HealTech keeps clinic work moving</h2>
          <p className="mt-4 text-base leading-7 text-[#5e6d55]">
            The system follows the real care path: intake, clinical decisions, lab and pharmacy actions, then patient follow-up.
          </p>
          <div className="mt-8 grid gap-4">
            {steps.map((step, index) => (
              <article key={step.title} className="grid grid-cols-[48px_1fr] gap-4 rounded-2xl border border-[#d9d9d9] bg-white p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13544e] text-lg font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#181818]">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#5e6d55]">{step.description}</p>
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
          className="h-auto w-full rounded-[32px] border border-[#d9d9d9] bg-[#f7f7f7] shadow-[0_24px_70px_rgba(0,0,0,0.10)]"
        />
      </section>

      <section id="pricing" className="bg-[#f7f7f7] py-16 lg:py-24">
        <div className="mx-auto w-[min(1200px,calc(100%_-_32px))]">
          <div className="max-w-[680px]">
            <h2 className="text-[32px] font-bold leading-tight text-[#181818] md:text-[42px]">Simple paths from demo to clinic rollout</h2>
            <p className="mt-4 text-base leading-7 text-[#5e6d55]">
              Pricing is scoped to your clinic setup, modules, and rollout needs. Start with demo access before making a commitment.
            </p>
          </div>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[24px] border bg-white p-7 ${
                  plan.featured ? "border-[#14a800] shadow-[0_24px_70px_rgba(20,168,0,0.16)]" : "border-[#d9d9d9]"
                }`}
              >
                {plan.featured ? (
                  <span className="rounded-full bg-[#14a800] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white">
                    Recommended
                  </span>
                ) : null}
                <h3 className="mt-5 text-2xl font-bold text-[#181818]">{plan.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5e6d55]">{plan.subtitle}</p>
                <p className="mt-6 text-[30px] font-bold text-[#13544e]">{plan.price}</p>
                <ul className="mt-6 grid gap-3">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-6 text-[#181818]">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#14a800]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-7 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-bold transition ${
                    plan.featured
                      ? "bg-[#14a800] text-white hover:bg-[#108a00]"
                      : "border border-[#181818] text-[#181818] hover:border-[#14a800] hover:text-[#108a00]"
                  }`}
                >
                  {plan.cta}
                </Link>
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

      <section className="bg-[#f2f7f2] py-14">
        <div className="mx-auto flex w-[min(1200px,calc(100%_-_32px))] flex-col gap-6 rounded-[32px] bg-[#13544e] p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="text-[30px] font-bold leading-tight md:text-[40px]">Ready to connect your clinic workflows?</h2>
            <p className="mt-3 max-w-[620px] text-base leading-7 text-[#d9f5d5]">
              Start with demo access, review the role workspaces, and choose the rollout path that fits your clinic.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-full bg-[#14a800] px-7 text-base font-bold text-white hover:bg-[#108a00]">
              Request a demo
            </Link>
            <a href="#explore" className="inline-flex h-12 items-center justify-center rounded-full border border-white/70 px-7 text-base font-bold text-white hover:bg-white/10">
              Browse workflows
            </a>
          </div>
        </div>
      </section>

      <footer id="resources" className="bg-[#181818] py-14 text-white">
        <div className="mx-auto grid w-[min(1200px,calc(100%_-_32px))] gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <p className="text-3xl font-bold text-white">HealTech</p>
            <p className="mt-4 max-w-[360px] text-sm leading-6 text-white/70">
              Clinic workflow management for teams that need clearer queues, safer handoffs, and connected patient operations.
            </p>
            <div className="mt-6 flex gap-3">
              {[Building2, HeartPulse, UsersRound].map((Icon, index) => (
                <span key={index} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-5 w-5" />
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-white">{column.title}</h3>
                <ul className="mt-4 grid gap-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#main-content" className="text-sm text-white/68 hover:text-white">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-10 flex w-[min(1200px,calc(100%_-_32px))] flex-col gap-3 border-t border-white/12 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HealTech. Clinic operations software.</p>
          <div className="flex flex-wrap gap-5">
            <a href="#resources" className="hover:text-white">
              Privacy
            </a>
            <a href="#resources" className="hover:text-white">
              Terms
            </a>
            <a href="#security" className="hover:text-white">
              Security
            </a>
            <a href="#resources" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
