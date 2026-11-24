"use client";

import { useCallback, useMemo, useState } from "react";
import { FaqApiItem, FaqKategori } from "../types";
import {
  FaqSortKey,
  FaqViewMode,
  FaqViewStatus,
  computeFaqStats,
  countByKategori,
  filterFaqs,
  sortFaqs,
} from "../utils";

/**
 * State & turunan filter CMS FAQ (semua dihitung di sisi klien dari data
 * yang sudah dimuat, sehingga statistik selalu akurat terhadap seluruh FAQ).
 */
export function useFaqFilters(items: FaqApiItem[]) {
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState<FaqKategori[]>([]);
  const [status, setStatus] = useState<FaqViewStatus>("ALL");
  const [sort, setSort] = useState<FaqSortKey>("urutan");
  const [view, setView] = useState<FaqViewMode>("card");

  const toggleKategori = useCallback((value: FaqKategori) => {
    setKategori((prev) =>
      prev.includes(value) ? prev.filter((k) => k !== value) : [...prev, value],
    );
  }, []);

  const clearKategori = useCallback(() => setKategori([]), []);

  const reset = useCallback(() => {
    setSearch("");
    setKategori([]);
    setStatus("ALL");
    setSort("urutan");
  }, []);

  const stats = useMemo(() => computeFaqStats(items), [items]);
  const kategoriCounts = useMemo(() => countByKategori(items), [items]);

  const visibleItems = useMemo(
    () => sortFaqs(filterFaqs(items, { search, kategori, status }), sort),
    [items, search, kategori, status, sort],
  );

  const hasActiveFilters =
    search.trim() !== "" || kategori.length > 0 || status !== "ALL";

  return {
    search,
    setSearch,
    kategori,
    toggleKategori,
    clearKategori,
    status,
    setStatus,
    sort,
    setSort,
    view,
    setView,
    reset,
    stats,
    kategoriCounts,
    visibleItems,
    hasActiveFilters,
  };
}
