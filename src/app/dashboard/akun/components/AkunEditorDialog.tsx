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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Wand2,
  Copy,
  Check,
  AlertCircle,
  Info,
  Shield,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { CabangItem, RoleItem } from "@/features/wilayah/types";
import {
  AkunItem,
  CreateAkunPayload,
  StatusAkun,
  UpdateAkunPayload,
} from "@/features/akun/types";

interface AkunEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  akun: AkunItem | null;
  cabangList: CabangItem[];
  roleList: RoleItem[];
  isLoadingCabang: boolean;
  isLoadingRoles: boolean;
  onCreate: (payload: CreateAkunPayload) => Promise<unknown>;
  onUpdate: (payload: UpdateAkunPayload) => Promise<unknown>;
  isSubmitting: boolean;
}

interface AkunFormInnerProps {
  akun: AkunItem | null;
  cabangList: CabangItem[];
  roleList: RoleItem[];
  isLoadingCabang: boolean;
  isLoadingRoles: boolean;
  onCreate: (payload: CreateAkunPayload) => Promise<unknown>;
  onUpdate: (payload: UpdateAkunPayload) => Promise<unknown>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const STATUS_AKUN_OPTIONS = [
  { value: "ACTIVE", label: "Aktif (Bisa Login)" },
  { value: "INACTIVE", label: "Nonaktif (Akses Diblokir)" },
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN:
    "Akses penuh nasional (DPP), manajemen wilayah, cabang, akun, & seluruh CMS.",
  ADMIN_CABANG:
    "Admin operasional DPD/DPC: verifikasi anggota wilayah, CMS Sejarah, Galeri, & Berita.",
  KETUA_CABANG:
    "Pimpinan DPD/DPC: hak verifikasi anggota wilayah & pengelolaan konten.",
  USER: "Akses dasar Portal Anggota & KTA Digital (wajib dipertahankan untuk akun anggota).",
};

type FormErrors = Partial<Record<string, string>>;

function generateStrongPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const nums = "23456789";
  const syms = "@#$%&*!";
  const all = upper + lower + nums + syms;

  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    nums[Math.floor(Math.random() * nums.length)],
    syms[Math.floor(Math.random() * syms.length)],
  ];

  for (let i = chars.length; i < length; i++) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

