"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HistoryEvent, HistoryStatus } from "../types";
import { toast } from "sonner";
import {
  Calendar,
  Image as ImageIcon,
  MapPin,
  User,
  Hash,
  ImagePlus,
  Trash2,
  Loader2,
  History,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: HistoryEvent | null;
  canSelectCabang?: boolean;
  cabangOptions?: { uuid: string; namaCabang: string }[];
  onSave: (data: HistoryEvent) => void | Promise<void>;
  onUploadPhoto?: (file: File) => Promise<string>;
}

const FOOTAGE_PRESETS = [
  { label: "Perintis", value: "/footage/image1.webp" },
  { label: "Konsolidasi", value: "/footage/image2.jpeg" },
  { label: "Aksi", value: "/footage/image3.jpg" },
];

function HistoryForm({
  event,
  canSelectCabang = false,
  cabangOptions = [],
  onOpenChange,
  onSave,
  onUploadPhoto,
}: {
  event?: HistoryEvent | null;
  canSelectCabang?: boolean;
  cabangOptions?: { uuid: string; namaCabang: string }[];
  onOpenChange: (open: boolean) => void;
  onSave: (data: HistoryEvent) => void | Promise<void>;
  onUploadPhoto?: (file: File) => Promise<string>;
}) {
  const isEditing = Boolean(event);

  const [year, setYear] = useState(event?.year || "");
  const [title, setTitle] = useState(event?.title || "");
  const [desc, setDesc] = useState(event?.desc || "");
  const [fullNarrative, setFullNarrative] = useState(
    event?.fullNarrative || "",
  );
  const [image, setImage] = useState(event?.image || FOOTAGE_PRESETS[0].value);
  const [location, setLocation] = useState(event?.location || "");
  const [keyFigure, setKeyFigure] = useState(event?.keyFigure || "");
  const [order, setOrder] = useState<number>(event?.order || 1);
  const [status, setStatus] = useState<HistoryStatus>(
    event?.status || "DRAFT",
  );
  const [cabangUuid, setCabangUuid] = useState<string | null>(
    event?.cabangUuid ?? null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cabangSelectOptions = useMemo(
    () => [
      { value: "__PUSAT__", label: "Pusat / Nasional (DPP)" },
      ...cabangOptions.map((c) => ({
        value: c.uuid,
        label: c.namaCabang,
      })),
    ],
    [cabangOptions],
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      toast.error("Format berkas harus JPG, PNG, WebP, atau GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran berkas maksimal 5 MB.");
      return;
    }

    setIsUploading(true);

    try {
      let uploadedUrl = "";
      if (onUploadPhoto) {
        uploadedUrl = await onUploadPhoto(file);
      } else {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = Cookies.get("token");

        if (apiUrl) {
          const formData = new FormData();
          formData.append("file", file);
          try {
            const res = await fetch(`${apiUrl}/upload`, {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: formData,
            });
            if (res.ok) {
              const data = await res.json();
              if (data.url) uploadedUrl = data.url;
              if (data.data?.url) uploadedUrl = data.data.url;
            }
          } catch {}
        }
      }

      if (!uploadedUrl) {
        uploadedUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Gagal membaca berkas"));
          reader.readAsDataURL(file);
        });
      }

      setImage(uploadedUrl);
      toast.success("Foto dokumentasi berhasil dimuat.");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memproses berkas foto.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!year.trim()) {
      toast.error("Tahun tonggak sejarah wajib diisi");
      return;
    }
    if (!title.trim()) {
      toast.error("Judul tonggak sejarah wajib diisi");
      return;
    }
    if (!desc.trim()) {
      toast.error("Ringkasan peristiwa wajib diisi");
      return;
    }

    const payload: HistoryEvent = {
      id: event?.id || `hist-${Date.now()}`,
      year: year.trim(),
      title: title.trim(),
      desc: desc.trim(),
      fullNarrative: fullNarrative.trim() || undefined,
      image: image.trim() || FOOTAGE_PRESETS[0].value,
      location: location.trim() || undefined,
      keyFigure: keyFigure.trim() || undefined,
      order: Number(order) || 1,
      status,
      ...(canSelectCabang ? { cabangUuid } : {}),
      createdAt: event?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Kolom Kiri (7 col): Informasi Utama & Narasi */}
          <div className="space-y-4 lg:col-span-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="hist-year"
                  className="flex items-center gap-1.5 text-xs font-medium"
                >
                  <Calendar className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span>
                    Tahun <span className="text-destructive">*</span>
                  </span>
                </Label>
                <Input
                  id="hist-year"
                  placeholder="Contoh: 1963"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  maxLength={9}
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="hist-order"
                  className="flex items-center gap-1.5 text-xs font-medium"
                >
                  <Hash className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span>Urutan Tampil</span>
                </Label>
                <Input
                  id="hist-order"
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hist-status" className="block text-xs font-medium">
                  Status Publikasi
                </Label>
                <Select
                  value={status}
                  onValueChange={(val) => {
                    if (val) setStatus(val as HistoryStatus);
                  }}
                >
                  <SelectTrigger id="hist-status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="DRAFT"
                      disabled={event?.status === "ARCHIVED"}
                    >
                      Draf (Draft)
                    </SelectItem>
                    <SelectItem value="PUBLISHED">Tayang (Published)</SelectItem>
                    {isEditing && (
                      <SelectItem value="ARCHIVED">Arsip (Archived)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hist-title" className="block text-xs font-medium">
                Judul Peristiwa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hist-title"
                placeholder="Contoh: Lahirnya PIKI di Jakarta"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="hist-desc" className="block text-xs font-medium">
                  Ringkasan Kartu Linimasa <span className="text-destructive">*</span>
                </Label>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {desc.length} karakter
                </span>
              </div>
              <Textarea
                id="hist-desc"
                rows={3}
                placeholder="Deskripsi singkat yang tampil langsung pada kartu linimasa..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="leading-relaxed"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hist-narrative" className="block text-xs font-medium">
                Narasi Sejarah Mendalam (Opsional)
              </Label>
              <Textarea
                id="hist-narrative"
                rows={4}
                placeholder="Teks uraian detail peristiwa untuk arsip sejarah organisasi..."
                value={fullNarrative}
                onChange={(e) => setFullNarrative(e.target.value)}
                className="leading-relaxed"
              />
            </div>
          </div>

          {/* Kolom Kanan (5 col): Media, Preset, & Metadata Wilayah */}
          <div className="space-y-4 rounded-xl border border-border/70 bg-muted/25 p-4 lg:col-span-5">
            <div className="space-y-2.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <ImageIcon className="size-3.5 text-primary" aria-hidden="true" />
                <span>Foto Dokumentasi / Footage</span>
              </Label>

              <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border/70 bg-muted shadow-xs">
                {image ? (
                  <Image
                    src={image}
                    alt="Pratinjau footage sejarah"
                    fill
                    sizes="360px"
                    unoptimized={
                      image.startsWith("data:") || image.startsWith("blob:")
                    }
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1.5 p-3 text-center text-muted-foreground/60">
                    <ImageIcon className="size-8 opacity-40" aria-hidden="true" />
                    <span className="text-xs">Belum ada foto</span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/75 text-xs font-medium text-foreground backdrop-blur-xs">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Memproses foto...</span>
                  </div>
                )}
              </div>

              {/* Preset Cepat + Upload */}
              <div className="flex flex-wrap items-center gap-1.5">
                {FOOTAGE_PRESETS.map((preset) => {
                  const isActive = image === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setImage(preset.value)}
                      className={cn(
                        "cursor-pointer rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                        isActive
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-auto h-7 cursor-pointer px-2.5 text-xs"
                >
                  <ImagePlus className="mr-1.5 size-3.5" />
                  Unggah
                </Button>

                {image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={isUploading}
                    onClick={() => setImage("")}
                    aria-label="Hapus gambar"
                    title="Hapus gambar"
                    className="size-7 cursor-pointer text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="footage-url"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Tautan Gambar Eksternal (opsional)
                </Label>
                <Input
                  id="footage-url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://... atau tempel URL gambar"
                  disabled={isUploading}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-border/60 pt-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="hist-loc"
                  className="flex items-center gap-1.5 text-xs font-medium"
                >
                  <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span>Lokasi Peristiwa</span>
                </Label>
                <Input
                  id="hist-loc"
                  placeholder="Gedung Perintis Kemerdekaan, Jakarta"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="hist-fig"
                  className="flex items-center gap-1.5 text-xs font-medium"
                >
                  <User className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span>Tokoh / Fungsionaris</span>
                </Label>
                <Input
                  id="hist-fig"
                  placeholder="Presidium DPP PIKI 1963"
                  value={keyFigure}
                  onChange={(e) => setKeyFigure(e.target.value)}
                />
              </div>

              {canSelectCabang && (
                <div className="space-y-1.5">
                  <Label htmlFor="hist-cabang" className="block text-xs font-medium">
                    Wilayah / Cabang Pemilik
                  </Label>
                  <SearchableSelect
                    id="hist-cabang"
                    value={cabangUuid ?? "__PUSAT__"}
                    onValueChange={(val) =>
                      setCabangUuid(val === "__PUSAT__" ? null : val)
                    }
                    options={cabangSelectOptions}
                    placeholder="Pilih wilayah pemilik..."
                    searchPlaceholder="Cari wilayah / cabang..."
                    emptyMessage="Wilayah tidak ditemukan."
                    triggerClassName="h-9 rounded-sm px-3 dark:bg-input/30 dark:hover:bg-input/50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 border-t border-border/70 bg-muted/20 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || isUploading}
          className="cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Save className="mr-1.5 size-3.5" />
          )}
          {isSubmitting
            ? "Menyimpan..."
            : isEditing
              ? "Simpan Perubahan"
              : "Simpan Sejarah"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function HistoryEditorDialog({
  open,
  onOpenChange,
  event,
  canSelectCabang = false,
  cabangOptions = [],
  onSave,
  onUploadPhoto,
}: HistoryEditorDialogProps) {
  const isEditing = Boolean(event);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-xl p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-border/70 bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <History className="size-4" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                {isEditing ? "Edit Tonggak Sejarah" : "Tambah Sejarah Baru"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Peristiwa sejarah akan tampil pada linimasa interaktif beranda
                publik PIKI.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <HistoryForm
            key={event ? event.id : "new-event"}
            event={event}
            canSelectCabang={canSelectCabang}
            cabangOptions={cabangOptions}
            onOpenChange={onOpenChange}
            onSave={onSave}
            onUploadPhoto={onUploadPhoto}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
