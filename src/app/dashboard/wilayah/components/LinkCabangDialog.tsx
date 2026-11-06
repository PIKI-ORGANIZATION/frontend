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
  targetName,
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
        searchKey: `${c.namaCabang} ${c.kabupatenKota} ${c.provinsi}`,
      })),
    ];
  }, [availableCabang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCabangUuid = selectedCabangUuid === "NONE" ? null : selectedCabangUuid;
    await onSave(finalCabangUuid);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      <div className="space-y-2">
        <Label htmlFor="cabang-select" className="text-sm font-medium text-foreground">
          Pilih Profil Cabang untuk {targetName}
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
        <p className="text-xs text-muted-foreground mt-1">
          Hanya profil cabang publik yang belum terikat ke wilayah lain yang dapat dipilih.
        </p>
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
          disabled={isSubmitting}
          className="h-10 px-5 text-sm font-medium"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Link2 className="w-5 h-5 text-primary" />
            Tautkan Profil Cabang ke {targetType}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Pilih profil cabang website resmi yang mewakili kepengurusan {targetName}.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <LinkCabangFormInner
            key={currentCabangUuid || "new-link"}
            targetType={targetType}
            targetName={targetName}
            currentCabangUuid={currentCabangUuid}
            cabangList={cabangList}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
