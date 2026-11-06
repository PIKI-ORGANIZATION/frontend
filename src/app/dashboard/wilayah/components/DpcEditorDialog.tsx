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
import { DpcItem, DpcFormValues, MasterProvinsi } from "@/features/wilayah/types";
import { useMasterKabupaten } from "@/features/wilayah/hooks/useWilayah";

interface DpcEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dpc: DpcItem | null;
  masterProvinsi: MasterProvinsi[];
  existingDpcCodes: Set<string>;
  onSave: (payload: DpcFormValues) => Promise<unknown>;
  isSubmitting: boolean;
}

interface DpcFormInnerProps {
  dpc: DpcItem | null;
  masterProvinsi: MasterProvinsi[];
  existingDpcCodes: Set<string>;
  onSave: (payload: DpcFormValues) => Promise<unknown>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const STATUS_KEPENGURUSAN_OPTIONS = [
  { value: "Definitif", label: "Definitif" },
  { value: "Caretaker", label: "Caretaker" },
  { value: "Mandataris", label: "Mandataris" },
  { value: "Formatur", label: "Formatur" },
];

function DpcFormInner({
  dpc,
  masterProvinsi,
  existingDpcCodes,
  onSave,
  onCancel,
  isSubmitting,
}: DpcFormInnerProps) {
  const isEditing = Boolean(dpc);

  // Urutkan provinsi berdasarkan kode terkecil
  const sortedProvinsi = useMemo(() => {
    return [...masterProvinsi].sort(
      (a, b) => Number(a.kode_provinsi) - Number(b.kode_provinsi)
    );
  }, [masterProvinsi]);

  // Default provinsi diatur berdasarkan kode provinsi terkecil
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>(
    dpc?.kode_provinsi || sortedProvinsi[0]?.kode_provinsi || "",
  );
  const [kodeKabupaten, setKodeKabupaten] = useState<string>(
    dpc?.kode_kabupaten || "",
  );
  const [pengurus, setPengurus] = useState<string>(dpc?.pengurus || "");
  const [noHandphone, setNoHandphone] = useState<string>(dpc?.no_handphone || "");
  const [keterangan, setKeterangan] = useState<string>(
    dpc?.keterangan || "Definitif",
  );
  const [penerbitanSk, setPenerbitanSk] = useState<string>(
    dpc?.penerbitan_sk || "",
  );

  const { data: kabupatenList = [], isLoading: isLoadingKab } =
    useMasterKabupaten(selectedProvinsi || null);

  // Filter kabupaten yang belum terdaftar di DPC, urutkan berdasarkan kode terkecil
  const availableKabupaten = useMemo(() => {
    return kabupatenList
      .filter(
        (k) =>
          !existingDpcCodes.has(k.kode_kabupaten) ||
          (isEditing && k.kode_kabupaten === dpc?.kode_kabupaten),
      )
      .sort((a, b) => Number(a.kode_kabupaten) - Number(b.kode_kabupaten));
  }, [kabupatenList, existingDpcCodes, isEditing, dpc?.kode_kabupaten]);

  // Pilihan provinsi: hanya nama provinsi (tanpa kode provinsi)
  const provinsiOptions = useMemo(() => {
    return sortedProvinsi.map((p) => ({
      value: p.kode_provinsi,
      label: p.nama_provinsi,
      searchKey: p.nama_provinsi,
    }));
  }, [sortedProvinsi]);

  // Pilihan kabupaten: hanya nama kabupaten (tanpa kode kabupaten)
  const kabupatenOptions = useMemo(() => {
    return availableKabupaten.map((k) => ({
      value: k.kode_kabupaten,
      label: k.nama_kabupaten,
      searchKey: k.nama_kabupaten,
    }));
  }, [availableKabupaten]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeKabupaten) return;

    await onSave({
      kode_kabupaten: kodeKabupaten,
      pengurus: pengurus.trim(),
      no_handphone: noHandphone.trim(),
      keterangan: keterangan.trim(),
      penerbitan_sk: penerbitanSk.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      {/* 1. Pilih Provinsi Induk */}
      <div className="space-y-2">
        <Label htmlFor="dpc-provinsi" className="text-sm font-medium text-foreground">
          Provinsi Induk <span className="text-destructive">*</span>
        </Label>
        {isEditing ? (
          <Input
            value={dpc?.dpd || "Provinsi"}
            disabled
            className="h-10 text-sm bg-muted text-muted-foreground font-medium"
          />
        ) : (
          <SearchableSelect
            id="dpc-provinsi"
            value={selectedProvinsi}
            onValueChange={(val) => {
              setSelectedProvinsi(val);
              setKodeKabupaten("");
            }}
            options={provinsiOptions}
            placeholder="Pilih provinsi induk..."
            searchPlaceholder="Cari provinsi..."
            emptyMessage="Provinsi tidak ditemukan"
          />
        )}
      </div>

      {/* 2. Pilih Kabupaten/Kota */}
      <div className="space-y-2">
        <Label htmlFor="kabupaten" className="text-sm font-medium text-foreground">
          Kabupaten / Kota (DPC) <span className="text-destructive">*</span>
        </Label>
        {isEditing ? (
          <Input
            value={`DPC ${dpc?.dpc}`}
            disabled
            className="h-10 text-sm bg-muted text-muted-foreground font-medium"
          />
        ) : (
          <SearchableSelect
            id="kabupaten"
            value={kodeKabupaten}
            onValueChange={(val) => setKodeKabupaten(val)}
            options={kabupatenOptions}
            placeholder={
              !selectedProvinsi
                ? "Pilih provinsi terlebih dahulu"
                : isLoadingKab
                ? "Memuat kabupaten/kota..."
                : "Pilih kabupaten/kota..."
            }
            searchPlaceholder="Cari kabupaten / kota..."
            emptyMessage={
              !selectedProvinsi
                ? "Pilih provinsi terlebih dahulu"
                : "Kabupaten/kota tidak ditemukan"
            }
            disabled={!selectedProvinsi || isLoadingKab}
          />
        )}
      </div>

      {/* 3. Pengurus / Ketua */}
      <div className="space-y-2">
        <Label htmlFor="dpc-pengurus" className="text-sm font-medium text-foreground">
          Ketua / Penanggung Jawab
        </Label>
        <Input
          id="dpc-pengurus"
          placeholder="Contoh: Pnt. Nama Lengkap, S.Sos"
          value={pengurus}
          onChange={(e) => setPengurus(e.target.value)}
          className="h-10 text-sm"
        />
      </div>

      {/* 4. Kontak Telepon / WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="dpc-noHandphone" className="text-sm font-medium text-foreground">
          No. Handphone / WhatsApp
        </Label>
        <Input
          id="dpc-noHandphone"
          placeholder="Contoh: 08123456789"
          value={noHandphone}
          onChange={(e) => setNoHandphone(e.target.value)}
          className="h-10 text-sm"
        />
      </div>

      {/* 5. Status Kepengurusan & Nomor SK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dpc-keterangan" className="text-sm font-medium text-foreground">
            Status Kepengurusan
          </Label>
          <SearchableSelect
            id="dpc-keterangan"
            value={keterangan}
            onValueChange={(val) => setKeterangan(val)}
            options={STATUS_KEPENGURUSAN_OPTIONS}
            placeholder="Pilih status..."
            searchPlaceholder="Cari status..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dpc-penerbitanSk" className="text-sm font-medium text-foreground">
            Nomor SK
          </Label>
          <Input
            id="dpc-penerbitanSk"
            placeholder="SK-012/DPD-JB/2024"
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
          disabled={isSubmitting || !kodeKabupaten}
          className="h-10 px-5 text-sm font-medium"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {isEditing ? "Simpan Perubahan" : "Tambah DPC"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DpcEditorDialog({
  open,
  onOpenChange,
  dpc,
  masterProvinsi,
  existingDpcCodes,
  onSave,
  isSubmitting,
}: DpcEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {dpc ? `Edit Data: DPC ${dpc.dpc}` : "Tambah Dewan Pimpinan Cabang (DPC)"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {dpc
              ? "Perbarui data pengurus, kontak, atau nomor SK DPC terkait."
              : "Bentuk kepengurusan DPC tingkat kabupaten/kota baru di bawah provinsi induk."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <DpcFormInner
            key={dpc?.id || "new-dpc"}
            dpc={dpc}
            masterProvinsi={masterProvinsi}
            existingDpcCodes={existingDpcCodes}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
