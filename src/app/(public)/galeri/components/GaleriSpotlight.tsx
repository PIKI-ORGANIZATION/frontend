"use client";

import {
  Play,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Check,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TiltedGridHero,
  type TiltedGridImage,
} from "@/components/ui/tilted-grid-hero";
import { SPOTLIGHT_HERO_IMAGES } from "../data/galeriData";
import type { MediaItem } from "../types";

interface GaleriSpotlightProps {
  item: MediaItem;
  images?: TiltedGridImage[];
  onSelect: (item: MediaItem) => void;
  onShare: (item: MediaItem, e?: React.MouseEvent) => void;
  hasCopied: boolean;
}

export function GaleriSpotlight({
  item,
  images = SPOTLIGHT_HERO_IMAGES,
  onSelect,
  onShare,
  hasCopied,
}: GaleriSpotlightProps) {
  return (
    <TiltedGridHero
      images={images}
      speed={7}
      tileHeight={28}
      aspectRatio={16 / 9}
      gap={6}
      axis={48}
      curve={75}
      fade={14}
      className="relative w-full h-145 sm:h-155 md:h-160 overflow-hidden mb-16 pb-8"
    >
      {/* Ambient Gradient & Vignette for Contrast & Glassmorphism Depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/25 dark:from-background dark:via-background/70 dark:to-background/35 z-1"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,var(--color-background)_100%)] opacity-70 z-1"
      />

      {/* Foreground Content Layer */}
      <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-8 md:p-10">
        {/* Center Interactive Play Button Stage */}
        <div className="flex flex-col items-center justify-center my-auto px-4 text-center">
          <button
            type="button"
            onClick={() => onSelect(item)}
            aria-label={`Tonton video ${item.title}`}
            className="group/play relative cursor-pointer flex items-center justify-center size-16 sm:size-20 rounded-full bg-primary text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25 group-hover/play:opacity-40" />
            <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-current" />
          </button>
        </div>

        {/* Bottom Glassmorphic Content Details Card */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-background/85 dark:bg-card/90 backdrop-blur-xl p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.tanggal}
                </span>
                {item.lokasi && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.lokasi}
                    </span>
                  </>
                )}
                {item.duration && (
                  <span className="sm:hidden flex items-center gap-1 font-mono">
                    • <Clock className="w-3.5 h-3.5" /> {item.duration}
                  </span>
                )}
              </div>

              <h3
                onClick={() => onSelect(item)}
                className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer leading-snug"
              >
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {item.deskripsi}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <Button
                variant="outline"
                onClick={(e) => onShare(item, e)}
                className="gap-2 cursor-pointer font-medium bg-background/60 dark:bg-card/60"
              >
                {hasCopied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                Bagikan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TiltedGridHero>
  );
}
