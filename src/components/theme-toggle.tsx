"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeToggleProps {
  variant?: "default" | "dropdown";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return <div className="h-10 w-10" />;

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border/50 bg-muted/50 rounded-lg"
            />
          }
        >
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="cursor-pointer"
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="cursor-pointer"
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="cursor-pointer"
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

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
