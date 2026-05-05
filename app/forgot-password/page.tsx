import Link from "next/link";
import { ArrowLeft, RotateCcwKey } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef4f7] px-6 py-12 font-[Manrope,Inter,sans-serif] text-[#081014]">
      <section className="flex min-h-[470px] w-full max-w-[550px] translate-y-10 flex-col justify-center rounded-2xl border border-[#b9c8d0] bg-white px-10 py-10 shadow-[0_16px_40px_rgba(15,23,42,0.03)] sm:px-12 sm:py-10">
        <div className="text-center">
          <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#007f9d] text-white shadow-[0_10px_22px_rgba(0,100,124,0.16)]">
            <RotateCcwKey className="h-7 w-7 stroke-[2.5]" />
          </div>
          <h1 className="mt-7 text-[30px] font-semibold leading-[38px] tracking-[-0.025em] text-[#080d10]">Forgot Password</h1>
          <p className="mt-3 text-[17px] leading-6 text-[#3e484d]">Enter your email to receive reset instructions.</p>
        </div>

        <div className="mt-9">
          <ForgotPasswordForm />
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[20px] font-medium text-[#00647c] transition hover:text-[#004e61]">
            <ArrowLeft className="h-5 w-5" />
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}
