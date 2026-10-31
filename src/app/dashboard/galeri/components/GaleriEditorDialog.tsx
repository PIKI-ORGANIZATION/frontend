"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Film,
  Sparkles,
  ChevronsUpDown,
  Check,
  Calendar,
  Clock,
  MapPin,
  Link2,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import {
  GaleriItem,
  GaleriFormValues,
  KategoriGaleri,
  KATEGORI_GALERI_OPTIONS,
  SingleMediaType,
  StatusPublikasi,
} from "@/features/galeri/types";
import { cn } from "@/lib/utils";

interface GaleriEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: GaleriItem | null;
  onSave: (values: GaleriFormValues) => void;
}

// Helper to extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface GaleriEditorFormProps {
  editingItem: GaleriItem | null;
  onSave: (values: GaleriFormValues) => void;
  onCancel: () => void;
}

function GaleriEditorForm({
  editingItem,
  onSave,
  onCancel,
}: GaleriEditorFormProps) {
  // Compute initial states directly from props
  const [type, setType] = useState<SingleMediaType>(
    editingItem?.type || "PHOTO",
  );
  const [title, setTitle] = useState(editingItem?.title || "");
  const [deskripsi, setDeskripsi] = useState(editingItem?.deskripsi || "");
  const [kategori, setKategori] = useState<KategoriGaleri>(
    (editingItem?.kategoriKegiatan as KategoriGaleri) || "Kongres & Pelantikan",
  );
  const [url, setUrl] = useState(editingItem?.url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    editingItem?.thumbnailUrl || "",
  );
  const [tanggal, setTanggal] = useState(
    editingItem?.tanggal ||
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
  );
  const [lokasi, setLokasi] = useState(editingItem?.lokasi || "");
  const [duration, setDuration] = useState(editingItem?.duration || "");
  const [featured, setFeatured] = useState(Boolean(editingItem?.featured));
  const [status, setStatus] = useState<StatusPublikasi>(
    editingItem?.status || "PUBLISHED",
  );

  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);

  // Derived YouTube ID and Thumbnail
  const youtubeId = type === "VIDEO" ? extractYouTubeId(url) : null;
  const effectiveThumbnail =
    thumbnailUrl ||
    (type === "VIDEO" && youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    // Determine final thumbnail
    let finalThumbnail = effectiveThumbnail.trim();
    if (!finalThumbnail) {
      if (type === "PHOTO" && url.trim()) {
        finalThumbnail = url.trim();
      } else {
        finalThumbnail = "/footage/image1.webp";
      }
    }

    const payload: GaleriFormValues = {
      title: title.trim(),
      deskripsi: deskripsi.trim(),
      type,
      url: url.trim() || finalThumbnail,
      thumbnailUrl: finalThumbnail,
      kategoriKegiatan: kategori,
      tanggal: tanggal.trim() || "Hari ini",
      lokasi: lokasi.trim() || undefined,
      duration: type === "VIDEO" ? duration.trim() || undefined : undefined,
      youtubeVideoId: type === "VIDEO" && youtubeId ? youtubeId : undefined,
      instagramUrl: type === "INSTAGRAM" ? url.trim() : undefined,
      featured,
      status,
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      {/* 1. Tipe Media Selector */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tipe Media Dokumentasi
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              value: "PHOTO" as const,
              label: "Galeri Foto",
              icon: Camera,
              color: "text-blue-600",
            },
            {
              value: "VIDEO" as const,
              label: "Video Liputan",
              icon: Film,
              color: "text-red-600",
            },
            {
              value: "INSTAGRAM" as const,
              label: "Feed Instagram",
              icon: FaInstagram,
              color: "text-pink-600",
            },
          ].map((t) => {
            const isSelected = type === t.value;
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setType(t.value);
                  if (t.value !== type) {
                    setUrl("");
                    setThumbnailUrl("");
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                    : "border-border/80 bg-card hover:bg-muted text-muted-foreground",
                )}
              >
                <Icon className={cn("size-5", isSelected ? t.color : "")} />
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected && "font-semibold text-foreground",
                  )}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Media Specific Inputs & Live Preview */}
      <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-4">
        {type === "VIDEO" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="video-url" className="text-xs font-medium">
                URL Video YouTube
              </Label>
              <div className="relative">
                <Input
                  id="video-url"
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <Link2 className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tempelkan tautan video YouTube resmi PIKI. Sistem otomatis
                mengekstraksi Video ID.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="video-duration" className="text-xs font-medium">
                  Durasi Video (Opsional)
                </Label>
                <div className="relative">
                  <Input
                    id="video-duration"
                    placeholder="Contoh: 14:32 atau 08:45"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <Clock className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="video-thumb" className="text-xs font-medium">
                  URL Thumbnail Kustom (Opsional)
                </Label>
                <Input
                  id="video-thumb"
                  placeholder="Biarkan kosong untuk thumbnail otomatis"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Live YouTube Preview */}
            {youtubeId ? (
              <div className="pt-2">
                <p className="text-xs font-semibold mb-1 text-emerald-600 flex items-center gap-1">
                  <Check className="size-3.5" /> Video Terdeteksi: ID {youtubeId}
                </p>
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-md border border-border">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
                    title="Live Preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              url.trim() && (
                <p className="text-xs text-amber-600">
                  Tautan belum dikenali sebagai URL YouTube yang valid.
                </p>
              )
            )}
          </div>
        )}

        {type === "PHOTO" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="photo-url" className="text-xs font-medium">
                URL Foto Resolusi Tinggi
              </Label>
              <div className="relative">
                <Input
                  id="photo-url"
                  placeholder="https://... atau /footage/image1.webp"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (!thumbnailUrl) setThumbnailUrl(e.target.value);
                  }}
                  required
                />
                <Camera className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="photo-thumb" className="text-xs font-medium">
                URL Thumbnail Foto (Opsional)
              </Label>
              <Input
                id="photo-thumb"
                placeholder="Sama dengan foto utama jika dikosongkan"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
            </div>

            {/* Live Photo Preview */}
            {(url.trim() || thumbnailUrl.trim()) && (
              <div className="pt-2">
                <p className="text-xs font-semibold mb-1 text-muted-foreground">
                  Pratinjau Foto:
                </p>
                <div className="relative aspect-16/9 w-full max-h-48 rounded-lg overflow-hidden bg-muted border border-border">
                  <Image
                    src={thumbnailUrl.trim() || url.trim()}
                    alt="Preview Foto"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {type === "INSTAGRAM" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ig-url" className="text-xs font-medium">
                URL Postingan / Reel Instagram
              </Label>
              <div className="relative">
                <Input
                  id="ig-url"
                  placeholder="https://www.instagram.com/p/... atau @piki.official"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <FaInstagram className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ig-thumb" className="text-xs font-medium">
                URL Gambar Cover / Thumbnail Post
              </Label>
              <Input
                id="ig-thumb"
                placeholder="https://images.unsplash.com/..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                required
              />
            </div>

            {thumbnailUrl.trim() && (
              <div className="pt-2">
                <p className="text-xs font-semibold mb-1 text-muted-foreground">
                  Pratinjau Cover Instagram:
                </p>
                <div className="relative aspect-square size-36 rounded-lg overflow-hidden bg-muted border border-border">
                  <Image
                    src={thumbnailUrl.trim()}
                    alt="Preview Instagram"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. General Information Fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="media-title" className="text-xs font-medium">
            Judul Dokumentasi / Acara <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="media-title"
            placeholder="Contoh: Kongres Nasional DPP PIKI 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kategori Kegiatan - Wajib menggunakan Popover per StyleGuide */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Kategori Kegiatan <span className="text-rose-500">*</span>
            </Label>
            <Popover
              open={openCategoryPopover}
              onOpenChange={setOpenCategoryPopover}
            >
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCategoryPopover}
                    className="w-full justify-between cursor-pointer font-normal"
                  >
                    <span className="truncate">{kategori}</span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-72 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Cari kategori kegiatan..." />
                  <CommandList>
                    <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {KATEGORI_GALERI_OPTIONS.map((opt) => (
                        <CommandItem
                          key={opt}
                          value={opt}
                          onSelect={() => {
                            setKategori(opt);
                            setOpenCategoryPopover(false);
                          }}
                          className="cursor-pointer flex items-center justify-between"
                        >
                          <span>{opt}</span>
                          <Check
                            className={cn(
                              "size-4 text-primary",
                              kategori === opt ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tanggal Pelaksanaan */}
          <div className="space-y-1.5">
            <Label htmlFor="media-date" className="text-xs font-medium">
              Tanggal Pelaksanaan
            </Label>
            <div className="relative">
              <Input
                id="media-date"
                placeholder="Contoh: 15 Oktober 2024"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
              <Calendar className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Lokasi */}
        <div className="space-y-1.5">
          <Label htmlFor="media-location" className="text-xs font-medium">
            Lokasi Pelaksanaan (Opsional)
          </Label>
          <div className="relative">
            <Input
              id="media-location"
              placeholder="Contoh: Grand Sahid Jaya, Jakarta Pusat"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
            <MapPin className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
          </div>
        </div>

        {/* Deskripsi */}
        <div className="space-y-1.5">
          <Label htmlFor="media-desc" className="text-xs font-medium">
            Deskripsi Dokumentasi
          </Label>
          <Textarea
            id="media-desc"
            placeholder="Rangkum momen penting, delegasi yang hadir, dan hasil yang dicapai dalam kegiatan ini..."
            rows={3}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Controls: Spotlight Highlight & Publication Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
        {/* Spotlight Toggle */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-card flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-amber-500" />
              <span className="text-xs font-semibold text-foreground">
                Spotlight Utama
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Jadikan highlight pada banner 3D di halaman galeri.
            </p>
          </div>
          <input
            type="checkbox"
            id="featured-toggle"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="size-4.5 rounded accent-primary cursor-pointer"
          />
        </div>

        {/* Status Publikasi */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-card flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-foreground">
              Status Publikasi
            </span>
            <p className="text-[11px] text-muted-foreground">
              {status === "PUBLISHED"
                ? "Tayang langsung di galeri publik"
                : "Hanya tersimpan sebagai draf internal"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStatus("DRAFT")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                status === "DRAFT"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              Draf
            </button>
            <button
              type="button"
              onClick={() => setStatus("PUBLISHED")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                status === "PUBLISHED"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              Tayang
            </button>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="cursor-pointer font-medium">
          {editingItem ? "Simpan Perubahan" : "Tambah Media"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function GaleriEditorDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
}: GaleriEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {editingItem ? "Edit Dokumentasi Media" : "Tambah Dokumentasi Media"}
          </DialogTitle>
          <DialogDescription>
            Isi rincian informasi aset foto, video liputan, atau konten media
            sosial PIKI untuk tayang di galeri.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <GaleriEditorForm
            key={editingItem?.id || "create-new"}
            editingItem={editingItem}
            onSave={(values) => {
              onSave(values);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
