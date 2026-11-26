"use client";

import React, { useState, useMemo } from "react";
import {
  KeyRound,
  Plus,
  Search,
  Edit2,
  UserX,
  Building2,
  Building,
  Users,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  UserCheck,
  Shield,
  Filter,
} from "lucide-react";
import {
  SkeletonTablePage,
  SkeletonTableRows,
} from "@/components/ui/skeleton-presets";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasAnyPermission, hasPermission } from "@/lib/rbac";
import {
  useAkunList,
  useCreateAkun,
  useUpdateAkun,
  useDeleteAkun,
} from "@/features/akun/hooks/useAkun";
import {
  AkunItem,
  CreateAkunPayload,
  StatusAkun,
  UpdateAkunPayload,
} from "@/features/akun/types";
import {
  useCabangList,
  useRolesList,
} from "@/features/wilayah/hooks/useWilayah";
import { AkunEditorDialog } from "./components/AkunEditorDialog";

type StatusTab = "ALL" | StatusAkun;
type AccountTypeFilter = "ALL" | "NON_MEMBER" | "MEMBER";

const ACCOUNT_TYPE_OPTIONS = [
  { value: "ALL", label: "Semua Tipe Akun" },
  { value: "NON_MEMBER", label: "Admin Non-Anggota" },
  { value: "MEMBER", label: "Akun Anggota" },
];

function getRoleBadgeClass(roleName: string): string {
  const upper = roleName.toUpperCase();
  if (upper === "SUPER_ADMIN" || upper === "ADMIN_DPP") {
    return "bg-primary/10 text-primary border-primary/20";
  }
  if (upper === "ADMIN_CABANG" || upper === "ADMIN_DPC") {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  }
  if (upper === "KETUA_CABANG") {
    return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
  }
  return "bg-muted text-muted-foreground border-border";
}

