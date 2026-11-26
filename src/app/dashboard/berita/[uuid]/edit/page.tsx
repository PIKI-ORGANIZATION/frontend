"use client";

import { use } from "react";
import { NewsForm } from "../../components/NewsForm";
import { AccessDeniedState } from "@/components/dashboard/AccessDeniedState";
import {
  SkeletonFormWithPreview,
  SkeletonPageHeader,
} from "@/components/ui/skeleton-presets";
import { useAdminNewsById, useNewsScope } from "@/hooks/api/useNews";
import { canManageNewsItem, tingkatLabel } from "@/lib/news";

export default function EditBeritaPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const scope = useNewsScope();

  const canFetch = Boolean(
    scope && scope.canUpdate && scope.hasCabangBinding,
  );
  const query = useAdminNewsById(uuid, { enabled: canFetch });

  if (!scope) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 py-4 sm:py-6">
        <SkeletonPageHeader />
        <SkeletonFormWithPreview label="Memeriksa hak akses redaksi…" />
      </div>
    );
  }

  if (!scope.canUpdate) {
    return (
      <AccessDeniedState
        title="Akses Penyuntingan Berita Ditolak"
        description="Akun Anda tidak memiliki izin untuk menyunting berita."
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
        description="Akun admin DPD/DPC Anda belum terhubung ke profil cabang mana pun sehingga tidak dapat menyunting berita."
        scopeLabel={`Cakupan: ${tingkatLabel(scope.tingkat)}`}
        backHref="/dashboard/berita"
        backLabel="Kembali ke Daftar Berita"
      />
    );
  }

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 py-4 sm:py-6">
        <SkeletonPageHeader />
        <SkeletonFormWithPreview label="Memuat detail artikel berita…" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AccessDeniedState
        title="Berita Tidak Dapat Diakses"
        description={
          (query.error as Error | null)?.message ||
          "Berita tidak ditemukan atau berada di luar cakupan cabang Anda."
        }
        scopeLabel={`Cakupan: ${tingkatLabel(scope.tingkat)}`}
        backHref="/dashboard/berita"
        backLabel="Kembali ke Daftar Berita"
      />
    );
  }

  if (!canManageNewsItem(scope, query.data)) {
    return (
      <AccessDeniedState
        title="Berita Milik Cabang Lain"
        description={`Anda hanya memiliki izin untuk menyunting berita milik cabang ${scope.cabangName || tingkatLabel(scope.tingkat)}.`}
        scopeLabel={`Cakupan: ${tingkatLabel(scope.tingkat)}`}
        backHref="/dashboard/berita"
        backLabel="Kembali ke Daftar Berita"
      />
    );
  }

  return <NewsForm mode="edit" initial={query.data} />;
}
