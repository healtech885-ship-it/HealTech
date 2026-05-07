"use client";

import type * as React from "react";
import { TextArea as HeroUITextArea } from "@heroui/react/textarea";
import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <HeroUITextArea
      {...props}
      fullWidth
      className={cn(
        "min-h-28 w-full rounded-lg border border-[var(--field-border)] bg-[var(--field-background)] px-3 py-2.5 text-[15px] leading-6 text-[var(--field-foreground)] shadow-sm outline-none transition-colors placeholder:text-[var(--field-placeholder)] hover:border-[var(--border-strong)] focus:border-[var(--focus)] focus:ring-3 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--muted)] disabled:opacity-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-[var(--surface-muted)] data-[disabled=true]:text-[var(--muted)] data-[focused=true]:border-[var(--focus)] data-[focused=true]:ring-3 data-[focused=true]:ring-[var(--focus-ring)] data-[invalid=true]:border-[var(--danger)] data-[invalid=true]:ring-3 data-[invalid=true]:ring-[var(--danger-container)]",
        props.className,
      )}
    />
  );
}
