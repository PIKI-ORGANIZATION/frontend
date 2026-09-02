"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    const stringifiedArgs = args
      .map((arg) => (arg instanceof Error ? arg.message : String(arg)))
      .join(" ");
    
    if (
      stringifiedArgs.includes("Encountered a script tag") ||
      stringifiedArgs.includes("bis_skin_checked") ||
      stringifiedArgs.includes("A tree hydrated but some attributes")
    ) {
      return;
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
