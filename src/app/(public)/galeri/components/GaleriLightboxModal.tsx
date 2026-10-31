"use client";

import Image from "next/image";
import { Calendar, MapPin, ExternalLink, Share2, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "../types";

interface GaleriLightboxModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onShare: (item: MediaItem, e?: React.MouseEvent) => void;
  hasCopied: boolean;
}

export function GaleriLightboxModal({
  item,
  onClose,
  onShare,
  hasCopied,
}: GaleriLightboxModalProps) {
  return (
    <Dialog
      open={Boolean(item)}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl p-0 overflow-hidden rounded-xl bg-background text-foreground shadow-2xl"
      >
        <div className="sr-only">
          <DialogTitle>{item?.title || "Pratinjau Media"}</DialogTitle>
          <DialogDescription>
            {item?.deskripsi || "Detail dokumentasi kegiatan resmi PIKI."}
          </DialogDescription>
        </div>

        {item && (
          <div className="flex flex-col">
            {/* Media Display Area (Modern Web Guidance: Lazy load video player on dialog open) */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {item.type === "VIDEO" && item.youtubeVideoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${item.youtubeVideoId}?autoplay=1&rel=0`}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 896px"
                  />
                </div>
              )}

              {/* Close Button Top Right */}
              <button
                type="button"
                aria-label="Tutup pratinjau"
                onClick={onClose}
                className="absolute top-3 right-3 z-20 size-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Media Metadata & Caption Details */}
            <div className="p-6 sm:p-8 space-y-4 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.kategoriKegiatan}</Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground flex items-center gap-1 font-mono">
                    <Calendar className="size-3" />
                    {item.tanggal}
                  </span>
                  {item.lokasi && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3" />
                        {item.lokasi}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.instagramUrl && (
                    <a
                      href={item.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Buka di Instagram <ExternalLink className="size-3" />
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => onShare(item, e)}
                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="size-3.5" />
                        <span>Bagikan</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
