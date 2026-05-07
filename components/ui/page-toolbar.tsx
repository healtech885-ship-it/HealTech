import type * as React from "react";
import { cn } from "@/lib/utils";

export type PageToolbarProps = {
  search?: React.ReactNode;
  filters?: React.ReactNode;
  tabs?: React.ReactNode;
  actions?: React.ReactNode;
  summary?: React.ReactNode;
  className?: string;
};

export function PageToolbar({ search, filters, tabs, actions, summary, className }: PageToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {search ? <div className="min-w-0 flex-1">{search}</div> : null}
          {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">{actions}</div> : null}
      </div>
      {(tabs || summary) ? (
        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-3 sm:flex-row sm:items-center sm:justify-between">
          {tabs ? <div className="min-w-0 overflow-x-auto">{tabs}</div> : null}
          {summary ? <div className="text-sm font-medium text-[var(--on-surface-variant)]">{summary}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
