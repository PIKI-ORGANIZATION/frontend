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
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Loader2, Link2 } from "lucide-react";
import { CabangItem } from "@/features/wilayah/types";

interface LinkCabangDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "DPD" | "DPC";
  targetId: string | number;
  targetName: string;
  currentCabangUuid?: string | null;
  cabangList: CabangItem[];
  onSave: (cabangUuid: string | null) => Promise<unknown>;
  isSubmitting: boolean;
}

interface LinkCabangFormInnerProps {
  targetType: "DPD" | "DPC";
  targetName: string;
  currentCabangUuid?: string | null;
  cabangList: CabangItem[];
  onSave: (cabangUuid: string | null) => Promise<unknown>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function LinkCabangFormInner({
  targetType,
  currentCabangUuid,
  cabangList,
  onSave,
  onCancel,
  isSubmitting,
}: LinkCabangFormInnerProps) {
  const [selectedCabangUuid, setSelectedCabangUuid] = useState<string>(
    currentCabangUuid || "NONE",
  );

  // Filter cabang: hanya yang belum ditautkan atau yang saat ini tertaut ke entitas ini
  const safeCabangList = Array.isArray(cabangList) ? cabangList : [];
  const availableCabang = safeCabangList.filter((c) => {
    if (c.uuid === currentCabangUuid) return true;
    if (targetType === "DPD") {
      return !c.dpdId && !c.dpcId;
    } else {
      return !c.dpcId && !c.dpdId;
    }
  });

  const cabangOptions = useMemo(() => {
    return [
      {
        value: "NONE",
        label: "Tidak Ada Tautan (Lepas Tautan)",
        subLabel: "Kosongkan tautan",
      },
      ...availableCabang.map((c) => ({
        value: c.uuid,
        label: c.namaCabang,
        subLabel: `${c.kabupatenKota}, ${c.provinsi}`,
      })),
    ];
  }, [availableCabang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCabangUuid = selectedCabangUuid === "NONE" ? null : selectedCabangUuid;
    await onSave(finalCabangUuid);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="cabang-select" className="text-xs font-semibold">
          Pilih Profil Cabang
        </Label>
        <SearchableSelect
          id="cabang-select"
          value={selectedCabangUuid}
          onValueChange={(val) => setSelectedCabangUuid(val)}
          options={cabangOptions}
          placeholder="Pilih cabang..."
          searchPlaceholder="Cari nama cabang atau kota..."
          emptyMessage="Tidak ada cabang yang tersedia"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Hanya profil cabang yang belum terikat ke wilayah lain yang dapat dipilih.
        </p>
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
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
          Simpan Tautan
        </Button>
      </DialogFooter>
    </form>
  );
}

export function LinkCabangDialog({
  open,
  onOpenChange,
  targetType,
  targetName,
  currentCabangUuid,
  cabangList,
  onSave,
  isSubmitting,
}: LinkCabangDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Tautkan Profil Cabang ke {targetType}
          </DialogTitle>
          <DialogDescription>
            Hubungkan entitas profil cabang resmi PIKI dengan kepengurusan wilayah{" "}
            <strong className="text-foreground">{targetName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <LinkCabangFormInner
            key={currentCabangUuid || "none-cabang"}
            targetType={targetType}
            targetName={targetName}
            currentCabangUuid={currentCabangUuid}
            cabangList={cabangList}
            onSave={async (uuid) => {
              await onSave(uuid);
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