export default function ManajemenAkunPage() {
  const { user, isReady } = useCurrentUser();

  const canAccessPage = hasAnyPermission(user, ["AKUN_CREATE", "AKUN_UPDATE"]);
  const canCreate = hasPermission(user, "AKUN_CREATE");
  const canUpdate = hasPermission(user, "AKUN_UPDATE");
  const canDelete = hasPermission(user, "AKUN_DELETE");

  const [statusTab, setStatusTab] = useState<StatusTab>("ALL");
  const [accountTypeFilter, setAccountTypeFilter] =
    useState<AccountTypeFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dialog states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAkun, setEditingAkun] = useState<AkunItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingAkun, setDeletingAkun] = useState<AkunItem | null>(null);

  const shouldFetch = isReady && canAccessPage;

  const { data: akunResponse, isLoading } = useAkunList({
    search: searchTerm,
    statusAkun: statusTab === "ALL" ? undefined : statusTab,
    currentPage,
    pageSize,
    enabled: shouldFetch,
  });

  const { data: cabangList = [], isLoading: isLoadingCabang } = useCabangList({
    pageSize: 100,
    enabled: shouldFetch,
  });

  const { data: roleList = [], isLoading: isLoadingRoles } = useRolesList(shouldFetch);

  const createMutation = useCreateAkun();
  const updateMutation = useUpdateAkun();
  const deleteMutation = useDeleteAkun();

  const cabangById = useMemo(() => {
    const map = new Map<string, (typeof cabangList)[number]>();
    cabangList.forEach((c) => map.set(c.uuid, c));
    return map;
  }, [cabangList]);

  const rawAkunList = useMemo(() => akunResponse?.data ?? [], [akunResponse]);
  const pagination = akunResponse?.pagination ?? {
    currentPage: 1,
    pageSize,
    total: 0,
  };

  const filteredAkunList = useMemo(() => {
    if (accountTypeFilter === "ALL") return rawAkunList;
    if (accountTypeFilter === "NON_MEMBER") {
      return rawAkunList.filter((a) => !a.anggotaUuid && !a.anggota);
    }
    return rawAkunList.filter((a) => Boolean(a.anggotaUuid || a.anggota));
  }, [rawAkunList, accountTypeFilter]);

  const totalPages = Math.ceil(pagination.total / pageSize) || 1;

  const handleOpenCreate = () => {
    setEditingAkun(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (item: AkunItem) => {
    setEditingAkun(item);
    setEditorOpen(true);
  };

  const handleOpenDelete = (item: AkunItem) => {
    setDeletingAkun(item);
    setDeleteConfirmOpen(true);
  };

  const handleCreate = async (payload: CreateAkunPayload) => {
    await createMutation.mutateAsync(payload);
    setEditorOpen(false);
  };

  const handleUpdate = async (payload: UpdateAkunPayload) => {
    await updateMutation.mutateAsync(payload);
    setEditorOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAkun) return;
    await deleteMutation.mutateAsync(deletingAkun.uuid);
    setDeletingAkun(null);
  };

  // Loading hydration state
  if (!isReady) {
    return (
      <SkeletonTablePage
        showTabs
        tabCount={3}
        columns={5}
        rows={6}
        className="px-4 sm:px-6"
        label="Memeriksa hak akses manajemen akun…"
      />
    );
  }

  // Unauthorized guard
  if (!canAccessPage) {
    return (
      <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-border/70 pb-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <KeyRound className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Manajemen Akun &amp; Akses
            </h1>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Akses Terbatas — Khusus Super Admin (DPP)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pengelolaan pembuatan akun admin, penugasan role, dan penautan cabang
                hanya tersedia bagi akun yang memiliki izin{" "}
                <span className="font-mono text-xs font-semibold text-foreground">
                  AKUN_CREATE
                </span>{" "}
                atau{" "}
                <span className="font-mono text-xs font-semibold text-foreground">
                  AKUN_UPDATE
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const STATUS_TABS: Array<{
    id: StatusTab;
    label: string;
    icon: React.ElementType;
  }> = [
    { id: "ALL", label: "Semua Akun", icon: Users },
    { id: "ACTIVE", label: "Aktif", icon: CheckCircle2 },
    { id: "INACTIVE", label: "Nonaktif", icon: XCircle },
  ];

  return (
    <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <KeyRound className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Manajemen Akun &amp; Akses
            </h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Buat akun admin DPD/DPC (termasuk admin non-anggota), kelola role akses,
            tautan cabang wilayah, serta status aktif akun.
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={handleOpenCreate}
            className="h-10 px-4 text-sm font-medium gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Akun Admin</span>
          </Button>
        )}
      </div>

      {/* 2. Segmented Tabs Status */}
      <div className="flex items-center overflow-x-auto pb-1 max-w-full">
        <div
          role="tablist"
          aria-label="Filter Status Akun"
          className="inline-flex items-center gap-1 p-1 rounded-md bg-muted/60 dark:bg-muted/40 border border-border"
        >
          {STATUS_TABS.map((tab) => {
            const isSelected = statusTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setStatusTab(tab.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-all whitespace-nowrap cursor-pointer select-none",
                  "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                  isSelected
                    ? "bg-background text-foreground font-medium shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40 font-normal border border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Toolbar Search & Filter Tipe */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Cari email atau username..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 text-sm h-10 bg-background"
            />
          </div>

          <div className="w-full sm:w-56 shrink-0">
            <SearchableSelect
              value={accountTypeFilter}
              onValueChange={(val) =>
                setAccountTypeFilter(val as AccountTypeFilter)
              }
              options={ACCOUNT_TYPE_OPTIONS}
              placeholder="Filter tipe akun"
              searchPlaceholder="Cari tipe..."
              icon={<Filter className="w-4 h-4 text-muted-foreground mr-0.5" />}
            />
          </div>
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-sm font-semibold py-3.5 px-4">
                Akun &amp; Identitas
              </TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">
                Role Akses
              </TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">
                Cabang &amp; Wilayah
              </TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">
                Status
              </TableHead>
              <TableHead className="text-right text-sm font-semibold py-3.5 px-4">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows rows={6} columns={5} />
            ) : filteredAkunList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-52 text-center text-muted-foreground text-sm"
                >
                  <KeyRound className="w-9 h-9 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">
                    Tidak ada akun ditemukan.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchTerm || statusTab !== "ALL" || accountTypeFilter !== "ALL"
                      ? "Coba sesuaikan kata kunci pencarian atau filter status."
                      : "Klik tombol Buat Akun Admin untuk menambahkan akun pertama."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredAkunList.map((item) => {
                const isSelf = item.uuid === user?.sub;
                const isMember = Boolean(item.anggotaUuid || item.anggota);
                const effectiveCabangUuid =
                  item.cabangUuid || item.anggota?.cabangUuid || null;
                const cabangObj = effectiveCabangUuid
                  ? cabangById.get(effectiveCabangUuid)
                  : null;

                return (
                  <TableRow
                    key={item.uuid}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {item.username}
                          </span>
                          {isSelf && (
                            <Badge
                              variant="outline"
                              className="text-xs py-0 px-1.5 bg-primary/10 text-primary border-primary/20"
                            >
                              Anda
                            </Badge>
                          )}
                          {!isMember ? (
                            <Badge
                              variant="secondary"
                              className="text-xs py-0 px-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium gap-1"
                            >
                              <Shield className="w-3 h-3" />
                              Admin Non-Anggota
                            </Badge>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                              {item.anggota?.namaLengkap || "Anggota"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.email}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.roles && item.roles.length > 0 ? (
                          item.roles.map((r) => (
                            <Badge
                              key={r.uuid}
                              variant="outline"
                              className={cn(
                                "text-xs font-medium px-2 py-0.5",
                                getRoleBadgeClass(r.namaRole),
                              )}
                            >
                              {r.namaRole}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Tanpa Role
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4">
                      {cabangObj ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            {cabangObj.dpdId ? (
                              <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                            ) : (
                              <Building className="w-4 h-4 text-indigo-500 shrink-0" />
                            )}
                            <span>{cabangObj.namaCabang}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {cabangObj.dpdId
                              ? `Tingkat DPD · ${cabangObj.provinsi}`
                              : cabangObj.dpcId
                              ? `Tingkat DPC · ${cabangObj.kabupatenKota}`
                              : `${cabangObj.kabupatenKota}, ${cabangObj.provinsi}`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Nasional / Tanpa Cabang
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-4 px-4">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs px-2.5 py-0.5 font-medium rounded-md",
                          item.statusAkun === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.statusAkun === "ACTIVE" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canUpdate && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Akun & Hak Akses"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && item.statusAkun === "ACTIVE" && !isSelf && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleOpenDelete(item)}
                            title="Nonaktifkan Akun"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
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

      {/* 5. Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isFetching={isLoading}
      />

      {/* Dialog Tambah / Edit Akun */}
      <AkunEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        akun={editingAkun}
        cabangList={cabangList}
        roleList={roleList}
        isLoadingCabang={isLoadingCabang}
        isLoadingRoles={isLoadingRoles}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Confirmation Dialog Nonaktifkan Akun */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Nonaktifkan Akun"
        description={`Apakah Anda yakin ingin menonaktifkan akun "${deletingAkun?.username}" (${deletingAkun?.email})? Pemilik akun tidak akan dapat login hingga diaktifkan kembali.`}
        confirmText="Ya, Nonaktifkan"
        cancelText="Batal"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
