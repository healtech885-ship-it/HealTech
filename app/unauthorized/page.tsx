import Link from "next/link";
import { Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef4f7] px-6 py-12 font-[Manrope,Inter,sans-serif] text-[#081014]">
      <section className="w-full max-w-[560px] translate-y-[52px] text-center">
        <div className="mx-auto flex h-[74px] w-[74px] items-center justify-center text-[#00647c]">
          <ShieldAlert className="h-[74px] w-[74px] stroke-[2.2]" />
        </div>
        <h1 className="mt-12 text-[40px] font-bold leading-[48px] tracking-[-0.04em] text-[#080d10]">403 - Access Denied</h1>
        <p className="mx-auto mt-4 max-w-[500px] text-[22px] leading-[31px] text-[#2f3a40]">
          Your account does not have permission to view this workspace. Contact an administrator if you need access.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard">
            <Button className="h-11 w-[200px] rounded-lg bg-[#00758d] px-8 text-[17px] font-semibold text-white shadow-none transition hover:bg-[#00647c]">
              <Home className="h-5 w-5" />
              My Dashboard
            </Button>
          </Link>
          <Link href="/login" className="text-[16px] font-semibold text-[#00758d] transition hover:text-[#004e61]">
            Return to Login
          </Link>
        </div>
        <div className="mt-[60px] border-t border-[#d9e1e4] pt-11">
          <Link href="/" className="text-[17px] font-medium text-[#00758d] transition hover:text-[#004e61]">
            HealTech
          </Link>
        </div>
      </section>
    </main>
  );
}
