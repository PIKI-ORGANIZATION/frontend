"use client";

import { EyeOff, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FaqApiItem, FAQ_KATEGORI_LABELS } from "@/features/faq/types";
import { cn } from "@/lib/utils";

/** Badge kategori netral (selaras dengan badge wilayah). */
export function FaqKategoriBadge({ item }: { item: FaqApiItem }) {
  return (
    <Badge
      variant="outline"
      className="h-5 rounded-md border-border/60 bg-muted/40 px-2 text-[11px] font-medium text-muted-foreground"
    >
      {FAQ_KATEGORI_LABELS[item.kategori] ?? item.kategori}
    </Badge>
  );
}

/** Badge status record (Aktif / Arsip). */
export function FaqStatusBadge({ item }: { item: FaqApiItem }) {
  const isActive = item.statusFAQ === "ACTIVE";
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 gap-1.5 rounded-md px-2 text-[11px] font-medium",
        isActive
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-border bg-muted/60 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-muted-foreground",
        )}
        aria-hidden="true"
      />
      {isActive ? "Aktif" : "Arsip"}
    </Badge>
  );
}

/** Badge status publikasi (Publik / Draft). */
export function FaqPublishBadge({ item }: { item: FaqApiItem }) {
  const isPublished = item.statusFAQ === "ACTIVE" && item.isPublish;
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 gap-1 rounded-md px-2 text-[11px] font-medium",
        isPublished
          ? "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300"
          : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      )}
    >
      {isPublished ? (
        <Globe className="size-3 shrink-0" aria-hidden="true" />
      ) : (
        <EyeOff className="size-3 shrink-0" aria-hidden="true" />
      )}
      {isPublished ? "Publik" : "Draft"}
    </Badge>
  );
}
