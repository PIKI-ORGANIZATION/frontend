"use client";

import React, { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from "@/components/data-table";
import {
  useGetRegistrasiPending,
  useApproveRegistrasi,
  RegistrasiItem,
} from "@/hooks/api/useVerifikasi";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  Check,
  Mail,
  Phone,
  Clock,
  FileCheck,
} from "lucide-react";
import { ReviewModal } from "./components/ReviewModal";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function VerifikasiPage() {
  const { data, isLoading, error } = useGetRegistrasiPending();
  const { mutate: processVerifikasi, isPending } = useApproveRegistrasi();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // States for Review Modal
  const [selectedItem, setSelectedItem] = useState<RegistrasiItem | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const openReview = (item: RegistrasiItem) => {
    setSelectedItem(item);
    setIsReviewOpen(true);
  };

  const handleProcess = (
    id: string,
    status: "APPROVED_DPP" | "REJECTED",
    catatanVerifikasi?: string,
  ) => {
    setProcessingId(id);
    processVerifikasi(
      { id, status, catatanVerifikasi },
      {
        onSuccess: () => {
          toast.success(
            status === "APPROVED_DPP"
              ? "Pendaftaran berhasil disetujui & KTA diterbitkan."
              : "Pendaftaran telah ditolak.",
          );
          setProcessingId(null);
          setIsReviewOpen(false);
        },
        onError: (err) => {
          toast.error(err.message || "Gagal memproses verifikasi");
          setProcessingId(null);
        },
      },
    );
  };

  const registrasiList = data?.data || [];

  // Filter client-side berdasarkan pencarian nama, email, atau no WA
  const filteredList = useMemo(() => {
    if (!searchTerm) return registrasiList;
    const q = searchTerm.toLowerCase();
    return registrasiList.filter(
      (item) =>
        item.namaLengkap?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.noWa?.includes(q) ||
        item.cabang?.namaCabang?.toLowerCase().includes(q) ||
        item.dpc?.toLowerCase().includes(q),
    );
  }, [registrasiList, searchTerm]);

  // Kolom TanStack Table untuk Verifikasi
  const columns = useMemo<ColumnDef<RegistrasiItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Pilih semua baris"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Pilih baris"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "namaLengkap",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Pendaftar" />
        ),
        cell: ({ row }) => {
          const item = row.original;
          const initial = item.namaLengkap
            ? item.namaLengkap.charAt(0).toUpperCase()
            : "?";
          return (
            <div className="flex items-center gap-3 py-1">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 font-semibold text-sm border border-orange-500/20">
                {initial}
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className="font-semibold text-foreground truncate cursor-pointer hover:underline"
                  onClick={() => openReview(item)}
                >
                  {item.namaLengkap}
                </span>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <Mail className="h-3 w-3 shrink-0" />
                    {item.email}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Phone className="h-3 w-3 shrink-0" />
                    {item.noWa}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "cabang",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cabang / Wilayah" />
        ),
        cell: ({ row }) => {
          const item = row.original;
          const namaCabang = item.cabang?.namaCabang || item.dpc || "-";
          const prov = item.cabang?.provinsi || item.dpp || "";
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">{namaCabang}</span>
              {prov && (
                <span className="text-muted-foreground text-[11px]">
                  {prov}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tanggal Daftar" />
        ),
        cell: ({ row }) => {
          const dateStr = row.original.created_at;
          if (!dateStr)
            return <span className="text-xs text-muted-foreground">-</span>;
          try {
            return (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground/70" />
                {format(new Date(dateStr), "dd MMM yyyy HH:mm", {
                  locale: localeId,
                })}
              </span>
            );
          } catch {
            return <span className="text-xs text-muted-foreground">-</span>;
          }
        },
      },
      {
        accessorKey: "statusVerifikasi",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: () => (
          <Badge
            variant="secondary"
            className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-medium text-xs flex items-center gap-1 w-fit"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            Menunggu DPP
          </Badge>
        ),
      },
      {
        id: "berkas",
        header: () => (
          <div className="text-xs font-semibold text-muted-foreground uppercase">
            Dokumen
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1 text-xs">
              {item.fileKtpUrl && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-normal py-0 px-1.5"
                >
                  <FileCheck className="h-3 w-3 mr-1 text-emerald-500" /> KTP
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <div className="text-right text-xs font-semibold text-muted-foreground uppercase">
            Aksi
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const isCurrentPending = isPending && processingId === item.id;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openReview(item)}
                className="h-8 px-2.5 text-xs font-medium"
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-primary" />
                Review
              </Button>
              <Button
                size="sm"
                disabled={isCurrentPending}
                onClick={() => handleProcess(item.id, "APPROVED_DPP")}
                className="h-8 px-2.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isCurrentPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1" />
                )}
                Setujui
              </Button>
            </div>
          );
        },
      },
    ],
    [isPending, processingId],
  );

  const table = useReactTable({
    data: filteredList,
    columns,
    state: {
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (error) {
    return (
      <div className="p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-600">
        <p className="font-medium">Gagal memuat data verifikasi.</p>
        <p className="text-sm mt-1 text-red-500">
          Silakan muat ulang halaman atau coba beberapa saat lagi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Verifikasi Keanggotaan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Tinjau berkas pendaftaran anggota baru dan berikan persetujuan untuk
            penerbitan KTA resmi.
          </p>
        </div>
      </div>

      {/* Data Table Card Wrapper */}
      <div className="space-y-4 py-4">
        {/* Table Toolbar */}
        <DataTableToolbar
          table={table}
          searchPlaceholder="Cari nama pendaftar, email, no WA..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          isFiltered={searchTerm.length > 0}
          onResetFilters={() => setSearchTerm("")}
        />

        {/* TanStack Table Element */}
        <div className="relative rounded-md border border-border overflow-hidden bg-background">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 text-xs font-semibold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm">
                        Memuat antrean verifikasi...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl">
                        ✓
                      </div>
                      <p className="font-medium text-foreground">
                        Tidak ada antrean verifikasi
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm
                          ? "Tidak ada pendaftar yang cocok dengan kata kunci pencarian."
                          : "Semua pendaftar telah diverifikasi."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <DataTablePagination
          table={table}
          totalRows={filteredList.length}
          pageSizeOptions={[10, 20, 30, 50]}
        />
      </div>

      {/* Review Modal untuk pemeriksaan detail KTP & Alasan Tolak */}
      <ReviewModal
        isOpen={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        selectedItem={selectedItem}
        isPending={isPending}
        processingId={processingId}
        onApprove={(id) => handleProcess(id, "APPROVED_DPP")}
        onReject={(id, reason) => handleProcess(id, "REJECTED", reason)}
      />
    </div>
  );
}
