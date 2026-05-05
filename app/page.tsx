import Link from "next/link";
import { ArrowRight, ClipboardCheck, FlaskConical, MonitorCog, PackagePlus, Stethoscope, UserRound } from "lucide-react";
import { ProductPreview } from "@/components/public/product-preview";

const roles = [
  {
    title: "Admin",
    text: "Employee management, financial reports, and clinic configurations.",
    icon: MonitorCog,
    tone: "bg-[#dbe7ff] text-[#005c72]",
  },
  {
    title: "Reception",
    text: "Patient registration, appointment scheduling, and initial triage.",
    icon: ClipboardCheck,
    tone: "bg-[#efe3d5] text-[#7b3f00]",
  },
  {
    title: "Doctor",
    text: "Clinical diagnosis, digital prescriptions, and treatment planning.",
    icon: Stethoscope,
    tone: "bg-[#d2edf3] text-[#00647c]",
  },
  {
    title: "Lab",
    text: "Process test orders, record results, and notify practitioners.",
    icon: FlaskConical,
    tone: "bg-[#e2f1f4] text-[#00647c]",
  },
  {
    title: "Pharmacy",
    text: "Medication inventory tracking and prescription dispensing.",
    icon: PackagePlus,
    tone: "bg-[#ffe7e7] text-[#ba1a1a]",
  },
  {
    title: "Patient",
    text: "Secure portal access for medical records and tele-consultations.",
    icon: UserRound,
    tone: "bg-[#dbe7ff] text-[#005c72]",
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
    <main className="min-h-screen bg-[#f6fafd] font-sans text-[#171c1e]">
      <header className="border-b border-[#bdc8ce] bg-[#f6fafd]">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-6 lg:px-7">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-[32px] font-bold leading-none text-[#005c72]">
              HealTech
            </Link>
            <nav className="hidden items-center gap-7 text-[15px] font-medium text-[#0f171a] md:flex">
              <a href="#solutions" className="hover:text-[#00647c]">Solutions</a>
              <a href="#roles" className="hover:text-[#00647c]">Roles</a>
              <a href="#workflow" className="hover:text-[#00647c]">Workflow</a>
              <a href="#pricing" className="hover:text-[#00647c]">Pricing</a>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden text-[15px] font-medium text-[#005c72] sm:inline">
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-[#00647c] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_4px_12px_rgba(0,100,124,0.18)] transition hover:bg-[#004e61]"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </header>

      <section id="solutions" className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-12 md:py-16 lg:grid-cols-[0.95fr_1fr] lg:px-7">
        <div className="max-w-[560px]">
          <h1 className="text-[44px] font-bold leading-[1.16] tracking-[-0.02em] text-[#050b0e] md:text-[50px]">
            Clinical Efficiency,
            <br />
            Human Care.
          </h1>
          <p className="mt-7 text-[16px] leading-7 text-[#2f3b40]">
            A complete clinic management system for modern healthcare providers.
            <br className="hidden sm:block" />
            Streamline operations from reception to pharmacy.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-[52px] items-center rounded-md bg-[#00647c] px-7 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(0,100,124,0.20)] transition hover:bg-[#004e61]"
          >
            Explore the Platform
          </Link>
        </div>
        <ProductPreview />
      </section>

      <section id="roles" className="border-t border-[#edf1f4] bg-[#f1f6f9] py-12 md:py-14">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-7">
          <div className="text-center">
            <h2 className="text-[26px] font-semibold tracking-[-0.01em] text-[#050b0e]">Empowering Every Role</h2>
            <p className="mt-3 text-[15px] text-[#3e484d]">Tailored tools for seamless clinical collaboration.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <article key={role.title} className="min-h-[180px] rounded-xl border border-[#bdc8ce] bg-white p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${role.tone}`}>
                  <role.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.01em] text-[#050b0e]">{role.title}</h3>
                <p className="mt-2 max-w-[360px] text-[14px] leading-5 text-[#3e484d]">{role.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-t border-[#edf1f4] bg-[#f6fafd] py-14 md:py-16">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-7">
          <div className="text-center">
            <h2 className="text-[26px] font-semibold tracking-[-0.01em] text-[#050b0e]">End-to-End Workflow</h2>
            <p className="mt-3 text-[15px] text-[#3e484d]">A seamless journey from entry to exit.</p>
          </div>
          <div className="mt-9 grid items-start gap-4 md:grid-cols-[repeat(11,minmax(0,1fr))]">
            {workflow.map((step, index) => (
              <div key={step.label} className="contents">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#bdc8ce] bg-[#eef4f7]">
                    <step.icon className="h-5 w-5 text-[#172025]" />
                  </div>
                  <span className="text-center text-[14px] font-medium text-[#050b0e]">{step.label}</span>
                </div>
                {index < workflow.length - 1 ? (
                  <div className="hidden h-16 items-center justify-center text-[#9aa8ae] md:flex">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="pricing" className="border-t border-[#bdc8ce] bg-white py-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 lg:flex-row lg:items-end lg:justify-between lg:px-7">
          <div>
            <p className="text-[21px] font-semibold text-[#050b0e]">HealTech</p>
            <p className="mt-3 text-[12px] text-[#2f3b40]">© 2026 HealTech. Clinic operations software.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-[12px] text-[#2f3b40]">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Compliance</span>
            <span>API Documentation</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
