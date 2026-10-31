"use client";

import Image from "next/image";
import {
  Camera,
  Film,
  Sparkles,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  Eye,
  Star,
  ExternalLink,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GaleriItem } from "@/features/galeri/types";
import { cn } from "@/lib/utils";

interface GaleriGridViewProps {
  items: GaleriItem[];
  onInspect: (item: GaleriItem) => void;
  onEdit: (item: GaleriItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

export function GaleriGridView({
  items,
  onInspect,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
}: GaleriGridViewProps) {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center gap-3">
        <Camera className="size-10 text-muted-foreground/40" />
        <h4 className="text-base font-semibold text-foreground">
          Tidak ada dokumentasi ditemukan
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
          Belum ada aset galeri yang sesuai dengan kata kunci pencarian atau
          filter yang sedang aktif.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        return (
          <Card
            key={item.id}
            className="group relative border border-border/80 bg-card overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg flex flex-col h-full p-0 pt-0 gap-0"
          >
            {/* 1. Media Thumbnail Container */}
            <div
              className="relative aspect-16/9 w-full overflow-hidden bg-muted cursor-pointer"
              onClick={() => onInspect(item)}
            >
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />

              {/* Top Badges Over Thumbnail */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                {/* Media Format Icon Badge */}
                <div className="flex items-center gap-1.5">
                  <div className="size-7 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-xs">
                    {item.type === "PHOTO" && <Camera className="size-3.5" />}
                    {item.type === "VIDEO" && <Film className="size-3.5" />}
                    {item.type === "INSTAGRAM" && (
                      <FaInstagram className="size-3.5" />
                    )}
                  </div>

                  {item.featured && (
                    <Badge className="bg-amber-500 text-white font-semibold text-[10px] px-2 py-0.5 shadow-md flex items-center gap-1 border-0">
                      <Sparkles className="size-3" /> Spotlight
                    </Badge>
                  )}
                </div>

                {/* Status Publication Badge */}
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] font-semibold border-0 backdrop-blur-xs shadow-xs",
                    item.status === "PUBLISHED"
                      ? "bg-emerald-600/90 text-white"
                      : "bg-amber-500/90 text-white",
                  )}
                >
                  {item.status === "PUBLISHED" ? "Tayang" : "Draf"}
                </Badge>
              </div>

              {/* Video Duration Badge */}
              {item.duration && (
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{item.duration}</span>
                </div>
              )}
            </div>

            {/* 2. Card Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[11px] font-normal truncate">
                    {item.kategoriKegiatan}
                  </Badge>
                  <span className="font-mono text-[11px] shrink-0">
                    {item.tanggal}
                  </span>
                </div>

                <h4
                  onClick={() => onInspect(item)}
                  className="font-semibold text-sm sm:text-base text-foreground leading-snug hover:text-primary transition-colors cursor-pointer line-clamp-2"
                >
                  {item.title}
                </h4>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>

              {item.lokasi && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{item.lokasi}</span>
                </div>
              )}

              {/* 3. Action Buttons Footer */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                {/* Left Quick Actions */}
                <div className="flex items-center gap-1">
                  {/* Toggle Spotlight Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleFeatured(item.id)}
                    title={
                      item.featured
                        ? "Hapus dari Spotlight Utama"
                        : "Jadikan Spotlight Utama"
                    }
                    className={cn(
                      "size-8 rounded-lg cursor-pointer transition-colors",
                      item.featured
                        ? "text-amber-500 hover:text-amber-600 bg-amber-500/10"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Star
                      className={cn(
                        "size-4",
                        item.featured && "fill-amber-500",
                      )}
                    />
                  </Button>

                  {/* Toggle Status Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(item.id)}
                    title={
                      item.status === "PUBLISHED"
                        ? "Ubah jadi Draf"
                        : "Terbitkan ke Publik"
                    }
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Eye className="size-4" />
                  </Button>

                  {/* Detail Inspector Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onInspect(item)}
                    title="Buka Detail"
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                </div>

                {/* Right Edit & Delete Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                    title="Edit Media"
                    className="size-8 rounded-lg text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    title="Hapus Media"
                    className="size-8 rounded-lg text-muted-foreground hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
