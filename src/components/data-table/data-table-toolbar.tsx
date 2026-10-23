"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode;
  isFiltered?: boolean;
  onResetFilters?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Cari data...",
  searchValue,
  onSearchChange,
  children,
  isFiltered,
  onResetFilters,
}: DataTableToolbarProps<TData>) {
  const hasFilter = isFiltered ?? (searchValue && searchValue.length > 0);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2">
      <div className="flex flex-1 flex-wrap items-center gap-2 w-full sm:w-auto">
        {onSearchChange !== undefined ? (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 w-full sm:w-[220px] lg:w-[280px]"
          />
        ) : null}

        {children}

        {hasFilter && onResetFilters && (
          <Button
            variant="ghost"
            onClick={onResetFilters}
            className="h-9 px-2 lg:px-3 text-xs sm:text-sm text-muted-foreground hover:text-foreground"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
