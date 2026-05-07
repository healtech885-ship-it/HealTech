"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@heroui/react/rac";

export function Providers({ children }: { children: ReactNode }) {
  return <I18nProvider locale="en-US">{children}</I18nProvider>;
}
