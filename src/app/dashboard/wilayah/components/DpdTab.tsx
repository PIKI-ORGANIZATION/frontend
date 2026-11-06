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
  Building2,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DpdItem, DpdFormValues, MasterProvinsi, CabangItem } from "@/features/wilayah/types";
import {
  useDpdList,
  useCreateDpd,
  useUpdateDpd,
  useDeleteDpd,
  useTautkanCabang,
} from "@/features/wilayah/hooks/useWilayah";
import { DpdEditorDialog } from "./DpdEditorDialog";
import { LinkCabangDialog } from "./LinkCabangDialog";

interface DpdTabProps {
  masterProvinsi: MasterProvinsi[];
  cabangList: CabangItem[];
}

export function DpdTab({ masterProvinsi, cabangList }: DpdTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: dpdResponse, isLoading } = useDpdList({
    search: searchTerm,
    currentPage,
    pageSize,
  });

  const dpdList = useMemo(() => dpdResponse?.data || [], [dpdResponse?.data]);
  const meta = dpdResponse?.meta || { total: 0, page: 1, limit: pageSize };

  const createDpdMutation = useCreateDpd();
  const updateDpdMutation = useUpdateDpd();
  const deleteDpdMutation = useDeleteDpd();
  const tautkanCabangMutation = useTautkanCabang();

  // State Dialogs
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingDpd, setEditingDpd] = useState<DpdItem | null>(null);

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkingDpd, setLinkingDpd] = useState<DpdItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingDpd, setDeletingDpd] = useState<DpdItem | null>(null);

  // Set kode provinsi yang sudah terdaftar
  const existingDpdCodes = useMemo(
    () => new Set(dpdList.map((d) => d.kodeProvinsi)),
    [dpdList],
  );

  const handleOpenAdd = () => {
    setEditingDpd(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (item: DpdItem) => {
    setEditingDpd(item);
    setEditorOpen(true);
  };

  const handleOpenLink = (item: DpdItem) => {
    setLinkingDpd(item);
    setLinkOpen(true);
  };

  const handleDelete = (item: DpdItem) => {
    setDeletingDpd(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDpd) return;
    await deleteDpdMutation.mutateAsync(deletingDpd.id);
    setDeletingDpd(null);
  };

  const handleSaveEditor = async (values: DpdFormValues) => {
    if (editingDpd) {
      await updateDpdMutation.mutateAsync({ id: editingDpd.id, payload: values });
    } else {
      await createDpdMutation.mutateAsync(values);
    }
  };

  const handleSaveLink = async (cabangUuid: string | null) => {
    if (!linkingDpd) return;

    if (!cabangUuid && linkingDpd.cabang?.uuid) {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: linkingDpd.cabang.uuid,
        dpdId: null,
      });
      return;
    }

    if (cabangUuid) {
      if (linkingDpd.cabang?.uuid && linkingDpd.cabang.uuid !== cabangUuid) {
        await tautkanCabangMutation.mutateAsync({
          cabangUuid: linkingDpd.cabang.uuid,
          dpdId: null,
        });
      }
      await tautkanCabangMutation.mutateAsync({
        cabangUuid,
        dpdId: linkingDpd.id,
      });
    }
  };

  const totalPages = Math.ceil(meta.total / pageSize) || 1;

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Cari provinsi, nama ketua..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 text-sm h-10 bg-background"
          />
        </div>

        <Button onClick={handleOpenAdd} className="h-10 px-4 text-sm font-medium gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span>Tambah DPD</span>
        </Button>
      </div>

      {/* 2. Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Provinsi (DPD)</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Ketua / Kontak</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Status & SK</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Tautan Profil Cabang</TableHead>
              <TableHead className="text-right text-sm font-semibold py-3.5 px-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-52 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm">Memuat data DPD...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : dpdList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-52 text-center text-muted-foreground text-sm">
                  <Building2 className="w-9 h-9 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Belum ada data DPD.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchTerm
                      ? "Tidak ada DPD yang sesuai dengan kata kunci pencarian."
                      : "Klik tombol Tambah DPD untuk membentuk DPD pertama."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              dpdList.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4 px-4">
                    <div className="font-semibold text-foreground text-sm">
                      DPD {item.dpd}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="space-y-1 text-sm">
                      <div className="font-medium flex items-center gap-2 text-foreground">
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{item.pengurus || "-"}</span>
                      </div>
                      {item.noHandphone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>{item.noHandphone}</span>
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
                      {item.penerbitanSk && (
                        <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item.penerbitanSk}</span>
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
                        <Building2 className="w-3.5 h-3.5" />
                        {item.cabang.namaCabang}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                        Belum Ditautkan
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit DPD"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item)}
                        title="Nonaktifkan DPD"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 3. Reusable Pagination Component */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={meta.total}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isFetching={isLoading}
      />

      {/* Dialogs */}
      <DpdEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        dpd={editingDpd}
        masterProvinsi={masterProvinsi}
        existingDpdCodes={existingDpdCodes}
        onSave={handleSaveEditor}
        isSubmitting={createDpdMutation.isPending || updateDpdMutation.isPending}
      />

      {linkingDpd && (
        <LinkCabangDialog
          open={linkOpen}
          onOpenChange={setLinkOpen}
          targetType="DPD"
          targetId={linkingDpd.id}
          targetName={`DPD ${linkingDpd.dpd}`}
          currentCabangUuid={linkingDpd.cabang?.uuid || null}
          cabangList={cabangList}
          onSave={handleSaveLink}
          isSubmitting={tautkanCabangMutation.isPending}
        />
      )}

      {/* Confirmation Dialog Nonaktifkan DPD */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Nonaktifkan DPD"
        description={`Apakah Anda yakin ingin menonaktifkan DPD ${deletingDpd?.dpd}? Data ini akan dinonaktifkan dari struktur kepengurusan aktif.`}
        confirmText="Ya, Nonaktifkan"
        cancelText="Batal"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
