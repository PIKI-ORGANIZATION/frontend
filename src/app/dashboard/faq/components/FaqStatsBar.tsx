"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonGroup, shimmerDelay } from "@/components/ui/skeleton-presets";
import { FaqStats, FaqViewStatus } from "@/features/faq/utils";
import { cn } from "@/lib/utils";

interface FaqStatsBarProps {
  stats: FaqStats;
  activeStatus: FaqViewStatus;
  onSelectStatus: (status: FaqViewStatus) => void;
  isLoading: boolean;
}

/** Mini stats ringkas: Total, Aktif, dan Draft (sekaligus filter cepat). */
export function FaqStatsBar({
  stats,
  activeStatus,
  onSelectStatus,
  isLoading,
}: FaqStatsBarProps) {
  if (isLoading) {
    return (
      <SkeletonGroup
        label="Memuat ringkasan FAQ…"
        className="flex flex-wrap items-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            className="h-9 w-28 rounded-lg"
            style={shimmerDelay(i)}
          />
        ))}
      </SkeletonGroup>
    );
  }

  const items: {
    status: FaqViewStatus;
    label: string;
    value: number;
    dot: string;
  }[] = [
    { status: "ALL", label: "Total", value: stats.total, dot: "bg-primary" },
    {
      status: "PUBLISHED",
      label: "Aktif",
      value: stats.published,
      dot: "bg-emerald-500",
    },
    {
      status: "DRAFT",
      label: "Draft",
      value: stats.draft,
      dot: "bg-amber-500",
    },
  ];

  return (
    <div
      role="group"
      aria-label="Ringkasan statistik FAQ"
      className="flex flex-wrap items-center gap-2"
    >
      {items.map((item) => {
        const isActive = activeStatus === item.status;
        return (
          <button
            key={item.status}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectStatus(isActive ? "ALL" : item.status)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              isActive
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border/70 bg-card/70 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
            )}
          >
            <span
              className={cn("size-1.5 rounded-full shrink-0", item.dot)}
              aria-hidden="true"
            />
            <span className="font-medium">{item.label}</span>
            <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
              {item.value}
            </span>
          </button>
        );
      })}
    </div>
  );
}
