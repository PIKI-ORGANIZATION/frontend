"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { usePengurus } from "@/features/pengurus/hooks/usePengurus";
import {
  PengurusItem,
  KategoriPengurus,
  StatusPublikasi,
  PengurusFormValues,
} from "@/features/pengurus/types";
import { PengurusEditorDialog } from "./components/PengurusEditorDialog";
import { PengurusDetailDrawer } from "./components/PengurusDetailDrawer";
import { PengurusGridView } from "./components/PengurusGridView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  Check,
  ChevronDown,
  RotateCcw,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Users,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FilterKategori = "ALL" | KategoriPengurus;
type FilterStatus = "ALL" | StatusPublikasi;

const STATUS_FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "PUBLISHED", label: "Tayang Publik (Published)" },
  { value: "DRAFT", label: "Draf Internal (Draft)" },
];

export default function PengurusCMSPage() {
  const {
    items,
    isLoaded,
    stats,
    addPengurus,
    updatePengurus,
    deletePengurus,
    toggleStatus,
    resetToDefault,
  } = usePengurus();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] =
    useState<FilterKategori>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  // Inspector Drawer State (Linear / Stripe style slide-over)
  const [inspectorItem, setInspectorItem] = useState<PengurusItem | null>(null);

  // Editor Dialog State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengurusItem | null>(null);

  // Delete Confirmation Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reset Confirmation Dialog State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Filtered List
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Kategori Filter
        if (selectedKategori !== "ALL" && item.kategori !== selectedKategori) {
          return false;
        }
        // Status Filter
        if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
          return false;
        }
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNama = item.nama.toLowerCase().includes(q);
          const matchJabatan = item.jabatan.toLowerCase().includes(q);
          const matchBidang = item.bidang?.toLowerCase().includes(q);
          return matchNama || matchJabatan || matchBidang;
        }
        return true;
      })
      .sort((a, b) => a.urutan - b.urutan);
  }, [items, selectedKategori, selectedStatus, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: PengurusItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleSave = (form: PengurusFormValues) => {
    if (editingItem) {
      updatePengurus(editingItem.id, form);
      if (inspectorItem?.id === editingItem.id) {
        setInspectorItem((prev) => (prev ? { ...prev, ...form } : null));
      }
      toast.success("Data pengurus berhasil diperbarui!");
    } else {
      const created = addPengurus(form);
      setInspectorItem(created);
      toast.success("Pengurus baru berhasil ditambahkan!");
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    deletePengurus(deletingId);
    if (inspectorItem?.id === deletingId) {
      setInspectorItem(null);
    }
    setDeletingId(null);
    toast.success("Pengurus berhasil dihapus");
  };

  const handleReset = () => {
    resetToDefault();
    setInspectorItem(null);
    setIsResetConfirmOpen(false);
    toast.info("Data pengurus telah direset ke data default organisasi.");
  };

  const currentStatusFilterLabel =
    STATUS_FILTER_OPTIONS.find((opt) => opt.value === selectedStatus)?.label ||
    "Semua Status";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 ">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              CMS Data Pengurus
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola pimpinan inti DPP, dewan pengurus, dan dewan penasehat .
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsResetConfirmOpen(true)}
            title="Kembalikan data ke dummy bawaan awal"
            className="cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Data
          </Button>

          <Button onClick={handleOpenAdd} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pengurus
          </Button>
        </div>
      </div>

      {/* 3. Search Bar, Category Tabs & Status Filter */}
      <div className="flex flex-col gap-3">
        {/* Category Tabs (Segmented Control Track per StyleGuide & shadcn-admin) */}
        <div className="flex items-center overflow-x-auto pb-1 max-w-full">
          <div
            role="tablist"
            aria-label="Filter Kategori Pengurus"
            className="inline-flex items-center gap-1 p-1 rounded-md bg-muted/60 dark:bg-muted/40 border border-border"
          >
            {[
              {
                id: "ALL" as const,
                label: "Semua Pengurus",
                count: stats.total,
              },
              {
                id: "INTI" as const,
                label: "Pimpinan Inti DPP",
                count: stats.inti,
              },
              {
                id: "BIDANG" as const,
                label: "Dewan Pengurus & Bidang",
                count: stats.bidang,
              },
              {
                id: "PENASEHAT" as const,
                label: "Dewan Penasehat & Pakar",
                count: stats.penasehat,
              },
            ].map((tab) => {
              const isSelected = selectedKategori === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedKategori(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-all whitespace-nowrap cursor-pointer select-none",
                    "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                    isSelected
                      ? "bg-background text-foreground font-medium shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40 font-normal border border-transparent",
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "ml-0.5 px-1.5 py-0.5 shrink-0 rounded-full text-[10px] font-mono transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
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

        {/* Search & Popover Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, jabatan, atau bidang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Switcher (Tabel vs Grid) */}
            <div
              role="radiogroup"
              aria-label="Mode Tampilan Data"
              className="inline-flex items-center p-0.5 rounded-md bg-muted/60 dark:bg-muted/40 border border-border"
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "table"}
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-sm transition-all cursor-pointer select-none",
                  viewMode === "table"
                    ? "bg-background text-foreground font-medium shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Mode Tampilan Tabel"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-sm transition-all cursor-pointer select-none",
                  viewMode === "grid"
                    ? "bg-background text-foreground font-medium shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Mode Tampilan Grid Kartu (team-2 style)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid Kartu</span>
              </button>
            </div>

            {/* Popover Filter Status - per StyleGuide */}
            <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStatusFilter}
                    className="justify-between min-w-[160px] font-normal cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {currentStatusFilterLabel}
                      </span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-56 p-1" align="end">
                <div className="flex flex-col gap-0.5">
                  {STATUS_FILTER_OPTIONS.map((option) => {
                    const isSelected = selectedStatus === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedStatus(option.value);
                          setOpenStatusFilter(false);
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs rounded-sm transition-colors text-left cursor-pointer",
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-foreground",
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 4. Data View: Table or Grid with Inspector Trigger */}
      <div className="flex flex-col gap-3">
        {viewMode === "table" ? (
          <div
            tabIndex={0}
            role="region"
            aria-label="Tabel Data Pengurus"
            className="w-full overflow-x-auto rounded-sm border border-border bg-card shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-primary/40"
          >
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              {/* Sticky Header per modern-web-guidance */}
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-xs border-b border-border/80 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 w-12 text-center">#</th>
                  <th className="py-3 px-3.5 min-w-[220px]">Pengurus & Foto</th>
                  <th className="py-3 px-3.5 min-w-[160px]">Jabatan</th>
                  <th className="py-3 px-3.5 min-w-[180px]">
                    Kategori & Departemen
                  </th>
                  <th className="py-3 px-3.5 w-32 text-center">Periode</th>
                  <th className="py-3 px-3.5 w-28 text-center">Status</th>
                  <th className="py-3 px-3.5 w-32 text-right pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {!isLoaded ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground text-xs"
                    >
                      Memuat data pengurus...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 opacity-30" />
                        <p className="text-sm font-medium">
                          Tidak ada data pengurus yang sesuai.
                        </p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Coba ubah kata kunci pencarian atau ganti filter
                          kategori/status.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isInspected = inspectorItem?.id === item.id;
                    const isBlobOrData =
                      item.foto.startsWith("data:") ||
                      item.foto.startsWith("blob:");

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setInspectorItem(item)}
                        className={cn(
                          "transition-colors cursor-pointer group",
                          isInspected
                            ? "bg-primary/10 hover:bg-primary/15"
                            : "hover:bg-muted/50",
                        )}
                      >
                        {/* Order Badge */}
                        <td className="py-3.5 px-3.5 text-center font-mono text-xs text-muted-foreground">
                          <span
                            className={cn(
                              "inline-flex items-center justify-center w-6 h-6 rounded-sm text-[11px] font-bold",
                              item.kategori === "INTI"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {item.urutan}
                          </span>
                        </td>

                        {/* Name & Photo */}
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-13 rounded-sm overflow-hidden bg-muted shrink-0 border border-border/80">
                              {item.foto ? (
                                <Image
                                  src={item.foto}
                                  alt={item.nama}
                                  fill
                                  unoptimized={isBlobOrData}
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {item.nama}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {item.email || "Email belum disetel"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Jabatan */}
                        <td className="py-3.5 px-3.5">
                          <span className="font-medium text-foreground text-xs block">
                            {item.jabatan}
                          </span>
                        </td>

                        {/* Category & Department */}
                        <td className="py-3.5 px-3.5">
                          <div className="flex flex-col gap-1">
                            <div>
                              {item.kategori === "INTI" && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 bg-primary/10 text-primary border-primary/20"
                                >
                                  Pimpinan Inti DPP
                                </Badge>
                              )}
                              {item.kategori === "BIDANG" && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                >
                                  Dewan Bidang
                                </Badge>
                              )}
                              {item.kategori === "PENASEHAT" && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                >
                                  Dewan Penasehat
                                </Badge>
                              )}
                            </div>
                            {item.bidang && (
                              <span className="text-[11px] text-muted-foreground truncate block">
                                {item.bidang}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Periode */}
                        <td className="py-3.5 px-3.5 text-center text-xs text-muted-foreground font-medium">
                          {item.periode}
                        </td>

                        {/* Status with Quick Toggle */}
                        <td className="py-3.5 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(item.id);
                              if (inspectorItem?.id === item.id) {
                                setInspectorItem((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        status:
                                          prev.status === "PUBLISHED"
                                            ? "DRAFT"
                                            : "PUBLISHED",
                                      }
                                    : null,
                                );
                              }
                              toast.info(
                                `Status ${item.nama} diubah ke ${
                                  item.status === "PUBLISHED"
                                    ? "Draf"
                                    : "Tayang"
                                }`,
                              );
                            }}
                            title="Klik untuk mengubah status tayang"
                            className="inline-flex items-center gap-1 cursor-pointer group/toggle"
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] py-0.5 transition-colors",
                                item.status === "PUBLISHED"
                                  ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 group-hover/toggle:bg-emerald-500/20"
                                  : "text-amber-600 bg-amber-500/10 border-amber-500/20 group-hover/toggle:bg-amber-500/20",
                              )}
                            >
                              {item.status === "PUBLISHED" ? (
                                <>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Tayang
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Draf
                                </>
                              )}
                            </Badge>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectorItem(item);
                              }}
                              title="Buka panel pratinjau & detail"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenEdit(item, e)}
                              title="Ubah data pengurus"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingId(item.id);
                              }}
                              title="Hapus pengurus"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <PengurusGridView
            items={filteredItems}
            isLoaded={isLoaded}
            activeId={inspectorItem?.id}
            onSelect={(item) => setInspectorItem(item)}
            onEdit={handleOpenEdit}
            onDelete={(id, e) => {
              e.stopPropagation();
              setDeletingId(id);
            }}
            onToggleStatus={(id, e) => {
              e.stopPropagation();
              toggleStatus(id);
              if (inspectorItem?.id === id) {
                setInspectorItem((prev) =>
                  prev
                    ? {
                        ...prev,
                        status:
                          prev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                      }
                    : null,
                );
              }
              const item = items.find((i) => i.id === id);
              if (item) {
                toast.info(
                  `Status ${item.nama} diubah ke ${
                    item.status === "PUBLISHED" ? "Draf" : "Tayang"
                  }`,
                );
              }
            }}
          />
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Menampilkan {filteredItems.length} dari {items.length} data
            pengurus.
          </span>
          <span className="text-[11px] italic text-muted-foreground/80">
            *Klik baris tabel atau kartu pengurus untuk membuka Inspector &
            Pratinjau Publik.
          </span>
        </div>
      </div>

      {/* 5. Slide-Over Inspector Drawer (InformationDrawer Inspired) */}
      <PengurusDetailDrawer
        item={inspectorItem}
        allItems={filteredItems}
        onClose={() => setInspectorItem(null)}
        onEdit={(item) => handleOpenEdit(item)}
        onDelete={(id) => setDeletingId(id)}
        onToggleStatus={(id) => {
          toggleStatus(id);
          if (inspectorItem?.id === id) {
            setInspectorItem((prev) =>
              prev
                ? {
                    ...prev,
                    status:
                      prev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                  }
                : null,
            );
          }
          toast.info("Status publikasi diperbarui.");
        }}
        onNavigate={(nextItem) => setInspectorItem(nextItem)}
      />

      {/* Editor Modal Dialog */}
      <PengurusEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        initialData={editingItem}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <DialogContent className="sm:max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Hapus Data Pengurus
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Apakah Anda yakin ingin menghapus data pengurus ini? Data yang
              dihapus tidak akan lagi muncul di website resmi PIKI.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Ya, Hapus Pengurus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Reset ke Data Bawaan Organisasi
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              Tindakan ini akan mengembalikan data pengurus ke data awal DPP
              PIKI (Ketua Umum Maruarar Sirait, Sekjen Benyamin Patondok, Bendum
              Juniver Girsang, dan ketua bidang resmi).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsResetConfirmOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleReset}>Reset Data Sekarang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
