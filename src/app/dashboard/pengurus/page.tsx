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
  UserCog,
  MapPin,
  RotateCcw,
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
        label: p.namaPeriode,
        subLabel: p.cabang?.namaCabang || "Pusat (DPP)",
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
      activePeriode: periodeList.filter((p) => p.isAktif).length,
    }),
    [items, periodeList],
  );

  const hasActiveStrukturFilters =
    selectedKategori !== "ALL" ||
    selectedPeriodeUuid !== "ALL" ||
    searchQuery.trim() !== "";

  const handleResetStrukturFilters = () => {
    setSelectedKategori("ALL");
    setSelectedPeriodeUuid("ALL");
    setSearchQuery("");
  };

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
    <div className="mx-auto max-w-7xl space-y-5 py-4 sm:py-6 lg:py-8">
      {/* 1. Organization Dashboard Header */}
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <UserCog className="size-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                CMS Kepengurusan &amp; Struktur Organisasi
              </h1>
              <Badge
                variant="outline"
                className="h-5 rounded-md border-primary/25 bg-primary/10 px-2 text-[11px] font-medium text-primary"
              >
                Cakupan {access.scope}
              </Badge>
              {!access.canManage && (
                <Badge variant="secondary" className="h-5 text-[11px] font-medium">
                  Mode Baca Saja
                </Badge>
              )}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Kelola masa bakti periode kepengurusan serta susunan pengurus
              organisasi sesuai hierarki wilayah DPP, DPD, dan DPC.
            </p>
          </div>
        </div>

        {access.canManage && (
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
            {activeTab === "struktur" ? (
              <Button
                size="sm"
                onClick={handleOpenAddStruktur}
                disabled={
                  access.isUnlinkedBranchAdmin ||
                  writablePeriodeList.length === 0
                }
                className="cursor-pointer"
              >
                <Plus className="mr-1.5 size-4" />
                <span>Tambah Pengurus</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setEditingPeriode(null);
                  setIsPeriodeDialogOpen(true);
                }}
                disabled={access.isUnlinkedBranchAdmin}
                className="cursor-pointer"
              >
                <Plus className="mr-1.5 size-4" />
                <span>Tambah Periode</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {access.isUnlinkedBranchAdmin && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">
              Akun admin wilayah belum ditautkan ke Cabang
            </p>
            <p className="mt-0.5 text-xs opacity-90">
              Hubungi Superadmin DPP untuk menautkan akun Anda ke profil Cabang
              agar dapat membuat periode dan struktur kepengurusan.
            </p>
          </div>
        </div>
      )}

      {/* 2. Primary Section Tabs + Mini Stats Strip */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-full items-center overflow-x-auto pb-1 lg:pb-0">
          <div
            role="tablist"
            aria-label="Bagian Manajemen Kepengurusan"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 p-1 dark:bg-muted/40"
          >
            <button
              type="button"
              role="tab"
              id="tab-struktur"
              aria-selected={activeTab === "struktur"}
              onClick={() => setActiveTab("struktur")}
              className={cn(
                "flex cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-sm px-3.5 py-2 text-sm transition-all",
                "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                activeTab === "struktur"
                  ? "bg-background font-medium text-foreground shadow-2xs"
                  : "border border-transparent font-normal text-muted-foreground hover:bg-background/40 hover:text-foreground",
              )}
            >
              <Users
                className={cn(
                  "size-3.5 shrink-0",
                  activeTab === "struktur"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
              <span>Struktur Organisasi</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums transition-colors",
                  activeTab === "struktur"
                    ? "bg-primary/10 font-semibold text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
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
                "flex cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-sm px-3.5 py-2 text-sm transition-all",
                "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                activeTab === "periode"
                  ? "bg-background font-medium text-foreground shadow-2xs"
                  : "border border-transparent font-normal text-muted-foreground hover:bg-background/40 hover:text-foreground",
              )}
            >
              <Calendar
                className={cn(
                  "size-3.5 shrink-0",
                  activeTab === "periode"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
              <span>Periode Kepengurusan</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums transition-colors",
                  activeTab === "periode"
                    ? "bg-primary/10 font-semibold text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {periodeList.length}
              </span>
            </button>
          </div>
        </div>

        {/* Mini Stats Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/85 px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>Periode Aktif</span>
            <strong className="font-mono tabular-nums text-foreground">
              {stats.activePeriode}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/85 px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            <span>Inti</span>
            <strong className="font-mono tabular-nums text-foreground">
              {stats.inti}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/85 px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-sky-500" aria-hidden="true" />
            <span>Bidang</span>
            <strong className="font-mono tabular-nums text-foreground">
              {stats.bidang}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/85 px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            <span>Penasehat</span>
            <strong className="font-mono tabular-nums text-foreground">
              {stats.penasehat}
            </strong>
          </span>
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
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-border/80 bg-card/80 px-4 py-3.5 text-xs shadow-2xs sm:flex-row sm:items-center sm:text-sm">
                <span className="text-muted-foreground">
                  Belum ada <strong>Periode Kepengurusan</strong> untuk cabang
                  Anda. Buat periode terlebih dahulu sebelum menambahkan
                  pengurus ke struktur.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 cursor-pointer self-start sm:self-center"
                  onClick={() => {
                    setActiveTab("periode");
                    setEditingPeriode(null);
                    setIsPeriodeDialogOpen(true);
                  }}
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Buat Periode
                </Button>
              </div>
            )}

          {/* Elevated Filter Surface */}
          <div className="space-y-3 rounded-xl border border-border/80 bg-card/75 p-3.5 shadow-xs sm:p-4">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div
                role="group"
                aria-label="Filter kategori kepengurusan"
                className="flex flex-wrap items-center gap-1.5"
              >
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
                ].map((cat) => {
                  const isActive = selectedKategori === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedKategori(cat.id)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={cn(
                          "font-mono text-[11px] tabular-nums",
                          isActive ? "opacity-90" : "opacity-70",
                        )}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="w-full sm:w-60">
                  <SearchableSelect
                    value={selectedPeriodeUuid}
                    onValueChange={setSelectedPeriodeUuid}
                    options={periodeFilterOptions}
                    placeholder="Semua Periode"
                    searchPlaceholder="Cari periode..."
                    triggerClassName="h-9 rounded-sm px-3 dark:bg-input/30 dark:hover:bg-input/50"
                  />
                </div>

                <div className="min-w-0 flex-1 sm:w-56 sm:flex-initial">
                  <SearchInput
                    placeholder="Cari nama, jabatan, bidang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery("")}
                  />
                </div>

                {hasActiveStrukturFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetStrukturFilters}
                    className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-1.5 size-3.5" />
                    Reset
                  </Button>
                )}

                <div
                  role="group"
                  aria-label="Mode tampilan struktur"
                  className="inline-flex items-center rounded-md border border-border bg-muted/60 p-0.5"
                >
                  <button
                    type="button"
                    aria-pressed={viewMode === "table"}
                    onClick={() => setViewMode("table")}
                    aria-label="Tampilan tabel"
                    title="Tampilan tabel"
                    className={cn(
                      "cursor-pointer rounded-sm p-1.5 transition-colors",
                      viewMode === "table"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <List className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-pressed={viewMode === "grid"}
                    onClick={() => setViewMode("grid")}
                    aria-label="Tampilan grid"
                    title="Tampilan grid"
                    className={cn(
                      "cursor-pointer rounded-sm p-1.5 transition-colors",
                      viewMode === "grid"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                </div>
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
            <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="py-3.5 pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nama &amp; Jabatan
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Bidang
                    </TableHead>
                    <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Periode &amp; Wilayah
                    </TableHead>
                    <TableHead className="py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Urutan
                    </TableHead>
                    <TableHead className="py-3.5 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isStrukturLoading ? (
                    <SkeletonTableRows rows={6} columns={5} />
                  ) : filteredItems.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="py-14 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Users
                            className="size-8 text-muted-foreground/40"
                            aria-hidden="true"
                          />
                          <p className="text-sm font-semibold text-foreground">
                            {hasActiveStrukturFilters
                              ? "Tidak ada pengurus yang cocok"
                              : "Belum ada data struktur pengurus"}
                          </p>
                          <p className="max-w-sm text-xs">
                            {hasActiveStrukturFilters
                              ? "Coba ubah kategori, periode, atau kata kunci pencarian."
                              : "Klik tombol Tambah Pengurus untuk mulai menyusun struktur."}
                          </p>
                          {hasActiveStrukturFilters && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleResetStrukturFilters}
                              className="mt-1 cursor-pointer"
                            >
                              Reset Filter
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const itemCanManage = canManageItem(item);
                      return (
                        <TableRow
                          key={item.id}
                          onClick={() => setInspectorItem(item)}
                          className="cursor-pointer transition-colors hover:bg-muted/40"
                        >
                          <TableCell className="py-3.5 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/70">
                                <Image
                                  src={item.foto}
                                  alt={item.nama}
                                  fill
                                  className="object-cover object-top"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {item.nama}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.jabatan}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <Badge
                              variant="outline"
                              className="h-5 rounded-md border-border/60 bg-muted/40 px-2 text-[11px] font-normal text-muted-foreground"
                            >
                              {item.bidang || "Pimpinan Inti"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <p className="font-medium text-foreground">
                              {item.periode}
                            </p>
                            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MapPin className="size-3 opacity-70" aria-hidden="true" />
                              {item.cabangNama || "Pusat (DPP)"}
                            </p>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs tabular-nums text-muted-foreground">
                            #{item.urutan}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectorItem(item);
                                }}
                                aria-label={`Lihat detail ${item.nama}`}
                                title="Lihat detail"
                              >
                                <Eye className="size-3.5" />
                              </Button>
                              {itemCanManage && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                                    onClick={(e) =>
                                      handleOpenEditStruktur(item, e)
                                    }
                                    aria-label={`Ubah data ${item.nama}`}
                                    title="Ubah data"
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
                                      title="Hapus"
                                      className="cursor-pointer text-destructive hover:bg-destructive/10"
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
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="py-3.5 pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nama Periode
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Masa Bakti
                  </TableHead>
                  <TableHead className="py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Wilayah / Cabang
                  </TableHead>
                  <TableHead className="py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="py-3.5 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPeriodeLoading ? (
                  <SkeletonTableRows rows={5} columns={5} />
                ) : periodeList.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Calendar
                          className="size-8 text-muted-foreground/40"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-semibold text-foreground">
                          Belum ada periode kepengurusan
                        </p>
                        <p className="max-w-sm text-xs">
                          Tambahkan periode kepengurusan terlebih dahulu untuk
                          mengelola susunan pengurus.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  periodeList.map((p) => {
                    const periodeCanManage = canManagePeriode(p);
                    return (
                      <TableRow
                        key={p.uuid}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="py-3.5 pl-4 text-sm font-medium text-foreground">
                          {p.namaPeriode}
                        </TableCell>
                        <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                          {p.tahunMulai} – {p.tahunSelesai}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3 opacity-70" aria-hidden="true" />
                            {p.cabang?.namaCabang || "Pusat / Nasional (DPP)"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-5 gap-1.5 rounded-md px-2 text-[11px] font-medium",
                              p.isAktif
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "border-border bg-muted/60 text-muted-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                p.isAktif
                                  ? "bg-emerald-500"
                                  : "bg-muted-foreground",
                              )}
                              aria-hidden="true"
                            />
                            {p.isAktif ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
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
                                  className="h-7 cursor-pointer text-xs text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                                >
                                  <CheckCircle2 className="mr-1 size-3.5" />
                                  Aktifkan
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="cursor-pointer text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setEditingPeriode(p);
                                  setIsPeriodeDialogOpen(true);
                                }}
                                aria-label={`Edit periode ${p.namaPeriode}`}
                                title="Edit periode"
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              {access.canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setDeletingPeriodeTarget(p)}
                                  aria-label={`Hapus periode ${p.namaPeriode}`}
                                  title="Hapus periode"
                                  className="cursor-pointer text-destructive hover:bg-destructive/10"
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
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-foreground">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="size-4" aria-hidden="true" />
              </span>
              <span>Hapus Pengurus dari Struktur</span>
            </DialogTitle>
            <DialogDescription className="pt-1 text-xs leading-relaxed text-muted-foreground">
              Pengurus akan dikeluarkan dari susunan periode ini. Data
              keanggotaan anggota tetap tersimpan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setDeletingStrukturId(null)}
              disabled={deleteStruktur.isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer"
              onClick={handleConfirmDeleteStruktur}
              disabled={deleteStruktur.isPending}
            >
              {deleteStruktur.isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
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
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-foreground">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="size-4" aria-hidden="true" />
              </span>
              <span>Hapus Periode Kepengurusan</span>
            </DialogTitle>
            <DialogDescription className="pt-1 text-xs leading-relaxed text-muted-foreground">
              Apakah Anda yakin ingin menghapus periode &ldquo;
              {deletingPeriodeTarget?.namaPeriode}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => setDeletingPeriodeTarget(null)}
              disabled={deletePeriode.isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer"
              onClick={handleConfirmDeletePeriode}
              disabled={deletePeriode.isPending}
            >
              {deletePeriode.isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              Ya, Hapus Periode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
