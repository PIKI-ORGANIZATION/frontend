"use client";

import React, { useState, useMemo } from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { ArtikelBerita, BeritaStatus } from "./types";
import { DUMMY_BERITA_LIST } from "./data/dummy-berita";
import { getBeritaColumns } from "./components/berita-columns";
import { BeritaToolbar } from "./components/berita-toolbar";
import { BeritaEditorDialog } from "./components/berita-editor-dialog";
import { BeritaPreviewDialog } from "./components/berita-preview-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  CheckCircle,
  FileClock,
  Eye,
  RotateCcw,
  Sparkles,
  Inbox,
} from "lucide-react";

export function BeritaFeature() {
  // In-memory data state initialized with rich dummy data
  const [data, setData] = useState<ArtikelBerita[]>(DUMMY_BERITA_LIST);

  // Table States
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  // Dialog States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ArtikelBerita | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ArtikelBerita | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ArtikelBerita | null>(null);

  // Summary Metrics
  const totalBerita = data.length;
  const publishedCount = data.filter((b) => b.status === "PUBLISHED").length;
  const draftCount = data.filter((b) => b.status === "DRAFT").length;
  const totalViews = data.reduce((acc, curr) => acc + curr.views, 0);

  // CRUD Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (berita: ArtikelBerita) => {
    setEditingItem(berita);
    setIsEditorOpen(true);
  };

  const handleOpenPreview = (berita: ArtikelBerita) => {
    setPreviewItem(berita);
    setIsPreviewOpen(true);
  };

  const handleOpenDelete = (berita: ArtikelBerita) => {
    setDeletingItem(berita);
    setIsDeleteOpen(true);
  };

  const handleToggleStatus = (berita: ArtikelBerita) => {
    const nextStatus: BeritaStatus =
      berita.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const nextPublishedAt =
      nextStatus === "PUBLISHED" ? new Date().toISOString() : null;

    setData((prev) =>
      prev.map((item) =>
        item.id === berita.id
          ? { ...item, status: nextStatus, publishedAt: nextPublishedAt }
          : item,
      ),
    );

    if (nextStatus === "PUBLISHED") {
      toast.success("Artikel berhasil dipublikasikan!", {
        description: `"${berita.judul.slice(0, 40)}..." kini tayang.`,
      });
    } else {
      toast.info("Artikel diubah menjadi Draft", {
        description: `"${berita.judul.slice(0, 40)}..." disimpan ke draf internal.`,
      });
    }
  };

  const handleSaveArticle = (
    articleData: Omit<
      ArtikelBerita,
      "id" | "views" | "createdAt" | "updatedAt"
    > & {
      id?: string;
    },
  ) => {
    const now = new Date().toISOString();

    if (articleData.id) {
      // Edit mode
      setData((prev) =>
        prev.map((item) =>
          item.id === articleData.id
            ? {
                ...item,
                ...articleData,
                updatedAt: now,
              }
            : item,
        ),
      );
      toast.success("Perubahan artikel berhasil disimpan!", {
        description: `"${articleData.judul.slice(0, 40)}..."`,
      });
    } else {
      // Create mode
      const newArticle: ArtikelBerita = {
        ...articleData,
        id: `art-${Date.now().toString().slice(-4)}`,
        views: 0,
        createdAt: now,
        updatedAt: now,
      };

      setData((prev) => [newArticle, ...prev]);
      toast.success("Artikel baru berhasil ditambahkan!", {
        description:
          newArticle.status === "PUBLISHED"
            ? "Artikel langsung tayang pada portal publik."
            : "Artikel disimpan dalam draf internal.",
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    setData((prev) => prev.filter((item) => item.id !== deletingItem.id));
    toast.success("Artikel berhasil dihapus", {
      description: `"${deletingItem.judul.slice(0, 40)}..." telah dihapus dari sistem.`,
    });
    setDeletingItem(null);
  };

  // Bulk Handlers
  const handleBulkPublish = (ids: string[]) => {
    setData((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? {
              ...item,
              status: "PUBLISHED",
              publishedAt: item.publishedAt || new Date().toISOString(),
            }
          : item,
      ),
    );
    setRowSelection({});
    toast.success(`${ids.length} artikel berhasil dipublikasikan!`);
  };

  const handleBulkDraft = (ids: string[]) => {
    setData((prev) =>
      prev.map((item) =>
        ids.includes(item.id) ? { ...item, status: "DRAFT" } : item,
      ),
    );
    setRowSelection({});
    toast.info(`${ids.length} artikel dialihkan ke status draft.`);
  };

  const handleBulkDelete = (ids: string[]) => {
    setData((prev) => prev.filter((item) => !ids.includes(item.id)));
    setRowSelection({});
    toast.success(`${ids.length} artikel berhasil dihapus.`);
  };

  const handleResetData = () => {
    setData(DUMMY_BERITA_LIST);
    setRowSelection({});
    toast.success("Data contoh berita berhasil di-reset ke default!");
  };

  // Columns definition memoized
  const columns = useMemo(
    () =>
      getBeritaColumns({
        onPreview: handleOpenPreview,
        onEdit: handleOpenEdit,
        onToggleStatus: handleToggleStatus,
        onDelete: handleOpenDelete,
      }),
    [],
  );

  // TanStack Table Instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-10 px-2">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Manajemen Berita & Publikasi
            </h1>
            <Badge
              variant="secondary"
              className="gap-1.5 font-normal text-xs py-0.5 px-2 text-muted-foreground bg-muted/60 border border-border/50"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              CMS Editorial
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola naskah pers resmi, opini cendekiawan, liputan kegiatan
            DPD/DPC, dan publikasi digital DPP PIKI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            title="Reset data contoh ke bawaan"
            className="text-xs py-4"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Reset Dummy</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs gap-1.5 py-4"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Berita</span>
          </Button>
        </div>
      </div>

      {/* 2. Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Artikel */}
        <Card className="p-4 shadow-none">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Artikel
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {totalBerita}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Basis data publikasi
              </p>
            </div>
            <div className="h-9 w-9 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>

        {/* Tayang / Published */}
        <Card className="p-4 shadow-none">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Artikel Tayang
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {publishedCount}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Aktif di portal web
              </p>
            </div>
            <div className="h-9 w-9 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>

        {/* Draf Internal */}
        <Card className="p-4 shadow-none">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Draf Konsep
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {draftCount}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Menunggu telaah redaksi
              </p>
            </div>
            <div className="h-9 w-9 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileClock className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card className="p-4 shadow-none">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Dibaca
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {totalViews.toLocaleString("id-ID")}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Akumulasi pembaca web
              </p>
            </div>
            <div className="h-9 w-9 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Eye className="h-4.5 w-4.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Data Table Container */}
      <div className="space-y-4">
        {/* Toolbar */}
        <BeritaToolbar
          table={table}
          onBulkPublish={handleBulkPublish}
          onBulkDraft={handleBulkDraft}
          onBulkDelete={handleBulkDelete}
        />

        {/* Table Box */}
        <div className="rounded-lg border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-3 px-3 text-xs font-semibold"
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-44 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-8 w-8 opacity-40" />
                      <p className="text-sm font-medium">
                        Tidak ada data artikel yang sesuai dengan filter.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          table.resetColumnFilters();
                          table.setGlobalFilter("");
                        }}
                        className="text-xs mt-1"
                      >
                        Reset Filter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="border-t border-border/60 bg-muted/20">
            <DataTablePagination table={table} />
          </div>
        </div>
      </div>

      {/* 4. Dialogs */}
      {/* Editor Modal */}
      <BeritaEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        initialData={editingItem}
        onSave={handleSaveArticle}
      />

      {/* Preview Modal */}
      <BeritaPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        berita={previewItem}
        onEdit={(item) => {
          setIsPreviewOpen(false);
          handleOpenEdit(item);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Hapus Artikel Berita?"
        description={`Apakah Anda yakin ingin menghapus artikel "${deletingItem?.judul || ""}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Artikel"
        cancelText="Batal"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
