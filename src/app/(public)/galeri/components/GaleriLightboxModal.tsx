"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  ExternalLink,
  Share2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { formatTanggalIndo, getSafeImageSrc } from "@/features/galeri/types";
import type { MediaItem } from "../types";

interface GaleriLightboxModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onShare: (item: MediaItem, e?: React.MouseEvent) => void;
  hasCopied: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  totalItems?: number;
  currentIndex?: number;
}

interface GaleriVideoPlayerProps {
  videoId: string;
  title: string;
  url?: string;
}

function GaleriVideoPlayer({ videoId, title, url }: GaleriVideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const startMatch = url?.match(/[?&]t=(\d+)s?/);
  const startParam = startMatch ? `&start=${startMatch[1]}` : "";

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-border/40 dark:border-white/10 shadow-2xl">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-black/80 text-muted-foreground dark:text-zinc-400 text-xs font-mono">
          Memuat video dokumentasi...
        </div>
      )}
      <iframe
        key={videoId}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1${startParam}`}
        title={title}
        onLoad={() => setLoading(false)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}

export function GaleriLightboxModal({
  item,
  onClose,
  onShare,
  hasCopied,
  onNext,
  onPrev,
}: GaleriLightboxModalProps) {
  // Keyboard navigation for lightbox (ArrowLeft / ArrowRight)
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onNext, onPrev]);

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal className="z-999">
        {/* 1. Theme-Adaptive Translucent Backdrop Overlay (Light: soft translucent frosted / Dark: deep translucent) */}
        <DialogOverlay
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50  transition-all duration-300 cursor-zoom-out"
        />

        {/* 2. Fullscreen Popup Container */}
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex h-dvh w-screen flex-col justify-between overflow-hidden p-0 text-foreground ring-0 overscroll-contain "
        >
          <div className="sr-only">
            <DialogTitle>
              {item?.title || "Pratinjau Multimedia PIKI"}
            </DialogTitle>
            <DialogDescription>
              {item?.deskripsi ||
                "Dokumentasi arsip kegiatan resmi Persatuan Intelegensia Kristen Indonesia."}
            </DialogDescription>
          </div>

          {item && (
            <div className="relative flex h-full w-full flex-col justify-between overflow-hidden">
              {/* 3. Top Header Bar & Controls */}
              <header className="relative z-30 flex items-center justify-end p-4 sm:p-6 md:px-10">
                {/* Top Action Buttons & Close Icon */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {item.instagramUrl && (
                    <a
                      href={item.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-card/85  px-3.5 text-xs font-medium text-foreground backdrop-blur-md transition-all hover:bg-card dark:hover:bg-white/20 active:scale-95 shadow-2xs cursor-pointer"
                    >
                      <span>Buka Instagram</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => onShare(item, e)}
                    className="h-9 gap-1.5 rounded-full border border-border/80 d bg-card/85  px-3.5 text-xs font-medium text-foreground  backdrop-blur-md transition-all hover:bg-card dark:hover:bg-white/20 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="size-3.5" />
                        <span className="hidden sm:inline">Bagikan</span>
                      </>
                    )}
                  </Button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup pratinjau (Esc)"
                    className="group relative flex size-9 sm:size-10 items-center justify-center rounded-full border border-border/80 bg-card/85  text-foreground backdrop-blur-md transition-all hover:bg-card dark:hover:bg-white/25 hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <X className="size-5 transition-transform duration-200 group-hover:rotate-90" />
                    <span className="sr-only">Tutup</span>
                  </button>
                </div>
              </header>

              {/* 4. Centerpiece Media Stage */}
              <main
                className="relative flex flex-1 items-center justify-center px-4 sm:px-12 md:px-20 z-60 cursor-zoom-out"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    onClose();
                  }
                }}
              >
                {/* Prev Navigation Button */}
                {onPrev && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev();
                    }}
                    aria-label="Media sebelumnya (Panah Kiri)"
                    className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 flex size-11 sm:size-12 items-center justify-center rounded-full border border-border/80 bg-background  text-foreground backdrop-blur-md transition-all hover:bg-card hover:scale-110 active:scale-95 shadow-md cursor-pointer"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                )}

                {/* Next Navigation Button */}
                {onNext && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    aria-label="Media selanjutnya (Panah Kanan)"
                    className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 flex size-11 sm:size-12 items-center justify-center rounded-full border border-border/80 bg-background  text-foreground backdrop-blur-md transition-all hover:bg-card hover:scale-110 active:scale-95 shadow-md cursor-pointer"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                )}

                {/* Media Container */}
                <div
                  className="relative max-h-[60vh] sm:max-h-[68vh] md:max-h-[72vh] w-full max-w-5xl overflow-hidden cursor-default flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.type === "VIDEO" ? (
                    item.youtubeVideoId ? (
                      <GaleriVideoPlayer
                        key={item.youtubeVideoId}
                        videoId={item.youtubeVideoId}
                        title={item.title}
                        url={item.url}
                      />
                    ) : (
                      <video
                        key={item.url}
                        controls
                        autoPlay
                        playsInline
                        poster={item.thumbnailUrl}
                        className="max-h-[60vh] sm:max-h-[68vh] md:max-h-[72vh] w-full aspect-video rounded-2xl bg-black shadow-2xl"
                      >
                        <source src={item.url} />
                        Peramban Anda tidak mendukung pemutar video HTML5.
                      </video>
                    )
                  ) : item.type === "INSTAGRAM" && (item.embedUrl || item.instagramUrl || item.url) ? (
                    <div className="flex items-center justify-center w-full max-w-md h-[55vh] sm:h-[65vh] max-h-[680px]">
                      <iframe
                        key={item.embedUrl || item.instagramUrl || item.url}
                        src={
                          item.embedUrl ||
                          `${(item.instagramUrl || item.url).replace(/\/?(\?.*)?$/, "")}/embed`
                        }
                        title={item.title}
                        className="w-full h-full rounded-2xl border border-border/80 shadow-2xl bg-card"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="relative h-[50vh] sm:h-[60vh] md:h-[66vh] w-full flex items-center justify-center">
                      <Image
                        src={getSafeImageSrc(
                          item.type === "INSTAGRAM"
                            ? item.thumbnailUrl || item.url
                            : item.url || item.thumbnailUrl,
                        )}
                        alt={item.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 1280px"
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </main>

              {/* 5. Bottom-Aligned Media Metadata (Translucent Glass Card) */}
              <footer className="relative z-60 p-4 sm:p-6 md:px-12 md:pb-12">
                <div className="mx-auto max-w-5xl rounded-xl bg-background p-5 sm:p-6 shadow-xl space-y-2.5">
                  {/* Meta details badges */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted-foreground ">
                    <span className="flex items-center gap-1.5 font-mono text-muted-foreground ">
                      <Calendar className="size-3.5 text-primary" />
                      {formatTanggalIndo(item.tanggal)}
                    </span>

                    {item.lokasi && (
                      <>
                        <span className="flex items-center gap-1.5 text-muted-foreground ">
                          <MapPin className="size-3.5 text-primary" />
                          {item.lokasi}
                        </span>
                      </>
                    )}

                    {item.duration && (
                      <>
                        <span className="flex items-center gap-1.5 font-mono text-muted-foreground">
                          <Clock className="size-3.5 text-primary" />
                          {item.duration}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-muted-foreground  leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {item.deskripsi}
                  </p>
                </div>
              </footer>
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
