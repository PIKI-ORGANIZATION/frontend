"use client";

import React, { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import FaqAccordion, {
  FaqItem,
} from "@/components/ui/cue-split-panel-image-synced-faq-features";
import { usePublicFaq } from "@/features/faq/hooks/useFaq";
import { FAQ_KATEGORI_OPTIONS, FaqKategori } from "@/features/faq/types";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicFaqPage() {
  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<FaqKategori | "ALL">(
    "ALL",
  );
  const debouncedSearch = useDebounce(search, 350);

  const { items, isLoading } = usePublicFaq({
    kategori: selectedKategori,
    search: debouncedSearch,
    pageSize: 100,
  });

  const accordionItems: FaqItem[] = useMemo(
    () =>
      items.map((faq) => ({
        id: faq.uuid,
        question: faq.pertanyaan,
        answer: faq.jawaban,
      })),
    [items],
  );

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-8">
        <PageHeader
          eyebrow="Pusat Bantuan"
          title="Pertanyaan Umum (FAQ)"
          description="Informasi seputar pendaftaran anggota, KTA Digital, struktur organisasi, dan program PIKI."
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedKategori("ALL")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                selectedKategori === "ALL"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground",
              )}
            >
              Semua
            </button>
            {FAQ_KATEGORI_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedKategori(opt.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                  selectedKategori === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <SearchInput
              placeholder="Cari pertanyaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-7 animate-spin text-primary" />
          </div>
        ) : accordionItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-14 text-center space-y-2">
            <HelpCircle className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-medium text-foreground">
              Tidak ada FAQ ditemukan
            </p>
            <p className="text-xs text-muted-foreground">
              Coba ubah kata kunci pencarian atau pilih kategori lain.
            </p>
          </div>
        ) : (
          <FaqAccordion eyebrow="" items={accordionItems} defaultOpen={0} />
        )}
      </div>
    </main>
  );
}
