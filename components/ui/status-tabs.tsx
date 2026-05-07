"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

export type StatusTabOption = {
  value: string;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
};

export type StatusTabsProps = {
  options: StatusTabOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
};

export function StatusTabs({ options, value, onChange, ariaLabel = "Status filters", className }: StatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("inline-flex min-h-10 max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-1", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-current={selected ? "page" : undefined}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition focus:outline-none focus:ring-3 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
              selected
                ? "bg-[var(--surface-elevated)] text-[var(--primary)] shadow-sm"
                : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-elevated)] hover:text-[var(--on-surface)]",
            )}
          >
            <span>{option.label}</span>
            {typeof option.count === "number" ? (
              <span className={cn("table-numeric rounded-full px-2 py-0.5 text-xs", selected ? "bg-[var(--secondary-container)] text-[var(--primary)]" : "bg-[var(--surface-container)] text-[var(--muted)]")}>
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
