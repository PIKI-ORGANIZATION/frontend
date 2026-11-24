"use client";

import React, { useMemo, useState } from "react";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FaqApiItem,
  FaqFormValues,
  FaqKategori,
  FAQ_KATEGORI_OPTIONS,
} from "@/features/faq/types";
import { HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FaqEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: FaqApiItem | null;
  canSelectCabang: boolean;
  cabangOptions: { uuid: string; namaCabang: string }[];
  isSubmitting: boolean;
  onSave: (values: FaqFormValues) => Promise<void>;
}

function FaqEditorForm({
  editingItem,
  canSelectCabang,
  cabangOptions,
  isSubmitting,
  onSave,
  onCancel,
}: {
  editingItem: FaqApiItem | null;
  canSelectCabang: boolean;
  cabangOptions: { uuid: string; namaCabang: string }[];
  isSubmitting: boolean;
  onSave: (values: FaqFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [pertanyaan, setPertanyaan] = useState(editingItem?.pertanyaan || "");
  const [jawaban, setJawaban] = useState(editingItem?.jawaban || "");
  const [kategori, setKategori] = useState<FaqKategori>(
    editingItem?.kategori || "UMUM",
  );
  const [urutan, setUrutan] = useState(String(editingItem?.urutan ?? 1));
  const [isPublish, setIsPublish] = useState<boolean>(
    editingItem?.isPublish ?? true,
  );
  const [cabangUuid, setCabangUuid] = useState<string>(
    editingItem?.cabangUuid || "__PUSAT__",
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pertanyaan.trim()) {
      toast.error("Pertanyaan wajib diisi");
      return;
    }
    if (!jawaban.trim()) {
      toast.error("Jawaban wajib diisi");
      return;
    }

    const parsedUrutan = Number(urutan);

    await onSave({
      pertanyaan: pertanyaan.trim(),
      jawaban: jawaban.trim(),
      kategori,
      urutan: Number.isInteger(parsedUrutan) ? parsedUrutan : 1,
      isPublish,
      statusFAQ: editingItem?.statusFAQ || "ACTIVE",
      ...(canSelectCabang
        ? { cabangUuid: cabangUuid === "__PUSAT__" ? null : cabangUuid }
        : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="faq-pertanyaan">
          Pertanyaan <span className="text-destructive">*</span>
        </Label>
        <Input
          id="faq-pertanyaan"
          value={pertanyaan}
          onChange={(e) => setPertanyaan(e.target.value)}
          placeholder="Contoh: Bagaimana cara mendaftar KTA PIKI?"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="faq-jawaban">
          Jawaban <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="faq-jawaban"
          rows={4}
          value={jawaban}
          onChange={(e) => setJawaban(e.target.value)}
          placeholder="Tuliskan penjelasan lengkap dan mudah dipahami..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="faq-kategori">Kategori</Label>
          <Select
            value={kategori}
            onValueChange={(val) => {
              if (val) setKategori(val as FaqKategori);
            }}
          >
            <SelectTrigger id="faq-kategori">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {FAQ_KATEGORI_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="faq-urutan">Urutan Tampil</Label>
          <Input
            id="faq-urutan"
            type="number"
            value={urutan}
            onChange={(e) => setUrutan(e.target.value)}
          />
        </div>
      </div>

      {canSelectCabang && (
        <div className="space-y-1.5">
          <Label htmlFor="faq-cabang">Wilayah / Cabang Pemilik</Label>
          <SearchableSelect
            id="faq-cabang"
            value={cabangUuid}
            onValueChange={setCabangUuid}
            options={cabangSelectOptions}
            placeholder="Pilih wilayah pemilik..."
            searchPlaceholder="Cari wilayah / cabang..."
            emptyMessage="Wilayah tidak ditemukan."
            triggerClassName="h-9 rounded-sm px-3 dark:bg-input/30 dark:hover:bg-input/50"
          />
        </div>
      )}

      <label
        htmlFor="faq-publish"
        className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/20 p-3 cursor-pointer"
      >
        <input
          id="faq-publish"
          type="checkbox"
          checked={isPublish}
          onChange={(e) => setIsPublish(e.target.checked)}
          className="mt-0.5 size-4 rounded accent-primary"
        />
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-foreground block">
            Tayangkan ke Halaman Publik
          </span>
          <span className="text-xs text-muted-foreground block">
            Jika dicentang, FAQ akan tampil di halaman /faq dan section FAQ beranda.
          </span>
        </div>
      </label>

      <DialogFooter className="pt-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {editingItem ? "Simpan Perubahan" : "Tambah FAQ"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function FaqEditorDialog({
  open,
  onOpenChange,
  editingItem,
  canSelectCabang,
  cabangOptions,
  isSubmitting,
  onSave,
}: FaqEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span>{editingItem ? "Edit FAQ" : "Tambah FAQ Baru"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Kelola daftar pertanyaan dan jawaban resmi sesuai cakupan wilayah Anda.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <FaqEditorForm
            key={editingItem?.uuid || "new-faq"}
            editingItem={editingItem}
            canSelectCabang={canSelectCabang}
            cabangOptions={cabangOptions}
            isSubmitting={isSubmitting}
            onSave={async (values) => {
              await onSave(values);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
