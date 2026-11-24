"use client";

import React, { useState } from "react";
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
import {
  PeriodeKepengurusanItem,
  PeriodeFormValues,
} from "@/features/pengurus/types";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PeriodeEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPeriode: PeriodeKepengurusanItem | null;
  canSelectCabang: boolean;
  cabangOptions: { uuid: string; namaCabang: string }[];
  isSubmitting: boolean;
  onSave: (values: PeriodeFormValues) => Promise<void>;
}

function PeriodeEditorForm({
  editingPeriode,
  canSelectCabang,
  cabangOptions,
  isSubmitting,
  onSave,
  onCancel,
}: {
  editingPeriode: PeriodeKepengurusanItem | null;
  canSelectCabang: boolean;
  cabangOptions: { uuid: string; namaCabang: string }[];
  isSubmitting: boolean;
  onSave: (values: PeriodeFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const currentYear = new Date().getFullYear();
  const [namaPeriode, setNamaPeriode] = useState(
    editingPeriode?.namaPeriode || `Masa Bakti ${currentYear}-${currentYear + 5}`,
  );
  const [tahunMulai, setTahunMulai] = useState(
    String(editingPeriode?.tahunMulai ?? currentYear),
  );
  const [tahunSelesai, setTahunSelesai] = useState(
    String(editingPeriode?.tahunSelesai ?? currentYear + 5),
  );
  const [isAktif, setIsAktif] = useState<boolean>(
    editingPeriode?.isAktif ?? true,
  );
  const [cabangUuid, setCabangUuid] = useState<string>(
    editingPeriode?.cabangUuid || "__PUSAT__",
  );

  const selectCabangOptions = [
    { value: "__PUSAT__", label: "Pusat / Nasional (DPP)" },
    ...cabangOptions.map((c) => ({
      value: c.uuid,
      label: c.namaCabang,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (namaPeriode.trim().length < 3) {
      toast.error("Nama periode minimal 3 karakter");
      return;
    }
    const mulai = Number(tahunMulai);
    const selesai = Number(tahunSelesai);
    if (!Number.isInteger(mulai) || !Number.isInteger(selesai) || selesai < mulai) {
      toast.error("Tahun selesai harus lebih besar atau sama dengan tahun mulai");
      return;
    }

    await onSave({
      namaPeriode: namaPeriode.trim(),
      tahunMulai: mulai,
      tahunSelesai: selesai,
      isAktif,
      ...(canSelectCabang
        ? { cabangUuid: cabangUuid === "__PUSAT__" ? null : cabangUuid }
        : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="periode-nama">
          Nama Periode <span className="text-destructive">*</span>
        </Label>
        <Input
          id="periode-nama"
          value={namaPeriode}
          onChange={(e) => setNamaPeriode(e.target.value)}
          placeholder="Contoh: Periode Bakti 2025-2030"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="periode-mulai">
            Tahun Mulai <span className="text-destructive">*</span>
          </Label>
          <Input
            id="periode-mulai"
            type="number"
            value={tahunMulai}
            onChange={(e) => setTahunMulai(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="periode-selesai">
            Tahun Selesai <span className="text-destructive">*</span>
          </Label>
          <Input
            id="periode-selesai"
            type="number"
            value={tahunSelesai}
            onChange={(e) => setTahunSelesai(e.target.value)}
            required
          />
        </div>
      </div>

      {canSelectCabang && (
        <div className="space-y-1.5">
          <Label htmlFor="periode-cabang">Wilayah / Cabang Pemilik</Label>
          <SearchableSelect
            id="periode-cabang"
            value={cabangUuid}
            onValueChange={setCabangUuid}
            options={selectCabangOptions}
            placeholder="Pilih wilayah pemilik..."
            searchPlaceholder="Cari cabang..."
          />
        </div>
      )}

      <label
        htmlFor="periode-aktif"
        className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/20 p-3 cursor-pointer"
      >
        <input
          id="periode-aktif"
          type="checkbox"
          checked={isAktif}
          onChange={(e) => setIsAktif(e.target.checked)}
          className="mt-0.5 size-4 rounded accent-primary"
        />
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-foreground block">
            Jadikan Periode Aktif
          </span>
          <span className="text-xs text-muted-foreground block">
            Mengaktifkan periode ini akan otomatis menonaktifkan periode lain di cabang yang sama.
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
          {editingPeriode ? "Simpan Perubahan" : "Tambah Periode"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PeriodeEditorDialog({
  open,
  onOpenChange,
  editingPeriode,
  canSelectCabang,
  cabangOptions,
  isSubmitting,
  onSave,
}: PeriodeEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Calendar className="w-5 h-5 text-primary" />
            <span>
              {editingPeriode
                ? `Edit Periode: ${editingPeriode.namaPeriode}`
                : "Tambah Periode Kepengurusan"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Kelola masa bakti kepengurusan organisasi per tingkat wilayah.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <PeriodeEditorForm
            key={editingPeriode?.uuid || "new-periode"}
            editingPeriode={editingPeriode}
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
