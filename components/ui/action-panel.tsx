import type * as React from "react";
import { SectionCard } from "@/components/ui/section-card";

type ActionPanelTone = "default" | "info" | "warning" | "danger" | "success";

export type ActionPanelProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: ActionPanelTone;
  className?: string;
};

export function ActionPanel({
  title,
  description,
  children,
  footer,
  tone = "default",
  className,
}: ActionPanelProps) {
  return (
    <SectionCard
      title={title}
      description={description}
      tone={tone === "default" ? "default" : tone}
      className={className}
      contentClassName="space-y-4"
    >
      <div>{children}</div>
      {footer ? <div className="border-t border-[var(--border)] pt-4">{footer}</div> : null}
    </SectionCard>
  );
}
