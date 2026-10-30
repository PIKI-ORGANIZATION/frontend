"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  PengurusItem,
  PengurusFormValues,
  KategoriPengurus,
  StatusPublikasi,
} from "@/features/pengurus/types";
import {
  Check,
  ChevronDown,
  Upload,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PengurusEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PengurusItem | null;
  onSave: (data: PengurusFormValues) => void;
}

const KATEGORI_OPTIONS: { value: KategoriPengurus; label: string }[] = [
  { value: "INTI", label: "Pimpinan Inti DPP (Landing Page & Utama)" },
  { value: "BIDANG", label: "Dewan Pengurus & Bidang Departemen" },
  { value: "PENASEHAT", label: "Dewan Penasehat & Dewan Pakar" },
];

const STATUS_OPTIONS: { value: StatusPublikasi; label: string }[] = [
  { value: "PUBLISHED", label: "Tayang Publik (Published)" },
  { value: "DRAFT", label: "Draf Internal (Draft)" },
];

const PRESET_FOOTAGE = [
  { label: "Ketum (Maruarar)", value: "/footage/pimpinan/ketum.jpg" },
  { label: "Sekjen (Benyamin)", value: "/footage/pimpinan/sekjen.png" },
  { label: "Bendum (Juniver)", value: "/footage/pimpinan/bendahara.jpg" },
  { label: "Footage 1", value: "/footage/image1.webp" },
  { label: "Footage 2", value: "/footage/image2.jpeg" },
  { label: "Footage 3", value: "/footage/image3.jpg" },
];

function getInitialFormValues(initialData?: PengurusItem | null): PengurusFormValues {
  if (initialData) {
    return {
      nama: initialData.nama,
      jabatan: initialData.jabatan,
      kategori: initialData.kategori,
      bidang: initialData.bidang || "",
      deskripsi: initialData.deskripsi,
      foto: initialData.foto,
      urutan: initialData.urutan,
      periode: initialData.periode,
      status: initialData.status,
      email: initialData.email || "",
      linkedin: initialData.linkedin || "",
    };
  }
  return {
    nama: "",
    jabatan: "",
    kategori: "INTI",
    bidang: "Dewan Pimpinan Pusat",
    deskripsi: "",
    foto: "/footage/pimpinan/ketum.jpg",
    urutan: 1,
    periode: "2020 - 2025",
    status: "PUBLISHED",
    email: "",
    linkedin: "",
  };
}

function getInitialImageMode(foto: string): "preset" | "url" | "upload" {
  if (foto?.startsWith("data:") || foto?.startsWith("blob:")) {
    return "upload";
  }
  if (foto?.startsWith("http")) {
    return "url";
  }
  return "preset";
}

interface PengurusEditorFormProps {
  initialData?: PengurusItem | null;
  onSave: (data: PengurusFormValues) => void;
  onClose: () => void;
}

