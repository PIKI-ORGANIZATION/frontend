"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FAQ_KATEGORI_OPTIONS, FaqKategori } from "@/features/faq/types";
import { FaqViewStatus } from "@/features/faq/utils";

interface FaqFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedKategori: FaqKategori | "ALL";
  kategoriCounts: Record<FaqKategori, number>;
  onKategoriChange: (value: FaqKategori | "ALL") => void;
  status: FaqViewStatus;
  onStatusChange: (value: FaqViewStatus) => void;
  /** Filter wilayah (khusus Superadmin DPP). */
  canSelectCabang: boolean;
  cabangValue: string;
  onCabangChange: (value: string) => void;
  cabangOptions: { uuid: string; namaCabang: string }[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

/** Bar pencarian dan filter ringkas (Kategori, Wilayah, Status). */
export function FaqFilterBar({
  search,
  onSearchChange,
  selectedKategori,
  kategoriCounts,
  onKategoriChange,
  status,
  onStatusChange,
  canSelectCabang,
  cabangValue,
  onCabangChange,
  cabangOptions,
  hasActiveFilters,
  onResetFilters,
}: FaqFilterBarProps) {
  const cabangSelectOptions = useMemo(
    () => [
      { value: "ALL", label: "Semua Wilayah" },
      ...cabangOptions.map((c) => ({
        value: c.uuid,
        label: c.namaCabang,
      })),
    ],
    [cabangOptions],
  );

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <SearchInput
          placeholder="Cari pertanyaan atau jawaban..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange("")}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="sm:w-44">
          <Select
            value={selectedKategori}
            onValueChange={(val) => {
              if (val) onKategoriChange(val as FaqKategori | "ALL");
            }}
          >
            <SelectTrigger aria-label="Filter kategori FAQ" className="w-full">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {FAQ_KATEGORI_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} ({kategoriCounts[opt.value]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canSelectCabang && (
          <div className="sm:w-52">
            <SearchableSelect
              value={cabangValue}
              onValueChange={onCabangChange}
              options={cabangSelectOptions}
              placeholder="Semua Wilayah"
              searchPlaceholder="Cari wilayah / cabang..."
              emptyMessage="Wilayah tidak ditemukan."
              triggerClassName="h-9 rounded-sm px-3 dark:bg-input/30 dark:hover:bg-input/50"
            />
          </div>
        )}

        <div className="col-span-2 sm:col-span-1 sm:w-40">
          <Select
            value={status}
            onValueChange={(val) => val && onStatusChange(val as FaqViewStatus)}
          >
            <SelectTrigger aria-label="Filter status FAQ" className="w-full">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PUBLISHED">Aktif</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Arsip</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="col-span-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground sm:col-span-1"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
