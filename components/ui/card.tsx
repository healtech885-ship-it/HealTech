"use client";

import type * as React from "react";
import {
  Card as HeroUICard,
  CardContent as HeroUICardContent,
  CardDescription as HeroUICardDescription,
  CardHeader as HeroUICardHeader,
  CardTitle as HeroUICardTitle,
} from "@heroui/react/card";
import { cn } from "@/lib/utils";

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <HeroUICard
      className={cn("clinical-card gap-0 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-0 text-[var(--on-surface)]", className)}
      render={(renderProps) => <section {...renderProps} />}
      {...props}
    >
      {children}
    </HeroUICard>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <HeroUICardHeader className={cn("gap-0 border-b border-[var(--border)] px-6 py-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <HeroUICardTitle
      className={cn("text-xl font-semibold leading-7 text-[var(--on-surface)]", className)}
      render={(renderProps) => <h2 {...renderProps} />}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <HeroUICardDescription className={cn("mt-1 text-sm leading-5 text-[var(--on-surface-variant)]", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <HeroUICardContent className={cn("block flex-none gap-0 p-6", className)} {...props} />;
}
