"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Link2,
  Phone,
  User,
  ShieldCheck,
  Building,
  Loader2,
  Filter,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { DpcItem, DpcFormValues, MasterProvinsi, CabangItem } from "@/features/wilayah/types";
import {
  useDpcList,
  useCreateDpc,
  useUpdateDpc,
  useDeleteDpc,
  useTautkanCabang,
} from "@/features/wilayah/hooks/useWilayah";
import { WilayahAccess } from "@/lib/rbac";
import { DpcEditorDialog } from "./DpcEditorDialog";
import { LinkCabangDialog } from "./LinkCabangDialog";

interface DpcTabProps {
  masterProvinsi: MasterProvinsi[];
  cabangList: CabangItem[];
  allDpcList?: DpcItem[];
  access: WilayahAccess;
}

export function DpcTab({
  masterProvinsi,
  cabangList,
  allDpcList,
  access,
}: DpcTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: dpcResponse, isLoading } = useDpcList({
    search: access.scope !== "DPC" ? searchTerm : undefined,
    kode_provinsi:
      access.canFilterProvinsi && selectedProvinsi !== "ALL"
        ? selectedProvinsi
        : undefined,
    currentPage,
    pageSize,
    enabled: access.canViewDpc,
  });

  const dpcList = useMemo(() => dpcResponse?.data || [], [dpcResponse?.data]);
  const meta = dpcResponse?.meta || { total: 0, page: 1, limit: pageSize };

  const createDpcMutation = useCreateDpc();
  const updateDpcMutation = useUpdateDpc();
  const deleteDpcMutation = useDeleteDpc();
  const tautkanCabangMutation = useTautkanCabang();

  // State Dialogs
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDpc, setEditingDpc] = useState<DpcItem | null>(null);

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkingDpc, setLinkingDpc] = useState<DpcItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingDpc, setDeletingDpc] = useState<DpcItem | null>(null);

  const hasAnyAction =
    access.canManageCabangLink || access.canEditDpc || access.canDeleteDpc;
  const colSpan = hasAnyAction ? 6 : 5;

  const existingDpcCodes = useMemo(() => {
    const source = allDpcList && allDpcList.length > 0 ? allDpcList : dpcList;
    return new Set(source.map((d) => d.kode_kabupaten));
  }, [allDpcList, dpcList]);

  // Urutkan provinsi berdasarkan kode terkecil, dan tampilkan nama tanpa kode
  const provinsiFilterOptions = useMemo(() => {
    const sorted = [...masterProvinsi].sort(
      (a, b) => Number(a.kode_provinsi) - Number(b.kode_provinsi)
    );
    return [
      { value: "ALL", label: "Semua Provinsi" },
      ...sorted.map((p) => ({
        value: p.kode_provinsi,
        label: p.nama_provinsi,
        searchKey: p.nama_provinsi,
      })),
    ];
  }, [masterProvinsi]);

  const handleOpenAdd = () => {
    setEditingDpc(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (item: DpcItem) => {
    setEditingDpc(item);
    setEditorOpen(true);
  };

  const handleOpenLink = (item: DpcItem) => {
    setLinkingDpc(item);
    setLinkOpen(true);
  };

  const handleDelete = (item: DpcItem) => {
    setDeletingDpc(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDpc) return;
    await deleteDpcMutation.mutateAsync(deletingDpc.id);
    setDeletingDpc(null);
  };

  const handleSaveEditor = async (values: Partial<DpcFormValues>) => {
    if (editingDpc) {
      await updateDpcMutation.mutateAsync({ id: editingDpc.id, payload: values });
    } else if (values.kode_kabupaten) {
      await createDpcMutation.mutateAsync(values as DpcFormValues);
    }
    setEditorOpen(false);
  };

  const handleSaveLink = async (cabangUuid: string | null) => {
    if (!linkingDpc) return;

    if (!cabangUuid && linkingDpc.cabang?.uuid) {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: linkingDpc.cabang.uuid,
        dpcId: null,
      });
      setLinkOpen(false);
      return;
    }

    if (cabangUuid) {
      if (linkingDpc.cabang?.uuid && linkingDpc.cabang.uuid !== cabangUuid) {
        await tautkanCabangMutation.mutateAsync({
          cabangUuid: linkingDpc.cabang.uuid,
          dpcId: null,
        });
      }
      await tautkanCabangMutation.mutateAsync({
        cabangUuid,
        dpcId: linkingDpc.id,
      });
      setLinkOpen(false);
    }
  };

  const totalPages = Math.ceil(meta.total / pageSize) || 1;

  return (
    <div className="space-y-5">
      {/* Contextual Info Banner untuk Admin DPD (Read-Only) atau Admin DPC (Self-Edit) */}
      {access.scope === "DPD" && (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Menampilkan seluruh DPC di wilayah provinsi Anda (hanya baca). Perubahan data DPC dikelola oleh DPP atau admin DPC terkait.
          </p>
        </div>
      )}

      {access.scope === "DPC" && (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {access.canEditDpc
              ? "Menampilkan data DPC wilayah Anda. Anda dapat memperbarui nama ketua, nomor kontak, status kepengurusan, dan nomor SK."
              : "Menampilkan data DPC wilayah Anda (mode lihat saja)."}
          </p>
        </div>
      )}

      {/* 1. Header Toolbar (DPP: Search + Filter Provinsi + Tambah; DPD: Search saja; DPC: tanpa toolbar) */}
      {access.scope !== "DPC" && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Cari kabupaten, kota, atau nama ketua..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-sm h-10 bg-background"
              />
            </div>

            {access.canFilterProvinsi && (
              <div className="w-full sm:w-64 shrink-0">
                <SearchableSelect
                  value={selectedProvinsi}
                  onValueChange={(val) => {
                    setSelectedProvinsi(val);
                    setCurrentPage(1);
                  }}
                  options={provinsiFilterOptions}
                  placeholder="Saring Provinsi"
                  searchPlaceholder="Cari provinsi..."
                  emptyMessage="Provinsi tidak ditemukan"
                  icon={<Filter className="w-4 h-4 text-muted-foreground mr-0.5" />}
                />
              </div>
            )}
          </div>

          {access.canCreateDpc && (
            <Button onClick={handleOpenAdd} className="h-10 px-4 text-sm font-medium gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span>Tambah DPC</span>
            </Button>
          )}
        </div>
      )}

      {/* 2. Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Kabupaten / Kota (DPC)</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Provinsi Induk</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Ketua / Kontak</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Status & SK</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Tautan Profil Cabang</TableHead>
              {hasAnyAction && (
                <TableHead className="text-right text-sm font-semibold py-3.5 px-4">Aksi</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-52 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm">Memuat data DPC...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : dpcList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-52 text-center text-muted-foreground text-sm">
                  <Building className="w-9 h-9 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Belum ada data DPC.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchTerm || selectedProvinsi !== "ALL"
                      ? "Tidak ada DPC yang sesuai dengan filter pencarian."
                      : access.canCreateDpc
                      ? "Klik tombol Tambah DPC untuk membentuk DPC pertama."
                      : "Belum ada DPC yang terdaftar di cakupan wilayah Anda."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              dpcList.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4 px-4">
                    <div className="font-semibold text-foreground text-sm">
                      DPC {item.dpc}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="text-sm font-medium text-foreground">
                      {item.dpd || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="space-y-1 text-sm">
                      <div className="font-medium flex items-center gap-2 text-foreground">
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{item.pengurus || "-"}</span>
                      </div>
                      {item.no_handphone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>{item.no_handphone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="space-y-1.5 text-sm">
                      <Badge
                        variant="secondary"
                        className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {item.keterangan || "Definitif"}
                      </Badge>
                      {item.penerbitan_sk && (
                        <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item.penerbitan_sk}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    {item.cabang ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5 w-fit py-1 px-2.5"
                      >
                        <Building className="w-3.5 h-3.5" />
                        {item.cabang.namaCabang}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                        Belum Ditautkan
                      </span>
                    )}
                  </TableCell>
                  {hasAnyAction && (
                    <TableCell className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {access.canManageCabangLink && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenLink(item)}
                            title="Tautkan Profil Cabang"
                          >
                            <Link2 className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                        {access.canEditDpc && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit DPC"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {access.canDeleteDpc && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(item)}
                            title="Nonaktifkan DPC"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 3. Reusable Pagination Component */}
      {(access.scope !== "DPC" || meta.total > pageSize) && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={meta.total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          isFetching={isLoading}
        />
      )}

      {/* Dialogs */}
      {(access.canCreateDpc || access.canEditDpc) && (
        <DpcEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          dpc={editingDpc}
          masterProvinsi={masterProvinsi}
          existingDpcCodes={existingDpcCodes}
          onSave={handleSaveEditor}
          isSubmitting={createDpcMutation.isPending || updateDpcMutation.isPending}
        />
      )}

      {access.canManageCabangLink && linkingDpc && (
        <LinkCabangDialog
          open={linkOpen}
          onOpenChange={setLinkOpen}
          targetType="DPC"
          targetId={linkingDpc.id}
          targetName={`DPC ${linkingDpc.dpc}`}
          currentCabangUuid={linkingDpc.cabang?.uuid || null}
          cabangList={cabangList}
          onSave={handleSaveLink}
          isSubmitting={tautkanCabangMutation.isPending}
        />
      )}

      {/* Confirmation Dialog Nonaktifkan DPC */}
      {access.canDeleteDpc && (
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Nonaktifkan DPC"
          description={`Apakah Anda yakin ingin menonaktifkan DPC ${deletingDpc?.dpc}? Data ini akan dinonaktifkan dari struktur kepengurusan aktif.`}
          confirmText="Ya, Nonaktifkan"
          cancelText="Batal"
          variant="destructive"
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
