import type * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionTone = "default" | "accent" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<SectionTone, string> = {
  default: "",
  accent: "border-[var(--accent)]",
  success: "border-[var(--success)]",
  warning: "border-[var(--warning)]",
  danger: "border-[var(--danger)]",
  info: "border-[var(--info)]",
};

export type SectionCardProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  tone?: SectionTone;
  compact?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  description,
  action,
  children,
  tone = "default",
  compact = false,
  className,
  headerClassName,
  contentClassName,
}: SectionCardProps) {
  const hasHeader = title || description || action;

  return (
    <Card className={cn(toneClasses[tone], className)}>
      {hasHeader ? (
        <CardHeader
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
            compact ? "px-4 py-3" : "px-6 py-5",
            headerClassName,
          )}
        >
          <div className="min-w-0">
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn(compact ? "p-4" : "p-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
