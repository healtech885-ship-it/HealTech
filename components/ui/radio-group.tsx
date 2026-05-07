"use client";

import type * as React from "react";
import { Radio as HeroUIRadio } from "@heroui/react/radio";
import { RadioGroup as HeroUIRadioGroup } from "@heroui/react/radio-group";
import { cn } from "@/lib/utils";

export type RadioOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type RadioGroupChangeEvent = {
  target: { value: string; name?: string };
  currentTarget: { value: string; name?: string };
};

type RadioGroupProps = {
  id?: string;
  className?: string;
  "aria-label"?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: RadioGroupChangeEvent) => void;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  options: RadioOption[];
  orientation?: "horizontal" | "vertical";
};

export function RadioGroup({
  className,
  name,
  value,
  defaultValue,
  onChange,
  onValueChange,
  required,
  disabled,
  options,
  orientation = "vertical",
  ...props
}: RadioGroupProps) {
  function handleChange(nextValue: string) {
    onValueChange?.(nextValue);
    onChange?.({
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name },
    });
  }

  return (
    <HeroUIRadioGroup
      {...props}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      isRequired={required}
      isDisabled={disabled}
      orientation={orientation}
      className={cn(orientation === "horizontal" ? "flex flex-wrap gap-3" : "grid gap-2", className)}
    >
      {options.map((option) => (
        <HeroUIRadio
          key={option.value}
          value={option.value}
          isDisabled={option.disabled}
          className="group flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-medium text-[var(--on-surface-variant)] outline-none transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] data-[focus-visible=true]:ring-3 data-[focus-visible=true]:ring-[var(--focus-ring)] data-[selected=true]:border-[var(--primary)] data-[selected=true]:bg-[var(--secondary-container)] data-[selected=true]:text-[var(--primary)]"
        >
          <HeroUIRadio.Control className="border-[var(--border)] bg-[var(--surface-elevated)] group-data-[selected=true]:border-[var(--primary)] group-data-[selected=true]:bg-[var(--primary)]" />
          <HeroUIRadio.Indicator />
          <HeroUIRadio.Content>{option.label}</HeroUIRadio.Content>
        </HeroUIRadio>
      ))}
    </HeroUIRadioGroup>
  );
}
