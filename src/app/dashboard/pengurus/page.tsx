"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  usePeriodeList,
  usePeriodeMutations,
  useStrukturList,
  useStrukturMutations,
  useJabatanList,
  useBidangList,
} from "@/features/pengurus/hooks/usePengurus";
import {
  PengurusItem,
  KategoriPengurus,
  PeriodeKepengurusanItem,
  PeriodeFormValues,
  StrukturFormValues,
  toPengurusItem,
} from "@/features/pengurus/types";
import { useGetDaftarAnggota } from "@/hooks/api/useAnggota";
import { useCabangList } from "@/features/wilayah/hooks/useWilayah";
import { PengurusEditorDialog } from "./components/PengurusEditorDialog";
import { PeriodeEditorDialog } from "./components/PeriodeEditorDialog";
import { PengurusDetailDrawer } from "./components/PengurusDetailDrawer";
import { PengurusGridView } from "./components/PengurusGridView";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  SkeletonTablePage,
  SkeletonTableRows,
} from "@/components/ui/skeleton-presets";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Users,
  LayoutGrid,
  List,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AccessDeniedState } from "@/components/dashboard/AccessDeniedState";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { resolvePengurusCmsAccess, canWriteCabangItem } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type ActiveTab = "struktur" | "periode";
type FilterKategori = "ALL" | KategoriPengurus;

