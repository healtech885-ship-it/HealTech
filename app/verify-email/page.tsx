import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef4f7] px-6 py-12 font-[Manrope,Inter,sans-serif] text-[#081014]">
      <section className="flex min-h-[510px] w-full max-w-[560px] translate-y-12 flex-col justify-center rounded-2xl border border-[#c0ccd2] bg-white px-10 py-10 shadow-[0_16px_40px_rgba(15,23,42,0.03)] sm:px-10">
        <div className="text-center">
          <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#dceff4] text-[#00647c]">
            <Mail className="h-8 w-8 stroke-[2.4]" />
          </div>
          <h1 className="mt-9 text-[30px] font-semibold leading-[38px] tracking-[-0.025em] text-[#080d10]">Verify your email</h1>
          <p className="mx-auto mt-3 max-w-[380px] text-[17px] leading-6 text-[#242e33]">
            We sent a link to your email. Please click it to verify your account.
          </p>
        </div>

        <div className="mx-auto mt-11 w-full max-w-[478px]">
          <Button className="h-[64px] w-full rounded-lg bg-[#00758d] text-[17px] font-semibold text-white shadow-[0_10px_22px_rgba(0,100,124,0.16)] transition hover:bg-[#00647c]">
            Resend Verification Email
          </Button>
          <div className="mt-5 flex h-12 items-center justify-center gap-2 rounded-lg border border-[#d3dde2] bg-[#e7edf1] text-[17px] text-[#161f24]">
            <CheckCircle2 className="h-5 w-5 text-[#00647c]" />
            Verification link resent.
          </div>
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
