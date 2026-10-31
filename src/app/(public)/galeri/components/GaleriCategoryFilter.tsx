"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryFilter } from "../data/galeriData";

interface GaleriCategoryFilterProps {
  categories: readonly string[];
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
}

export function GaleriCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: GaleriCategoryFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full sm:w-[260px] justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate text-xs sm:text-sm font-medium">
                {selectedCategory}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari kegiatan / acara..." />
          <CommandList>
            <CommandEmpty>Kegiatan tidak ditemukan.</CommandEmpty>
            <CommandGroup heading="Daftar Kegiatan PIKI">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <CommandItem
                    key={cat}
                    value={cat}
                    onSelect={() => {
                      onSelectCategory(cat as CategoryFilter);
                      setOpen(false);
                    }}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "opacity-100 text-primary" : "opacity-0",
                        )}
                      />
                      <span
                        className={cn(
                          "truncate text-xs sm:text-sm",
                          isSelected && "font-semibold text-primary",
                        )}
                      >
                        {cat}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

