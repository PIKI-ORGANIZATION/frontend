"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Camera,
  Film,
  Play,
  Calendar,
  MapPin,
  ZoomIn,
  ExternalLink,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MediaItem } from "../types";

interface GaleriMediaCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
}

export function GaleriMediaCard({ item, onSelect }: GaleriMediaCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
      className="group relative cursor-pointer overflow-hidden border-border/80 transition-all duration-300 hover:border-primary/50 hover:shadow-xl flex flex-col h-full bg-card"
      aria-label={`Lihat detail ${item.title}`}
    >
      {/* Media Thumbnail with Modern Web Guidance Aspect-Ratio & Lazy Load */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={item.thumbnailUrl}
          alt={item.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <Badge
            variant="secondary"
            className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium border-0 shadow-xs"
          >
            {item.kategoriKegiatan}
          </Badge>

          {/* Media Type Icon Badge */}
          <div
            className="size-7 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-xs"
            aria-label={`Tipe media: ${item.type}`}
          >
            {item.type === "PHOTO" && <Camera className="size-3.5" />}
            {item.type === "VIDEO" && <Film className="size-3.5" />}
            {item.type === "INSTAGRAM" && <FaInstagram className="size-3.5" />}
          </div>
        </div>

        {/* Center Play Button for Videos */}
        {item.type === "VIDEO" && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition-colors group-hover:bg-black/40">
            <div className="w-12 h-12 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="w-5 h-5 ml-0.5 fill-primary text-primary" />
            </div>
            {item.duration && (
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono">
                {item.duration}
              </div>
            )}
          </div>
        )}

        {/* Hover Overlay matching GalleryGridBlock standard */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-xs text-white p-4 z-20"
          aria-hidden="true"
        >
          {item.type === "PHOTO" && (
            <>
              <ZoomIn className="mb-2 h-8 w-8 text-white transition-transform group-hover:scale-110" />
              <p className="text-xs font-semibold text-center text-white/90">
                Perbesar Foto
              </p>
            </>
          )}
          {item.type === "VIDEO" && (
            <>
              <Play className="mb-2 h-8 w-8 fill-white text-white transition-transform group-hover:scale-110" />
              <p className="text-xs font-semibold text-center text-white/90">
                Putar Video Liputan
              </p>
            </>
          )}
          {item.type === "INSTAGRAM" && (
            <>
              <ExternalLink className="mb-2 h-8 w-8 text-white transition-transform group-hover:scale-110" />
              <p className="text-xs font-semibold text-center text-white/90">
                Lihat di Instagram
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Card Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <h4 className="font-semibold text-sm sm:text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.deskripsi}
          </p>
        </div>

        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {item.tanggal}
          </span>
          {item.lokasi && (
            <span className="truncate max-w-[130px] flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{item.lokasi}</span>
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

