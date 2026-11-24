import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  /**
   * `true` (default): efek shimmer kiri → kanan (lihat `.skeleton-shimmer` di globals.css).
   * `false`: kembali ke animasi pulse sederhana.
   */
  shimmer?: boolean
}

/**
 * Blok placeholder dasar untuk keadaan loading.
 * Dekoratif: disembunyikan dari screen reader. Bungkus kumpulan skeleton dengan
 * `SkeletonGroup` (skeleton-presets.tsx) agar status "memuat" diumumkan sekali.
 */
function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "rounded-md bg-muted",
        shimmer ? "skeleton-shimmer" : "animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
export type { SkeletonProps }
