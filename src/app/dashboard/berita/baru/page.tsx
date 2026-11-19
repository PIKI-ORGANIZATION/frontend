"use client";

import { Loader2 } from "lucide-react";
import { NewsForm } from "../components/NewsForm";
import { AccessDeniedState } from "@/components/dashboard/AccessDeniedState";
import { useNewsScope } from "@/hooks/api/useNews";
import { tingkatLabel } from "@/lib/news";

export default function BeritaBaruPage() {
  const scope = useNewsScope();

  if (!scope) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!scope.canCreate) {
    return (
      <AccessDeniedState
        title="Akses Pembuatan Berita Ditolak"
        description="Akun Anda tidak memiliki izin untuk membuat berita baru."
        scopeLabel={`Cakupan: ${tingkatLabel(scope.tingkat)}`}
        backHref="/dashboard/berita"
        backLabel="Kembali ke Daftar Berita"
      />
    );
  }

  if (!scope.hasCabangBinding) {
    return (
      <AccessDeniedState
        title="Akun Belum Terhubung ke Cabang"
        description="Akun admin DPD/DPC Anda belum terhubung ke profil cabang mana pun sehingga belum dapat menerbitkan berita. Hubungi Administrator DPP."
        scopeLabel={`Cakupan: ${tingkatLabel(scope.tingkat)}`}
        backHref="/dashboard/berita"
        backLabel="Kembali ke Daftar Berita"
      />
    );
  }

  return <NewsForm mode="create" />;
}
