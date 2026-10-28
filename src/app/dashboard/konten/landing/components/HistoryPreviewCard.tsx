"use client";

import React from "react";
import Image from "next/image";
import { HistoryEvent } from "../types";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Eye } from "lucide-react";

interface HistoryPreviewCardProps {
  event: HistoryEvent;
}

export function HistoryPreviewCard({ event }: HistoryPreviewCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground px-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Eye className="w-3.5 h-3.5 text-primary" />
          Pratinjau Kartu Publik (Landing Page)
        </span>
        <Badge
          variant={event.status === "PUBLISHED" ? "default" : "secondary"}
          className={`text-[10px] rounded-full font-semibold px-2 py-0.2 ${
            event.status === "PUBLISHED"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          }`}
        >
          {event.status === "PUBLISHED" ? "Published" : "Draft"}
        </Badge>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden ring-1 ring-border bg-card group transition-all duration-300">
        {/* Gambar Latar dengan Overlay Gradien */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          
          {/* Badge Tahun */}
          <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-sm border border-border/70 text-xs font-mono font-bold tracking-wider text-foreground">
            {event.year}
          </div>
        </div>

        {/* Konten Kartu */}
        <div className="p-4 space-y-2 relative -mt-6">
          <h4 className="text-base font-bold text-foreground tracking-tight leading-snug">
            {event.title}
          </h4>
          <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed line-clamp-3 font-normal">
            {event.desc}
          </p>

          {(event.location || event.keyFigure) && (
            <div className="flex items-center gap-3 pt-2 text-[11px] text-muted-foreground border-t border-border/60">
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" />
                  {event.location}
                </span>
              )}
              {event.keyFigure && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-muted-foreground" />
                  {event.keyFigure}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
