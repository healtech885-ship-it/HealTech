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
      className={cn("group flex items-center gap-2 text-sm font-medium text-[#41546b]", className)}
    >
      <HeroUICheckbox.Control className="border border-[#cbd8e2] bg-white shadow-[inset_0_1px_1px_rgba(15,23,42,0.03)] group-data-[focus-visible=true]:ring-3 group-data-[focus-visible=true]:ring-[#00758d]/15 group-data-[selected=true]:border-[#00758d] group-data-[selected=true]:bg-[#00758d]" />
      <HeroUICheckbox.Indicator />
      {children ? <HeroUICheckbox.Content>{children}</HeroUICheckbox.Content> : null}
    </HeroUICheckbox>
  );
}
