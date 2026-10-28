"use client";

import React, { useState } from "react";
import { HeroContent } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sparkles,
  Link as LinkIcon,
  Save,
  RotateCcw,
  Eye,
  ArrowRight,
} from "lucide-react";

interface HeroSectionTabProps {
  hero: HeroContent;
  setHero: React.Dispatch<React.SetStateAction<HeroContent>>;
}

export function HeroSectionTab({ hero, setHero }: HeroSectionTabProps) {
  const [draft, setDraft] = useState<HeroContent>({ ...hero });
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = <K extends keyof HeroContent>(
    key: K,
    value: HeroContent[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.highlight.trim()) {
      toast.error("Judul utama dan sorotan tidak boleh kosong.");
      return;
    }

    const updated = { ...draft, updatedAt: new Date().toISOString() };
    setHero(updated);
    setIsDirty(false);
    toast.success("Pengaturan Hero Section berhasil disimpan!");
  };

  const handleReset = () => {
    setDraft({ ...hero });
    setIsDirty(false);
    toast.info("Perubahan draf dibatalkan.");
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Pengaturan Hero (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-lg ring-1 ring-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Teks Utama & Heading Hero
                </h3>
                <p className="text-xs md:text-[13px] text-muted-foreground">
                  Konfigurasikan judul besar dan pengantar yang pertama kali dilihat pengunjung.
                </p>
              </div>
            </div>

            {/* Eyebrow */}
            <div>
              <Label htmlFor="hero-eyebrow" className="text-xs md:text-sm font-medium mb-1.5 block">
                Eyebrow Text (Label Atas Kecil)
              </Label>
              <Input
                id="hero-eyebrow"
                value={draft.eyebrow}
                onChange={(e) => handleChange("eyebrow", e.target.value)}
                placeholder="Contoh: PERSATUAN INTELEGENSIA KRISTEN INDONESIA"
              />
            </div>

            {/* Title & Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hero-title" className="text-xs md:text-sm font-medium mb-1.5 block">
                  Judul Baris Pertama <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hero-title"
                  value={draft.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Contoh: Sistem Informasi"
                  required
                />
              </div>

              <div>
                <Label htmlFor="hero-highlight" className="text-xs md:text-sm font-medium mb-1.5 block">
                  Aksen Sorotan (Warna Biru) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hero-highlight"
                  value={draft.highlight}
                  onChange={(e) => handleChange("highlight", e.target.value)}
                  placeholder="Contoh: KTA Digital"
                  required
                />
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <Label htmlFor="hero-sub" className="text-xs md:text-sm font-medium mb-1.5 block">
                Deskripsi / Sub-headline
              </Label>
              <Textarea
                id="hero-sub"
                rows={3}
                value={draft.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
                placeholder="Deskripsi singkat layanan ekosistem keanggotaan terpadu..."
                className="leading-relaxed"
              />
            </div>
          </div>

          {/* Form CTA Buttons */}
          <div className="rounded-lg ring-1 ring-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <LinkIcon className="w-4 h-4 text-primary" />
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Tombol Aksi (Call to Action / CTA)
                </h3>
                <p className="text-xs md:text-[13px] text-muted-foreground">
                  Tautan tombol navigasi utama bagi calon anggota baru dan anggota terdaftar.
                </p>
              </div>
            </div>

            {/* CTA 1: Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cta1-text" className="text-xs md:text-sm font-medium mb-1.5 block">
                  Label Tombol Utama (Primary)
                </Label>
                <Input
                  id="cta1-text"
                  value={draft.primaryCtaText}
                  onChange={(e) => handleChange("primaryCtaText", e.target.value)}
                  placeholder="Daftar Anggota"
                />
              </div>
              <div>
                <Label htmlFor="cta1-url" className="text-xs md:text-sm font-medium mb-1.5 block">
                  Target Link Tombol Utama
                </Label>
                <Input
                  id="cta1-url"
                  value={draft.primaryCtaUrl}
                  onChange={(e) => handleChange("primaryCtaUrl", e.target.value)}
                  placeholder="/register"
                />
              </div>
            </div>

            {/* CTA 2: Sekunder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cta2-text" className="text-xs md:text-sm font-medium mb-1.5 block">
                  Label Tombol Sekunder (Outline)
                </Label>
                <Input
                  id="cta2-text"
                  value={draft.secondaryCtaText}
                  onChange={(e) => handleChange("secondaryCtaText", e.target.value)}
                  placeholder="Masuk Portal"
                />
              </div>
              <div>
                <Label htmlFor="cta2-url" className="text-xs md:text-sm font-medium mb-1.5 block">
                  Target Link Tombol Sekunder
                </Label>
                <Input
                  id="cta2-url"
                  value={draft.secondaryCtaUrl}
                  onChange={(e) => handleChange("secondaryCtaUrl", e.target.value)}
                  placeholder="/login"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs md:text-[13px] text-muted-foreground">
              {isDirty ? (
                <span className="text-amber-500 font-medium">
                  • Ada perubahan yang belum disimpan
                </span>
              ) : (
                "Semua perubahan tersimpan"
              )}
            </span>

            <div className="flex items-center gap-2">
              {isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Batal
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Pengaturan Hero
              </Button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pratinjau Tampilan Hero (lg:col-span-5) */}
        <div className="lg:col-span-5 sticky top-20 space-y-2">
          <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="w-3.5 h-3.5 text-primary" />
              Simulasi Tampilan Hero Publik
            </span>
            <span className="text-xs md:text-[12px] text-muted-foreground/70">
              Live Preview
            </span>
          </div>

          <div className="rounded-xl ring-1 ring-border bg-card p-6 overflow-hidden relative space-y-4">
            {/* Background glow simulation */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

            {/* Simulated Eyebrow */}
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              {draft.eyebrow || "PERSATUAN INTELEGENSIA KRISTEN INDONESIA"}
            </p>

            {/* Simulated Heading */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              {draft.title || "Sistem Informasi"} <br />
              <span className="text-primary">{draft.highlight || "KTA Digital"}</span>
            </h2>

            {/* Simulated Subtitle */}
            <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed line-clamp-4">
              {draft.subtitle || "Platform keanggotaan terpadu organisasi."}
            </p>

            {/* Simulated Buttons */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <div className="h-8 px-3 rounded-sm bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5">
                <span>{draft.primaryCtaText || "Daftar Anggota"}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
              <div className="h-8 px-3 rounded-sm border border-border text-foreground text-xs font-medium flex items-center">
                <span>{draft.secondaryCtaText || "Masuk Portal"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/70 text-xs text-muted-foreground flex items-center justify-between">
              <span>Rute aktif: {draft.primaryCtaUrl}</span>
              <span>Diperbarui terkini</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
