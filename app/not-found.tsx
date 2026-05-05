import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef4f7] px-6 py-12 font-[Manrope,Inter,sans-serif] text-[#081014]">
      <section className="w-full max-w-[560px] translate-y-[52px] text-center">
        <div className="relative mx-auto h-[74px] w-[74px] text-[#00647c]" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-[31px] w-[82px] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] rounded-lg bg-[#00647c]" />
          <div className="absolute left-1/2 top-1/2 h-[31px] w-[82px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-lg border-[4px] border-[#00647c] bg-[#eef4f7]" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eef4f7]" />
          <div className="absolute left-[30px] top-[29px] h-2 w-2 rounded-full bg-[#00647c]" />
          <div className="absolute left-[38px] top-[37px] h-2 w-2 rounded-full bg-[#00647c]" />
        </div>
        <h1 className="mt-12 text-[40px] font-bold leading-[48px] tracking-[-0.04em] text-[#080d10]">404 - Page Not Found</h1>
        <p className="mx-auto mt-4 max-w-[500px] text-[22px] leading-[31px] text-[#2f3a40]">
          We could not find the page you are looking for. It might have been moved or no longer exists in the system.
        </p>
        <Link href="/">
          <Button className="mt-10 h-11 w-[200px] rounded-lg bg-[#00758d] px-8 text-[17px] font-semibold text-white shadow-none transition hover:bg-[#00647c]">
            <Home className="h-5 w-5" />
            Return Home
          </Button>
        </Link>
        <div className="mt-[60px] border-t border-[#d9e1e4] pt-11">
          <Link href="/" className="text-[17px] font-medium text-[#00758d] transition hover:text-[#004e61]">
            HealTech
          </Link>
        </div>
      </section>
    </main>
  );
}
