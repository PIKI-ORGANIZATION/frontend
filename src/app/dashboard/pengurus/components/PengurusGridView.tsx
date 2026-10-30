"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PengurusItem } from "@/features/pengurus/types";
import { Eye, EyeOff, Edit2, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  if (!name) return "PI";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface PengurusGridViewProps {
  items: PengurusItem[];
  isLoaded: boolean;
  activeId?: string | null;
  onSelect: (item: PengurusItem) => void;
  onEdit: (item: PengurusItem, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onToggleStatus: (id: string, e: React.MouseEvent) => void;
}

export function PengurusGridView({
  items,
  isLoaded,
  activeId,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}: PengurusGridViewProps) {
  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-4 bg-card p-6 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded-sm bg-muted" />
                <div className="h-4 w-2/3 rounded-sm bg-muted" />
                <div className="h-3 w-1/2 rounded-sm bg-muted" />
              </div>
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="h-3 w-full rounded-sm bg-muted" />
              <div className="h-3 w-4/5 rounded-sm bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-12 text-center text-muted-foreground">
        <div className="flex flex-col items-center justify-center gap-2">
          <Users className="w-8 h-8 opacity-30" />
          <p className="text-sm font-medium">
            Tidak ada data pengurus yang sesuai.
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Coba ubah kata kunci pencarian atau ganti filter kategori/status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/50 bg-card sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const isInspected = activeId === item.id;
        const fallbackText =
          item.deskripsi ||
          `Pengurus resmi Dewan Pimpinan Pusat Persatuan Inteligensia Kristen Indonesia (PIKI) masa bakti ${item.periode}.`;

        return (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={cn(
              "group relative flex flex-col justify-between gap-5 bg-background rounded-xl p-6 transition-colors duration-200 hover:bg-card cursor-pointer select-none",
              isInspected && "bg-primary/5 ring-1 ring-primary/40",
            )}
          >
            {/* Header: Avatar & Member Info */}
            <div className="flex items-start gap-4">
              <Avatar className="size-16 shrink-0 border border-border">
                <AvatarImage
                  src={item.foto}
                  alt={item.nama}
                  className="grayscale transition-all duration-300 group-hover:grayscale-0 object-cover"
                />
                <AvatarFallback className="text-sm font-semibold font-mono bg-primary/10 text-primary">
                  {getInitials(item.nama)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                {/* Name */}
                <span className="text-sm leading-snug font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {item.nama}
                </span>

                {/* Role */}
                <span className="text-sm text-muted-foreground line-clamp-1">
                  {item.jabatan}
                </span>

                {/* Urutan & Periode */}
                <span className="text-xs text-muted-foreground/70 font-mono">
                  {item.periode}
                </span>
              </div>
            </div>

            {/* Narrative / Bio */}
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 min-h-[3rem]">
              {fallbackText}
            </p>

            {/* Footer: Quick Status Toggle & Action Buttons */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => onToggleStatus(item.id, e)}
                title="Klik untuk mengubah status tayang"
                className="inline-flex items-center gap-1 cursor-pointer group/status"
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] py-0.5 transition-colors cursor-pointer",
                    item.status === "PUBLISHED"
                      ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 group-hover/status:bg-emerald-500/20"
                      : "text-amber-600 bg-amber-500/10 border-amber-500/20 group-hover/status:bg-amber-500/20",
                  )}
                >
                  {item.status === "PUBLISHED" ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Tayang
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Draf
                    </>
                  )}
                </Badge>
              </button>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                  }}
                  title="Buka panel pratinjau & detail"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onEdit(item, e)}
                  title="Ubah data pengurus"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onDelete(item.id, e)}
                  title="Hapus pengurus"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
