import { Chip as HeroUIChip } from "@heroui/react/chip";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/app.types";

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-[#d4e0e8] bg-[#f4f8fb] text-[#52677a]",
  info: "border-[#acd8e4] bg-[#edf9fb] text-[#006d86]",
  success: "border-[#a7dfb7] bg-[#edf8ef] text-[#087a35]",
  warning: "border-[#e6ca83] bg-[#fff7df] text-[#8a5a00]",
  danger: "border-[#f2aaa4] bg-[#fff1f0] text-[#b42318]",
};

export function badgeTone(status: string): StatusTone {
  const normalized = status.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  if (["completed", "approved", "dispensed", "reviewed", "active", "in_stock", "fulfilled", "available"].includes(normalized)) return "success";
  if (["queued", "ordered", "in_progress", "pending", "pending_review", "partially_dispensed", "waiting_lab", "waiting_pharmacy", "entered", "high", "on_leave", "waiting", "follow_up_req"].includes(normalized)) return "warning";
  if (["urgent", "expired", "cancelled", "canceled", "rejected", "out_of_stock", "unavailable", "inactive", "suspended", "terminated", "failed", "error", "critical", "delayed"].includes(normalized)) return "danger";
  if (["lab_completed", "submitted", "low", "visible", "yes", "checked_in"].includes(normalized)) return "info";
  return "neutral";
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <HeroUIChip
      variant="soft"
      size="sm"
      className={cn("inline-flex h-7 rounded-full border px-2.5 text-xs font-semibold shadow-none", toneClasses[tone], className)}
    >
      <HeroUIChip.Label>{children}</HeroUIChip.Label>
    </HeroUIChip>
  );
}
