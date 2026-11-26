"use client";

import React, { useState } from "react";
import { AboutVisionContent } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Info,
  Compass,
  Target,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Loader2,
  Eye,
} from "lucide-react";

interface AboutVisionTabProps {
  data: AboutVisionContent;
  onSave: (updated: AboutVisionContent) => Promise<void>;
  isSaving?: boolean;
}

export function AboutVisionTab({
  data,
  onSave,
  isSaving = false,
}: AboutVisionTabProps) {
  const [localDraft, setLocalDraft] = useState<AboutVisionContent | null>(null);
  const isDirty = localDraft !== null;
  const draft = localDraft ?? data;

  const handleChange = <K extends keyof AboutVisionContent>(
    key: K,
    value: AboutVisionContent[K]
  ) => {
    setLocalDraft((prev) => ({ ...(prev ?? data), [key]: value }));
  };

  const handleMissionChange = (index: number, text: string) => {
    setLocalDraft((prev) => {
      const base = prev ?? data;
      const nextMissions = [...base.missionPoints];
      nextMissions[index] = text;
      return { ...base, missionPoints: nextMissions };
    });
  };

  const handleAddMission = () => {
    setLocalDraft((prev) => {
      const base = prev ?? data;
      return {
        ...base,
        missionPoints: [...base.missionPoints, ""],
      };
    });
  };

  const handleRemoveMission = (index: number) => {
    if (draft.missionPoints.length <= 1) {
      toast.error("Minimal harus ada satu butir misi organisasi.");
      return;
    }
    setLocalDraft((prev) => {
      const base = prev ?? data;
      return {
        ...base,
        missionPoints: base.missionPoints.filter((_, i) => i !== index),
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!draft.aboutDescription.trim() || !draft.visionText.trim()) {
      toast.error("Deskripsi organisasi dan teks visi wajib diisi.");
      return;
    }

    const filteredMissions = draft.missionPoints
      .map((m) => m.trim())
      .filter(Boolean);

    if (filteredMissions.length === 0) {
      toast.error("Minimal harus ada satu butir misi yang terisi.");
      return;
    }

    const updated: AboutVisionContent = {
      ...draft,
      missionPoints: filteredMissions,
      updatedAt: new Date().toISOString(),
    };

    await onSave(updated);
    setLocalDraft(null);
    toast.success("Konten Profil, Visi, dan Misi berhasil disimpan ke server!");
  };

  const handleReset = () => {
    setLocalDraft(null);
    toast.info("Perubahan draf dibatalkan.");
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Form Tentang, Visi & Misi (7 col) */}
        <div className="space-y-5 lg:col-span-7">
          {/* 1. Profil / Tentang PIKI */}
          <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <Info className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Tentang Organisasi (About Section)
            </h3>
            <p className="text-xs md:text-[13px] text-muted-foreground">
              Teks pengantar profil organisasi yang tampil langsung di bawah hero section.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="about-tagline" className="text-xs md:text-sm font-medium mb-1.5 block">
              Tagline Label Kecil
            </Label>
            <Input
              id="about-tagline"
              value={draft.aboutTagline}
              onChange={(e) => handleChange("aboutTagline", e.target.value)}
              placeholder="Contoh: Tentang Organisasi"
            />
          </div>

          <div>
            <Label htmlFor="about-title" className="text-xs md:text-sm font-medium mb-1.5 block">
              Judul Utama Baris 1
            </Label>
            <Input
              id="about-title"
              value={draft.aboutTitle}
              onChange={(e) => handleChange("aboutTitle", e.target.value)}
              placeholder="Wadah Perhimpunan"
            />
          </div>

          <div>
            <Label htmlFor="about-highlight" className="text-xs md:text-sm font-medium mb-1.5 block">
              Aksen Judul (Biru)
            </Label>
            <Input
              id="about-highlight"
              value={draft.aboutHighlight}
              onChange={(e) => handleChange("aboutHighlight", e.target.value)}
              placeholder="Intelektual Kristen"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="about-desc" className="text-xs md:text-sm font-medium mb-1.5 block">
            Narasi Profil Pengantar <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="about-desc"
            rows={4}
            value={draft.aboutDescription}
            onChange={(e) => handleChange("aboutDescription", e.target.value)}
            placeholder="Persatuan Intelegensia Kristen Indonesia (PIKI) terpanggil..."
            className="leading-relaxed"
            required
          />
        </div>
      </div>

      {/* 2. Visi Organisasi */}
      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/70 pb-3">
          <Compass className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-foreground">Visi Organisasi</h3>
            <p className="text-xs md:text-[13px] text-muted-foreground">
              Arah pandang dan cita-cita luhur perhimpunan intelektual PIKI.
            </p>
          </div>
        </div>

        <div className="max-w-xs">
          <Label htmlFor="vision-title" className="text-xs md:text-sm font-medium mb-1.5 block">
            Judul Bagian Visi
          </Label>
          <Input
            id="vision-title"
            value={draft.visionTitle}
            onChange={(e) => handleChange("visionTitle", e.target.value)}
            placeholder="Visi PIKI"
          />
        </div>

        <div>
          <Label htmlFor="vision-text" className="text-xs md:text-sm font-medium mb-1.5 block">
            Teks Pernyataan Visi <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="vision-text"
            rows={3}
            value={draft.visionText}
            onChange={(e) => handleChange("visionText", e.target.value)}
            placeholder="Mewujudkan komunitas intelektual Kristen yang kritis, kreatif, dan transformatif..."
            className="leading-relaxed"
            required
          />
        </div>
      </div>

      {/* 3. Misi Organisasi (Dinamis) */}
      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Butir-butir Misi Organisasi
              </h3>
              <p className="text-xs md:text-[13px] text-muted-foreground">
                Daftar agenda strategis misi PIKI (tampil terurut 01, 02, 03, dst).
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMission}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Butir
          </Button>
        </div>

        <div className="space-y-3">
          {draft.missionPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-3 group">
              <span className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center font-mono font-bold text-xs shrink-0 text-muted-foreground mt-0.5 border border-border/70">
                0{index + 1}
              </span>
              <div className="flex-1">
                <Textarea
                  rows={2}
                  value={point}
                  onChange={(e) => handleMissionChange(index, e.target.value)}
                  placeholder={`Uraian butir misi 0${index + 1}...`}
                  className="leading-relaxed"
                  required
                />
              </div>
              <div className="mt-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveMission(index)}
                  title="Hapus butir misi ini"
                  disabled={draft.missionPoints.length <= 1}
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                </Button>
              </div>
            </div>
          ))}
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
              disabled={isSaving}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Batal
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isSaving ? "Menyimpan..." : "Simpan Profil & Visi Misi"}
          </Button>
        </div>
      </div>
        </div>

        {/* Kolom Kanan: Live Preview Tentang & Visi-Misi (5 col) */}
        <div className="space-y-2 lg:sticky lg:top-20 lg:col-span-5">
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="size-3.5 text-primary" aria-hidden="true" />
              Simulasi Tampilan Tentang &amp; Visi-Misi
            </span>
            <span className="text-[11px] text-muted-foreground/75">
              Live Preview
            </span>
          </div>

          <div className="space-y-5 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                {draft.aboutTagline || "Tentang Organisasi"}
              </p>
              <h4 className="text-xl font-bold leading-tight tracking-tight text-foreground">
                {draft.aboutTitle || "Wadah Perhimpunan"}{" "}
                <span className="text-primary">
                  {draft.aboutHighlight || "Intelektual Kristen"}
                </span>
              </h4>
              <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
                {draft.aboutDescription}
              </p>
            </div>

            <div className="space-y-1.5 border-t border-border/60 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {draft.visionTitle || "Visi PIKI"}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {draft.visionText}
              </p>
            </div>

            <div className="space-y-2 border-t border-border/60 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Butir Misi ({draft.missionPoints.filter((m) => m.trim()).length})
              </p>
              <ul className="space-y-1.5">
                {draft.missionPoints
                  .filter((m) => m.trim())
                  .slice(0, 4)
                  .map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      <span className="font-mono text-[11px] font-semibold text-primary">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="line-clamp-2">{point}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
