import Link from "next/link";
import { ArrowRight, ClipboardCheck, FlaskConical, MonitorCog, PackagePlus, Stethoscope, UserRound } from "lucide-react";
import { ProductPreview } from "@/components/public/product-preview";

const roles = [
  {
    title: "Admin",
    text: "Employee management, financial reports, and clinic configurations.",
    icon: MonitorCog,
    tone: "bg-[var(--secondary-container)] text-[var(--secondary)]",
  },
  {
    title: "Reception",
    text: "Patient registration, appointment scheduling, and initial triage.",
    icon: ClipboardCheck,
    tone: "bg-[var(--tertiary-fixed)] text-[var(--tertiary)]",
  },
  {
    title: "Doctor",
    text: "Clinical diagnosis, digital prescriptions, and treatment planning.",
    icon: Stethoscope,
    tone: "bg-[var(--primary-fixed)] text-[var(--primary)]",
  },
  {
    title: "Lab",
    text: "Process test orders, record results, and notify practitioners.",
    icon: FlaskConical,
    tone: "bg-[var(--primary-fixed)]/40 text-[var(--primary)]",
  },
  {
    title: "Pharmacy",
    text: "Medication inventory tracking and prescription dispensing.",
    icon: PackagePlus,
    tone: "bg-[var(--error-container)] text-[var(--error)]",
  },
  {
    title: "Patient",
    text: "Secure portal access for medical records and tele-consultations.",
    icon: UserRound,
    tone: "bg-[var(--secondary-container)] text-[var(--primary)]",
  },
];

const workflow = [
  { label: "Reception", icon: ClipboardCheck },
  { label: "Doctor", icon: Stethoscope },
  { label: "Lab", icon: FlaskConical },
  { label: "Review", icon: ClipboardCheck },
  { label: "Pharmacy", icon: PackagePlus },
  { label: "Patient Exit", icon: UserRound },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] font-[Manrope,Inter,sans-serif] text-[var(--on-surface)]">
      {/* ─── Header ─────────────────────────────────────── */}
      <header className="border-b border-[var(--outline-variant)] bg-[var(--background)]">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-6 lg:px-7">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-[32px] font-bold leading-none tracking-[-0.02em] text-[var(--primary)]">
              ClinicFlow
            </Link>
            <nav className="hidden items-center gap-7 text-[15px] font-medium text-[var(--on-surface)] md:flex">
              <a href="#solutions" className="transition hover:text-[var(--primary)]">Solutions</a>
              <a href="#roles" className="transition hover:text-[var(--primary)]">Roles</a>
              <a href="#workflow" className="transition hover:text-[var(--primary)]">Workflow</a>
              <a href="#pricing" className="transition hover:text-[var(--primary)]">Pricing</a>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden text-[15px] font-medium text-[var(--primary)] sm:inline">
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-[0.5rem] bg-[var(--primary)] px-5 py-2.5 text-[14px] font-bold text-[var(--on-primary)] shadow-[0_4px_12px_rgba(0,100,124,0.18)] transition hover:bg-[var(--on-primary-fixed-variant)]"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ──────────────────────────────────────── */}
      <section id="solutions" className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-12 md:py-16 lg:grid-cols-[0.95fr_1fr] lg:px-7">
        <div className="max-w-[560px]">
          <h1 className="text-[44px] font-bold leading-[1.16] tracking-[-0.02em] text-[var(--on-surface)] md:text-[50px]">
            Clinical Efficiency,
            <br />
            Human Care.
          </h1>
          <p className="mt-7 text-[16px] leading-7 text-[var(--on-surface-variant)]">
            A complete clinic management system for modern healthcare providers.
            <br className="hidden sm:block" />
            Streamline operations from reception to pharmacy.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-[52px] items-center rounded-[0.5rem] bg-[var(--primary)] px-7 text-[15px] font-bold text-[var(--on-primary)] shadow-[0_6px_16px_rgba(0,100,124,0.20)] transition hover:bg-[var(--on-primary-fixed-variant)]"
          >
            Explore the Platform
          </Link>
        </div>
        <ProductPreview />
      </section>

      {/* ─── Roles ─────────────────────────────────────── */}
      <section id="roles" className="border-t border-[var(--surface-container-high)] bg-[var(--surface-container-low)] py-12 md:py-14">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-7">
          <div className="text-center">
            <h2 className="text-[26px] font-semibold tracking-[-0.01em] text-[var(--on-surface)]">Empowering Every Role</h2>
            <p className="mt-3 text-[15px] text-[var(--on-surface-variant)]">Tailored tools for seamless clinical collaboration.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <article key={role.title} className="min-h-[180px] rounded-[0.75rem] border border-[var(--outline-variant)] bg-white p-6 transition hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
                <div className={`flex h-12 w-12 items-center justify-center rounded-[0.5rem] ${role.tone}`}>
                  <role.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.01em] text-[var(--on-surface)]">{role.title}</h3>
                <p className="mt-2 max-w-[360px] text-[14px] leading-5 text-[var(--on-surface-variant)]">{role.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Workflow ──────────────────────────────────── */}
      <section id="workflow" className="border-t border-[var(--surface-container-high)] bg-[var(--background)] py-14 md:py-16">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-7">
          <div className="text-center">
            <h2 className="text-[26px] font-semibold tracking-[-0.01em] text-[var(--on-surface)]">End-to-End Workflow</h2>
            <p className="mt-3 text-[15px] text-[var(--on-surface-variant)]">A seamless journey from entry to exit.</p>
          </div>
          <div className="mt-9 grid items-start gap-4 md:grid-cols-[repeat(11,minmax(0,1fr))]">
            {workflow.map((step, index) => (
              <div key={step.label} className="contents">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                    <step.icon className="h-5 w-5 text-[var(--on-surface)]" />
                  </div>
                  <span className="text-center text-[14px] font-medium text-[var(--on-surface)]">{step.label}</span>
                </div>
                {index < workflow.length - 1 ? (
                  <div className="hidden h-16 items-center justify-center text-[var(--outline)] md:flex">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer id="pricing" className="border-t border-[var(--outline-variant)] bg-white py-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 lg:flex-row lg:items-end lg:justify-between lg:px-7">
          <div>
            <p className="text-[21px] font-semibold text-[var(--on-surface)]">ClinicFlow</p>
            <p className="mt-3 text-[12px] text-[var(--on-surface-variant)]">© 2024 ClinicFlow Management Systems. Surgical Precision in Healthcare.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-[12px] text-[var(--on-surface-variant)]">
            <a href="#" className="transition hover:text-[var(--primary)]">Privacy Policy</a>
            <a href="#" className="transition hover:text-[var(--primary)]">Terms of Service</a>
            <a href="#" className="transition hover:text-[var(--primary)]">Security Compliance</a>
            <a href="#" className="transition hover:text-[var(--primary)]">API Documentation</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
