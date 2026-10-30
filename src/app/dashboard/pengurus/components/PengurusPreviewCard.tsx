"use client";

import React from "react";
import Image from "next/image";
import { PengurusItem } from "@/features/pengurus/types";
import {
  ShieldCheck,
  UserCheck,
  Calendar,
  Mail,
  Globe,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PengurusPreviewCardProps {
  item: PengurusItem | null;
}

export function PengurusPreviewCard({ item }: PengurusPreviewCardProps) {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-sm border border-dashed border-border bg-card/40 text-center min-h-[420px]">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          Pilih Pengurus untuk Pratinjau
        </h4>
        <p className="text-xs text-muted-foreground max-w-[240px] mt-1">
          Klik baris pengurus pada tabel untuk melihat kartu profil publik
          secara langsung.
        </p>
      </div>
    );
  }

  const isDataOrBlob =
    item.foto?.startsWith("data:") || item.foto?.startsWith("blob:");

  return (
    <div className="flex flex-col rounded-sm border border-border bg-card overflow-hidden shadow-xs">
      {/* Header Info */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground tracking-tight">
            Pratinjau Kartu Publik
          </span>
        </div>
        <Badge
          variant="outline"
          className={
            item.status === "PUBLISHED"
              ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
              : "text-amber-600 bg-amber-500/10 border-amber-500/20"
          }
        >
          {item.status === "PUBLISHED" ? "Tayang di Web" : "Draf (Tersimpan)"}
        </Badge>
      </div>

      {/* Card Content - Mimicking Public StructureSection */}
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        {/* Photo Container */}
        <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden bg-muted group">
          {item.foto ? (
            <Image
              src={item.foto}
              alt={item.nama}
              fill
              unoptimized={isDataOrBlob}
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              sizes="(max-width: 768px) 100vw, 360px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted">
              <ShieldCheck className="w-10 h-10 opacity-30 mb-2" />
              <span className="text-xs">Belum ada foto</span>
            </div>
          )}

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80" />

          {/* Floating Role Badge */}
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-sm shadow-xs">
            {item.jabatan}
          </div>

          {/* Floating Urutan / Order Badge */}
          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-xs text-foreground text-[10px] font-mono px-2 py-0.5 rounded-sm border border-border">
            #{item.urutan}
          </div>
        </div>

        {/* Text Info */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug">
            {item.nama}
          </h3>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            {item.jabatan}
          </p>

          {item.bidang && (
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
              <UserCheck className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span className="truncate">{item.bidang}</span>
            </p>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-3">
            {item.deskripsi || "Belum ada deskripsi profil tugas."}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>Masa Bakti: {item.periode}</span>
          </div>

          <div className="flex items-center gap-2">
            {item.email && (
              <span title={item.email} className="hover:text-primary">
                <Mail className="w-3.5 h-3.5" />
              </span>
            )}
            {item.linkedin && (
              <span title="Tautan Profil / Web" className="hover:text-primary">
                <Globe className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
