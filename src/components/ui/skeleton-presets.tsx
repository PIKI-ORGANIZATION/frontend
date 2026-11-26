import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Preset skeleton yang dapat dipakai ulang di seluruh CMS & panel admin.
 * Semua preset memakai `Skeleton` (shimmer kiri → kanan) sebagai blok dasar.
 */

/** Jeda bertahap agar sapuan cahaya antar item terasa mengalir. */
export function shimmerDelay(index: number, stepMs = 90): React.CSSProperties {
  return { ["--skeleton-shimmer-delay" as string]: `${index * stepMs}ms` };
}

/** Pembungkus: mengumumkan status "memuat" satu kali ke screen reader. */
export function SkeletonGroup({
  label = "Memuat data…",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={className}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Beberapa baris teks; baris terakhir lebih pendek. */
export function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  className,
  style,
}: {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("space-y-2", className)} style={style}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{
            width: i === lines - 1 && lines > 1 ? lastLineWidth : "100%",
          }}
        />
      ))}
    </div>
  );
}

/** Header halaman admin (judul, subjudul, tombol aksi, dan opsional tab strip). */
export function SkeletonPageHeader({
  showAction = true,
  showTabs = false,
  tabCount = 3,
  className,
}: {
  showAction?: boolean;
  showTabs?: boolean;
  tabCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" style={shimmerDelay(1)} />
        </div>
        {showAction && (
          <Skeleton
            className="h-9 w-36 shrink-0 rounded-md"
            style={shimmerDelay(2)}
          />
        )}
      </div>

      {showTabs && (
        <div className="inline-flex items-center gap-1.5 rounded-md  bg-muted/40 p-1">
          {Array.from({ length: tabCount }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 w-32 rounded-sm"
              style={shimmerDelay(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Kartu konten: baris badge, judul, teks, dan tombol aksi. */
export function SkeletonCard({
  badgeCount = 3,
  lines = 2,
  showActions = true,
  className,
  style,
}: {
  badgeCount?: number;
  lines?: number;
  showActions?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("rounded-lg  bg-card p-4 sm:p-5 space-y-3", className)}
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: badgeCount }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-16 rounded-full" />
          ))}
        </div>
        {showActions && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="size-7 rounded-md" />
            ))}
          </div>
        )}
      </div>
      <Skeleton className="h-5 w-3/4" />
      <SkeletonText lines={lines} />
      <Skeleton className="h-3.5 w-28" />
    </div>
  );
}

/** Daftar kartu dengan efek shimmer bertahap. */
export function SkeletonList({
  count = 4,
  label,
  className,
  cardProps,
}: {
  count?: number;
  label?: string;
  className?: string;
  cardProps?: React.ComponentProps<typeof SkeletonCard>;
}) {
  return (
    <SkeletonGroup label={label} className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} style={shimmerDelay(i)} {...cardProps} />
      ))}
    </SkeletonGroup>
  );
}

/** Deretan kartu statistik ringkas. */
export function SkeletonStatCards({
  count = 4,
  label,
  className,
}: {
  count?: number;
  label?: string;
  className?: string;
}) {
  return (
    <SkeletonGroup
      label={label}
      className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl  bg-card p-4 space-y-2">
          <Skeleton className="h-3 w-20" style={shimmerDelay(i)} />
          <Skeleton className="h-7 w-12" style={shimmerDelay(i)} />
        </div>
      ))}
    </SkeletonGroup>
  );
}

/** Baris tabel placeholder. Letakkan di dalam `<TableBody>`. */
export function SkeletonTableRows({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} aria-hidden="true" className="hover:bg-transparent">
          {Array.from({ length: columns }).map((__, c) => (
            <TableCell key={c} className="py-4 px-4">
              <Skeleton
                className={cn(
                  "h-4",
                  c === 0
                    ? "w-4/5"
                    : c === columns - 1
                      ? "ml-auto w-16"
                      : "w-2/3",
                )}
                style={shimmerDelay(r)}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/** Halaman penuh bertipe tabel (Header + opsional tab + toolbar + tabel shimmer). */
export function SkeletonTablePage({
  label = "Memuat halaman…",
  showAction = true,
  showTabs = false,
  tabCount = 3,
  rows = 6,
  columns = 5,
  className,
}: {
  label?: string;
  showAction?: boolean;
  showTabs?: boolean;
  tabCount?: number;
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <SkeletonGroup
      label={label}
      className={cn(
        "mx-auto max-w-7xl space-y-6 py-4 sm:py-6 lg:py-8",
        className,
      )}
    >
      <SkeletonPageHeader
        showAction={showAction}
        showTabs={showTabs}
        tabCount={tabCount}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-full sm:max-w-sm rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-md" style={shimmerDelay(1)} />
          <Skeleton className="h-9 w-28 rounded-md" style={shimmerDelay(2)} />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl  bg-card">
        <div className="grid grid-cols-5 gap-4 border-b border-border bg-muted/40 px-4 py-3.5">
          {Array.from({ length: Math.min(columns, 5) }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-24" style={shimmerDelay(i)} />
          ))}
        </div>
        <div className="divide-y divide-border/70">
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className="flex items-center justify-between gap-4 px-4 py-4"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" style={shimmerDelay(r)} />
                <Skeleton className="h-3 w-1/4" style={shimmerDelay(r)} />
              </div>
              <Skeleton
                className="hidden h-5 w-24 rounded-full sm:block"
                style={shimmerDelay(r)}
              />
              <Skeleton
                className="hidden h-5 w-20 rounded-full md:block"
                style={shimmerDelay(r)}
              />
              <Skeleton
                className="h-7 w-16 rounded-md"
                style={shimmerDelay(r)}
              />
            </div>
          ))}
        </div>
      </div>
    </SkeletonGroup>
  );
}

