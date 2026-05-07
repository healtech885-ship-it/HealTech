"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Button as HeroUIButton } from "@heroui/react/button";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-3 focus:ring-blue-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-[#003f82]",
        secondary: "border border-border bg-white text-[var(--on-surface)] hover:bg-muted",
        ghost: "text-[var(--on-surface-variant)] hover:bg-muted",
        destructive: "bg-destructive text-white hover:bg-[#93000a]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-11 px-5",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

const heroButtonVariants = {
  primary: "primary",
  secondary: "outline",
  ghost: "ghost",
  destructive: "danger",
} as const;

type HeroUIButtonProps = React.ComponentPropsWithoutRef<typeof HeroUIButton>;

export type ButtonProps = Omit<HeroUIButtonProps, "className" | "isDisabled" | "isIconOnly" | "size" | "variant"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    disabled?: boolean;
  };

export function Button({ className, disabled, variant, size, ...props }: ButtonProps) {
  const resolvedVariant = variant ?? "primary";
  const resolvedSize = size ?? "md";

  return (
    <HeroUIButton
      className={cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
      isDisabled={disabled}
      isIconOnly={resolvedSize === "icon"}
      size={resolvedSize === "icon" ? "md" : resolvedSize}
      variant={heroButtonVariants[resolvedVariant]}
      {...props}
    />
  );
}
