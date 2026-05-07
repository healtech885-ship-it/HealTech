"use client";

import type * as React from "react";
import { Switch as HeroUISwitch } from "@heroui/react/switch";
import { cn } from "@/lib/utils";

export type SwitchChangeEvent = {
  target: { checked: boolean; name?: string };
  currentTarget: { checked: boolean; name?: string };
};

type SwitchProps = {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: SwitchChangeEvent) => void;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export function Switch({
  className,
  children,
  name,
  checked,
  defaultChecked,
  onChange,
  onCheckedChange,
  disabled,
  ...props
}: SwitchProps) {
  function handleChange(nextChecked: boolean) {
    onCheckedChange?.(nextChecked);
    onChange?.({
      target: { checked: nextChecked, name },
      currentTarget: { checked: nextChecked, name },
    });
  }

  return (
    <HeroUISwitch
      {...props}
      name={name}
      isSelected={checked}
      defaultSelected={defaultChecked}
      onChange={handleChange}
      isDisabled={disabled}
      className={cn("group inline-flex items-center gap-3 text-sm font-medium text-[#41546b]", className)}
    >
      <HeroUISwitch.Control className="bg-[#d7e1e7] group-data-[focus-visible=true]:ring-3 group-data-[focus-visible=true]:ring-[#00758d]/15 group-data-[selected=true]:bg-[#00758d]" />
      <HeroUISwitch.Thumb />
      {children ? <HeroUISwitch.Content>{children}</HeroUISwitch.Content> : null}
    </HeroUISwitch>
  );
}
