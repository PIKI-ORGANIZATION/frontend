"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-10 w-50" />;

  return (
    <div className="px-24">
      <div className="w-fit inline-flex items-center p-0.5 bg-muted/50 rounded-lg border border-border/50 backdrop-blur-sm">
        <button
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-300 cursor-pointer  ${
            theme === "light"
              ? "bg-background text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className="h-3 w-3" strokeWidth={2.5} />
          Light
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-300 cursor-pointer  ${
            theme === "dark"
              ? "bg-background text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className="h-3 w-3" strokeWidth={2.5} />
          Dark
        </button>

        <button
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-300 cursor-pointer  ${
            theme === "system"
              ? "bg-background text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Monitor className="h-3 w-3" strokeWidth={2.5} />
          System
        </button>
      </div>
    </div>
  );
}
