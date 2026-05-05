import Link from "next/link";
import { ArrowLeft, BriefcaseMedical } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef4f7] px-6 py-12 font-[Manrope,Inter,sans-serif] text-[#081014]">
      <section className="flex min-h-[660px] w-full max-w-[560px] translate-y-10 flex-col justify-center rounded-2xl border border-[#b9c8d0] bg-white px-10 py-10 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
        <div className="text-center">
          <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#dceff4] text-[#00647c]">
            <BriefcaseMedical className="h-8 w-8 stroke-[2.4]" />
          </div>
          <h1 className="mt-7 text-[30px] font-semibold leading-[38px] tracking-[-0.025em] text-[#080d10]">Reset Password</h1>
          <p className="mt-3 text-[17px] leading-6 text-[#242e33]">Create a new, secure password for your account</p>
        </div>

        <div className="mt-9">
          <ResetPasswordForm submitLabel="Update Password" />
        </div>

        <div className="mt-10 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[20px] font-medium text-[#00647c] transition hover:text-[#004e61]">
            <ArrowLeft className="h-5 w-5" />
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}
