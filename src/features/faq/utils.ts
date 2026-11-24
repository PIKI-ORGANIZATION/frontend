import { FaqApiItem, FaqKategori } from "./types";

/** Status tampilan CMS (turunan dari `statusFAQ` + `isPublish`). */
export type FaqViewStatus = "ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED";
export type FaqSortKey = "urutan" | "terbaru" | "abjad";
export type FaqViewMode = "card" | "list";

export const FAQ_SORT_OPTIONS: { value: FaqSortKey; label: string }[] = [
  { value: "urutan", label: "Urutan tampil" },
  { value: "terbaru", label: "Terbaru diubah" },
  { value: "abjad", label: "Abjad (A–Z)" },
];

/** Warna badge per kategori (terang & gelap). Label teks tetap ditampilkan. */
export const FAQ_KATEGORI_BADGE_CLASS: Record<FaqKategori, string> = {
  UMUM: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  KEANGGOTAAN:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PROGRAM:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  ORGANISASI:
    "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

export const FAQ_STATUS_META: Record<
  Exclude<FaqViewStatus, "ALL">,
  { label: string; badgeClass: string }
> = {
  PUBLISHED: {
    label: "Tayang",
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  DRAFT: {
    label: "Draf",
    badgeClass:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  ARCHIVED: {
    label: "Nonaktif",
    badgeClass: "border-border bg-muted text-muted-foreground",
  },
};

export function getFaqViewStatus(
  item: Pick<FaqApiItem, "statusFAQ" | "isPublish">,
): Exclude<FaqViewStatus, "ALL"> {
  if (item.statusFAQ === "ARCHIVED") return "ARCHIVED";
  return item.isPublish ? "PUBLISHED" : "DRAFT";
}

export interface FaqStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export function computeFaqStats(items: FaqApiItem[]): FaqStats {
  const stats: FaqStats = { total: items.length, published: 0, draft: 0, archived: 0 };
  for (const item of items) {
    const status = getFaqViewStatus(item);
    if (status === "PUBLISHED") stats.published++;
    else if (status === "DRAFT") stats.draft++;
    else stats.archived++;
  }
  return stats;
}

export function countByKategori(items: FaqApiItem[]): Record<FaqKategori, number> {
  const counts: Record<FaqKategori, number> = {
    UMUM: 0,
    KEANGGOTAAN: 0,
    PROGRAM: 0,
    ORGANISASI: 0,
  };
  for (const item of items) {
    if (item.kategori in counts) counts[item.kategori]++;
  }
  return counts;
}

export interface FaqFilterCriteria {
  search: string;
  kategori: FaqKategori[];
  status: FaqViewStatus;
}

export function filterFaqs(
  items: FaqApiItem[],
  { search, kategori, status }: FaqFilterCriteria,
): FaqApiItem[] {
  const q = search.trim().toLowerCase();
  return items.filter((item) => {
    if (kategori.length > 0 && !kategori.includes(item.kategori)) return false;
    if (status !== "ALL" && getFaqViewStatus(item) !== status) return false;
    if (q) {
      return (
        item.pertanyaan.toLowerCase().includes(q) ||
        item.jawaban.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

export function sortFaqs(items: FaqApiItem[], key: FaqSortKey): FaqApiItem[] {
  const sorted = [...items];
  switch (key) {
    case "terbaru":
      return sorted.sort((a, b) =>
        (b.update_at ?? b.insert_at ?? "").localeCompare(
          a.update_at ?? a.insert_at ?? "",
        ),
      );
    case "abjad":
      return sorted.sort((a, b) =>
        a.pertanyaan.localeCompare(b.pertanyaan, "id"),
      );
    default:
      return sorted.sort((a, b) => a.urutan - b.urutan);
  }
}
