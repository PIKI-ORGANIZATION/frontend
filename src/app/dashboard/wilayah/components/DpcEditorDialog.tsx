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

function DpcFormInner({
  dpc,
  masterProvinsi,
  existingDpcCodes,
  onSave,
  onCancel,
  isSubmitting,
}: DpcFormInnerProps) {
  const isEditing = Boolean(dpc);

  const [selectedProvinsi, setSelectedProvinsi] = useState<string>(
    dpc?.kode_provinsi || "",
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

  // Filter kabupaten yang belum terdaftar di DPC
  const availableKabupaten = kabupatenList.filter(
    (k) => !existingDpcCodes.has(k.kode_kabupaten) || (isEditing && k.kode_kabupaten === dpc?.kode_kabupaten),
  );

  const provinsiOptions = useMemo(() => {
    return masterProvinsi.map((p) => ({
      value: p.kode_provinsi,
      label: p.nama_provinsi,
      subLabel: p.kode_provinsi,
    }));
  }, [masterProvinsi]);

  const kabupatenOptions = useMemo(() => {
    return availableKabupaten.map((k) => ({
      value: k.kode_kabupaten,
      label: k.nama_kabupaten,
      subLabel: k.kode_kabupaten,
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
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* 1. Pilih Provinsi Induk */}
      <div className="space-y-1.5">
        <Label htmlFor="dpc-provinsi" className="text-xs font-semibold">
          Provinsi Induk <span className="text-red-500">*</span>
        </Label>
        {isEditing ? (
          <Input
            value={`${dpc?.dpd} (${dpc?.kode_provinsi})`}
            disabled
            className="bg-muted text-muted-foreground text-xs"
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
      <div className="space-y-1.5">
        <Label htmlFor="kabupaten" className="text-xs font-semibold">
          Kabupaten / Kota (DPC) <span className="text-red-500">*</span>
        </Label>
        {isEditing ? (
          <Input
            value={`${dpc?.dpc} (${dpc?.kode_kabupaten})`}
            disabled
            className="bg-muted text-muted-foreground text-xs"
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
                ? "Memuat kab/kota..."
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
      <div className="space-y-1.5">
        <Label htmlFor="dpc-pengurus" className="text-xs font-semibold">
          Ketua / Penanggung Jawab
        </Label>
        <Input
          id="dpc-pengurus"
          placeholder="Contoh: Nama Ketua DPC"
          value={pengurus}
          onChange={(e) => setPengurus(e.target.value)}
          className="text-xs"
        />
      </div>

      {/* 4. Kontak WhatsApp / Telepon */}
      <div className="space-y-1.5">
        <Label htmlFor="dpc-noHandphone" className="text-xs font-semibold">
          No. Handphone / WhatsApp
        </Label>
        <Input
          id="dpc-noHandphone"
          placeholder="Contoh: 08123456789"
          value={noHandphone}
          onChange={(e) => setNoHandphone(e.target.value)}
          className="text-xs"
        />
      </div>

      {/* 5. Status Kepengurusan & SK */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dpc-keterangan" className="text-xs font-semibold">
            Status Kepengurusan
          </Label>
          <Select
            value={keterangan}
            onValueChange={(val) => val && setKeterangan(val)}
          >
            <SelectTrigger id="dpc-keterangan" className="text-xs">
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

        <div className="space-y-1.5">
          <Label htmlFor="dpc-penerbitanSk" className="text-xs font-semibold">
            Nomor SK
          </Label>
          <Input
            id="dpc-penerbitanSk"
            placeholder="SK-002/DPC/2024"
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
          disabled={isSubmitting || !kodeKabupaten}
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
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
  const isEditing = Boolean(dpc);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit DPC ${dpc?.dpc || ""}` : "Tambah DPC Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui informasi pengurus, kontak, dan SK DPC."
              : "Pilih provinsi dan kabupaten/kota untuk membentuk DPC baru."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <DpcFormInner
            key={dpc ? String(dpc.id) : "new-dpc"}
            dpc={dpc}
            masterProvinsi={masterProvinsi}
            existingDpcCodes={existingDpcCodes}
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
