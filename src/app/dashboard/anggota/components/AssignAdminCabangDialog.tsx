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
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import {
  useCabangList,
  useRolesList,
  useAssignAkunCabang,
} from "@/features/wilayah/hooks/useWilayah";
import { CabangItem, RoleItem } from "@/features/wilayah/types";

interface AssignAdminCabangDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anggota: {
    namaLengkap: string;
    akun?: {
      uuid: string;
      email: string;
      cabangUuid?: string | null;
      roles?: Array<{
        role: {
          uuid: string;
          namaRole: string;
        };
      }>;
    } | null;
  } | null;
}

interface AssignFormInnerProps {
  anggota: NonNullable<AssignAdminCabangDialogProps["anggota"]>;
  cabangList: CabangItem[];
  roleList: RoleItem[];
  isLoadingCabang: boolean;
  isLoadingRoles: boolean;
  onSave: (payload: { akunUuid: string; cabangUuid: string | null; roleUuids: string[] }) => Promise<unknown>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function AssignFormInner({
  anggota,
  cabangList,
  roleList,
  isLoadingCabang,
  isLoadingRoles,
  onSave,
  onCancel,
  isSubmitting,
}: AssignFormInnerProps) {
  const userRole = roleList.find((r) => r.namaRole === "USER");
  const adminCabangRole = roleList.find((r) => r.namaRole === "ADMIN_CABANG");
  const ketuaCabangRole = roleList.find((r) => r.namaRole === "KETUA_CABANG");

  const [selectedCabangUuid, setSelectedCabangUuid] = useState<string>(
    anggota.akun?.cabangUuid || "NONE",
  );

  const [selectedRoleUuids, setSelectedRoleUuids] = useState<Set<string>>(() => {
    const roles = new Set<string>();
    if (userRole) roles.add(userRole.uuid);
    anggota.akun?.roles?.forEach((r) => {
      if (r.role?.uuid) roles.add(r.role.uuid);
    });
    return roles;
  });

  const toggleRole = (roleUuid: string) => {
    // Role USER tidak boleh dilepas
    if (userRole && roleUuid === userRole.uuid) return;

    setSelectedRoleUuids((prev) => {
      const next = new Set(prev);
      if (next.has(roleUuid)) {
        next.delete(roleUuid);
      } else {
        next.add(roleUuid);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anggota?.akun?.uuid) return;

    // Pastikan role USER selalu ada dalam payload
    const roleUuidsArray = Array.from(selectedRoleUuids);
    if (userRole && !roleUuidsArray.includes(userRole.uuid)) {
      roleUuidsArray.push(userRole.uuid);
    }

    const finalCabangUuid =
      selectedCabangUuid === "NONE" ? null : selectedCabangUuid;

    await onSave({
      akunUuid: anggota.akun.uuid,
      cabangUuid: finalCabangUuid,
      roleUuids: roleUuidsArray,
    });
  };

  const safeCabangList = useMemo(
    () => (Array.isArray(cabangList) ? cabangList : []),
    [cabangList],
  );

  const cabangOptions = useMemo(() => {
    return [
      {
        value: "NONE",
        label: "Tidak Ditautkan ke Cabang Khusus (Nasional)",
        subLabel: "Akses tingkat pusat / tanpa cabang",
      },
      ...safeCabangList.map((c) => ({
        value: c.uuid,
        label: c.namaCabang,
        subLabel: `${c.kabupatenKota}, ${c.provinsi}`,
      })),
    ];
  }, [safeCabangList]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Info Anggota */}
      <div className="rounded-lg bg-muted/40 p-3 border border-border/70 text-xs space-y-1">
        <div className="font-semibold text-foreground">
          {anggota.namaLengkap}
        </div>
        <div className="text-muted-foreground">{anggota.akun?.email}</div>
      </div>

      {/* Pilihan Cabang */}
      <div className="space-y-1.5">
        <Label htmlFor="assign-cabang" className="text-xs font-semibold">
          Tugaskan ke Profil Cabang
        </Label>
        <SearchableSelect
          id="assign-cabang"
          value={selectedCabangUuid}
          onValueChange={(val) => setSelectedCabangUuid(val)}
          options={cabangOptions}
          placeholder="Pilih cabang..."
          searchPlaceholder="Cari profil cabang..."
          emptyMessage="Cabang tidak ditemukan"
          disabled={isLoadingCabang}
        />
      </div>

      {/* Pilihan Role */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Peran & Hak Akses</Label>
        <div className="space-y-2 border border-border/70 rounded-lg p-3 bg-card">
          {/* 1. USER role */}
          <div className="flex items-center space-x-2 text-xs">
            <Checkbox
              id="role-user"
              checked={true}
              disabled={true}
              className="opacity-70"
            />
            <label
              htmlFor="role-user"
              className="font-medium text-foreground cursor-not-allowed leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Anggota (USER)
              <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                (Wajib untuk portal KTA)
              </span>
            </label>
          </div>

          {/* 2. ADMIN_CABANG role */}
          {adminCabangRole && (
            <div className="flex items-center space-x-2 text-xs">
              <Checkbox
                id="role-admin-cabang"
                checked={selectedRoleUuids.has(adminCabangRole.uuid)}
                onCheckedChange={() => toggleRole(adminCabangRole.uuid)}
              />
              <label
                htmlFor="role-admin-cabang"
                className="font-medium text-foreground cursor-pointer leading-none"
              >
                Admin Cabang / Daerah (ADMIN_CABANG)
              </label>
            </div>
          )}

          {/* 3. KETUA_CABANG role */}
          {ketuaCabangRole && (
            <div className="flex items-center space-x-2 text-xs">
              <Checkbox
                id="role-ketua-cabang"
                checked={selectedRoleUuids.has(ketuaCabangRole.uuid)}
                onCheckedChange={() => toggleRole(ketuaCabangRole.uuid)}
              />
              <label
                htmlFor="role-ketua-cabang"
                className="font-medium text-foreground cursor-pointer leading-none"
              >
                Ketua Cabang / Daerah (KETUA_CABANG)
              </label>
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Perubahan hak akses baru akan berlaku penuh setelah anggota melakukan login ulang.
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
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || isLoadingRoles}
        >
          {isSubmitting && (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
          )}
          Simpan Penugasan
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AssignAdminCabangDialog({
  open,
  onOpenChange,
  anggota,
}: AssignAdminCabangDialogProps) {
  const { data: cabangList = [], isLoading: isLoadingCabang } = useCabangList();
  const { data: roleList = [], isLoading: isLoadingRoles } = useRolesList();
  const assignMutation = useAssignAkunCabang();

  const hasAkun = Boolean(anggota?.akun?.uuid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Penetapan Akses Wilayah / Cabang
          </DialogTitle>
          <DialogDescription>
            Tautkan akun anggota ke cabang tertentu dan berikan wewenang sebagai
            pengelola cabang/daerah.
          </DialogDescription>
        </DialogHeader>

        {!hasAkun ? (
          <div className="py-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-xs font-semibold text-foreground">
              Anggota Belum Memiliki Akun Login
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Hanya anggota yang telah memiliki akun login aktif yang dapat ditugaskan
              sebagai Admin atau Ketua Cabang.
            </p>
          </div>
        ) : (
          open && anggota && (
            <AssignFormInner
              key={anggota.akun?.uuid || "none"}
              anggota={anggota}
              cabangList={cabangList}
              roleList={roleList}
              isLoadingCabang={isLoadingCabang}
              isLoadingRoles={isLoadingRoles}
              onSave={async (payload) => {
                await assignMutation.mutateAsync(payload);
                onOpenChange(false);
              }}
              onCancel={() => onOpenChange(false)}
              isSubmitting={assignMutation.isPending}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
