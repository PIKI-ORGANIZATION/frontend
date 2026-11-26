"use client";

import React from "react";
import Image from "next/image";
import { HistoryEvent } from "../types";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Eye } from "lucide-react";
import { getSafeImageSrc } from "@/features/galeri/types";
import { cn } from "@/lib/utils";

interface HistoryPreviewCardProps {
  event: HistoryEvent;
}

export function HistoryPreviewCard({ event }: HistoryPreviewCardProps) {
  const statusBadge =
    event.status === "PUBLISHED"
      ? {
          label: "Tayang",
          className:
            "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        }
      : event.status === "ARCHIVED"
        ? {
            label: "Arsip",
            className: "border-border bg-muted text-muted-foreground",
          }
        : {
            label: "Draf",
            className:
              "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
          };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 font-medium">
          <Eye className="size-3.5 text-primary" aria-hidden="true" />
          Pratinjau Linimasa Publik
        </span>
        <Badge
          variant="outline"
          className={cn("h-5 rounded-full px-2 text-[10px] font-medium", statusBadge.className)}
        >
          {statusBadge.label}
        </Badge>
      </div>

      <article className="group overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        {/* Foto 16:10 bersih */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={getSafeImageSrc(event.image, "/footage/image1.webp")}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized={
              event.image.startsWith("data:") ||
              event.image.startsWith("blob:")
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Konten Teks selaras dengan HistorySection */}
        <div className="space-y-2.5 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-black leading-none tracking-tighter text-primary tabular-nums">
              {event.year}
            </span>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-border to-transparent"
            />
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              #{event.order}
            </span>
          </div>

          <h4 className="text-base font-bold leading-snug tracking-tight text-foreground">
            {event.title}
          </h4>

          <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground md:text-[13px]">
            {event.desc}
          </p>

          {(event.location || event.keyFigure) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
              {event.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3 shrink-0 text-primary" aria-hidden="true" />
                  <span className="truncate">{event.location}</span>
                </span>
              )}
              {event.keyFigure && (
                <span className="inline-flex items-center gap-1">
                  <User className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{event.keyFigure}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
