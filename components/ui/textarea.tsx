import type * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full rounded-[0.5rem] border border-[var(--outline-variant)] bg-white px-3 py-2 text-sm text-[var(--on-surface)] shadow-none outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15",
        props.className,
      )}
    />
  );
}
