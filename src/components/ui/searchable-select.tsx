"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronsUpDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  id?: string;
  icon?: React.ReactNode;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ada hasil.",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  id,
  icon,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearch("");
    }
  };

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchSub = opt.subLabel ? opt.subLabel.toLowerCase().includes(q) : false;
      const matchVal = opt.value.toLowerCase().includes(q);
      return matchLabel || matchSub || matchVal;
    });
  }, [options, search]);

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-full justify-between font-normal text-xs h-9 px-3 border-input bg-background hover:bg-muted/50 cursor-pointer select-none",
                !selectedOption && "text-muted-foreground",
                triggerClassName
              )}
            >
              <div className="flex items-center gap-2 truncate text-left">
                {icon && <span className="shrink-0">{icon}</span>}
                <span className="truncate">
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
                {selectedOption?.subLabel && (
                  <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                    ({selectedOption.subLabel})
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          }
        />
        <PopoverContent
          align="start"
          className={cn(
            "w-[300px] sm:w-[360px] p-2 space-y-2 z-[100] shadow-lg border border-border bg-popover rounded-md",
            contentClassName
          )}
        >
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-7 h-8 text-xs bg-muted/40 border-border/80 focus-visible:ring-1"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-xs cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options Scroll Area */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 overscroll-contain pr-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      onValueChange(opt.value);
                      handleOpenChange(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs text-left transition-colors cursor-pointer select-none",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-foreground",
                      opt.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.subLabel && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {opt.subLabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

