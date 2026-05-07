"use client";

import type { Key } from "react";
import type * as React from "react";
import { Select as HeroUISelect } from "@heroui/react/select";
import { ListBox } from "@heroui/react/list-box";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectOptionInput = SelectOption | string;

export type SelectChangeEvent = {
  target: { value: string; name?: string };
  currentTarget: { value: string; name?: string };
};

type SelectProps = {
  id?: string;
  className?: string;
  "aria-label"?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: SelectChangeEvent) => void;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options: SelectOptionInput[];
  allowEmptyOption?: boolean;
  triggerClassName?: string;
  popoverClassName?: string;
};

export function Select({
  className,
  triggerClassName,
  popoverClassName,
  name,
  value,
  defaultValue,
  onChange,
  onValueChange,
  required,
  disabled,
  placeholder = "Select an option",
  options,
  allowEmptyOption = false,
  ...props
}: SelectProps) {
  const normalizedOptions = options.map((option) => (
    typeof option === "string" ? { value: option, label: option } : option
  ));
  const hasEmptyOption = normalizedOptions.some((option) => option.value === "");
  const shouldRenderEmptyOption = allowEmptyOption && Boolean(placeholder) && !hasEmptyOption;
  const selectedKey = value !== undefined ? (value === "" && !shouldRenderEmptyOption ? null : value) : undefined;
  const defaultSelectedKey = value === undefined ? (defaultValue === "" && !shouldRenderEmptyOption ? null : defaultValue) : undefined;
  const renderedOptions = shouldRenderEmptyOption ? [{ value: "", label: placeholder }, ...normalizedOptions] : normalizedOptions;

  function handleSelectionChange(key: Key | null) {
    const nextValue = key === null ? "" : String(key);
    onValueChange?.(nextValue);
    onChange?.({
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name },
    });
  }

  return (
    <HeroUISelect
      {...props}
      id={props.id}
      name={name}
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={handleSelectionChange}
      isRequired={required}
      isDisabled={disabled}
      placeholder={placeholder}
      fullWidth
      className={cn("w-full", className)}
    >
      <HeroUISelect.Trigger
        className={cn(
          "h-11 w-full rounded-lg border border-[#cbd8e2] bg-[#fbfdff] px-3 text-[15px] text-[var(--on-surface)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.03)] outline-none transition-colors hover:border-[#a9bdca] data-[focus-visible=true]:border-[#00758d] data-[focus-visible=true]:ring-3 data-[focus-visible=true]:ring-[#00758d]/15 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-[#eef3f7] data-[disabled=true]:text-[#748394]",
          triggerClassName,
        )}
      >
        <HeroUISelect.Value className="truncate data-[placeholder=true]:text-[#8797a6]" />
        <HeroUISelect.Indicator className="text-[#65788a]" />
      </HeroUISelect.Trigger>
      <HeroUISelect.Popover className={cn("rounded-xl border border-[#cbd8e2] bg-white p-1 shadow-[0_18px_40px_rgba(15,23,42,0.16)]", popoverClassName)}>
        <ListBox>
          {renderedOptions.map((option) => (
            <ListBox.Item
              key={option.value}
              id={option.value}
              textValue={option.label}
              isDisabled={option.disabled}
              className="min-h-10 rounded-lg px-3 py-2 text-sm text-[#17212f] outline-none hover:bg-[#f0f7fa] data-[focused=true]:bg-[#f0f7fa] data-[selected=true]:bg-[#e5f4f7] data-[selected=true]:font-semibold data-[selected=true]:text-[#006d86]"
            >
              {option.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </HeroUISelect.Popover>
    </HeroUISelect>
  );
}