/** Grid kartu media (thumbnail 16:9 + badge + judul + metadata) untuk CMS Galeri. */
export function SkeletonMediaGrid({
  count = 8,
  label = "Memuat dokumentasi media…",
  className,
}: {
  count?: number;
  label?: string;
  className?: string;
}) {
  return (
    <SkeletonGroup
      label={label}
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl  bg-card">
          <Skeleton
            className="aspect-video w-full rounded-none"
            style={shimmerDelay(i)}
          />
          <div className="space-y-2.5 p-4">
            <div className="flex items-center gap-1.5">
              <Skeleton
                className="h-4 w-16 rounded-full"
                style={shimmerDelay(i)}
              />
              <Skeleton
                className="h-4 w-20 rounded-full"
                style={shimmerDelay(i)}
              />
            </div>
            <Skeleton className="h-4 w-4/5" style={shimmerDelay(i)} />
            <Skeleton className="h-3 w-3/5" style={shimmerDelay(i)} />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

/** Daftar artikel bertumpuk (badge + judul + ringkasan + tombol aksi) untuk CMS Berita. */
export function SkeletonArticleList({
  count = 5,
  label = "Memuat daftar berita…",
  className,
}: {
  count?: number;
  label?: string;
  className?: string;
}) {
  return (
    <SkeletonGroup
      label={label}
      className={cn(
        "overflow-hidden rounded-xl  bg-card divide-y divide-border",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton
                className="h-5 w-16 rounded-full"
                style={shimmerDelay(i)}
              />
              <Skeleton
                className="h-5 w-20 rounded-full"
                style={shimmerDelay(i)}
              />
              <Skeleton className="h-3.5 w-28" style={shimmerDelay(i)} />
            </div>
            <Skeleton className="h-5 w-3/4" style={shimmerDelay(i)} />
            <Skeleton className="h-3.5 w-2/3" style={shimmerDelay(i)} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-8 w-20 rounded-md" style={shimmerDelay(i)} />
            <Skeleton className="h-8 w-20 rounded-md" style={shimmerDelay(i)} />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

/** Daftar baris linimasa dengan thumbnail kotak (untuk CMS Sejarah / Landing). */
export function SkeletonTimelineList({
  rows = 4,
  label = "Memuat linimasa…",
  className,
}: {
  rows?: number;
  label?: string;
  className?: string;
}) {
  return (
    <SkeletonGroup
      label={label}
      className={cn("divide-y divide-border/60", className)}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 px-4 py-4 md:px-5"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Skeleton
              className="size-12 shrink-0 rounded-sm"
              style={shimmerDelay(i)}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton
                  className="h-4 w-14 rounded"
                  style={shimmerDelay(i)}
                />
                <Skeleton
                  className="h-4 w-20 rounded-full"
                  style={shimmerDelay(i)}
                />
              </div>
              <Skeleton className="h-4 w-3/5" style={shimmerDelay(i)} />
              <Skeleton className="h-3 w-4/5" style={shimmerDelay(i)} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Skeleton className="size-7 rounded-md" style={shimmerDelay(i)} />
            <Skeleton className="size-7 rounded-md" style={shimmerDelay(i)} />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

/** Form 2 kolom (kiri: form pengaturan, kanan: kartu live preview) untuk Tab Hero. */
export function SkeletonFormWithPreview({
  label = "Memuat pengaturan…",
}: {
  label?: string;
}) {
  return (
    <SkeletonGroup
      label={label}
      className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
    >
      <div className="space-y-5 lg:col-span-7">
        <div className="space-y-4 rounded-lg  bg-card p-5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-9 w-full rounded-md" style={shimmerDelay(1)} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton
              className="h-9 w-full rounded-md"
              style={shimmerDelay(2)}
            />
            <Skeleton
              className="h-9 w-full rounded-md"
              style={shimmerDelay(2)}
            />
          </div>
          <Skeleton
            className="h-24 w-full rounded-md"
            style={shimmerDelay(3)}
          />
        </div>
      </div>
      <div className="space-y-3 rounded-xl  bg-card p-6 lg:col-span-5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-8 w-3/4" style={shimmerDelay(1)} />
        <SkeletonText lines={3} style={shimmerDelay(2)} />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-28 rounded-sm" style={shimmerDelay(3)} />
          <Skeleton className="h-8 w-24 rounded-sm" style={shimmerDelay(3)} />
        </div>
      </div>
    </SkeletonGroup>
  );
}

/** Form multi-kartu (untuk Tab Tentang & Visi-Misi). */
export function SkeletonFormSections({
  sections = 3,
  label = "Memuat formulir…",
}: {
  sections?: number;
  label?: string;
}) {
  return (
    <SkeletonGroup label={label} className="max-w-4xl space-y-5">
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-lg  bg-card p-5">
          <Skeleton className="h-5 w-52" style={shimmerDelay(i)} />
          <Skeleton className="h-9 w-full rounded-md" style={shimmerDelay(i)} />
          <Skeleton
            className="h-20 w-full rounded-md"
            style={shimmerDelay(i)}
          />
        </div>
      ))}
    </SkeletonGroup>
  );
}
