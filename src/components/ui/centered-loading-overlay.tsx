import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CenteredLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  submessage?: string;
  className?: string;
  spinnerClassName?: string;
  variant?: "overlay" | "inline";
}

/**
 * Reusable centered loading indicator / overlay component.
 * Provides clear, centered visual feedback during async operations (e.g. link verification).
 */
export function CenteredLoadingOverlay({
  isLoading,
  message = "Memverifikasi tautan...",
  submessage,
  className,
  spinnerClassName,
  variant = "overlay",
}: CenteredLoadingOverlayProps) {
  if (!isLoading) return null;

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 py-2 px-3 rounded-lg bg-muted/60 border border-border/60 text-xs text-muted-foreground animate-in fade-in duration-200",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2
          className={cn(
            "size-4 animate-spin text-primary shrink-0",
            spinnerClassName,
          )}
        />
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{message}</span>
          {submessage && (
            <span className="text-[11px] text-muted-foreground">
              {submessage}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/95 border border-border shadow-md max-w-xs text-center mx-4">
        <Loader2
          className={cn(
            "size-6 animate-spin text-primary",
            spinnerClassName,
          )}
        />
        <p className="text-xs font-medium text-foreground">{message}</p>
        {submessage && (
          <p className="text-[11px] text-muted-foreground leading-normal">
            {submessage}
          </p>
        )}
      </div>
    </div>
  );
}

