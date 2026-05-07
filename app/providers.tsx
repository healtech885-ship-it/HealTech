"use client";

import { I18nProvider } from "@heroui/react";
import type * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <I18nProvider locale="en-US">{children}</I18nProvider>;
}
