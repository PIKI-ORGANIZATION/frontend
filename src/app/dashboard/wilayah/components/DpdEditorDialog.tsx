"use client";

import React, { useState, useMemo } from "react";
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
import { Loader2 } from "lucide-react";
import { DpdItem, DpdFormValues, MasterProvinsi } from "@/features/wilayah/types";

interface DpdEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dpd: DpdItem | null;
  masterProvinsi: MasterProvinsi[];
  existingDpdCodes: Set<string>;
  onSave: (payload: DpdFormValues) => Promise<unknown>;
  isSubmitting: boolean;
}

interface DpdFormInnerProps {
  dpd: DpdItem | null;
  masterProvinsi: MasterProvinsi[];
  existingDpdCodes: Set<string>;
  onSave: (payload: DpdFormValues) => Promise<unknown>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const STATUS_KEPENGURUSAN_OPTIONS = [
  { value: "Definitif", label: "Definitif" },
  { value: "Caretaker", label: "Caretaker" },
  { value: "Mandataris", label: "Mandataris" },
  { value: "Formatur", label: "Formatur" },
];

function DpdFormInner({
  dpd,
  masterProvinsi,
  existingDpdCodes,
  onSave,
  onCancel,
  isSubmitting,
}: DpdFormInnerProps) {
  const isEditing = Boolean(dpd);

  // Filter provinsi yang belum memiliki DPD jika dalam mode Tambah, urutkan berdasarkan kode provinsi terkecil
  const availableProvinsi = useMemo(() => {
    return masterProvinsi
      .filter(
        (p) =>
          !existingDpdCodes.has(p.kode_provinsi) ||
          (isEditing && p.kode_provinsi === dpd?.kodeProvinsi),
      )
      .sort((a, b) => Number(a.kode_provinsi) - Number(b.kode_provinsi));
  }, [masterProvinsi, existingDpdCodes, isEditing, dpd?.kodeProvinsi]);

  // Default diatur berdasarkan kode provinsi terkecil
  const [kodeProvinsi, setKodeProvinsi] = useState<string>(
    dpd?.kodeProvinsi || availableProvinsi[0]?.kode_provinsi || "",
  );
  const [pengurus, setPengurus] = useState<string>(dpd?.pengurus || "");
  const [noHandphone, setNoHandphone] = useState<string>(dpd?.noHandphone || "");
  const [keterangan, setKeterangan] = useState<string>(dpd?.keterangan || "Definitif");
  const [penerbitanSk, setPenerbitanSk] = useState<string>(dpd?.penerbitanSk || "");

  // Hanya menampilkan nama provinsi (tanpa kode provinsi)
  const provinsiOptions = useMemo(() => {
    return availableProvinsi.map((p) => ({
      value: p.kode_provinsi,
      label: p.nama_provinsi,
      searchKey: p.nama_provinsi,
    }));
  }, [availableProvinsi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeProvinsi) return;

    await onSave({
      kodeProvinsi,
      pengurus: pengurus.trim(),
      noHandphone: noHandphone.trim(),
      keterangan: keterangan.trim(),
      penerbitanSk: penerbitanSk.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      {/* 1. Pilih Provinsi */}
      <div className="space-y-2">
        <Label htmlFor="provinsi" className="text-sm font-medium text-foreground">
          Provinsi (DPD) <span className="text-destructive">*</span>
        </Label>
        {isEditing ? (
          <Input
            value={`DPD ${dpd?.dpd}`}
            disabled
            className="h-10 text-sm bg-muted text-muted-foreground font-medium"
          />
        ) : (
          <SearchableSelect
            id="provinsi"
            value={kodeProvinsi}
            onValueChange={(val) => setKodeProvinsi(val)}
            options={provinsiOptions}
            placeholder="Pilih provinsi..."
            searchPlaceholder="Cari provinsi..."
            emptyMessage="Provinsi tidak ditemukan"
            disabled={isEditing}
          />
        )}
      </div>

      {/* 2. Pengurus / Ketua */}
      <div className="space-y-2">
        <Label htmlFor="pengurus" className="text-sm font-medium text-foreground">
          Ketua / Penanggung Jawab
        </Label>
        <Input
          id="pengurus"
          placeholder="Contoh: Pdt. Dr. Nama Lengkap, M.Th"
          value={pengurus}
          onChange={(e) => setPengurus(e.target.value)}
          className="h-10 text-sm"
        />
      </div>

      {/* 3. Kontak WhatsApp / Telepon */}
      <div className="space-y-2">
        <Label htmlFor="noHandphone" className="text-sm font-medium text-foreground">
          No. Handphone / WhatsApp
        </Label>
        <Input
          id="noHandphone"
          placeholder="Contoh: 08123456789"
          value={noHandphone}
          onChange={(e) => setNoHandphone(e.target.value)}
          className="h-10 text-sm"
        />
      </div>

      {/* 4. Status Kepengurusan & Nomor SK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="keterangan" className="text-sm font-medium text-foreground">
            Status Kepengurusan
          </Label>
          <SearchableSelect
            id="keterangan"
            value={keterangan}
            onValueChange={(val) => setKeterangan(val)}
            options={STATUS_KEPENGURUSAN_OPTIONS}
            placeholder="Pilih status..."
            searchPlaceholder="Cari status..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="penerbitanSk" className="text-sm font-medium text-foreground">
            Nomor SK
          </Label>
          <Input
            id="penerbitanSk"
            placeholder="SK-001/DPP/2024"
            value={penerbitanSk}
            onChange={(e) => setPenerbitanSk(e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>

      <DialogFooter className="pt-3 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 px-4 text-sm"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !kodeProvinsi}
          className="h-10 px-5 text-sm font-medium"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {isEditing ? "Simpan Perubahan" : "Tambah DPD"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DpdEditorDialog({
  open,
  onOpenChange,
  dpd,
  masterProvinsi,
  existingDpdCodes,
  onSave,
  isSubmitting,
}: DpdEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {dpd ? `Edit Data: DPD ${dpd.dpd}` : "Tambah Dewan Pimpinan Daerah (DPD)"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {dpd
              ? "Perbarui informasi pengurus, nomor SK, atau kontak DPD terkait."
              : "Daftarkan kepengurusan DPD tingkat provinsi baru dalam jaringan PIKI."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <DpdFormInner
            key={dpd?.id || "new-dpd"}
            dpd={dpd}
            masterProvinsi={masterProvinsi}
            existingDpdCodes={existingDpdCodes}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
