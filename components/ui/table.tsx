"use client";

import type * as React from "react";
import { Table as HeroUITable } from "@heroui/react/table";
import { cn } from "@/lib/utils";

export function TableFrame({
  children,
  className,
  scrollClassName,
}: {
  children: React.ReactNode;
  className?: string;
  scrollClassName?: string;
}) {
  return (
    <HeroUITable.Root
      variant="primary"
      className={cn("overflow-hidden rounded-xl border border-[#d4e0e8] bg-white shadow-sm", className)}
    >
      <HeroUITable.ScrollContainer className={cn("max-w-full overflow-auto overscroll-contain", scrollClassName)}>
        {children}
      </HeroUITable.ScrollContainer>
    </HeroUITable.Root>
  );
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("min-w-full border-collapse text-left text-sm", className)} {...props} />;
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-[#edf4f7] text-left text-xs font-semibold uppercase tracking-[0.04em] text-[#52677a]",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-[#e4edf2] bg-white", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("align-top transition-colors hover:bg-[#f7fbfd]", className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("whitespace-nowrap px-4 py-3", className)} {...props} />;
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-4 text-[#24364b]", className)} {...props} />;
}
