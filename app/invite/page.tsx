import { BriefcaseMedical, HeartPulse, Mail } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function InvitePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef4f7] px-6 py-12 font-[Manrope,Inter,sans-serif] text-[#081014]">
      <section className="grid h-[817px] w-full max-w-[1120px] translate-y-10 overflow-hidden rounded-xl border border-[#d0d9de] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:grid-cols-[545px_1fr]">
        <aside className="relative hidden overflow-hidden bg-[#006f87] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(202,242,246,0.95),rgba(95,184,194,0.72)_31%,rgba(0,100,124,0.93)_86%)]" />
          <div className="absolute left-[-70px] top-0 h-full w-[210px] skew-x-[11deg] border-r border-white/20 bg-black/18" />
          <div className="absolute right-[-70px] top-0 h-full w-[210px] -skew-x-[11deg] border-l border-white/18 bg-black/18" />
          <div className="absolute left-[95px] top-[95px] h-[210px] w-[245px] skew-x-[-17deg] border border-white/14 bg-white/8" />
          <div className="absolute right-[95px] top-[95px] h-[210px] w-[245px] skew-x-[17deg] border border-white/14 bg-white/8" />
          <div className="absolute inset-x-[170px] top-0 h-[190px] border-x border-white/18 bg-white/10" />
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(0,78,97,0.84))]" />
          <div className="absolute bottom-[68px] left-[31px] text-white">
            <div className="flex items-center gap-4">
              <BriefcaseMedical className="h-10 w-10 stroke-[2.4]" />
              <p className="text-[31px] font-semibold tracking-[-0.02em]">HealTech</p>
            </div>
            <p className="mt-4 text-[22px] leading-7">Clinic operations software.</p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-[464px]">
            <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.04em] text-[#080d10]">
              Welcome to HealTech
            </h1>
            <p className="mt-3 max-w-[420px] text-[17px] leading-6 text-[#242e33]">
              Please complete your account setup to access the clinical portal.
            </p>

            <div className="mt-8 rounded-lg border border-[#b9c8d0] bg-[#f4f9fc] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#d3edf4] text-[#00647c]">
                  <Mail className="h-7 w-7 stroke-[2.4]" />
                </div>
                <div>
                  <p className="text-[17px] font-medium leading-6 tracking-[0.04em] text-[#172025]">Invited Email</p>
                  <p className="text-[20px] leading-7 text-[#080d10]">dr.smith@healtech.local</p>
                </div>
              </div>
              <div className="my-6 h-px bg-[#aebbc2]" />
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[15px] leading-5 text-[#242e33]">Role</p>
                  <p className="mt-2 flex items-center gap-2 text-[17px] leading-6 text-[#161f24]">
                    <BriefcaseMedical className="h-4 w-4" />
                    Senior Physician
                  </p>
                </div>
                <div>
                  <p className="text-[15px] leading-5 text-[#242e33]">Department</p>
                  <p className="mt-2 flex items-center gap-2 text-[17px] leading-6 text-[#161f24]">
                    <HeartPulse className="h-4 w-4" />
                    Cardiology
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <ResetPasswordForm
                submitLabel="Activate Account"
                passwordLabel="Set Password"
                confirmLabel="Confirm Password"
                showStrength={false}
                showArrow
              />
            </div>

            <div className="mt-8 border-t border-[#d9e1e4] pt-5 text-center text-[15px] leading-5 text-[#64717a]">
              Secure connection. HealTech account setup.
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
