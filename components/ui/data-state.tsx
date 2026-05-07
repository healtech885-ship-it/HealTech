"use client";

import type * as React from "react";
import { Alert as HeroUIAlert } from "@heroui/react/alert";
import { Spinner } from "@heroui/react/spinner";
import { AlertTriangle, CheckCircle2, Info, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackTone = "success" | "warning" | "danger" | "info" | "neutral";

const alertStatus: Record<Exclude<FeedbackTone, "neutral">, "success" | "warning" | "danger" | "accent"> = {
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "accent",
};

const alertClasses: Record<FeedbackTone, string> = {
  success: "border-[#a7dfb7] bg-[#edf8ef] text-[#087a35]",
  warning: "border-[#e6ca83] bg-[#fff7df] text-[#8a5a00]",
  danger: "border-[#f2aaa4] bg-[#fff1f0] text-[#b42318]",
  info: "border-[#acd8e4] bg-[#edf9fb] text-[#006d86]",
  neutral: "border-[#d4e0e8] bg-[#f8fbfd] text-[#41546b]",
};

export function LoadingState({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-32 items-center justify-center gap-3 text-sm font-medium text-[#607084]", className)}>
      <Spinner color="accent" size="sm" className="text-[#00758d]" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-dashed border-[#cbd8e2] bg-[#f8fbfd] p-8 text-center", className)}>
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f4f7] text-[#00758d]">
        <SearchX className="h-5 w-5" />
      </span>
      <p className="mt-3 font-semibold text-[#17212f]">{title}</p>
      <p className="mt-1 text-sm text-[#607084]">{description}</p>
    </div>
  );
}

export function FeedbackAlert({
  tone = "info",
  title,
  message,
  className,
}: {
  tone?: FeedbackTone;
  title?: string;
  message: string;
  className?: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" || tone === "neutral" ? Info : AlertTriangle;
  const status = tone === "neutral" ? "default" : alertStatus[tone];

  return (
    <HeroUIAlert status={status} className={cn("rounded-xl border px-3 py-3 shadow-none", alertClasses[tone], className)}>
      <HeroUIAlert.Indicator className="mt-0.5">
        <Icon className="h-4 w-4" />
      </HeroUIAlert.Indicator>
      <HeroUIAlert.Content>
        {title ? <HeroUIAlert.Title className="text-sm font-semibold">{title}</HeroUIAlert.Title> : null}
        <HeroUIAlert.Description className="text-sm">{message}</HeroUIAlert.Description>
      </HeroUIAlert.Content>
    </HeroUIAlert>
  );
}
