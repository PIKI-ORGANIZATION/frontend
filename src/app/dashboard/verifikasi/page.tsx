"use client";

import React, { useState, useMemo, useCallback } from "react";
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
  useGetRegistrasiList,
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
  CheckCircle2,
  XCircle,
  Users,
  ShieldCheck,
} from "lucide-react";
import { ReviewModal } from "./components/ReviewModal";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";

type TabStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function VerifikasiPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data, isLoading, error } = useGetRegistrasiList({
    statusVerifikasi: activeTab,
    search: searchTerm,
  });

  const { mutate: processVerifikasi, isPending } = useApproveRegistrasi();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // States for Review Modal
  const [selectedItem, setSelectedItem] = useState<RegistrasiItem | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const openReview = (item: RegistrasiItem) => {
    setSelectedItem(item);
    setIsReviewOpen(true);
  };

  const handleProcess = useCallback(
    (id: string, action: "APPROVE" | "REJECT", catatanVerifikasi?: string) => {
      setProcessingId(id);
      processVerifikasi(
        { id, action, catatanVerifikasi },
        {
          onSuccess: () => {
            toast.success(
              action === "APPROVE"
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
    },
    [processVerifikasi],
  );

  const registrasiList = useMemo(() => data?.data || [], [data?.data]);
  const counts = data?.meta?.counts;

  // Segmented control tabs configuration
  const TABS: {
    id: TabStatus;
    label: string;
    count: number;
    icon: React.ElementType;
  }[] = [
    {
      id: "ALL",
      label: "Semua Pendaftar",
      count: counts?.all ?? 0,
      icon: Users,
    },
    {
      id: "PENDING",
      label: "Menunggu Verifikasi",
      count: counts?.pending ?? 0,
      icon: Clock,
    },
    {
      id: "APPROVED",
      label: "Telah Disetujui",
      count: counts?.approved ?? 0,
      icon: CheckCircle2,
    },
    {
      id: "REJECTED",
      label: "Ditolak",
      count: counts?.rejected ?? 0,
      icon: XCircle,
    },
  ];

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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                {initial}
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className="font-semibold text-sm text-foreground truncate cursor-pointer hover:underline"
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
          const namaCabang = item.dpc
            ? `DPC ${item.dpc}`
            : item.cabang?.namaCabang || "-";
          const namaDaerah = item.dpd
            ? `DPD ${item.dpd}`
            : item.cabang?.provinsi || item.dpp || "";

          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium text-foreground">{namaCabang}</span>
              {namaDaerah && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  {namaDaerah}
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
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
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
        cell: ({ row }) => {
          const item = row.original;
          const status = item.statusVerifikasi || "";

          if (status.startsWith("PENDING") || status === "BYPASSED_TO_DPD") {
            const label =
              status === "PENDING_VERIFIKASI_DPC"
                ? "Menunggu DPC"
                : status === "PENDING_VERIFIKASI_DPD"
                  ? "Menunggu DPD"
                  : status === "BYPASSED_TO_DPD"
                    ? "Eskalasi ke DPD"
                    : status === "PENDING_VERIFIKASI_DPP"
                      ? "Menunggu DPP"
                      : "Menunggu Verifikasi";

            return (
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium text-xs flex items-center gap-1.5 w-fit"
              >
                {/* <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" /> */}
                {label}
              </Badge>
            );
          }

          if (status.startsWith("APPROVED")) {
            const label =
              status === "APPROVED_DPC"
                ? "Disetujui DPC"
                : status === "APPROVED_DPD"
                  ? "Disetujui DPD"
                  : status === "APPROVED_DPP"
                    ? "Disetujui DPP"
                    : "Disetujui";

            const colorClass =
              status === "APPROVED_DPC"
                ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20"
                : status === "APPROVED_DPD"
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";

            return (
              <Badge
                variant="secondary"
                className={cn(
                  "border font-medium text-xs flex items-center gap-1.5 w-fit",
                  colorClass,
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {label}
              </Badge>
            );
          }

          if (status === "REJECTED") {
            return (
              <Badge
                variant="secondary"
                className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-medium text-xs flex items-center gap-1.5 w-fit"
              >
                <XCircle className="h-3.5 w-3.5 shrink-0" />
                Ditolak
              </Badge>
            );
          }

          return (
            <Badge variant="outline" className="text-xs font-medium">
              {status.replace(/_/g, " ")}
            </Badge>
          );
        },
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
            <div className="flex items-center gap-1.5 text-xs">
              {item.fileKtpUrl && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal py-0.5 px-2 bg-muted/40"
                >
                  <FileCheck className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                  KTP
                </Badge>
              )}
              {item.buktiBayarUrl && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal py-0.5 px-2 bg-muted/40"
                >
                  <FileCheck className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                  Bayar
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
          const isPendingVerifikasi =
            item.statusVerifikasi?.startsWith("PENDING") ||
            item.statusVerifikasi === "BYPASSED_TO_DPD";
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
                {isPendingVerifikasi ? "Review" : "Detail"}
              </Button>

              {isPendingVerifikasi && (
                <Button
                  size="sm"
                  disabled={isCurrentPending}
                  onClick={() => handleProcess(item.id, "APPROVE")}
                  className="h-8 px-2.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isCurrentPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <Check className="w-3.5 h-3.5 mr-1" />
                  )}
                  Setujui
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [isPending, processingId, handleProcess],
  );

  const table = useReactTable({
    data: registrasiList,
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
    <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Verifikasi Keanggotaan
            </h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tinjau berkas pendaftaran calon anggota baru dan berikan persetujuan
            berjenjang untuk penerbitan KTA resmi PIKI.
          </p>
        </div>
      </div>

      {/* 2. Navigation Tabs (Identik dengan format Tab Menu CMS Wilayah & CMS Galeri) */}
      <div className="flex items-center overflow-x-auto pb-1 max-w-full">
        <div
          role="tablist"
          aria-label="Filter Status Verifikasi"
          className="inline-flex items-center gap-1 p-1 rounded-md bg-muted/60 dark:bg-muted/40 border border-border"
        >
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
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
                <span
                  className={cn(
                    "inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium min-w-5 h-4.5",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Data Table Section */}
      <div className="space-y-4">
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
                      <span className="text-sm">Memuat data verifikasi...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : registrasiList.length === 0 ? (
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
                        Tidak ada data pendaftar
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm
                          ? "Tidak ada pendaftar yang cocok dengan kata kunci pencarian."
                          : activeTab === "PENDING"
                            ? "Semua pendaftar saat ini telah diverifikasi."
                            : "Belum ada data pendaftar pada tab ini."}
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
          totalRows={data?.meta?.total ?? registrasiList.length}
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
        onApprove={(id) => handleProcess(id, "APPROVE")}
        onReject={(id, reason) => handleProcess(id, "REJECT", reason)}
      />
    </div>
  );
}
