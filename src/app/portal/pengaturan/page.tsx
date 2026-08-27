"use client";

import { Loader2 } from "lucide-react";
import { useGetProfile } from "@/hooks/api/useProfile";
import { ProfileForm } from "@/components/portal/pengaturan/ProfileForm";
import { PasswordForm } from "@/components/portal/pengaturan/PasswordForm";

export default function PengaturanPortalPage() {
  const { data: profile, isLoading, error } = useGetProfile();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center text-destructive">
        <p>Gagal memuat profil. Silakan coba lagi.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">
          Perbarui informasi pribadi dan keamanan akun Anda.
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-6 md:p-8 space-y-10">
        {/* Form Profil */}
        <ProfileForm profile={profile} />

        {/* Separator */}
        <div className="h-px bg-border/50 w-full my-6"></div>

        {/* Form Keamanan / Password */}
        <PasswordForm />
      </div>
    </div>
  );
}