function PengurusEditorForm({
  initialData,
  onSave,
  onClose,
}: PengurusEditorFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formValues, setFormValues] = useState<PengurusFormValues>(() =>
    getInitialFormValues(initialData),
  );
  const [imageSourceMode, setImageSourceMode] = useState<
    "preset" | "url" | "upload"
  >(() => getInitialImageMode(formValues.foto));

  const [openKategori, setOpenKategori] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format berkas tidak valid", {
        description: "Harap unggah berkas gambar (JPG, PNG, WebP).",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar terlalu besar", {
        description: "Maksimal ukuran berkas adalah 2MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormValues((prev) => ({ ...prev, foto: result }));
      toast.success("Foto berhasil diunggah!");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.nama.trim()) {
      toast.error("Nama pengurus wajib diisi");
      return;
    }
    if (!formValues.jabatan.trim()) {
      toast.error("Jabatan pengurus wajib diisi");
      return;
    }
    if (!formValues.foto.trim()) {
      toast.error("Foto pengurus wajib disertakan");
      return;
    }

    onSave(formValues);
    onClose();
  };

  const currentKategoriLabel =
    KATEGORI_OPTIONS.find((opt) => opt.value === formValues.kategori)?.label ||
    "Pilih Kategori...";

  const currentStatusLabel =
    STATUS_OPTIONS.find((opt) => opt.value === formValues.status)?.label ||
    "Pilih Status...";

  const isDataOrBlob =
    formValues.foto.startsWith("data:") || formValues.foto.startsWith("blob:");

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-3">
      {/* Row 1: Nama Lengkap & Jabatan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nama" className="text-xs font-semibold">
            Nama Lengkap & Gelar <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nama"
            placeholder="Contoh: Maruarar Sirait, S.I.P."
            value={formValues.nama}
            onChange={(e) =>
              setFormValues({ ...formValues, nama: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="jabatan" className="text-xs font-semibold">
            Jabatan Kepengurusan <span className="text-destructive">*</span>
          </Label>
          <Input
            id="jabatan"
            placeholder="Contoh: Ketua Umum / Ketua Bidang Hukum"
            value={formValues.jabatan}
            onChange={(e) =>
              setFormValues({ ...formValues, jabatan: e.target.value })
            }
            required
          />
        </div>
      </div>

      {/* Row 2: Kategori (Popover) & Bidang / Departemen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Kategori Kepengurusan <span className="text-destructive">*</span>
          </Label>
          <Popover open={openKategori} onOpenChange={setOpenKategori}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={openKategori}
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate">{currentKategoriLabel}</span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              }
            />
            <PopoverContent className="w-80 p-1" align="start">
              <div className="flex flex-col gap-0.5">
                {KATEGORI_OPTIONS.map((option) => {
                  const isSelected = formValues.kategori === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFormValues({
                          ...formValues,
                          kategori: option.value,
                          bidang:
                            option.value === "INTI" && !formValues.bidang
                              ? "Dewan Pimpinan Pusat"
                              : formValues.bidang,
                        });
                        setOpenKategori(false);
                      }}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-xs rounded-sm transition-colors text-left cursor-pointer",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-foreground",
                      )}
                    >
                      <span className="pr-2">{option.label}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bidang" className="text-xs font-semibold">
            Departemen / Komisi / Bidang
          </Label>
          <Input
            id="bidang"
            placeholder="Contoh: Bidang Hukum & HAM"
            value={formValues.bidang}
            onChange={(e) =>
              setFormValues({ ...formValues, bidang: e.target.value })
            }
          />
        </div>
      </div>

      {/* Row 3: Periode Masa Bakti, Urutan Tampil & Status Publikasi (Popover) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="periode" className="text-xs font-semibold">
            Periode Masa Bakti
          </Label>
          <Input
            id="periode"
            placeholder="2020 - 2025"
            value={formValues.periode}
            onChange={(e) =>
              setFormValues({ ...formValues, periode: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="urutan" className="text-xs font-semibold">
            Urutan Tampil (Order)
          </Label>
          <Input
            id="urutan"
            type="number"
            min={1}
            value={formValues.urutan}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                urutan: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Status Publikasi <span className="text-destructive">*</span>
          </Label>
          <Popover open={openStatus} onOpenChange={setOpenStatus}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={openStatus}
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate">{currentStatusLabel}</span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              }
            />
            <PopoverContent className="w-64 p-1" align="start">
              <div className="flex flex-col gap-0.5">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = formValues.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFormValues({
                          ...formValues,
                          status: option.value,
                        });
                        setOpenStatus(false);
                      }}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-xs rounded-sm transition-colors text-left cursor-pointer",
                        isSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-foreground",
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Row 4: Deskripsi Tugas / Ringkasan Peran */}
      <div className="space-y-1.5">
        <Label htmlFor="deskripsi" className="text-xs font-semibold">
          Ringkasan Peran & Uraian Tugas
        </Label>
        <Textarea
          id="deskripsi"
          rows={3}
          placeholder="Deskripsi singkat mengenai peran dan tanggung jawab jabatan ini..."
          value={formValues.deskripsi}
          onChange={(e) =>
            setFormValues({ ...formValues, deskripsi: e.target.value })
          }
        />
      </div>

      {/* Row 5: Foto Pengurus (Preset, Link, Upload) */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">
            Foto Pengurus <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-sm">
            <button
              type="button"
              onClick={() => setImageSourceMode("preset")}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors cursor-pointer",
                imageSourceMode === "preset"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Preset Pimpinan
            </button>
            <button
              type="button"
              onClick={() => setImageSourceMode("url")}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors cursor-pointer",
                imageSourceMode === "url"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              URL Link
            </button>
            <button
              type="button"
              onClick={() => setImageSourceMode("upload")}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors cursor-pointer",
                imageSourceMode === "upload"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Unggah Berkas
            </button>
          </div>
        </div>

        {/* Input according to mode */}
        {imageSourceMode === "preset" && (
          <div className="flex flex-wrap gap-2 pt-1">
            {PRESET_FOOTAGE.map((preset) => {
              const isActive = formValues.foto === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() =>
                    setFormValues({ ...formValues, foto: preset.value })
                  }
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-sm border transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 border-border text-foreground hover:bg-muted/70",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}

        {imageSourceMode === "url" && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://example.com/foto-pengurus.jpg"
                value={formValues.foto}
                onChange={(e) =>
                  setFormValues({ ...formValues, foto: e.target.value })
                }
                className="pl-9"
              />
            </div>
          </div>
        )}

        {imageSourceMode === "upload" && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-11 border-dashed cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Pilih Foto dari Komputer (Maks. 2MB)
            </Button>
          </div>
        )}

        {/* Photo Preview Box */}
        {formValues.foto && (
          <div className="flex items-center gap-3 p-2.5 rounded-sm border border-border bg-muted/20">
            <div className="relative w-12 h-16 rounded-sm overflow-hidden bg-muted shrink-0">
              <Image
                src={formValues.foto}
                alt="Pratinjau Foto"
                fill
                unoptimized={isDataOrBlob}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {formValues.foto}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Format potret 3:4 optimal untuk profil publik.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFormValues({ ...formValues, foto: "" })}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Row 6: Kontak Tambahan (Email & LinkedIn) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            Alamat Email Resmi (Opsional)
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@piki.or.id"
            value={formValues.email}
            onChange={(e) =>
              setFormValues({ ...formValues, email: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="linkedin" className="text-xs font-semibold">
            Tautan Profil LinkedIn (Opsional)
          </Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/nama"
            value={formValues.linkedin}
            onChange={(e) =>
              setFormValues({ ...formValues, linkedin: e.target.value })
            }
          />
        </div>
      </div>

      <DialogFooter className="pt-4 border-t border-border/60 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Batal
        </Button>
        <Button type="submit">
          {initialData ? "Simpan Perubahan" : "Tambah Pengurus"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PengurusEditorDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: PengurusEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-sm">
        <DialogHeader className="pb-3 border-b border-border/60">
          <DialogTitle className="text-lg font-bold tracking-tight">
            {initialData ? "Ubah Data Pengurus" : "Tambah Pengurus Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lengkapi informasi kepengurusan untuk tampil di Landing Page dan
            halaman profil organisasi.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <PengurusEditorForm
            key={initialData?.id || "new"}
            initialData={initialData}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
