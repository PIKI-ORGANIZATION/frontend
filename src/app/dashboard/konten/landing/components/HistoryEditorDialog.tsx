"use client";

import React, { useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HistoryEvent } from "../types";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: HistoryEvent | null;
  onSave: (data: HistoryEvent) => void;
}

const FOOTAGE_PRESETS = [
  { label: "Footage 1 (Perintis)", value: "/footage/image1.webp" },
  { label: "Footage 2 (Konsolidasi)", value: "/footage/image2.jpeg" },
  { label: "Footage 3 (Aksi)", value: "/footage/image3.jpg" },
];

function HistoryForm({
  event,
  onOpenChange,
  onSave,
}: {
  event?: HistoryEvent | null;
  onOpenChange: (open: boolean) => void;
  onSave: (data: HistoryEvent) => void;
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
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">(
    event?.status || "PUBLISHED",
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          }
        } catch {}
      }

      // Fallback base64 data URL untuk dummy/offline preview
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
    } catch {
      toast.error("Gagal memproses berkas foto.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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
      createdAt: event?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(payload);
    onOpenChange(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-4">
      {/* 1. Baris Data Pokok: Tahun, Urutan, dan Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label
            htmlFor="hist-year"
            className="text-xs md:text-sm font-medium flex items-center gap-1.5 mb-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            Tahun <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hist-year"
            placeholder="Contoh: 1963"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            maxLength={9}
            required
          />
        </div>

        <div>
          <Label
            htmlFor="hist-order"
            className="text-xs md:text-sm font-medium flex items-center gap-1.5 mb-1.5"
          >
            <Hash className="w-3.5 h-3.5 text-muted-foreground" />
            Urutan Tampil
          </Label>
          <Input
            id="hist-order"
            type="number"
            min={1}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>

        <div>
          <Label
            htmlFor="hist-status"
            className="text-xs md:text-sm font-medium mb-1.5 block"
          >
            Status Publikasi
          </Label>
          <Select
            value={status}
            onValueChange={(val) => {
              if (val) setStatus(val as "PUBLISHED" | "DRAFT");
            }}
          >
            <SelectTrigger id="hist-status">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLISHED">Tayang (Published)</SelectItem>
              <SelectItem value="DRAFT">Draf (Draft)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Judul Peristiwa */}
      <div>
        <Label
          htmlFor="hist-title"
          className="text-xs md:text-sm font-medium mb-1.5 block"
        >
          Judul Peristiwa <span className="text-red-500">*</span>
        </Label>
        <Input
          id="hist-title"
          placeholder="Contoh: Lahirnya PIKI di Jakarta"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* 3. Ringkasan Kartu Linimasa */}
      <div>
        <Label
          htmlFor="hist-desc"
          className="text-xs md:text-sm font-medium mb-1.5 block"
        >
          Ringkasan Kartu Linimasa <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="hist-desc"
          rows={3}
          placeholder="Deskripsi singkat yang tampil langsung pada kartu horizontal linimasa..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="leading-relaxed"
          required
        />
      </div>

      {/* 4. Narasi Sejarah Mendalam (Opsional) */}
      <div>
        <Label
          htmlFor="hist-narrative"
          className="text-xs md:text-sm font-medium mb-1.5 block"
        >
          Narasi Sejarah Mendalam (Opsional)
        </Label>
        <Textarea
          id="hist-narrative"
          rows={3}
          placeholder="Teks uraian detail peristiwa untuk arsip sejarah organisasi..."
          value={fullNarrative}
          onChange={(e) => setFullNarrative(e.target.value)}
          className="leading-relaxed"
        />
      </div>

      {/* 5. Lokasi & Tokoh Kunci */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="hist-loc"
            className="text-xs md:text-sm font-medium flex items-center gap-1.5 mb-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            Lokasi Peristiwa
          </Label>
          <Input
            id="hist-loc"
            placeholder="Contoh: Gedung Perintis Kemerdekaan, Jakarta"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <Label
            htmlFor="hist-fig"
            className="text-xs md:text-sm font-medium flex items-center gap-1.5 mb-1.5"
          >
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            Tokoh / Fungsionaris
          </Label>
          <Input
            id="hist-fig"
            placeholder="Contoh: Presidium DPP PIKI 1963"
            value={keyFigure}
            onChange={(e) => setKeyFigure(e.target.value)}
          />
        </div>
      </div>

      {/* 6. Foto Dokumentasi / Footage (Bisa via Link & Upload, Layout Clean) */}
      <div className="space-y-2">
        <Label className="text-xs md:text-sm font-medium flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
          Foto Dokumentasi / Footage
        </Label>

        <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-4 items-start">
          {/* Box Preview Foto */}
          <div className="relative aspect-[4/3] w-full rounded-sm bg-muted overflow-hidden border border-border/70 group shadow-xs">
            {image ? (
              <Image
                src={image}
                alt="Pratinjau footage sejarah"
                fill
                sizes="240px"
                unoptimized={
                  image.startsWith("data:") || image.startsWith("blob:")
                }
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60 gap-1.5 p-3 text-center">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="text-xs">Belum ada foto</span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center gap-2 text-xs font-medium text-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Memproses foto...</span>
              </div>
            )}
          </div>

          {/* Input URL & Aksi Upload */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="space-y-1">
              <Label
                htmlFor="footage-url"
                className="text-xs font-medium text-muted-foreground"
              >
                Tautan Gambar Eksternal
              </Label>
              <Input
                id="footage-url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://... atau tempel URL gambar"
                disabled={isUploading}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-3.5 h-3.5 mr-1.5" />
                Unggah Foto
              </Button>

              {image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => setImage("")}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Hapus
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

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Mendukung berkas JPG, PNG, WebP, GIF (maks. 5 MB) atau URL gambar
              eksternal.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4 gap-2 border-t border-border/70">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
        >
          Batal
        </Button>
        <Button type="submit" size="sm">
          {isEditing ? "Perbarui Data" : "Simpan "}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function HistoryEditorDialog({
  open,
  onOpenChange,
  event,
  onSave,
}: HistoryEditorDialogProps) {
  const isEditing = Boolean(event);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-sm p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditing ? "Edit Sejarah" : "Tambah Sejarah Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-muted-foreground mt-1">
            Peristiwa sejarah yang ditambahkan akan tampil pada linimasa
            interaktif beranda publik.
          </DialogDescription>
        </DialogHeader>

        <HistoryForm
          key={event ? event.id : "new-event"}
          event={event}
          onOpenChange={onOpenChange}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  );
}
