import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-[0.5rem] px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--on-primary-fixed-variant)]",
        secondary: "border border-[var(--outline-variant)] bg-white text-[var(--on-surface)] hover:bg-[var(--surface-container-low)]",
        ghost: "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]",
        destructive: "bg-[var(--error)] text-[var(--on-error)] hover:bg-[var(--on-error-container)]",
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

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
