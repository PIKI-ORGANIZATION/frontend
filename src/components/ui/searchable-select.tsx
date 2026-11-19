"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  subLabel?: string;
  searchKey?: string;
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
  emptyMessage = "Tidak ada hasil ditemukan.",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  id,
  icon,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
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
                "w-full justify-between h-10 px-3.5 text-sm font-normal border-input bg-background hover:bg-muted/40 cursor-pointer select-none rounded-md transition-colors",
                !selectedOption && "text-muted-foreground",
                triggerClassName
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                {icon && <span className="shrink-0">{icon}</span>}
                <span className="truncate">
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        <PopoverContent
          align="start"
          className={cn(
            "w-[var(--anchor-width,300px)] min-w-[260px] p-0 z-[100] shadow-md border border-border bg-popover rounded-md overflow-hidden",
            contentClassName
          )}
        >
          <Command className="w-full">
            <CommandInput placeholder={searchPlaceholder} className="text-sm" />
            <CommandList className="max-h-60 overflow-y-auto">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = opt.value === value;
                  const searchTerms = [
                    opt.label,
                    opt.subLabel,
                    opt.searchKey,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <CommandItem
                      key={opt.value}
                      value={searchTerms}
                      disabled={opt.disabled}
                      onSelect={() => {
                        onValueChange(opt.value);
                        setOpen(false);
                      }}
                      className="cursor-pointer text-sm py-2.5 px-3 flex items-start gap-2.5"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0 text-primary transition-opacity",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate font-medium text-foreground">
                          {opt.label}
                        </span>
                        {opt.subLabel && (
                          <span className="text-xs text-muted-foreground truncate mt-0.5">
                            {opt.subLabel}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
