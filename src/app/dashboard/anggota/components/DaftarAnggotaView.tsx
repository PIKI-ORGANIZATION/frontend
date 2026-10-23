"use client";

import React, { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
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
  DataTableFacetedFilter,
} from "@/components/data-table";
import { useGetDaftarAnggota, AnggotaItem } from "@/hooks/api/useAnggota";
import { useDebounce } from "@/hooks/useDebounce";
import { AnggotaDetailModal } from "./AnggotaDetailModal";
import {
  Loader2,
  Eye,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function DaftarAnggotaView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnggotaUuid, setSelectedAnggotaUuid] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Reset pagination ke halaman 1 saat pencarian berubah
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevSearch) {
    setPrevSearch(debouncedSearch);
    setCurrentPage(1);
  }

  // Convert statusFilter Set to single param for backend API
  const statusKtaParam = useMemo(() => {
    if (statusFilter.size === 1) {
      return Array.from(statusFilter)[0];
    }
    return undefined;
  }, [statusFilter]);

  const { data, isLoading, error, isFetching } = useGetDaftarAnggota({
    search: debouncedSearch,
    statusKta: statusKtaParam,
    currentPage,
    pageSize,
  });

  const anggotaList = data?.data || [];
  const pagination = data?.pagination;

  // Definisi Kolom TanStack Table (Modern Shadcn Admin Style)
  const columns = useMemo<ColumnDef<AnggotaItem>[]>(
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
          <DataTableColumnHeader column={column} title="Anggota" />
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
                  className="font-semibold text-foreground truncate hover:underline cursor-pointer"
                  onClick={() => setSelectedAnggotaUuid(item.uuid)}
                >
                  {item.namaLengkap}
                </span>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                  {item.akun?.email && (
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <Mail className="h-3 w-3 shrink-0" />
                      {item.akun.email}
                    </span>
                  )}
                  {item.noWa && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Phone className="h-3 w-3 shrink-0" />
                      {item.noWa}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "noKta",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="No. KTA" />
        ),
        cell: ({ row }) => {
          const noKta = row.original.noKta;
          if (!noKta) {
            return (
              <span className="text-xs text-muted-foreground italic">
                Belum terbit
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground bg-muted/60 px-2 py-1 rounded-md w-fit border border-border/40">
              <CreditCard className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span>{noKta}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "cabang",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Wilayah / Cabang" />
        ),
        cell: ({ row }) => {
          const item = row.original;
          const cabangName =
            item.cabang?.namaCabang || item.kotaDomisili || "-";
          const provName = item.cabang?.provinsi || item.provinsi || "";
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">{cabangName}</span>
              {provName && (
                <span className="text-muted-foreground text-[11px]">
                  {provName}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "statusKta",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status KTA" />
        ),
        cell: ({ row }) => {
          const item = row.original;
          const isActive = item.statusKta === "ACTIVE";
          return (
            <Badge
              variant="secondary"
              className={
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium text-xs"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium text-xs"
              }
            >
              {isActive ? (
                <>
                  <ShieldCheck className="h-3 w-3 mr-1 inline shrink-0" />
                  Aktif
                </>
              ) : (
                "Non-Aktif"
              )}
            </Badge>
          );
        },
      },
      {
        accessorKey: "insert_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Terdaftar" />
        ),
        cell: ({ row }) => {
          const dateStr = row.original.insert_at || row.original.created_at;
          if (!dateStr)
            return <span className="text-xs text-muted-foreground">-</span>;
          try {
            return (
              <span className="text-xs text-muted-foreground">
                {format(new Date(dateStr), "dd MMM yyyy", { locale: localeId })}
              </span>
            );
          } catch {
            return <span className="text-xs text-muted-foreground">-</span>;
          }
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
          return (
            <div className="text-right">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedAnggotaUuid(item.uuid)}
                className="h-8 px-2.5 text-xs font-medium border-border/80 hover:bg-accent hover:text-accent-foreground"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Detail
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: anggotaList,
    columns,
    manualPagination: true,
    pageCount: pagination?.totalPages ?? 1,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (updater) => {
      const nextPagination =
        typeof updater === "function"
          ? updater({ pageIndex: currentPage - 1, pageSize })
          : updater;
      setCurrentPage(nextPagination.pageIndex + 1);
      setPageSize(nextPagination.pageSize);
    },
  });

  const statusOptions = [
    { label: "Aktif", value: "ACTIVE" },
    { label: "Non-Aktif", value: "INACTIVE" },
  ];

  if (error) {
    return (
      <div className="p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-600">
        <p className="font-medium">Gagal memuat data anggota.</p>
        <p className="text-sm mt-1 text-red-500">
          Silakan muat ulang halaman atau coba beberapa saat lagi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Daftar Anggota
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola data seluruh anggota PIKI nasional dan pantau status
            penerbitan KTA Digital.
          </p>
        </div>
      </div>

      {/* Data Table Card Wrapper */}
      <div className="rounded-lg space-y-4 mt-10">
        {/* Table Toolbar */}
        <DataTableToolbar
          table={table}
          searchPlaceholder="Cari nama, email, nomor WA..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          isFiltered={statusFilter.size > 0 || searchTerm.length > 0}
          onResetFilters={() => {
            setSearchTerm("");
            setStatusFilter(new Set());
            setCurrentPage(1);
          }}
        >
          <DataTableFacetedFilter
            title="Status KTA"
            options={statusOptions}
            selectedValues={statusFilter}
            onSelect={(next) => {
              setStatusFilter(next);
              setCurrentPage(1);
            }}
          />
        </DataTableToolbar>

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
              {isLoading && !isFetching ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm">Memuat data anggota...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : anggotaList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl">
                        👥
                      </div>
                      <p className="font-medium text-foreground">
                        Tidak ada data anggota
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm
                          ? "Tidak ada anggota yang cocok dengan kata kunci pencarian."
                          : "Belum ada anggota terdaftar."}
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
        {pagination && (
          <DataTablePagination
            table={table}
            totalRows={pagination.total}
            pageSizeOptions={[10, 20, 30, 50]}
          />
        )}
      </div>

      {/* Modal Detail Anggota (Dengan Accordion Kategori Modern) */}
      <AnggotaDetailModal
        uuid={selectedAnggotaUuid}
        onClose={() => setSelectedAnggotaUuid(null)}
      />
    </div>
  );
}
