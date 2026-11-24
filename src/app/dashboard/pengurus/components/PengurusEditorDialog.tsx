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
import {
  PengurusItem,
  PeriodeKepengurusanItem,
  JabatanItem,
  BidangItem,
  StrukturFormValues,
} from "@/features/pengurus/types";
import { AnggotaItem } from "@/hooks/api/useAnggota";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

interface PengurusEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PengurusItem | null;
  defaultPeriodeUuid?: string;
  periodeOptions: PeriodeKepengurusanItem[];
  jabatanOptions: JabatanItem[];
  bidangOptions: BidangItem[];
  anggotaOptions: AnggotaItem[];
  atasanOptions: PengurusItem[];
  isSubmitting?: boolean;
  onSave: (data: StrukturFormValues) => Promise<void>;
}

function PengurusEditorForm({
  initialData,
  defaultPeriodeUuid,
  periodeOptions,
  jabatanOptions,
  bidangOptions,
  anggotaOptions,
  atasanOptions,
  isSubmitting = false,
  onSave,
  onCancel,
}: Omit<PengurusEditorDialogProps, "open" | "onOpenChange"> & {
  onCancel: () => void;
}) {
  const [periodeUuid, setPeriodeUuid] = useState(
    initialData?.periodeUuid || defaultPeriodeUuid || periodeOptions[0]?.uuid || "",
  );
  const [anggotaUuid, setAnggotaUuid] = useState(initialData?.anggotaUuid || "");
  const [jabatanUuid, setJabatanUuid] = useState(initialData?.jabatanUuid || "");
  const [bidangUuid, setBidangUuid] = useState(initialData?.bidangUuid || "__NONE__");
  const [atasanUuid, setAtasanUuid] = useState(initialData?.atasanUuid || "__NONE__");
  const [urutan, setUrutan] = useState(String(initialData?.urutan ?? 1));
  const [levelOverride, setLevelOverride] = useState(
    initialData?.levelOverride !== undefined && initialData?.levelOverride !== null
      ? String(initialData.levelOverride)
      : "",
  );

  const periodeSelectOptions = useMemo(
    () =>
      periodeOptions.map((p) => ({
        value: p.uuid,
        label: `${p.namaPeriode} (${p.tahunMulai}-${p.tahunSelesai})`,
        subLabel: p.cabang?.namaCabang || "Pusat (DPP)",
      })),
    [periodeOptions],
  );

  const anggotaSelectOptions = useMemo(
    () =>
      anggotaOptions.map((a) => ({
        value: a.uuid,
        label: a.namaLengkap,
        subLabel: a.noKta || a.akun?.email || a.kotaDomisili || undefined,
      })),
    [anggotaOptions],
  );

  const jabatanSelectOptions = useMemo(
    () =>
      jabatanOptions.map((j) => ({
        value: j.uuid,
        label: j.namaJabatan,
        subLabel: `Level ${j.levelJabatan}`,
      })),
    [jabatanOptions],
  );

  const bidangSelectOptions = useMemo(
    () => [
      { value: "__NONE__", label: "Tanpa Bidang (Pimpinan Inti / Umum)" },
      ...bidangOptions.map((b) => ({
        value: b.uuid,
        label: b.namaBidang,
      })),
    ],
    [bidangOptions],
  );

  const atasanSelectOptions = useMemo(
    () => [
      { value: "__NONE__", label: "Tidak Ada (Puncak Struktur)" },
      ...atasanOptions
        .filter((item) => item.id !== initialData?.id && (!periodeUuid || item.periodeUuid === periodeUuid))
        .map((item) => ({
          value: item.id,
          label: item.nama,
          subLabel: item.jabatan,
        })),
    ],
    [atasanOptions, initialData?.id, periodeUuid],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodeUuid) {
      toast.error("Periode kepengurusan wajib dipilih");
      return;
    }
    if (!anggotaUuid) {
      toast.error("Anggota wajib dipilih");
      return;
    }
    if (!jabatanUuid) {
      toast.error("Jabatan wajib dipilih");
      return;
    }

    const parsedUrutan = Number(urutan);
    const parsedOverride =
      levelOverride.trim() !== "" ? Number(levelOverride) : null;

    await onSave({
      periodeUuid,
      anggotaUuid,
      jabatanUuid,
      bidangUuid: bidangUuid === "__NONE__" ? null : bidangUuid,
      atasanUuid: atasanUuid === "__NONE__" ? null : atasanUuid,
      urutan: Number.isInteger(parsedUrutan) && parsedUrutan >= 0 ? parsedUrutan : 1,
      levelOverride:
        parsedOverride !== null && Number.isInteger(parsedOverride)
          ? parsedOverride
          : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="str-periode">
          Periode Kepengurusan <span className="text-destructive">*</span>
        </Label>
        <SearchableSelect
          id="str-periode"
          value={periodeUuid}
          onValueChange={setPeriodeUuid}
          options={periodeSelectOptions}
          placeholder="Pilih periode kepengurusan..."
          searchPlaceholder="Cari periode..."
          emptyMessage="Belum ada periode yang tersedia"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="str-anggota">
          Anggota <span className="text-destructive">*</span>
        </Label>
        <SearchableSelect
          id="str-anggota"
          value={anggotaUuid}
          onValueChange={setAnggotaUuid}
          options={anggotaSelectOptions}
          placeholder="Pilih anggota..."
          searchPlaceholder="Cari nama, email, atau no KTA..."
          emptyMessage="Tidak ada data anggota di wilayah ini"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="str-jabatan">
            Jabatan <span className="text-destructive">*</span>
          </Label>
          <SearchableSelect
            id="str-jabatan"
            value={jabatanUuid}
            onValueChange={setJabatanUuid}
            options={jabatanSelectOptions}
            placeholder="Pilih jabatan..."
            searchPlaceholder="Cari jabatan..."
            emptyMessage="Master jabatan kosong"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="str-bidang">Bidang / Departemen</Label>
          <SearchableSelect
            id="str-bidang"
            value={bidangUuid}
            onValueChange={setBidangUuid}
            options={bidangSelectOptions}
            placeholder="Pilih bidang (opsional)..."
            searchPlaceholder="Cari bidang..."
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="str-atasan">Atasan Langsung (Opsional)</Label>
        <SearchableSelect
          id="str-atasan"
          value={atasanUuid}
          onValueChange={setAtasanUuid}
          options={atasanSelectOptions}
          placeholder="Pilih atasan dalam struktur..."
          searchPlaceholder="Cari nama pengurus..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="str-urutan">Urutan Tampil</Label>
          <Input
            id="str-urutan"
            type="number"
            min={0}
            value={urutan}
            onChange={(e) => setUrutan(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="str-level">Level Override (Opsional)</Label>
          <Input
            id="str-level"
            type="number"
            min={1}
            placeholder="Otomatis dari jabatan"
            value={levelOverride}
            onChange={(e) => setLevelOverride(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter className="pt-3 gap-2">
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
          {initialData ? "Simpan Perubahan" : "Tambahkan ke Struktur"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PengurusEditorDialog({
  open,
  onOpenChange,
  initialData,
  defaultPeriodeUuid,
  periodeOptions,
  jabatanOptions,
  bidangOptions,
  anggotaOptions,
  atasanOptions,
  isSubmitting = false,
  onSave,
}: PengurusEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Users className="w-5 h-5 text-primary" />
            <span>
              {initialData
                ? `Edit Struktur: ${initialData.nama}`
                : "Tambah Pengurus ke Struktur"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Tautkan anggota ke jabatan, bidang, dan periode kepengurusan sesuai cakupan wilayah Anda.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <PengurusEditorForm
            key={initialData?.id || "create-struktur"}
            initialData={initialData}
            defaultPeriodeUuid={defaultPeriodeUuid}
            periodeOptions={periodeOptions}
            jabatanOptions={jabatanOptions}
            bidangOptions={bidangOptions}
            anggotaOptions={anggotaOptions}
            atasanOptions={atasanOptions}
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