function AkunFormInner({
  akun,
  cabangList,
  roleList,
  isLoadingCabang,
  isLoadingRoles,
  onCreate,
  onUpdate,
  onCancel,
  isSubmitting,
}: AkunFormInnerProps) {
  const isEditing = Boolean(akun);
  const isMemberLinked = Boolean(akun?.anggotaUuid || akun?.anggota);

  const adminCabangRole = roleList.find(
    (r) => r.namaRole.toUpperCase() === "ADMIN_CABANG",
  );
  const userRole = roleList.find((r) => r.namaRole.toUpperCase() === "USER");

  const [email, setEmail] = useState<string>(akun?.email || "");
  const [username, setUsername] = useState<string>(akun?.username || "");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedPass, setCopiedPass] = useState<boolean>(false);
  const [statusAkun, setStatusAkun] = useState<StatusAkun>(
    akun?.statusAkun === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  );

  const [cabangUuid, setCabangUuid] = useState<string>(
    akun?.cabangUuid || (isEditing ? "NONE" : ""),
  );

  const [selectedRoleUuids, setSelectedRoleUuids] = useState<Set<string>>(
    () => {
      const set = new Set<string>();
      if (akun?.roles && akun.roles.length > 0) {
        akun.roles.forEach((r) => {
          if (r?.uuid) set.add(r.uuid);
        });
      } else if (!isEditing && adminCabangRole) {
        set.add(adminCabangRole.uuid);
      }
      return set;
    },
  );

  const [errors, setErrors] = useState<FormErrors>({});

  const safeCabangList = useMemo(
    () => (Array.isArray(cabangList) ? cabangList : []),
    [cabangList],
  );

  const cabangOptions = useMemo(() => {
    const mapped = safeCabangList.map((c) => {
      const tingkatLabel = c.dpdId
        ? `Tingkat DPD · ${c.provinsi}`
        : c.dpcId
          ? `Tingkat DPC · ${c.kabupatenKota}`
          : `${c.kabupatenKota}, ${c.provinsi} (Belum tertaut DPD/DPC)`;

      return {
        value: c.uuid,
        label: c.namaCabang,
        subLabel: tingkatLabel,
        searchKey: `${c.namaCabang} ${c.provinsi} ${c.kabupatenKota}`,
      };
    });

    if (isEditing) {
      return [
        {
          value: "NONE",
          label: "Tanpa Tautan Cabang (Lepaskan)",
          subLabel: "Hapus penugasan cabang dari akun ini",
        },
        ...mapped,
      ];
    }

    return mapped;
  }, [safeCabangList, isEditing]);

  const selectedCabangObj = useMemo(() => {
    if (!cabangUuid || cabangUuid === "NONE") return null;
    return safeCabangList.find((c) => c.uuid === cabangUuid) || null;
  }, [safeCabangList, cabangUuid]);

  // Urutkan role agar paling relevan tampil di atas
  const sortedRoles = useMemo(() => {
    const order = ["ADMIN_CABANG", "KETUA_CABANG", "SUPER_ADMIN", "USER"];
    return [...roleList].sort((a, b) => {
      const ia = order.indexOf(a.namaRole.toUpperCase());
      const ib = order.indexOf(b.namaRole.toUpperCase());
      const ra = ia === -1 ? 99 : ia;
      const rb = ib === -1 ? 99 : ib;
      if (ra !== rb) return ra - rb;
      return a.namaRole.localeCompare(b.namaRole);
    });
  }, [roleList]);

  const toggleRole = (roleUuid: string) => {
    setSelectedRoleUuids((prev) => {
      const next = new Set(prev);
      if (next.has(roleUuid)) {
        next.delete(roleUuid);
      } else {
        next.add(roleUuid);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, roles: undefined }));
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(12);
    setPassword(generated);
    setShowPassword(true);
    setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const handleCopyPassword = () => {
    if (!password) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(password).then(() => {
        setCopiedPass(true);
        toast.success("Password berhasil disalin");
        setTimeout(() => setCopiedPass(false), 2000);
      });
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      nextErrors.email = "Format email tidak valid.";
    }

    if (username.trim().length < 3) {
      nextErrors.username = "Username minimal 3 karakter.";
    } else if (/\s/.test(username.trim())) {
      nextErrors.username = "Username tidak boleh mengandung spasi.";
    }

    if (!isEditing) {
      if (password.length < 8) {
        nextErrors.password = "Password wajib diisi minimal 8 karakter.";
      }
      if (!cabangUuid || cabangUuid === "NONE") {
        nextErrors.cabangUuid =
          "Cabang wajib dipilih untuk akun admin non-anggota.";
      }
    } else if (password.length > 0 && password.length < 8) {
      nextErrors.password = "Password baru minimal 8 karakter.";
    }

    if (selectedRoleUuids.size === 0) {
      nextErrors.roles = "Pilih minimal satu role akses.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const roleUuidsArray = Array.from(selectedRoleUuids);

    if (!isEditing) {
      await onCreate({
        email: email.trim(),
        username: username.trim(),
        password,
        cabangUuid,
        roleUuids: roleUuidsArray,
      });
      return;
    }

    if (!akun) return;

    const updatePayload: UpdateAkunPayload = {
      uuid: akun.uuid,
      email: email.trim(),
      username: username.trim(),
      statusAkun,
      cabangUuid: cabangUuid === "NONE" || !cabangUuid ? null : cabangUuid,
      roleUuids: roleUuidsArray,
      ...(password.length > 0 && { password }),
    };

    await onUpdate(updatePayload);
  };

  const isMissingUserRoleWarning =
    isMemberLinked && userRole && !selectedRoleUuids.has(userRole.uuid);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      {/* Info jika akun terhubung dengan Anggota */}
      {isEditing && akun?.anggota && (
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            Terhubung ke data Anggota:{" "}
            <strong className="text-foreground">
              {akun.anggota.namaLengkap}
            </strong>
            {akun.anggota.noKta ? ` (No. KTA: ${akun.anggota.noKta})` : ""}.
          </span>
        </div>
      )}

      {/* 1. Kredensial Login */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="akun-email"
              className="text-sm font-medium text-foreground"
            >
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="akun-email"
              type="email"
              placeholder="admin.jambi@piki.or.id"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="h-10 text-sm"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="akun-username"
              className="text-sm font-medium text-foreground"
            >
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="akun-username"
              placeholder="admin_dpd_jambi"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              className="h-10 text-sm"
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username}</p>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="akun-password"
              className="text-sm font-medium text-foreground"
            >
              {isEditing ? "Reset Password (Opsional)" : "Password Awal"}{" "}
              {!isEditing && <span className="text-destructive">*</span>}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGeneratePassword}
              className="h-7 px-2.5 text-xs text-primary hover:text-primary gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Generate Password
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                id="akun-password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  isEditing
                    ? "Kosongkan jika tidak ingin mengubah password"
                    : "Minimal 8 karakter"
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className="h-10 text-sm pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {password && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyPassword}
                className="h-10 w-10 shrink-0"
                title="Salin password"
              >
                {copiedPass ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* 2. Tautan Cabang & Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Building2 className="w-4 h-4 text-primary" />
          <span>Tautan Profil Cabang Wilayah</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={isEditing ? "space-y-2" : "space-y-2 sm:col-span-2"}>
            <Label
              htmlFor="akun-cabang"
              className="text-sm font-medium text-foreground"
            >
              Profil Cabang{" "}
              {!isEditing && <span className="text-destructive">*</span>}
            </Label>
            <SearchableSelect
              id="akun-cabang"
              value={cabangUuid}
              onValueChange={(val) => {
                setCabangUuid(val);
                setErrors((prev) => ({ ...prev, cabangUuid: undefined }));
              }}
              options={cabangOptions}
              placeholder={
                isLoadingCabang
                  ? "Memuat daftar cabang..."
                  : "Pilih profil cabang..."
              }
              searchPlaceholder="Cari nama cabang, provinsi, kota..."
              emptyMessage="Profil cabang tidak ditemukan"
              disabled={isLoadingCabang}
            />
            {errors.cabangUuid && (
              <p className="text-xs text-destructive">{errors.cabangUuid}</p>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label
                htmlFor="akun-status"
                className="text-sm font-medium text-foreground"
              >
                Status Akun
              </Label>
              <SearchableSelect
                id="akun-status"
                value={statusAkun}
                onValueChange={(val) => setStatusAkun(val as StatusAkun)}
                options={STATUS_AKUN_OPTIONS}
                placeholder="Pilih status akun..."
              />
            </div>
          )}
        </div>

        {selectedCabangObj &&
          !selectedCabangObj.dpdId &&
          !selectedCabangObj.dpcId && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Cabang <strong>{selectedCabangObj.namaCabang}</strong> belum
                ditautkan ke DPD atau DPC. Tautkan di menu{" "}
                <strong>Wilayah &amp; Cabang</strong> agar akun ini menerima hak
                akses wilayah DPD/DPC.
              </span>
            </div>
          )}
      </div>

      <Separator />

      {/* 3. Role Akses */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span>Role Hak Akses</span>
        </div>

        {isLoadingRoles ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memuat daftar role...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {sortedRoles.map((role) => {
              const checked = selectedRoleUuids.has(role.uuid);
              const desc =
                ROLE_DESCRIPTIONS[role.namaRole.toUpperCase()] ||
                role.deskripsi ||
                "Role akses sistem PIKI.";

              return (
                <label
                  key={role.uuid}
                  className="flex items-start gap-3 rounded-lg border border-border/80 bg-card p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleRole(role.uuid)}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {role.namaRole}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {errors.roles && (
          <p className="text-xs text-destructive">{errors.roles}</p>
        )}

        {isMissingUserRoleWarning && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Perhatian: Akun ini terhubung dengan data Anggota. Karena update
              role bersifat mengganti seluruh role (<em>replace</em>),
              disarankan tetap mencentang role <strong>USER</strong> agar akses
              Portal Anggota &amp; KTA tidak hilang.
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            Perubahan role atau tautan cabang akan aktif setelah pemilik akun
            melakukan <strong>login ulang</strong>.
          </span>
        </div>
      </div>

      <DialogFooter className="pt-3 border-t border-border gap-2">
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
          className="h-10 px-5 text-sm font-medium gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isEditing ? "Simpan Perubahan" : "Buat Akun Admin"}</span>
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AkunEditorDialog({
  open,
  onOpenChange,
  akun,
  cabangList,
  roleList,
  isLoadingCabang,
  isLoadingRoles,
  onCreate,
  onUpdate,
  isSubmitting,
}: AkunEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <KeyRound className="w-5 h-5 text-primary" />
            <span>
              {akun
                ? `Edit Akun: ${akun.username}`
                : "Buat Akun Admin Cabang (Non-Anggota)"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {akun
              ? "Perbarui kredensial, status aktif, tautan cabang wilayah, atau hak akses role akun ini."
              : "Buat akun admin khusus DPD/DPC yang tidak terdaftar sebagai anggota KTA, terhubung langsung ke Profil Cabang."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <AkunFormInner
            key={akun?.uuid || "new-akun"}
            akun={akun}
            cabangList={cabangList}
            roleList={roleList}
            isLoadingCabang={isLoadingCabang}
            isLoadingRoles={isLoadingRoles}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
