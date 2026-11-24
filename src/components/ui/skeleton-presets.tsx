import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * Preset skeleton yang dapat dipakai ulang di seluruh CMS.
 * Semua preset memakai `Skeleton` (shimmer) sebagai blok dasar.
 */

/** Jeda bertahap agar sapuan cahaya antar item terasa mengalir. */
export function shimmerDelay(index: number, stepMs = 90): React.CSSProperties {
  return { ["--skeleton-shimmer-delay" as string]: `${index * stepMs}ms` }
}

/** Pembungkus: mengumumkan status "memuat" satu kali ke screen reader. */
export function SkeletonGroup({
  label = "Memuat data…",
  className,
  children,
}: {
  label?: string
  className?: string
  children: React.ReactNode
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
  )
}

/** Beberapa baris teks; baris terakhir lebih pendek. */
export function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  className,
  style,
}: {
  lines?: number
  lastLineWidth?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={cn("space-y-2", className)} style={style}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: i === lines - 1 && lines > 1 ? lastLineWidth : "100%" }}
        />
      ))}
    </div>
  )
}

/** Kartu konten: baris badge, judul, teks, dan tombol aksi. */
export function SkeletonCard({
  badgeCount = 3,
  lines = 2,
  showActions = true,
  className,
  style,
}: {
  badgeCount?: number
  lines?: number
  showActions?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3",
        className
      )}
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
  )
}

/** Daftar kartu dengan efek shimmer bertahap. */
export function SkeletonList({
  count = 4,
  label,
  className,
  cardProps,
}: {
  count?: number
  label?: string
  className?: string
  cardProps?: React.ComponentProps<typeof SkeletonCard>
}) {
  return (
    <SkeletonGroup label={label} className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} style={shimmerDelay(i)} {...cardProps} />
      ))}
    </SkeletonGroup>
  )
}

/** Deretan kartu statistik ringkas. */
export function SkeletonStatCards({
  count = 4,
  label,
  className,
}: {
  count?: number
  label?: string
  className?: string
}) {
  return (
    <SkeletonGroup
      label={label}
      className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4 space-y-2"
        >
          <Skeleton className="h-3 w-20" style={shimmerDelay(i)} />
          <Skeleton className="h-7 w-12" style={shimmerDelay(i)} />
        </div>
      ))}
    </SkeletonGroup>
  )
}

/** Baris tabel placeholder. Letakkan di dalam `<TableBody>`. */
export function SkeletonTableRows({
  rows = 5,
  columns = 4,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} aria-hidden="true" className="hover:bg-transparent">
          {Array.from({ length: columns }).map((__, c) => (
            <TableCell key={c} className="py-4">
              <Skeleton
                className={cn("h-4", c === 0 ? "w-4/5" : "w-2/3")}
                style={shimmerDelay(r)}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
