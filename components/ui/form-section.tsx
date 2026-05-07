import type * as React from "react";
import { cn } from "@/lib/utils";

export type FormSectionProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  requiredNote?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

const columnClasses: Record<NonNullable<FormSectionProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
};

export function FormSection({
  title,
  description,
  children,
  columns = 1,
  requiredNote,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || requiredNote) ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="text-lg font-semibold text-[var(--on-surface)]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-5 text-[var(--on-surface-variant)]">{description}</p> : null}
          </div>
          {requiredNote ? <p className="text-sm font-medium text-[var(--muted)]">{requiredNote}</p> : null}
        </div>
      ) : null}
      <div className={cn("grid gap-4", columnClasses[columns], contentClassName)}>{children}</div>
    </section>
  );
}
