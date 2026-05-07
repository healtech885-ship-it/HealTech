"use client";

import type * as React from "react";
import { Label as HeroUILabel } from "@heroui/react/label";
import { cn } from "@/lib/utils";

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <HeroUILabel {...props} className={cn("text-xs font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]", props.className)} />;
}
