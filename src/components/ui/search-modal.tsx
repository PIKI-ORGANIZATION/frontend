"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { LucideIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CommandItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: LucideIcon;
  shortcut?: string;
  onSelect?: () => void;
};

export type SearchModalProps = {
  children?: React.ReactNode;
  data: CommandItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function SearchModal({
  children,
  data,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: SearchModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (isControlled) {
        controlledOnOpenChange?.(value);
      } else {
        setUncontrolledOpen(value);
      }
    },
    [isControlled, controlledOnOpenChange],
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  return (
    <Modal open={open} onOpenChange={setOpen}>
      {children && <ModalTrigger>{children}</ModalTrigger>}
      <ModalContent className="p-1 max-w-lg">
        <ModalTitle className="sr-only">Search</ModalTitle>
        <Command className="bg-background md:bg-card rounded-md md:border">
          <CommandInput
            className={cn(
              "placeholder:text-muted-foreground flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            )}
            placeholder="Search..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[380px] min-h-[300px] px-2 md:px-0">
            <CommandEmpty className="flex min-h-[240px] flex-col items-center justify-center p-6 text-center">
              <SearchIcon className="text-muted-foreground mb-2 size-6 opacity-40" />
              <p className="text-muted-foreground mb-1 text-xs">
                No commands found for &ldquo;{query}&rdquo;
              </p>
              <Button onClick={() => setQuery("")} variant="ghost" size="sm" className="mt-2 text-xs">
                Clear search
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {data.map((item, i) => {
                return (
                  <CommandItem
                    key={item.id || i}
                    className="flex cursor-pointer items-center gap-3 py-2 px-3 rounded-md hover:bg-muted"
                    value={`${item.title} ${item.description} ${item.category}`}
                    onSelect={() => {
                      setOpen(false);
                      item.onSelect?.();
                    }}
                  >
                    {item.icon && <item.icon className="size-4 text-muted-foreground shrink-0" />}
                    <div className="flex flex-col min-w-0">
                      <p className="max-w-[260px] sm:max-w-sm truncate text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-muted-foreground text-xs truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <p className="text-muted-foreground ml-auto text-[11px] px-2 py-0.5 rounded-full bg-muted/60 font-mono shrink-0">
                      {item.category}
                    </p>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </ModalContent>
    </Modal>
  );
}

export default SearchModal;
