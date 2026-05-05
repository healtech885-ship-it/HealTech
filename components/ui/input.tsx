import type * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-[0.5rem] border border-[var(--outline-variant)] bg-white px-3 text-sm text-[var(--on-surface)] shadow-none outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15",
        props.className,
      )}
    />
  );
}
