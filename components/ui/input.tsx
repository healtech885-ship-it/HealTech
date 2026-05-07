"use client";

import type * as React from "react";
import { Input as HeroUIInput } from "@heroui/react/input";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <HeroUIInput
      {...props}
      fullWidth
      className={cn(
        "h-11 w-full rounded-lg border border-[#cbd8e2] bg-[#fbfdff] px-3 text-[15px] text-[var(--on-surface)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.03)] outline-none transition-colors placeholder:text-[#8797a6] hover:border-[#a9bdca] focus:border-[#00758d] focus:ring-3 focus:ring-[#00758d]/15 disabled:cursor-not-allowed disabled:bg-[#eef3f7] disabled:text-[#748394] disabled:opacity-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-[#eef3f7] data-[disabled=true]:text-[#748394] data-[focused=true]:border-[#00758d] data-[focused=true]:ring-3 data-[focused=true]:ring-[#00758d]/15 data-[invalid=true]:border-[#ba1a1a] data-[invalid=true]:ring-[#ba1a1a]/10",
        props.className,
      )}
    />
  );
}
