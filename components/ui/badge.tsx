import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/app.types";

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]",
  info: "bg-[var(--primary-fixed)]/10 text-[var(--primary)] border-[var(--primary-fixed-dim)]/30",
  success: "bg-[var(--success-container)] text-[var(--success)] border-[#a7dfb7]",
  warning: "bg-[var(--warning-container)] text-[var(--tertiary)] border-[var(--tertiary-fixed-dim)]/40",
  danger: "bg-[var(--error-container)] text-[var(--error)] border-[#f2aaa4]",
};

export function badgeTone(status: string): StatusTone {
  if (["completed", "approved", "dispensed", "reviewed", "active", "in_stock"].includes(status)) return "success";
  if (["queued", "ordered", "in_progress", "pending", "pending_review", "partially_dispensed", "waiting_lab", "waiting_pharmacy"].includes(status)) return "warning";
  if (["urgent", "expired", "cancelled", "rejected", "out_of_stock", "unavailable"].includes(status)) return "danger";
  if (["lab_completed", "submitted", "entered"].includes(status)) return "info";
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
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", toneClasses[tone], className)}>
      {children}
    </span>
  );
}
