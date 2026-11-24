"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Keadaan kosong: bedakan "belum ada data" dan "filter tidak cocok". */
export function FaqEmptyState({
  hasActiveFilters,
  onResetFilters,
}: {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <HelpCircle className="size-9 text-muted-foreground/40" aria-hidden="true" />
      <p className="text-sm font-semibold text-foreground">
        {hasActiveFilters ? "Tidak ada FAQ yang cocok" : "Belum ada FAQ"}
      </p>
      <p className="max-w-sm text-xs text-muted-foreground">
        {hasActiveFilters
          ? "Coba ubah kata kunci, kategori, atau status yang sedang dipilih."
          : "Klik tombol Tambah FAQ untuk membuat pertanyaan pertama."}
      </p>
      {hasActiveFilters && (
        <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>
          Reset filter
        </Button>
      )}
    </div>
  );
}
