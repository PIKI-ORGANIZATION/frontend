"use client";

import Image from "next/image";
import {
  Camera,
  Film,
  Edit2,
  Trash2,
  Eye,
  Star,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GaleriItem } from "@/features/galeri/types";
import { cn } from "@/lib/utils";

interface GaleriTableViewProps {
  items: GaleriItem[];
  onInspect: (item: GaleriItem) => void;
  onEdit: (item: GaleriItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleFeatured: (id: string) => void;
}

export function GaleriTableView({
  items,
  onInspect,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
}: GaleriTableViewProps) {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center gap-3">
        <Camera className="size-10 text-muted-foreground/40" />
        <h4 className="text-base font-semibold text-foreground">
          Tidak ada dokumentasi ditemukan
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
          Belum ada aset galeri yang sesuai dengan filter yang dipilih.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-24">Thumbnail</TableHead>
            <TableHead>Judul Kegiatan</TableHead>
            <TableHead className="w-32">Tipe Media</TableHead>
            <TableHead className="w-36">Waktu & Lokasi</TableHead>
            <TableHead className="w-28 text-center">Status</TableHead>
            <TableHead className="w-24 text-center">Spotlight</TableHead>
            <TableHead className="w-28 text-right pr-6">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            return (
              <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                {/* Thumbnail */}
                <TableCell className="py-3">
                  <div
                    className="relative aspect-video w-20 rounded-md overflow-hidden bg-muted cursor-pointer group"
                    onClick={() => onInspect(item)}
                  >
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                  </div>
                </TableCell>

                {/* Judul & Kategori */}
                <TableCell className="py-3">
                  <div className="space-y-1">
                    <p
                      onClick={() => onInspect(item)}
                      className="font-medium text-sm text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1"
                    >
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {item.kategoriKegiatan}
                      </Badge>
                      {item.duration && (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {item.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Tipe Media */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {item.type === "PHOTO" && (
                      <>
                        <Camera className="size-3.5 text-blue-600" />
                        <span>Foto</span>
                      </>
                    )}
                    {item.type === "VIDEO" && (
                      <>
                        <Film className="size-3.5 text-red-600" />
                        <span>Video</span>
                      </>
                    )}
                    {item.type === "INSTAGRAM" && (
                      <>
                        <FaInstagram className="size-3.5 text-pink-600" />
                        <span>Instagram</span>
                      </>
                    )}
                  </div>
                </TableCell>

                {/* Waktu & Lokasi */}
                <TableCell className="py-3 text-xs text-muted-foreground">
                  <p className="font-mono text-foreground font-medium">
                    {item.tanggal}
                  </p>
                  {item.lokasi && (
                    <p className="truncate max-w-[120px] text-[11px]">
                      {item.lokasi}
                    </p>
                  )}
                </TableCell>

                {/* Status Publikasi */}
                <TableCell className="py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item.id)}
                    title="Klik untuk ubah status"
                    className="cursor-pointer inline-flex"
                  >
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-semibold border-0 transition-opacity hover:opacity-80",
                        item.status === "PUBLISHED"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                      )}
                    >
                      {item.status === "PUBLISHED" ? "Tayang" : "Draf"}
                    </Badge>
                  </button>
                </TableCell>

                {/* Spotlight Switch */}
                <TableCell className="py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleFeatured(item.id)}
                    title={
                      item.featured
                        ? "Hapus dari Spotlight Utama"
                        : "Jadikan Spotlight Utama"
                    }
                    className={cn(
                      "size-7 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer",
                      item.featured
                        ? "text-amber-500 bg-amber-500/15"
                        : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Star
                      className={cn(
                        "size-4",
                        item.featured && "fill-amber-500",
                      )}
                    />
                  </button>
                </TableCell>

                {/* Aksi */}
                <TableCell className="py-3 text-right pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onInspect(item)}
                      title="Pratinjau Detail"
                      className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Eye className="size-4" />
                    </Button>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
