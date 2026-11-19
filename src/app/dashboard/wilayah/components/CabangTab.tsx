"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Building,
  MapPin,
  Link2,
  Unlink,
  Search,
  Loader2,
  Plus,
  Edit2,
  Trash2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  CabangItem,
  CabangFormValues,
  DpdItem,
  DpcItem,
  MasterProvinsi,
} from "@/features/wilayah/types";
import {
  useCreateCabang,
  useUpdateCabang,
  useDeleteCabang,
  useTautkanCabang,
} from "@/features/wilayah/hooks/useWilayah";
import { CabangEditorDialog } from "./CabangEditorDialog";

interface CabangTabProps {
  cabangList: CabangItem[];
  dpdList: DpdItem[];
  dpcList: DpcItem[];
  masterProvinsi: MasterProvinsi[];
  isLoading: boolean;
}

const TINGKAT_ORGANISASI_OPTIONS = [
  { value: "NONE", label: "Lepaskan Tautan (Tanpa Wilayah)" },
  { value: "DPD", label: "Tingkat Daerah / Provinsi (DPD)" },
  { value: "DPC", label: "Tingkat Cabang / Kab-Kota (DPC)" },
];

export function CabangTab({
  cabangList,
  dpdList,
  dpcList,
  masterProvinsi,
  isLoading,
}: CabangTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // State Quick Link Dialog
  const [selectedCabang, setSelectedCabang] = useState<CabangItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkType, setLinkType] = useState<"NONE" | "DPD" | "DPC">("NONE");
  const [targetId, setTargetId] = useState<string>("");

  // State Editor Dialog (Create / Edit)
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCabang, setEditingCabang] = useState<CabangItem | null>(null);

  // State Delete Confirm Dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCabang, setDeletingCabang] = useState<CabangItem | null>(null);

  const createCabangMutation = useCreateCabang();
  const updateCabangMutation = useUpdateCabang();
  const deleteCabangMutation = useDeleteCabang();
  const tautkanCabangMutation = useTautkanCabang();

  const safeCabangList = useMemo(
    () => (Array.isArray(cabangList) ? cabangList : []),
    [cabangList],
  );

  const filteredCabang = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return safeCabangList.filter((c) => {
      return (
        !q ||
        c.namaCabang.toLowerCase().includes(q) ||
        c.provinsi.toLowerCase().includes(q) ||
        c.kabupatenKota.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [safeCabangList, searchTerm]);

  const totalPages = Math.ceil(filteredCabang.length / pageSize) || 1;
  const paginatedCabang = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCabang.slice(start, start + pageSize);
  }, [filteredCabang, currentPage, pageSize]);

  // Filter DPD yang belum dipakai cabang lain (kecuali cabang yang sedang diatur)
  const dpdOptions = useMemo(() => {
    const usedDpdIds = new Set(
      safeCabangList
        .filter((c) => c.dpdId && c.uuid !== selectedCabang?.uuid)
        .map((c) => c.dpdId as string),
    );

    const sorted = [...dpdList]
      .filter(
        (d) =>
          !usedDpdIds.has(d.id) &&
          (!d.cabang || d.cabang.uuid === selectedCabang?.uuid),
      )
      .sort((a, b) => Number(a.kodeProvinsi) - Number(b.kodeProvinsi));

    return sorted.map((d) => ({
      value: d.id,
      label: `DPD ${d.dpd}`,
      searchKey: `DPD ${d.dpd}`,
    }));
  }, [dpdList, safeCabangList, selectedCabang?.uuid]);

  // Filter DPC yang belum dipakai cabang lain (kecuali cabang yang sedang diatur)
  const dpcOptions = useMemo(() => {
    const usedDpcIds = new Set(
      safeCabangList
        .filter((c) => c.dpcId && c.uuid !== selectedCabang?.uuid)
        .map((c) => c.dpcId as number),
    );

    const sorted = [...dpcList]
      .filter(
        (d) =>
          !usedDpcIds.has(d.id) &&
          (!d.cabang || d.cabang.uuid === selectedCabang?.uuid),
      )
      .sort((a, b) => {
        const p = Number(a.kode_provinsi) - Number(b.kode_provinsi);
        if (p !== 0) return p;
        return Number(a.kode_kabupaten) - Number(b.kode_kabupaten);
      });

    return sorted.map((d) => ({
      value: String(d.id),
      label: `DPC ${d.dpc} (${d.dpd})`,
      searchKey: `DPC ${d.dpc} ${d.dpd}`,
    }));
  }, [dpcList, safeCabangList, selectedCabang?.uuid]);

  const handleOpenAdd = () => {
    setEditingCabang(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (cabang: CabangItem) => {
    setEditingCabang(cabang);
    setEditorOpen(true);
  };

  const handleOpenDelete = (cabang: CabangItem) => {
    setDeletingCabang(cabang);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCabang) return;
    await deleteCabangMutation.mutateAsync(deletingCabang.uuid);
    setDeletingCabang(null);
  };

  const handleSaveEditor = async (values: CabangFormValues) => {
    if (editingCabang) {
      await updateCabangMutation.mutateAsync({
        uuid: editingCabang.uuid,
        payload: values,
      });
    } else {
      await createCabangMutation.mutateAsync(values);
    }
    setEditorOpen(false);
  };

  const handleOpenManageLink = (cabang: CabangItem) => {
    setSelectedCabang(cabang);
    if (cabang.dpdId) {
      setLinkType("DPD");
      setTargetId(cabang.dpdId);
    } else if (cabang.dpcId) {
      setLinkType("DPC");
      setTargetId(String(cabang.dpcId));
    } else {
      setLinkType("NONE");
      setTargetId("");
    }
    setDialogOpen(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCabang) return;

    if (linkType === "NONE") {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: selectedCabang.uuid,
        dpdId: null,
        dpcId: null,
      });
    } else if (linkType === "DPD") {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: selectedCabang.uuid,
        dpdId: targetId || null,
        dpcId: null,
      });
    } else if (linkType === "DPC") {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: selectedCabang.uuid,
        dpdId: null,
        dpcId: targetId ? Number(targetId) : null,
      });
    }

    setDialogOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Cari profil cabang, provinsi, kota, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 text-sm h-10 bg-background"
          />
        </div>

        <Button
          onClick={handleOpenAdd}
          className="h-10 px-4 text-sm font-medium gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Profil Cabang</span>
        </Button>
      </div>

      {/* 2. Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Nama Profil Cabang</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Lokasi &amp; Domisili</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Status Publik</TableHead>
              <TableHead className="text-sm font-semibold py-3.5 px-4">Tautan Kepengurusan</TableHead>
              <TableHead className="text-right text-sm font-semibold py-3.5 px-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-52 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm">Memuat profil cabang...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCabang.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-52 text-center text-muted-foreground text-sm">
                  <Building className="w-9 h-9 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Tidak ada profil cabang ditemukan.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchTerm
                      ? "Coba sesuaikan kata kunci pencarian Anda."
                      : "Klik tombol Tambah Profil Cabang untuk membuat profil cabang pertama."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCabang.map((item) => {
                const linkedDpd = item.dpdId ? dpdList.find((d) => d.id === item.dpdId) : null;
                const linkedDpc = item.dpcId ? dpcList.find((d) => d.id === item.dpcId) : null;

                return (
                  <TableRow key={item.uuid} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4 px-4">
                      <div className="font-semibold text-foreground text-sm">
                        {item.namaCabang}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.email}</div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="text-sm space-y-1">
                        <div className="font-medium flex items-center gap-1.5 text-foreground">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>{item.kabupatenKota}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pl-5.5">
                          {item.provinsi}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs px-2.5 py-0.5 font-medium rounded-md ${
                          item.statusCabang === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.statusCabang === "ACTIVE" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      {item.dpdId ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1.5 w-fit py-1 px-2.5"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          Tingkat DPD: {linkedDpd?.dpd || item.dpdRef?.dpd || "Provinsi"}
                        </Badge>
                      ) : item.dpcId ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium flex items-center gap-1.5 w-fit py-1 px-2.5"
                        >
                          <Building className="w-3.5 h-3.5" />
                          Tingkat DPC: {linkedDpc?.dpc || item.dpcRef?.dpc || "Kabupaten/Kota"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                          <Unlink className="w-3.5 h-3.5 opacity-60" /> Belum Tertaut
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
                          onClick={() => handleOpenManageLink(item)}
                          title="Atur Tautan Wilayah"
                        >
                          <Link2 className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Profil Cabang"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {item.statusCabang === "ACTIVE" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleOpenDelete(item)}
                            title="Nonaktifkan Profil Cabang"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* 3. Reusable Pagination Component */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredCabang.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isFetching={isLoading}
      />

      {/* Dialog Tambah / Edit Profil Cabang */}
      <CabangEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        cabang={editingCabang}
        cabangList={safeCabangList}
        dpdList={dpdList}
        dpcList={dpcList}
        masterProvinsi={masterProvinsi}
        onSave={handleSaveEditor}
        isSubmitting={createCabangMutation.isPending || updateCabangMutation.isPending}
      />

      {/* Dialog Atur Tautan Cabang Cepat */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Link2 className="w-5 h-5 text-primary" />
              Atur Tautan: {selectedCabang?.namaCabang}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Tautkan profil cabang publik ini ke struktur kepengurusan DPD (Provinsi) atau DPC (Kabupaten/Kota).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveLink} className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="linkType-select" className="text-sm font-medium text-foreground">
                Tingkat Organisasi
              </Label>
              <SearchableSelect
                id="linkType-select"
                value={linkType}
                onValueChange={(val) => {
                  setLinkType(val as "NONE" | "DPD" | "DPC");
                  setTargetId("");
                }}
                options={TINGKAT_ORGANISASI_OPTIONS}
                placeholder="Pilih tingkat..."
                searchPlaceholder="Cari tingkat..."
              />
            </div>

            {linkType === "DPD" && (
              <div className="space-y-2">
                <Label htmlFor="select-dpd-target" className="text-sm font-medium text-foreground">
                  Pilih DPD (Provinsi)
                </Label>
                <SearchableSelect
                  id="select-dpd-target"
                  value={targetId}
                  onValueChange={(val) => setTargetId(val)}
                  options={dpdOptions}
                  placeholder="Pilih DPD yang belum tertaut..."
                  searchPlaceholder="Cari nama provinsi / DPD..."
                  emptyMessage="Semua DPD sudah tertaut atau tidak ditemukan"
                />
              </div>
            )}

            {linkType === "DPC" && (
              <div className="space-y-2">
                <Label htmlFor="select-dpc-target" className="text-sm font-medium text-foreground">
                  Pilih DPC (Kabupaten/Kota)
                </Label>
                <SearchableSelect
                  id="select-dpc-target"
                  value={targetId}
                  onValueChange={(val) => setTargetId(val)}
                  options={dpcOptions}
                  placeholder="Pilih DPC yang belum tertaut..."
                  searchPlaceholder="Cari kabupaten/kota / DPC..."
                  emptyMessage="Semua DPC sudah tertaut atau tidak ditemukan"
                />
              </div>
            )}

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={tautkanCabangMutation.isPending}
                className="h-10 px-4 text-sm"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={tautkanCabangMutation.isPending || (linkType !== "NONE" && !targetId)}
                className="h-10 px-5 text-sm font-medium"
              >
                {tautkanCabangMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog Nonaktifkan Profil Cabang */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Nonaktifkan Profil Cabang"
        description={`Apakah Anda yakin ingin menonaktifkan profil cabang "${deletingCabang?.namaCabang}"? Status cabang akan diubah menjadi Nonaktif.`}
        confirmText="Ya, Nonaktifkan"
        cancelText="Batal"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
