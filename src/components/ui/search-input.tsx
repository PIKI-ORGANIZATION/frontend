"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  onClear?: () => void;
  wrapperClassName?: string;
  size?: "default" | "sm" | "lg";
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      wrapperClassName,
      placeholder = "Cari...",
      value,
      onChange,
      onClear,
      size = "default",
      disabled,
      ...props
    },
    ref,
  ) => {
    const isSm = size === "sm";
    const isLg = size === "lg";

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (onClear) {
        onClear();
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div
        className={cn(
          "group relative flex items-center w-full rounded-sm border border-input bg-transparent dark:bg-input/30 transition-colors",
          "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
          disabled && "opacity-50 pointer-events-none bg-input/50",
          isSm && "h-8 px-2.5 text-xs",
          isLg && "h-11 px-4 text-base",
          !isSm && !isLg && "h-9 px-3 text-sm",
          wrapperClassName,
        )}
      >
        <Search
          className={cn(
            "shrink-0 text-muted-foreground pointer-events-none select-none",
            isSm ? "size-3.5 mr-2" : "size-4 mr-2.5",
          )}
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none min-w-0 leading-normal",
            isSm ? "text-xs" : "text-sm",
            className,
          )}
          {...props}
        />
        {Boolean(value) && (
          <button
            type="button"
            onClick={handleClear}
            tabIndex={-1}
            title="Hapus pencarian"
            className="shrink-0 p-0.5 rounded-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className={cn(isSm ? "size-3" : "size-3.5")} />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

