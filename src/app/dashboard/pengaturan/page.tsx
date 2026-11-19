"use client";

import {
  Building2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetProfile } from "@/hooks/api/useProfile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isSuperAdmin } from "@/lib/rbac";
import { ProfileForm } from "@/components/portal/pengaturan/ProfileForm";
import { PasswordForm } from "@/components/portal/pengaturan/PasswordForm";
import { PhotoUploadCard } from "@/components/portal/pengaturan/PhotoUploadCard";

export default function DashboardPengaturanPage() {
  const { user } = useCurrentUser();
  const { data: profile, isLoading, error } = useGetProfile();

  if (isLoading) {
    return (
      <div className="flex h-[55vh] w-full items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        Gagal memuat pengaturan akun. Silakan muat ulang halaman.
      </div>
    );
  }

  const hasAnggotaProfile = Boolean(profile.anggotaUuid);
  const scopeLabel = isSuperAdmin(user)
    ? "DPP Pusat (Nasional)"
    : user?.tingkat === "DPD"
      ? `Admin DPD ${user.cabang || ""}`.trim()
      : user?.tingkat === "DPC"
        ? `Admin DPC ${user.cabang || ""}`.trim()
        : user?.cabang || "Administrator";

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-4 sm:py-6">
      {/* 1. Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Pengaturan Akun &amp; Keamanan
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Kelola kata sandi, informasi akun administrator, dan profil
            keanggotaan Anda.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="w-fit gap-1.5 px-3 py-1 text-xs font-semibold"
        >
          <ShieldCheck className="size-3.5 text-primary" />
          <span>{scopeLabel}</span>
        </Badge>
      </div>

      {/* 2. Ringkasan Akun Login */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Username &amp; Nama
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {profile.namaLengkap || profile.username}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              @{profile.username}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Email</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {profile.email}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Status: {profile.statusAkun}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              Peran &amp; Cakupan Cabang
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.cabang || profile.cabang?.namaCabang || "DPP Pusat"}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {(user?.roles ?? []).map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className="px-1.5 py-0 text-[11px] font-medium"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Konten Utama: Jika memiliki profil Anggota vs Akun Admin Non-Anggota */}
      {hasAnggotaProfile ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <PhotoUploadCard
              currentImageUrl={profile.profileImg}
              namaLengkap={profile.namaLengkap || profile.username}
            />
          </div>

          <div className="space-y-10 rounded-xl border border-border bg-card p-6 lg:col-span-8">
            <ProfileForm profile={profile} />
            <div className="h-px w-full bg-border/60" />
            <PasswordForm />
          </div>
        </div>
      ) : (
        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/40 p-4 text-xs text-muted-foreground">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">
                Akun Administrator Struktural (Non-Anggota)
              </p>
              <p className="mt-0.5 leading-relaxed">
                Akun ini dibuat khusus untuk pengelolaan sistem CMS/Wilayah dan
                tidak terhubung ke profil KTA anggota perorangan. Anda dapat
                memperbarui kata sandi keamanan akun di bawah ini.
              </p>
            </div>
          </div>

          <PasswordForm />
        </div>
      )}
    </div>
  );
}
