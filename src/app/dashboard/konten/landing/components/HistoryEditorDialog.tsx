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
import { Calendar, Image as ImageIcon, MapPin, User, Hash } from "lucide-react";

interface HistoryEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: HistoryEvent | null;
  onSave: (data: HistoryEvent) => void;
}

const FOOTAGE_OPTIONS = [
  { label: "Footage 1 (Dokumentasi Perintis)", value: "/footage/image1.webp" },
  { label: "Footage 2 (Konsolidasi & Sidang)", value: "/footage/image2.jpeg" },
  { label: "Footage 3 (Aksi Kebangsaan)", value: "/footage/image3.jpg" },
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
  const [fullNarrative, setFullNarrative] = useState(event?.fullNarrative || "");
  const [image, setImage] = useState(event?.image || FOOTAGE_OPTIONS[0].value);
  const [location, setLocation] = useState(event?.location || "");
  const [keyFigure, setKeyFigure] = useState(event?.keyFigure || "");
  const [order, setOrder] = useState<number>(event?.order || 1);
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">(
    event?.status || "PUBLISHED"
  );

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
      image,
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
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Baris 1: Tahun & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="hist-year" className="text-xs md:text-sm font-medium flex items-center gap-1.5 mb-1.5">
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
          <Label htmlFor="hist-order" className="text-xs md:text-sm font-medium flex items-center gap-1.5 mb-1.5">
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
          <Label htmlFor="hist-status" className="text-xs md:text-sm font-medium mb-1.5 block">
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

      {/* Baris 2: Judul Peristiwa */}
      <div>
        <Label htmlFor="hist-title" className="text-xs md:text-sm font-medium mb-1.5 block">
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

      {/* Baris 3: Ringkasan Kartu */}
      <div>
        <Label htmlFor="hist-desc" className="text-xs md:text-sm font-medium mb-1.5 block">
          Ringkasan Kartu Linimasa <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="hist-desc"
          rows={2}
          placeholder="Deskripsi singkat yang tampil langsung pada kartu horizontal linimasa..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="leading-relaxed"
          required
        />
      </div>

      {/* Baris 4: Narasi Lengkap (Opsional) */}
      <div>
        <Label htmlFor="hist-narrative" className="text-xs md:text-sm font-medium mb-1.5 block">
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

      {/* Baris 5: Lokasi & Tokoh Kunci */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="hist-loc" className="text-xs md:text-sm font-medium flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            Lokasi Peristiwa
          </Label>
          <Input
            id="hist-loc"
            placeholder="Contoh: Gedung Perintis, Jakarta"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="hist-fig" className="text-xs md:text-sm font-medium flex items-center gap-1.5 mb-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            Tokoh / Fungsionaris
          </Label>
          <Input
            id="hist-fig"
            placeholder="Contoh: Presidium DPP PIKI"
            value={keyFigure}
            onChange={(e) => setKeyFigure(e.target.value)}
          />
        </div>
      </div>

      {/* Baris 6: Pilihan Gambar Footage */}
      <div>
        <Label className="text-xs md:text-sm font-medium flex items-center gap-1.5 mb-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
          Foto Dokumentasi / Footage
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {FOOTAGE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setImage(opt.value)}
              className={`p-2 rounded-lg border text-left transition-all cursor-pointer text-xs flex flex-col gap-1.5 ${
                image === opt.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary font-medium text-foreground"
                  : "border-border/70 hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <div className="w-full h-14 rounded-md overflow-hidden bg-muted relative">
                <Image
                  src={opt.value}
                  alt={opt.label}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <span className="text-[11px] leading-tight truncate w-full">
                {opt.label.split("(")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <DialogFooter className="pt-3 gap-2 border-t border-border/70">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
        >
          Batal
        </Button>
        <Button type="submit" size="sm">
          {isEditing ? "Perbarui Data" : "Simpan Peristiwa"}
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEditing ? "Edit Tonggak Sejarah" : "Tambah Tonggak Sejarah Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Peristiwa sejarah yang ditambahkan akan tampil pada linimasa interaktif beranda publik.
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
