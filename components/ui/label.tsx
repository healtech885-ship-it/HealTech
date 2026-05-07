"use client";

import type * as React from "react";
import { Label as HeroUILabel } from "@heroui/react/label";
import { cn } from "@/lib/utils";

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <HeroUILabel {...props} className={cn("text-[13px] font-semibold leading-5 tracking-[0.01em] text-[var(--on-surface-variant)]", props.className)} />;
}
