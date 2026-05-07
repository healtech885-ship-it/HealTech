import Link from "next/link";
import type * as React from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  metadata?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  metadata,
  backHref,
  backLabel = "Back",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)}>
      <div className="min-w-0 space-y-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--primary-container)] focus:outline-none focus:ring-3 focus:ring-[var(--focus-ring)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{backLabel}</span>
          </Link>
        ) : null}
        {eyebrow ? (
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            {eyebrow}
          </div>
        ) : null}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold leading-tight tracking-normal text-[var(--on-surface)] md:text-[34px]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-[var(--on-surface-variant)] md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {metadata ? <div className="flex flex-wrap items-center gap-2 pt-1">{metadata}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">{actions}</div> : null}
    </header>
  );
}
