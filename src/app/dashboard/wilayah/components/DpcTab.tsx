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
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
import { DpcEditorDialog } from "./DpcEditorDialog";
import { LinkCabangDialog } from "./LinkCabangDialog";

interface DpcTabProps {
  masterProvinsi: MasterProvinsi[];
  cabangList: CabangItem[];
}

export function DpcTab({ masterProvinsi, cabangList }: DpcTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: dpcResponse, isLoading } = useDpcList({
    search: searchTerm,
    kode_provinsi: selectedProvinsi === "ALL" ? undefined : selectedProvinsi,
    currentPage,
    pageSize,
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

  const existingDpcCodes = useMemo(
    () => new Set(dpcList.map((d) => d.kode_kabupaten)),
    [dpcList],
  );

  const provinsiFilterOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Semua Provinsi" },
      ...masterProvinsi.map((p) => ({
        value: p.kode_provinsi,
        label: p.nama_provinsi,
        subLabel: p.kode_provinsi,
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

  const handleDelete = async (item: DpcItem) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan DPC ${item.dpc} (${item.kode_kabupaten})?`)) {
      await deleteDpcMutation.mutateAsync(item.id);
    }
  };

  const handleSaveEditor = async (values: DpcFormValues) => {
    if (editingDpc) {
      await updateDpcMutation.mutateAsync({ id: editingDpc.id, payload: values });
    } else {
      await createDpcMutation.mutateAsync(values);
    }
  };

  const handleSaveLink = async (cabangUuid: string | null) => {
    if (!linkingDpc) return;

    if (!cabangUuid && linkingDpc.cabang?.uuid) {
      await tautkanCabangMutation.mutateAsync({
        cabangUuid: linkingDpc.cabang.uuid,
        dpcId: null,
      });
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
    }
  };

  const totalPages = Math.ceil(meta.total / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar with Filter Provinsi */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Cari kabupaten, kota, kode, atau ketua..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 text-xs h-9"
            />
          </div>

          <div className="w-full sm:w-56 shrink-0">
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
              icon={<Filter className="w-3.5 h-3.5 text-muted-foreground mr-0.5" />}
            />
          </div>
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 font-semibold shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah DPC</span>
        </Button>
      </div>

      {/* 2. Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-20 text-center text-xs font-semibold">Kode</TableHead>
              <TableHead className="text-xs font-semibold">Kabupaten / Kota (DPC)</TableHead>
              <TableHead className="text-xs font-semibold">Provinsi Induk</TableHead>
              <TableHead className="text-xs font-semibold">Ketua / Kontak</TableHead>
              <TableHead className="text-xs font-semibold">Status & SK</TableHead>
              <TableHead className="text-xs font-semibold">Tautan Profil Cabang</TableHead>
              <TableHead className="text-right text-xs font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-xs">Memuat data DPC...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : dpcList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-muted-foreground text-xs">
                  <Building className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-medium text-foreground">Belum ada data DPC.</p>
                  <p className="text-[11px] mt-0.5">
                    {searchTerm || selectedProvinsi !== "ALL"
                      ? "Tidak ada DPC yang sesuai dengan filter pencarian."
                      : "Klik tombol Tambah DPC untuk membentuk DPC pertama."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              dpcList.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="text-center font-mono font-bold text-xs">
                    <span className="bg-muted px-1.5 py-0.5 rounded border border-border/70">
                      {item.kode_kabupaten}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground text-xs md:text-sm">
                      DPC {item.dpc}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {item.dpd || "-"}
                      {item.kode_provinsi && (
                        <span className="text-[10px] font-mono ml-1 opacity-70">
                          ({item.kode_provinsi})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-medium flex items-center gap-1.5 text-foreground">
                        <User className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span>{item.pengurus || "-"}</span>
                      </div>
                      {item.no_handphone && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{item.no_handphone}</span>
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
                      {item.penerbitan_sk && (
                        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{item.penerbitan_sk}</span>
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
                        <Building className="w-3 h-3" />
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
                        title="Edit DPC"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(item)}
                        title="Nonaktifkan DPC"
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
            Menampilkan halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total {meta.total} DPC)
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
      <DpcEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        dpc={editingDpc}
        masterProvinsi={masterProvinsi}
        existingDpcCodes={existingDpcCodes}
        onSave={handleSaveEditor}
        isSubmitting={createDpcMutation.isPending || updateDpcMutation.isPending}
      />

      <LinkCabangDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        targetType="DPC"
        targetId={linkingDpc?.id || 0}
        targetName={`DPC ${linkingDpc?.dpc || ""}`}
        currentCabangUuid={linkingDpc?.cabang?.uuid}
        cabangList={cabangList}
        onSave={handleSaveLink}
        isSubmitting={tautkanCabangMutation.isPending}
      />
    </div>
  );
}
