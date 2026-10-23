"use client";

import React, { useEffect } from "react";
import { ArtikelBerita } from "../types";
import { BERITA_CATEGORIES, BERITA_STATUSES } from "../constants";
import { MarkdownRenderer } from "./markdown-renderer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Eye,
  Edit3,
  Tag,
  CheckCircle2,
  FileClock,
  X,
} from "lucide-react";

interface BeritaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  berita: ArtikelBerita | null;
  onEdit?: (berita: ArtikelBerita) => void;
}

export function BeritaPreviewDialog({
  open,
  onOpenChange,
  berita,
  onEdit,
}: BeritaPreviewDialogProps) {
  // Lock body scroll when dialog is active so background page cannot scroll
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!berita) return null;

  const categoryConfig =
    BERITA_CATEGORIES.find((c) => c.value === berita.kategori) ||
    BERITA_CATEGORIES[0];
  const CategoryIcon = categoryConfig.icon;

  const statusConfig =
    BERITA_STATUSES.find((s) => s.value === berita.status) ||
    BERITA_STATUSES[0];

  const formattedDate = new Date(
    berita.publishedAt || berita.createdAt
  ).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const initials = berita.penulis.nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl h-[88vh] max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-lg shadow-none border border-border/80 bg-card text-card-foreground"
      >
        <DialogTitle className="sr-only">Pratinjau Artikel: {berita.judul}</DialogTitle>

        {/* 1. Solid Clean Top Header (Opaque bg-card, no bleed-through) */}
        <div className="px-6 py-4 border-b border-border/80 bg-card flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
              Pratinjau Publikasi
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>

            {/* Category Badge */}
            <Badge
              variant="outline"
              className={`text-[11px] font-medium py-0.5 px-2.5 gap-1 rounded-md ${categoryConfig.badgeClass}`}
            >
              <CategoryIcon className="h-3 w-3" />
              {categoryConfig.label}
            </Badge>

            {/* Status Pill */}
            <Badge
              variant="outline"
              className={`text-[11px] font-medium py-0.5 px-2.5 gap-1 rounded-full ${statusConfig.badgeClass}`}
            >
              {berita.status === "PUBLISHED" ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              ) : (
                <FileClock className="h-3 w-3 text-amber-500" />
              )}
              {statusConfig.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(berita);
                }}
                className="text-xs gap-1.5 h-8 rounded-lg border-border/80 hover:bg-muted"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Artikel</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Tutup Pratinjau"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Tutup</span>
            </Button>
          </div>
        </div>

        {/* 2. Scrollable Body with min-h-0 and data-lenis-prevent */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 py-6 space-y-6"
        >
          {/* Article Header & Excerpt */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
              {berita.judul}
            </h1>
            {berita.ringkasan && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {berita.ringkasan}
              </p>
            )}
          </div>

          {/* Clean Author & Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-3 border-b border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 rounded-full border border-border/80">
                {berita.penulis.avatarUrl && (
                  <AvatarImage
                    src={berita.penulis.avatarUrl}
                    alt={berita.penulis.nama}
                  />
                )}
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">
                  {berita.penulis.nama}
                </span>
                {berita.penulis.role && (
                  <span className="text-[11px] text-muted-foreground">
                    {berita.penulis.role}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span>{formattedDate}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span>{berita.views.toLocaleString("id-ID")} kali dibaca</span>
              </div>
            </div>
          </div>

          {/* Banner Hero Image */}
          {berita.bannerUrl && (
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-border/60 bg-muted/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={berita.bannerUrl}
                alt={berita.judul}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Parsed Rich Markdown Content */}
          <div className="pt-2">
            <MarkdownRenderer content={berita.konten} />
          </div>

          {/* Topic Tags */}
          {berita.tags.length > 0 && (
            <div className="pt-6 border-t border-border/50 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Tag className="h-3.5 w-3.5" />
                Kata Kunci:
              </span>
              {berita.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 3. Solid Bottom Action Bar (Opaque bg-card, no bleed-through) */}
        <div className="px-6 py-3.5 border-t border-border/80 bg-card flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs rounded-lg text-muted-foreground hover:text-foreground"
          >
            Tutup
          </Button>

          {onEdit && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(berita);
              }}
              className="text-xs gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Lanjut Edit Berita
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
