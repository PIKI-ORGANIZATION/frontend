"use client";

import { useState } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { FaqApiItem } from "@/features/faq/types";
import { getFaqViewStatus } from "@/features/faq/utils";
import { cn } from "@/lib/utils";
import { FaqKategoriBadge, FaqPublishBadge, FaqStatusBadge } from "./FaqBadges";
import { FaqRowActions } from "./FaqRowActions";
import { FaqRowHandlers, FaqRowPermissions } from "./faq-view.types";

interface FaqCardProps {
  item: FaqApiItem;
  cabangLabel?: string;
  canWrite: boolean;
  permissions: FaqRowPermissions;
  handlers: FaqRowHandlers;
}

/** Compact expandable FAQ card: pertanyaan, preview/detail jawaban, metadata, dan menu ⋮. */
export function FaqCard({
  item,
  cabangLabel,
  canWrite,
  permissions,
  handlers,
}: FaqCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isArchived = getFaqViewStatus(item) === "ARCHIVED";

  return (
    <article
      className={cn(
        "group rounded-lg border border-border/70 bg-card/75 px-4 py-4 transition-colors hover:border-border hover:bg-card",
        expanded && "border-border bg-card",
        isArchived && "opacity-70",
      )}
    >
      {/* Baris atas: judul expandable (heading + trigger) dan menu ⋮ */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground sm:text-[16px]">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
            className="flex w-full cursor-pointer items-start gap-2 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronRight
              className={cn(
                "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
                expanded && "rotate-90 text-primary",
              )}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">{item.pertanyaan}</span>
          </button>
        </h3>

        <FaqRowActions
          item={item}
          canWrite={canWrite}
          permissions={permissions}
          handlers={handlers}
        />
      </div>

      {/* Preview ringkas 1 baris saat tertutup */}
      {!expanded && (
        <p className="mt-1 line-clamp-1 pl-6 pr-8 text-[14px] leading-relaxed text-muted-foreground">
          {item.jawaban}
        </p>
      )}

      {/* Detail jawaban lengkap dengan transisi intrinsic-size */}
      <div
        className="faq-expand-body pl-6 pr-8"
        data-open={expanded ? "true" : "false"}
        aria-hidden={!expanded}
      >
        <div className="mt-2 border-t border-border/60 pt-2.5">
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-foreground/90">
            {item.jawaban}
          </p>
        </div>
      </div>

      {/* Footer metadata ringkas: kategori, wilayah, status, publikasi */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-6">
        <FaqKategoriBadge item={item} />

        {cabangLabel && (
          <span className="inline-flex h-5 items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 text-[11px] text-muted-foreground">
            <MapPin className="size-3 shrink-0 opacity-75" aria-hidden="true" />
            <span className="max-w-40 truncate">{cabangLabel}</span>
          </span>
        )}

        <FaqStatusBadge item={item} />
        <FaqPublishBadge item={item} />

        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground/75">
          #{item.urutan}
        </span>
      </div>
    </article>
  );
}
