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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function DpdFormInner({
  dpd,
  masterProvinsi,
  existingDpdCodes,
  onSave,
  onCancel,
  isSubmitting,
}: DpdFormInnerProps) {
  const isEditing = Boolean(dpd);

  const [kodeProvinsi, setKodeProvinsi] = useState<string>(dpd?.kodeProvinsi || "");
  const [pengurus, setPengurus] = useState<string>(dpd?.pengurus || "");
  const [noHandphone, setNoHandphone] = useState<string>(dpd?.noHandphone || "");
  const [keterangan, setKeterangan] = useState<string>(dpd?.keterangan || "Definitif");
  const [penerbitanSk, setPenerbitanSk] = useState<string>(dpd?.penerbitanSk || "");

  // Filter provinsi yang belum memiliki DPD jika dalam mode Tambah
  const availableProvinsi = masterProvinsi.filter(
    (p) => !existingDpdCodes.has(p.kode_provinsi) || (isEditing && p.kode_provinsi === dpd?.kodeProvinsi),
  );

  const provinsiOptions = useMemo(() => {
    return availableProvinsi.map((p) => ({
      value: p.kode_provinsi,
      label: p.nama_provinsi,
      subLabel: p.kode_provinsi,
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
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* 1. Pilih Provinsi */}
      <div className="space-y-1.5">
        <Label htmlFor="provinsi" className="text-xs font-semibold">
          Provinsi (DPD) <span className="text-red-500">*</span>
        </Label>
        {isEditing ? (
          <Input
            value={`${dpd?.dpd} (${dpd?.kodeProvinsi})`}
            disabled
            className="bg-muted text-muted-foreground text-xs"
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
      <div className="space-y-1.5">
        <Label htmlFor="pengurus" className="text-xs font-semibold">
          Ketua / Penanggung Jawab
        </Label>
        <Input
          id="pengurus"
          placeholder="Contoh: Pdt. Dr. Nama Lengkap, M.Th"
          value={pengurus}
          onChange={(e) => setPengurus(e.target.value)}
          className="text-xs"
        />
      </div>

      {/* 3. Kontak WhatsApp / Telepon */}
      <div className="space-y-1.5">
        <Label htmlFor="noHandphone" className="text-xs font-semibold">
          No. Handphone / WhatsApp
        </Label>
        <Input
          id="noHandphone"
          placeholder="Contoh: 08123456789"
          value={noHandphone}
          onChange={(e) => setNoHandphone(e.target.value)}
          className="text-xs"
        />
      </div>

      {/* 4. Status Kepengurusan (Keterangan) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="keterangan" className="text-xs font-semibold">
            Status Kepengurusan
          </Label>
          <Select
            value={keterangan}
            onValueChange={(val) => val && setKeterangan(val)}
          >
            <SelectTrigger id="keterangan" className="text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Definitif" className="text-xs">Definitif</SelectItem>
              <SelectItem value="Caretaker" className="text-xs">Caretaker</SelectItem>
              <SelectItem value="Mandataris" className="text-xs">Mandataris</SelectItem>
              <SelectItem value="Formatur" className="text-xs">Formatur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 5. Nomor / SK Penerbitan */}
        <div className="space-y-1.5">
          <Label htmlFor="penerbitanSk" className="text-xs font-semibold">
            Nomor SK
          </Label>
          <Input
            id="penerbitanSk"
            placeholder="SK-001/DPP/2024"
            value={penerbitanSk}
            onChange={(e) => setPenerbitanSk(e.target.value)}
            className="text-xs"
          />
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !kodeProvinsi}
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
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
  const isEditing = Boolean(dpd);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit DPD ${dpd?.dpd || ""}` : "Tambah DPD Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui informasi pengurus, kontak, dan SK DPD."
              : "Pilih provinsi untuk membentuk Dewan Pimpinan Daerah (DPD) baru."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <DpdFormInner
            key={dpd ? dpd.id : "new-dpd"}
            dpd={dpd}
            masterProvinsi={masterProvinsi}
            existingDpdCodes={existingDpdCodes}
            onSave={async (vals) => {
              await onSave(vals);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
