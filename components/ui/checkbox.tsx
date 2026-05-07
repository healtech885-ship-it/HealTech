"use client";

import type * as React from "react";
import { Checkbox as HeroUICheckbox } from "@heroui/react/checkbox";
import { cn } from "@/lib/utils";

export type CheckboxChangeEvent = {
  target: { checked: boolean; value?: string; name?: string };
  currentTarget: { checked: boolean; value?: string; name?: string };
};

type CheckboxProps = {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: CheckboxChangeEvent) => void;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
};

export function Checkbox({
  className,
  children,
  name,
  value,
  checked,
  defaultChecked,
  onChange,
  onCheckedChange,
  disabled,
  required,
  ...props
}: CheckboxProps) {
  function handleChange(nextChecked: boolean) {
    onCheckedChange?.(nextChecked);
    onChange?.({
      target: { checked: nextChecked, value, name },
      currentTarget: { checked: nextChecked, value, name },
    });
  }

  return (
    <HeroUICheckbox
      {...props}
      name={name}
      value={value}
      isSelected={checked}
      defaultSelected={defaultChecked}
      onChange={handleChange}
      isDisabled={disabled}
      isRequired={required}
      className={cn("group flex items-center gap-2 text-sm font-medium text-[var(--on-surface-variant)] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-[var(--muted)]", className)}
    >
      <HeroUICheckbox.Control className="border border-[var(--field-border)] bg-[var(--field-background)] shadow-sm group-data-[disabled=true]:bg-[var(--surface-muted)] group-data-[focus-visible=true]:ring-3 group-data-[focus-visible=true]:ring-[var(--focus-ring)] group-data-[selected=true]:border-[var(--primary)] group-data-[selected=true]:bg-[var(--primary)]" />
      <HeroUICheckbox.Indicator className="text-[var(--primary-foreground)]" />
      {children ? <HeroUICheckbox.Content>{children}</HeroUICheckbox.Content> : null}
    </HeroUICheckbox>
  );
}
