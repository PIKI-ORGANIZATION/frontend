"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Modal, ModalContent, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface SearchMenuItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  isUnderDevelopment?: boolean;
  icon?: React.ElementType;
  group: string;
}

export interface ModalSearchMenuProps {
  setIsSearchOpen:
    | React.Dispatch<React.SetStateAction<boolean>>
    | ((open: boolean) => void);
  setSearchQuery?:
    | React.Dispatch<React.SetStateAction<string>>
    | ((query: string) => void);
  searchQuery?: string;
  filteredSearchItems: SearchMenuItem[];
  open?: boolean;
  className?: string;
}

export default function ModalSearchMenu({
  setIsSearchOpen,
  setSearchQuery,
  searchQuery = "",
  filteredSearchItems,
  open = true,
  className,
}: ModalSearchMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState(searchQuery);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (setSearchQuery) {
      setSearchQuery(val);
    }
  };

  const handleClose = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (item: SearchMenuItem) => {
    handleClose();
    if (item.isUnderDevelopment || !item.url) {
      toast.info(`Modul ${item.title} sedang dalam tahap pengembangan`, {
        description:
          "Fitur ini akan segera tersedia pada pembaruan sistem berikutnya.",
      });
      return;
    }
    router.push(item.url);
  };

  // Group items by category (group)
  const groupedItems = useMemo(() => {
    const groups: Record<string, SearchMenuItem[]> = {};
    filteredSearchItems.forEach((item) => {
      const g = item.group || "Menu Navigasi";
      if (!groups[g]) {
        groups[g] = [];
      }
      groups[g].push(item);
    });
    return groups;
  }, [filteredSearchItems]);

  return (
    <Modal open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <ModalContent
        showCloseButton={false}
        className={cn(
          // Posisi di bagian atas (top 10-12vh) dan posisi horizontal 100% center
          "fixed top-[10vh] sm:top-[12vh] left-1/2 -translate-x-1/2 translate-y-0",
          // Lebar modal: responsif dan leluasa (override sm:max-w-lg bawaan dialog)
          "w-[calc(100vw-2rem)] sm:w-full sm:max-w-2xl md:max-w-3xl",
          // Styling kontainer modal
          "p-0 rounded-xl overflow-hidden shadow-2xl  bg-popover ring-1 ring-border/50",
          className,
        )}
      >
        <ModalTitle className="sr-only">Pencarian Menu & Modul</ModalTitle>
        <Command className="bg-popover rounded-none border-0">
          {/* Header Input Pencarian */}
          <div className="flex items-center px-4 py-3.5 border-b border-border/80 bg-muted/20">
            <SearchIcon className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
            <CommandPrimitive.Input
              value={query}
              onValueChange={handleQueryChange}
              placeholder="Ketikkan nama modul, menu, atau fitur..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
            />
            {query ? (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors mr-1 cursor-pointer"
                title="Bersihkan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-background border border-border/80 rounded select-none">
              ESC
            </kbd>
          </div>

          {/* Daftar Hasil Pencarian */}
          <CommandList className="max-h-[380px] overflow-y-auto px-2 py-2">
            <CommandEmpty className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
              <SearchIcon className="text-muted-foreground mb-2 size-6 opacity-30" />
              <p className="text-muted-foreground mb-1 text-xs">
                Tidak ada perintah yang sesuai untuk &ldquo;{query}&rdquo;
              </p>
              <Button
                onClick={() => handleQueryChange("")}
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
              >
                Bersihkan pencarian
              </Button>
            </CommandEmpty>

            {Object.entries(groupedItems).map(([groupName, items]) => (
              <CommandGroup key={groupName} heading={groupName}>
                {items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <CommandItem
                      key={item.id}
                      className="flex cursor-pointer items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/70 transition-colors group"
                      value={`${item.title} ${item.description || ""} ${item.group}`}
                      onSelect={() => handleSelect(item)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {ItemIcon && (
                          <div className="size-7 rounded-md bg-muted/60 flex items-center justify-center shrink-0 border border-border/40 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                            <ItemIcon className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-muted-foreground text-xs truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-muted-foreground text-[10px] px-2 py-0.5 rounded-full bg-muted/80 font-mono shrink-0 border border-border/40">
                        {item.group}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>

          {/* Footer Bar Petunjuk Pintas */}
          <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-background border border-border/80 text-[10px] font-mono">
                  ↑
                </kbd>
                <kbd className="px-1 py-0.5 rounded bg-background border border-border/80 text-[10px] font-mono">
                  ↓
                </kbd>
                <span className="hidden sm:inline">Navigasi</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border/80 text-[10px] font-mono">
                  ↵
                </kbd>
                <span className="hidden sm:inline">Pilih</span>
              </span>
            </div>
            <span>{filteredSearchItems.length} menu tersedia</span>
          </div>
        </Command>
      </ModalContent>
    </Modal>
  );
}
