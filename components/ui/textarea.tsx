import type * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-[var(--on-surface)] shadow-[inset_0_1px_1px_rgba(0,0,0,0.03)] outline-none transition focus:border-primary focus:ring-3 focus:ring-blue-100",
        props.className,
      )}
    />
  );
}
