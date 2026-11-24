import { FaqApiItem } from "@/features/faq/types";

/** Hak aksi per-peran (diturunkan dari `resolveFaqCmsAccess`). */
export interface FaqRowPermissions {
  canUpdate: boolean;
  canCreate: boolean;
  canArchive: boolean;
}

/** Callback aksi per-baris yang dibagikan oleh tampilan kartu & tabel. */
export interface FaqRowHandlers {
  onPreview: (item: FaqApiItem) => void;
  onEdit: (item: FaqApiItem) => void;
  onTogglePublish: (item: FaqApiItem) => void;
  onDuplicate: (item: FaqApiItem) => void;
  onArchive: (item: FaqApiItem) => void;
  onRestore: (item: FaqApiItem) => void;
}

/** Props umum untuk tampilan daftar (kartu maupun tabel). */
export interface FaqListViewProps {
  items: FaqApiItem[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  cabangNameMap?: Record<string, string>;
  canWriteItem: (item: FaqApiItem) => boolean;
  permissions: FaqRowPermissions;
  handlers: FaqRowHandlers;
}

export function resolveCabangLabel(
  item: FaqApiItem,
  cabangNameMap?: Record<string, string>,
): string | undefined {
  if (!cabangNameMap) return undefined;
  return item.cabangUuid
    ? cabangNameMap[item.cabangUuid] || "Wilayah Cabang"
    : "Pusat (DPP)";
}
