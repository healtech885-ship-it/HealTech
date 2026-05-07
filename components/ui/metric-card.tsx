import type * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/app.types";

export type MetricTone = StatusTone | "accent";

const iconToneClasses: Record<MetricTone, string> = {
  neutral: "bg-[var(--surface-muted)] text-[var(--on-surface-variant)]",
  info: "bg-[var(--info-container)] text-[var(--info)]",
  success: "bg-[var(--success-container)] text-[var(--success)]",
  warning: "bg-[var(--warning-container)] text-[var(--warning)]",
  danger: "bg-[var(--danger-container)] text-[var(--danger)]",
  accent: "bg-[var(--secondary-container)] text-[var(--primary)]",
};

export type MetricCardProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: MetricTone;
  trend?: React.ReactNode;
  loading?: boolean;
  className?: string;
};

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
  trend,
  loading = false,
  className,
}: MetricCardProps) {
  const badgeTone: StatusTone = tone === "accent" ? "info" : tone;

  return (
    <Card className={className}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--on-surface-variant)]">{label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-24 rounded-lg bg-[var(--surface-muted)]" aria-label="Loading metric" />
          ) : (
            <p className="mt-2 table-numeric text-3xl font-bold tracking-normal text-[var(--on-surface)]">{value}</p>
          )}
          {helper ? <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{helper}</p> : null}
          {trend ? (
            <div className="mt-3">
              <Badge tone={badgeTone}>{trend}</Badge>
            </div>
          ) : null}
        </div>
        {Icon ? (
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconToneClasses[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
