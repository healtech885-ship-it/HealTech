import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function titleCase(value: string) {
  return value
    .replace(/[-_/]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}