export default function PengurusCMSPage() {
  const { user, isReady } = useCurrentUser();
  const access = useMemo(() => resolvePengurusCmsAccess(user), [user]);

  const [activeTab, setActiveTab] = useState<ActiveTab>("struktur");
  const [selectedPeriodeUuid, setSelectedPeriodeUuid] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] =
    useState<FilterKategori>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  // Inspector & Dialog States
  const [inspectorItem, setInspectorItem] = useState<PengurusItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengurusItem | null>(null);
  const [deletingStrukturId, setDeletingStrukturId] = useState<string | null>(
    null,
  );

  const [isPeriodeDialogOpen, setIsPeriodeDialogOpen] = useState(false);
  const [editingPeriode, setEditingPeriode] =
    useState<PeriodeKepengurusanItem | null>(null);
  const [deletingPeriodeTarget, setDeletingPeriodeTarget] =
    useState<PeriodeKepengurusanItem | null>(null);

  // API Queries
  const { data: periodeList = [], isLoading: isPeriodeLoading } =
    usePeriodeList({
      fixed: "all",
      enabled: isReady && access.canView,
    });

  const { data: strukturRaw = [], isLoading: isStrukturLoading } =
    useStrukturList({
      periodeUuid: selectedPeriodeUuid,
      fixed: "all",
      enabled: isReady && access.canView,
    });

  const { data: jabatanList = [] } = useJabatanList(
    isReady && access.canManage,
  );
  const { data: bidangList = [] } = useBidangList(isReady && access.canManage);
  const { data: anggotaRes } = useGetDaftarAnggota(
    { pageSize: 200 },
    { enabled: isReady && access.canManage },
  );
  const { data: cabangList = [] } = useCabangList({
    pageSize: 500,
    enabled: isReady && access.canSelectCabang,
  });

  // Mutations
  const { createPeriode, updatePeriode, deletePeriode } = usePeriodeMutations();
  const { createStruktur, updateStruktur, deleteStruktur } =
    useStrukturMutations();

  const anggotaList = useMemo(() => anggotaRes?.data ?? [], [anggotaRes]);

  const items: PengurusItem[] = useMemo(
    () => strukturRaw.map(toPengurusItem),
    [strukturRaw],
  );

  const canManageItem = useMemo(
    () => (item: PengurusItem) =>
      access.canManage && canWriteCabangItem(user, item.cabangUuid),
    [access.canManage, user],
  );

  const canManagePeriode = useMemo(
    () => (periode: PeriodeKepengurusanItem) =>
      access.canManage && canWriteCabangItem(user, periode.cabangUuid),
    [access.canManage, user],
  );

  // Periode yang boleh dipilih saat menambah/mengedit struktur
  const writablePeriodeList = useMemo(
    () => periodeList.filter((p) => canManagePeriode(p)),
    [periodeList, canManagePeriode],
  );

  const periodeFilterOptions = useMemo(
    () => [
      { value: "ALL", label: "Semua Periode" },
      ...periodeList.map((p) => ({
        value: p.uuid,
        label: `${p.namaPeriode} `,
        subLabel: `${p.cabang?.namaCabang || "Pusat (DPP)"}`,
      })),
    ],
    [periodeList],
  );

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedKategori !== "ALL" && item.kategori !== selectedKategori) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNama = item.nama.toLowerCase().includes(q);
          const matchJabatan = item.jabatan.toLowerCase().includes(q);
          const matchBidang = item.bidang?.toLowerCase().includes(q);
          return matchNama || matchJabatan || matchBidang;
        }
        return true;
      })
      .sort((a, b) => a.urutan - b.urutan);
  }, [items, selectedKategori, searchQuery]);

  const stats = useMemo(
    () => ({
      total: items.length,
      inti: items.filter((i) => i.kategori === "INTI").length,
      bidang: items.filter((i) => i.kategori === "BIDANG").length,
      penasehat: items.filter((i) => i.kategori === "PENASEHAT").length,
    }),
    [items],
  );

  // Handlers Struktur
  const handleOpenAddStruktur = () => {
    if (!access.canManage || access.isUnlinkedBranchAdmin) return;
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditStruktur = (item: PengurusItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!canManageItem(item)) return;
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleSaveStruktur = async (values: StrukturFormValues) => {
    if (editingItem) {
      await updateStruktur.mutateAsync({ uuid: editingItem.id, values });
    } else {
      await createStruktur.mutateAsync(values);
    }
  };

  const handleConfirmDeleteStruktur = async () => {
    if (!deletingStrukturId) return;
    await deleteStruktur.mutateAsync(deletingStrukturId);
    if (inspectorItem?.id === deletingStrukturId) {
      setInspectorItem(null);
    }
    setDeletingStrukturId(null);
  };

  // Handlers Periode
  const handleSavePeriode = async (values: PeriodeFormValues) => {
    if (editingPeriode) {
      await updatePeriode.mutateAsync({ uuid: editingPeriode.uuid, values });
    } else {
      await createPeriode.mutateAsync(values);
    }
  };

  const handleConfirmDeletePeriode = async () => {
    if (!deletingPeriodeTarget) return;
    await deletePeriode.mutateAsync(deletingPeriodeTarget.uuid);
    if (selectedPeriodeUuid === deletingPeriodeTarget.uuid) {
      setSelectedPeriodeUuid("ALL");
    }
    setDeletingPeriodeTarget(null);
  };

  if (!isReady) {
    return (
      <SkeletonTablePage
        showTabs
        tabCount={2}
        columns={5}
        rows={6}
        label="Memuat CMS Data Pengurus…"
      />
    );
  }

  if (!access.canView) {
    return (
      <AccessDeniedState
        title="Akses CMS Pengurus Ditolak"
        description="Akun Anda tidak memiliki izin melihat atau mengelola data periode dan struktur kepengurusan."
      />
    );
  }

  return (
    <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              CMS Kepengurusan &amp; Struktur Organisasi
            </h1>
            {!access.canManage && (
              <Badge variant="secondary" className="text-xs font-medium">
                Mode Baca Saja
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola masa bakti periode kepengurusan serta susunan pengurus
            organisasi sesuai hierarki wilayah DPP, DPD, dan DPC.
          </p>
        </div>

        {access.canManage && (
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === "struktur" ? (
              <Button
                onClick={handleOpenAddStruktur}
                disabled={
                  access.isUnlinkedBranchAdmin ||
                  writablePeriodeList.length === 0
                }
                className="cursor-pointer"
              >
                <Plus className="size-4 mr-2" />
                <span>Tambah Pengurus</span>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEditingPeriode(null);
                  setIsPeriodeDialogOpen(true);
                }}
                disabled={access.isUnlinkedBranchAdmin}
                className="cursor-pointer"
              >
                <Plus className="size-4 mr-2" />
                <span>Tambah Periode</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {access.isUnlinkedBranchAdmin && (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200"
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">
              Akun admin wilayah belum ditautkan ke Cabang
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              Hubungi Superadmin DPP untuk menautkan akun Anda ke profil Cabang
              agar dapat membuat periode dan struktur kepengurusan.
            </p>
          </div>
        </div>
      )}

      {/* 2. Primary Section Tabs (Struktur vs Periode) */}
      <div className="flex items-center overflow-x-auto pb-1">
        <div
          role="tablist"
          aria-label="Bagian Manajemen Kepengurusan"
          className="inline-flex items-center gap-1 p-1 rounded-md bg-muted/60 dark:bg-muted/40 border border-border"
        >
          <button
            type="button"
            role="tab"
            id="tab-struktur"
            aria-selected={activeTab === "struktur"}
            onClick={() => setActiveTab("struktur")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-sm rounded-sm transition-all whitespace-nowrap cursor-pointer",
              activeTab === "struktur"
                ? "bg-background text-foreground font-medium shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Users className="size-4" />
            <span>Struktur Organisasi</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary">
              {items.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-periode"
            aria-selected={activeTab === "periode"}
            onClick={() => setActiveTab("periode")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-sm rounded-sm transition-all whitespace-nowrap cursor-pointer",
              activeTab === "periode"
                ? "bg-background text-foreground font-medium shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Calendar className="size-4" />
            <span>Periode Kepengurusan</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary">
              {periodeList.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Tab Panel: Struktur Organisasi */}
      {activeTab === "struktur" && (
        <div
          role="tabpanel"
          aria-labelledby="tab-struktur"
          className="space-y-4"
        >
          {access.canManage &&
            !access.isUnlinkedBranchAdmin &&
            !isPeriodeLoading &&
            writablePeriodeList.length === 0 && (
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  Belum ada <strong>Periode Kepengurusan</strong> untuk cabang
                  Anda. Buat periode terlebih dahulu sebelum menambahkan
                  pengurus ke struktur.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveTab("periode");
                    setEditingPeriode(null);
                    setIsPeriodeDialogOpen(true);
                  }}
                >
                  <Plus className="size-3.5 mr-1.5" />
                  Buat Periode
                </Button>
              </div>
            )}

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL" as const, label: "Semua", count: stats.total },
                {
                  id: "INTI" as const,
                  label: "Pimpinan Inti",
                  count: stats.inti,
                },
                { id: "BIDANG" as const, label: "Bidang", count: stats.bidang },
                {
                  id: "PENASEHAT" as const,
                  label: "Penasehat",
                  count: stats.penasehat,
                },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedKategori(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                    selectedKategori === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground",
                  )}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-64">
                <SearchableSelect
                  value={selectedPeriodeUuid}
                  onValueChange={setSelectedPeriodeUuid}
                  options={periodeFilterOptions}
                  placeholder="Semua Periode"
                  searchPlaceholder="Cari periode..."
                />
              </div>

              <div className="w-56">
                <SearchInput
                  placeholder="Cari nama, jabatan, bidang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery("")}
                />
              </div>

              <div className="inline-flex items-center p-0.5 rounded-md bg-muted/60 border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  aria-label="Tampilan tabel"
                  className={cn(
                    "p-1.5 rounded-sm cursor-pointer",
                    viewMode === "table"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground",
                  )}
                >
                  <List className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Tampilan grid"
                  className={cn(
                    "p-1.5 rounded-sm cursor-pointer",
                    viewMode === "grid"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground",
                  )}
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {viewMode === "grid" ? (
            <PengurusGridView
              items={filteredItems}
              isLoaded={!isStrukturLoading}
              canManage={access.canManage}
              canManageItem={canManageItem}
              activeId={inspectorItem?.id}
              onSelect={(item) => setInspectorItem(item)}
              onEdit={handleOpenEditStruktur}
              onDelete={(id, e) => {
                e.stopPropagation();
                const target = items.find((i) => i.id === id);
                if (target && canManageItem(target)) setDeletingStrukturId(id);
              }}
            />
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama &amp; Jabatan</TableHead>
                    <TableHead>Bidang</TableHead>
                    <TableHead>Periode &amp; Wilayah</TableHead>
                    <TableHead className="text-center">Urutan</TableHead>
                    <TableHead className="text-right pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isStrukturLoading ? (
                    <SkeletonTableRows rows={6} columns={5} />
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-40 text-center text-sm text-muted-foreground"
                      >
                        Belum ada data struktur pengurus untuk filter ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const itemCanManage = canManageItem(item);
                      return (
                        <TableRow
                          key={item.id}
                          onClick={() => setInspectorItem(item)}
                          className="cursor-pointer hover:bg-muted/40"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative size-9 rounded-full overflow-hidden bg-muted shrink-0">
                                <Image
                                  src={item.foto}
                                  alt={item.nama}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">
                                  {item.nama}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.jabatan}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.bidang || "Pimpinan Inti"}
                          </TableCell>
                          <TableCell className="text-xs">
                            <p className="font-medium text-foreground">
                              {item.periode}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.cabangNama || "Pusat (DPP)"}
                            </p>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs">
                            #{item.urutan}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="inline-flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectorItem(item);
                                }}
                                aria-label={`Lihat detail ${item.nama}`}
                              >
                                <Eye className="size-3.5" />
                              </Button>
                              {itemCanManage && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={(e) =>
                                      handleOpenEditStruktur(item, e)
                                    }
                                    aria-label={`Ubah data ${item.nama}`}
                                  >
                                    <Edit2 className="size-3.5" />
                                  </Button>
                                  {access.canDelete && (
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingStrukturId(item.id);
                                      }}
                                      aria-label={`Hapus ${item.nama}`}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* 4. Tab Panel: Periode Kepengurusan */}
      {activeTab === "periode" && (
        <div
          role="tabpanel"
          aria-labelledby="tab-periode"
          className="space-y-4"
        >
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Periode</TableHead>
                  <TableHead>Masa Bakti</TableHead>
                  <TableHead>Wilayah / Cabang</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPeriodeLoading ? (
                  <SkeletonTableRows rows={5} columns={5} />
                ) : periodeList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-40 text-center text-sm text-muted-foreground"
                    >
                      Belum ada periode kepengurusan.
                    </TableCell>
                  </TableRow>
                ) : (
                  periodeList.map((p) => {
                    const periodeCanManage = canManagePeriode(p);
                    return (
                      <TableRow key={p.uuid}>
                        <TableCell className="font-medium text-sm">
                          {p.namaPeriode}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {p.tahunMulai} – {p.tahunSelesai}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.cabang?.namaCabang || "Pusat / Nasional (DPP)"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px]",
                              p.isAktif
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {p.isAktif ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          {periodeCanManage && (
                            <div className="inline-flex items-center gap-1">
                              {!p.isAktif && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updatePeriode.mutate({
                                      uuid: p.uuid,
                                      values: { isAktif: true },
                                    })
                                  }
                                  className="h-7 text-xs text-emerald-600"
                                >
                                  <CheckCircle2 className="size-3.5 mr-1" />
                                  Aktifkan
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => {
                                  setEditingPeriode(p);
                                  setIsPeriodeDialogOpen(true);
                                }}
                                aria-label={`Edit periode ${p.namaPeriode}`}
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              {access.canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setDeletingPeriodeTarget(p)}
                                  aria-label={`Hapus periode ${p.namaPeriode}`}
                                  className="text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Inspector Drawer */}
      <PengurusDetailDrawer
        item={inspectorItem}
        allItems={filteredItems}
        canManage={access.canManage}
        canManageItem={canManageItem}
        onClose={() => setInspectorItem(null)}
        onEdit={(item) => handleOpenEditStruktur(item)}
        onDelete={(id) => setDeletingStrukturId(id)}
        onNavigate={(nextItem) => setInspectorItem(nextItem)}
      />

      {/* Editor Dialog Struktur */}
      {access.canManage && (
        <PengurusEditorDialog
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          initialData={editingItem}
          defaultPeriodeUuid={
            selectedPeriodeUuid !== "ALL" ? selectedPeriodeUuid : undefined
          }
          periodeOptions={writablePeriodeList}
          jabatanOptions={jabatanList}
          bidangOptions={bidangList}
          anggotaOptions={anggotaList}
          atasanOptions={items}
          isSubmitting={createStruktur.isPending || updateStruktur.isPending}
          onSave={handleSaveStruktur}
        />
      )}

      {/* Editor Dialog Periode */}
      {access.canManage && (
        <PeriodeEditorDialog
          open={isPeriodeDialogOpen}
          onOpenChange={setIsPeriodeDialogOpen}
          editingPeriode={editingPeriode}
          canSelectCabang={access.canSelectCabang}
          cabangOptions={cabangList}
          isSubmitting={createPeriode.isPending || updatePeriode.isPending}
          onSave={handleSavePeriode}
        />
      )}

      {/* Delete Struktur Confirmation */}
      <Dialog
        open={Boolean(deletingStrukturId)}
        onOpenChange={(open) => !open && setDeletingStrukturId(null)}
      >
        <DialogContent className="sm:max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Hapus Pengurus dari Struktur
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Pengurus akan dikeluarkan dari susunan periode ini. Data
              keanggotaan anggota tetap tersimpan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingStrukturId(null)}
              disabled={deleteStruktur.isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteStruktur}
              disabled={deleteStruktur.isPending}
            >
              {deleteStruktur.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Periode Confirmation */}
      <Dialog
        open={Boolean(deletingPeriodeTarget)}
        onOpenChange={(open) => !open && setDeletingPeriodeTarget(null)}
      >
        <DialogContent className="sm:max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Hapus Periode Kepengurusan
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Apakah Anda yakin ingin menghapus periode &ldquo;
              {deletingPeriodeTarget?.namaPeriode}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingPeriodeTarget(null)}
              disabled={deletePeriode.isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeletePeriode}
              disabled={deletePeriode.isPending}
            >
              {deletePeriode.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Ya, Hapus Periode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
