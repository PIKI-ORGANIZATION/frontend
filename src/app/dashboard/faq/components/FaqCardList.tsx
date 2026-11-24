"use client";

import { SkeletonList } from "@/components/ui/skeleton-presets";
import { FaqCard } from "./FaqCard";
import { FaqEmptyState } from "./FaqEmptyState";
import { FaqListViewProps, resolveCabangLabel } from "./faq-view.types";

/** Daftar compact FAQ card (skeleton shimmer → kosong → daftar kartu expandable). */
export function FaqCardList({
  items,
  isLoading,
  hasActiveFilters,
  onResetFilters,
  cabangNameMap,
  canWriteItem,
  permissions,
  handlers,
}: FaqListViewProps) {
  if (isLoading) {
    return (
      <SkeletonList
        count={5}
        label="Memuat daftar FAQ…"
        className="space-y-2.5"
        cardProps={{ badgeCount: 4, lines: 1, showActions: false }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <FaqEmptyState
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <div className="space-y-4 mt-2 md:mt-4 lg:mt-6">
      {items.map((item) => (
        <FaqCard
          key={item.uuid}
          item={item}
          cabangLabel={resolveCabangLabel(item, cabangNameMap)}
          canWrite={canWriteItem(item)}
          permissions={permissions}
          handlers={handlers}
        />
      ))}
    </div>
  );
}
