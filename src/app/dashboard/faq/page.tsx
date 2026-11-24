"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { AccessDeniedState } from "@/components/dashboard/AccessDeniedState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SkeletonGroup,
  SkeletonList,
  shimmerDelay,
} from "@/components/ui/skeleton-presets";
import { useFaqList } from "@/features/faq/hooks/useFaq";
import { useFaqActions } from "@/features/faq/hooks/useFaqActions";
import { useFaqFilters } from "@/features/faq/hooks/useFaqFilters";
import { FaqApiItem, FaqFormValues, FaqKategori } from "@/features/faq/types";
import { useCabangList } from "@/features/wilayah/hooks/useWilayah";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { canWriteCabangItem, resolveFaqCmsAccess } from "@/lib/rbac";
import { FaqCardList } from "./components/FaqCardList";
import { FaqEditorDialog } from "./components/FaqEditorDialog";
import { FaqFilterBar } from "./components/FaqFilterBar";
import { FaqPreviewDialog } from "./components/FaqPreviewDialog";
import { FaqStatsBar } from "./components/FaqStatsBar";
import { FaqRowHandlers, FaqRowPermissions } from "./components/faq-view.types";

export default function FaqCMSPage() {
  const { user, isReady } = useCurrentUser();
  const access = useMemo(() => resolveFaqCmsAccess(user), [user]);

  const [selectedCabang, setSelectedCabang] = useState<string>("ALL");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqApiItem | null>(null);
  const [previewItem, setPreviewItem] = useState<FaqApiItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<FaqApiItem | null>(null);

  const { data: cabangList = [] } = useCabangList({
    pageSize: 500,
    enabled: isReady && access.canView && access.scope !== "DPC",
  });

  const cabangNameMap = useMemo(() => {
    if (access.scope === "DPC") return undefined;
    const map: Record<string, string> = {};
    cabangList.forEach((c) => {
      map[c.uuid] = c.namaCabang;
    });
    return map;
  }, [access.scope, cabangList]);

  // Muat seluruh FAQ dalam cakupan wilayah aktif agar mini stats dan filter
  // sisi klien selalu konsisten tanpa mengubah kontrak API yang ada.
  const { data, isLoading } = useFaqList({
    ...(access.canSelectCabang && selectedCabang !== "ALL"
      ? { cabangUuid: selectedCabang }
      : {}),
    pageSize: 100,
    enabled: isReady && access.canView,
  });

  const faqList = useMemo(() => data?.items ?? [], [data?.items]);
  const filters = useFaqFilters(faqList);
  const { createFaq, updateFaq, togglePublish, restore, archive, duplicate } =
    useFaqActions();

  const canWriteItem = useCallback(
    (item: FaqApiItem) => canWriteCabangItem(user, item.cabangUuid),
    [user],
  );

  const permissions = useMemo<FaqRowPermissions>(
    () => ({
      canCreate: access.canCreate && !access.isUnlinkedBranchAdmin,
      canUpdate: access.canUpdate && !access.isUnlinkedBranchAdmin,
      canArchive: access.canArchive && !access.isUnlinkedBranchAdmin,
    }),
    [access],
  );

  const handlers = useMemo<FaqRowHandlers>(
    () => ({
      onPreview: (item) => setPreviewItem(item),
      onEdit: (item) => {
        setEditingItem(item);
        setEditorOpen(true);
      },
      onTogglePublish: (item) => {
        void togglePublish(item);
      },
      onDuplicate: (item) => {
        void duplicate(item, access.canSelectCabang);
      },
      onArchive: (item) => setArchiveTarget(item),
      onRestore: (item) => {
        void restore(item);
      },
    }),
    [access.canSelectCabang, duplicate, restore, togglePublish],
  );

  const selectedKategori: FaqKategori | "ALL" = filters.kategori[0] ?? "ALL";

  const handleKategoriChange = useCallback(
    (value: FaqKategori | "ALL") => {
      filters.clearKategori();
      if (value !== "ALL") filters.toggleKategori(value);
    },
    [filters],
  );

  const handleSave = async (values: FaqFormValues) => {
    if (editingItem) {
      await updateFaq.mutateAsync({ uuid: editingItem.uuid, values });
    } else {
      await createFaq.mutateAsync(values);
    }
  };

  const handleResetFilters = useCallback(() => {
    filters.reset();
    if (access.canSelectCabang) setSelectedCabang("ALL");
  }, [access.canSelectCabang, filters]);

  const hasActiveFilters =
    filters.hasActiveFilters ||
    (access.canSelectCabang && selectedCabang !== "ALL");

  if (!isReady) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 py-4 sm:py-6">
        <SkeletonGroup
          label="Memuat halaman CMS FAQ…"
          className="flex flex-wrap items-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              className="h-9 w-28 rounded-lg"
              style={shimmerDelay(i)}
            />
          ))}
        </SkeletonGroup>
        <SkeletonList
          count={4}
          label="Memuat daftar FAQ…"
          className="space-y-2.5"
          cardProps={{ badgeCount: 4, lines: 1, showActions: false }}
        />
      </div>
    );
  }

  if (!access.canView) {
    return (
      <AccessDeniedState
        title="Akses CMS FAQ Ditolak"
        description="Akun Anda tidak memiliki izin melihat atau mengelola data FAQ."
      />
    );
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto space-y-4 ">
      {/* 1. Header + Tambah FAQ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
              CMS Pertanyaan Umum (FAQ)
            </h1>
            {!access.canCreate && !access.canUpdate && (
              <Badge variant="secondary" className="text-[11px] font-medium">
                Mode Baca Saja
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Kelola pertanyaan dan jawaban yang tampil pada halaman publik FAQ.
          </p>
        </div>

        {access.canCreate && (
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setEditorOpen(true);
            }}
            disabled={access.isUnlinkedBranchAdmin}
            className="shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="mr-1.5 size-4" />
            <span>Tambah FAQ</span>
          </Button>
        )}
      </div>

      {access.isUnlinkedBranchAdmin && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">
              Akun admin wilayah belum ditautkan ke Cabang
            </p>
            <p className="mt-0.5 text-xs opacity-90">
              Hubungi Superadmin DPP untuk menautkan akun Anda ke profil Cabang
              agar dapat menambah dan mengelola FAQ.
            </p>
          </div>
        </div>
      )}

      {/* 2. Mini stats: Total, Aktif, Draft */}
      <div className="mb-4 md:mb-6 lg:mb-8">
        <FaqStatsBar
          stats={filters.stats}
          activeStatus={filters.status}
          onSelectStatus={filters.setStatus}
          isLoading={isLoading}
        />
      </div>

      {/* 3. Search + Filter Kategori, Wilayah, Status */}
      <FaqFilterBar
        search={filters.search}
        onSearchChange={filters.setSearch}
        selectedKategori={selectedKategori}
        kategoriCounts={filters.kategoriCounts}
        onKategoriChange={handleKategoriChange}
        status={filters.status}
        onStatusChange={filters.setStatus}
        canSelectCabang={access.canSelectCabang}
        cabangValue={selectedCabang}
        onCabangChange={setSelectedCabang}
        cabangOptions={cabangList}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Daftar Compact Expandable FAQ Card */}
      <FaqCardList
        items={filters.visibleItems}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        cabangNameMap={cabangNameMap}
        canWriteItem={canWriteItem}
        permissions={permissions}
        handlers={handlers}
      />

      {/* 5. Dialog Pratinjau, Editor & Konfirmasi Hapus/Arsip */}
      <FaqPreviewDialog
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {(access.canCreate || access.canUpdate) && (
        <FaqEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editingItem={editingItem}
          canSelectCabang={access.canSelectCabang}
          cabangOptions={cabangList}
          isSubmitting={createFaq.isPending || updateFaq.isPending}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Hapus / Arsipkan FAQ?"
        description={`FAQ "${archiveTarget?.pertanyaan || ""}" akan diarsipkan dan tidak lagi tampil di halaman publik.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
        onConfirm={async () => {
          if (!archiveTarget) return;
          await archive(archiveTarget);
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}
