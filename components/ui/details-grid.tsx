import type * as React from "react";
import { cn } from "@/lib/utils";

export type DetailsGridItem = {
  label: React.ReactNode;
  value?: React.ReactNode;
  emptyFallback?: React.ReactNode;
  truncate?: boolean;
};

export type DetailsGridProps = {
  items: DetailsGridItem[];
  columns?: 1 | 2 | 3;
  emptyFallback?: React.ReactNode;
  className?: string;
};

const columnClasses: Record<NonNullable<DetailsGridProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};

export function DetailsGrid({ items, columns = 2, emptyFallback = "Not set", className }: DetailsGridProps) {
  return (
    <dl className={cn("grid gap-4", columnClasses[columns], className)}>
      {items.map((item, index) => {
        const hasValue = item.value !== null && item.value !== undefined && item.value !== "";
        const value = hasValue ? item.value : item.emptyFallback ?? emptyFallback;

        return (
          <div key={index} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">{item.label}</dt>
            <dd className={cn("mt-1 text-sm font-semibold text-[var(--on-surface)]", item.truncate ? "truncate" : "break-words")}>
              {value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
