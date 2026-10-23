"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { X, CheckCircle, FileClock, Trash2 } from "lucide-react";
import { ArtikelBerita } from "../types";
import { BERITA_CATEGORIES, BERITA_STATUSES } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";

interface BeritaToolbarProps {
  table: Table<ArtikelBerita>;
  onBulkPublish?: (ids: string[]) => void;
  onBulkDraft?: (ids: string[]) => void;
  onBulkDelete?: (ids: string[]) => void;
}

export function BeritaToolbar({
  table,
  onBulkPublish,
  onBulkDraft,
  onBulkDelete,
}: BeritaToolbarProps) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter;

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r) => r.original.id);
  const hasSelection = selectedIds.length > 0;

  const categoryOptions = BERITA_CATEGORIES.map((cat) => ({
    label: cat.label,
    value: cat.value,
    icon: cat.icon,
  }));

  const statusOptions = BERITA_STATUSES.map((st) => ({
    label: st.label,
    value: st.value,
    icon: st.icon,
  }));

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Side: Search & Faceted Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Cari judul artikel..."
            value={
              (table.getColumn("judul")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("judul")?.setFilterValue(event.target.value)
            }
            className="h-9 w-full sm:w-[220px] lg:w-[280px] text-xs sm:text-sm bg-background border-border/80"
          />

          {table.getColumn("kategori") && (
            <DataTableFacetedFilter
              column={table.getColumn("kategori")}
              title="Kategori"
              options={categoryOptions}
            />
          )}

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statusOptions}
            />
          )}

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                table.setGlobalFilter("");
              }}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filter
              <X className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Right Side: Column View Options */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Floating Bulk Action Bar when rows are selected */}
      {hasSelection && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/60 border border-primary/20 rounded-lg text-xs animate-in fade-in-50 duration-150">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {selectedIds.length} artikel dipilih
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onBulkPublish && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkPublish(selectedIds)}
                className="h-7 px-2.5 text-xs gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <CheckCircle className="h-3 w-3" />
                Publikasikan
              </Button>
            )}

            {onBulkDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkDraft(selectedIds)}
                className="h-7 px-2.5 text-xs gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <FileClock className="h-3 w-3" />
                Jadikan Draft
              </Button>
            )}

            {onBulkDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkDelete(selectedIds)}
                className="h-7 px-2.5 text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
                Hapus Terpilih
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
