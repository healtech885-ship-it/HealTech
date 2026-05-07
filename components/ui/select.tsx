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
          "h-11 w-full rounded-lg border border-[var(--field-border)] bg-[var(--field-background)] px-3 text-[15px] text-[var(--field-foreground)] shadow-sm outline-none transition-colors hover:border-[var(--border-strong)] data-[focus-visible=true]:border-[var(--focus)] data-[focus-visible=true]:ring-3 data-[focus-visible=true]:ring-[var(--focus-ring)] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-[var(--surface-muted)] data-[disabled=true]:text-[var(--muted)]",
          triggerClassName,
        )}
      >
        <HeroUISelect.Value className="truncate data-[placeholder=true]:text-[var(--field-placeholder)]" />
        <HeroUISelect.Indicator className="text-[var(--on-surface-variant)]" />
      </HeroUISelect.Trigger>
      <HeroUISelect.Popover className={cn("rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-1 shadow-lg", popoverClassName)}>
        <ListBox>
          {renderedOptions.map((option) => (
            <ListBox.Item
              key={option.value}
              id={option.value}
              textValue={option.label}
              isDisabled={option.disabled}
              className="min-h-10 rounded-lg px-3 py-2 text-sm text-[var(--on-surface)] outline-none hover:bg-[var(--surface-muted)] data-[disabled=true]:text-[var(--muted)] data-[focused=true]:bg-[var(--surface-muted)] data-[selected=true]:bg-[var(--secondary-container)] data-[selected=true]:font-semibold data-[selected=true]:text-[var(--primary)]"
            >
              {option.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </HeroUISelect.Popover>
    </HeroUISelect>
  );
}
