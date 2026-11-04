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
  ChevronLeft,
  ChevronRight,
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

  const handleDelete = async (item: DpdItem) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan DPD ${item.dpd} (${item.kodeProvinsi})?`)) {
      await deleteDpdMutation.mutateAsync(item.id);
    }
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

    // Jika melepas tautan
    if (!cabangUuid && linkingDpd.cabang?.uuid) {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: linkingDpd.cabang.uuid,
        dpdId: null,
      });
      return;
    }

    if (cabangUuid) {
      // Jika sebelumnya DPD ini terhubung ke cabang lain, lepas dulu
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
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Cari provinsi, kode, atau ketua..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 text-xs h-9"
          />
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 font-semibold">
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah DPD</span>
        </Button>
      </div>

      {/* 2. Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-16 text-center text-xs font-semibold">Kode</TableHead>
              <TableHead className="text-xs font-semibold">Provinsi (DPD)</TableHead>
              <TableHead className="text-xs font-semibold">Ketua / Kontak</TableHead>
              <TableHead className="text-xs font-semibold">Status & SK</TableHead>
              <TableHead className="text-xs font-semibold">Tautan Profil Cabang</TableHead>
              <TableHead className="text-right text-xs font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-xs">Memuat data DPD...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : dpdList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center text-muted-foreground text-xs">
                  <Building2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-medium text-foreground">Belum ada data DPD.</p>
                  <p className="text-[11px] mt-0.5">
                    {searchTerm
                      ? "Tidak ada DPD yang sesuai dengan kata kunci pencarian."
                      : "Klik tombol Tambah DPD untuk membentuk DPD pertama."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              dpdList.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="text-center font-mono font-bold text-xs">
                    <span className="bg-muted px-1.5 py-0.5 rounded border border-border/70">
                      {item.kodeProvinsi}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground text-xs md:text-sm">
                      DPD {item.dpd}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-medium flex items-center gap-1.5 text-foreground">
                        <User className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span>{item.pengurus || "-"}</span>
                      </div>
                      {item.noHandphone && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{item.noHandphone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 rounded font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {item.keterangan || "Definitif"}
                      </Badge>
                      {item.penerbitanSk && (
                        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{item.penerbitanSk}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.cabang ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1 w-fit"
                      >
                        <Building2 className="w-3 h-3" />
                        {item.cabang.namaCabang}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                        Belum Ditautkan
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenLink(item)}
                        title="Tautkan Profil Cabang"
                      >
                        <Link2 className="w-3.5 h-3.5 text-primary" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit DPD"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(item)}
                        title="Nonaktifkan DPD"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 3. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div>
            Menampilkan halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total {meta.total} DPD)
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

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

      <LinkCabangDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        targetType="DPD"
        targetId={linkingDpd?.id || ""}
        targetName={`DPD ${linkingDpd?.dpd || ""}`}
        currentCabangUuid={linkingDpd?.cabang?.uuid}
        cabangList={cabangList}
        onSave={handleSaveLink}
        isSubmitting={tautkanCabangMutation.isPending}
      />
    </div>
  );
}
