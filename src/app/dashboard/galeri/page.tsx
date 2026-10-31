"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  LayoutGrid,
  List,
  Layers,
  Camera,
  Film,
  Check,
  ChevronDown,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGaleri } from "@/features/galeri/hooks/useGaleri";
import {
  GaleriItem,
  GaleriFormValues,
  MediaType,
  StatusPublikasi,
  KATEGORI_GALERI_OPTIONS,
} from "@/features/galeri/types";
import { GaleriStatsCards } from "./components/GaleriStatsCards";
import { GaleriGridView } from "./components/GaleriGridView";
import { GaleriTableView } from "./components/GaleriTableView";
import { GaleriEditorDialog } from "./components/GaleriEditorDialog";
import { GaleriDetailDrawer } from "./components/GaleriDetailDrawer";
import { GaleriDeleteDialog } from "./components/GaleriDeleteDialog";
import { cn } from "@/lib/utils";

type FilterStatus = "ALL" | StatusPublikasi;

const STATUS_FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "PUBLISHED", label: "Tayang Publik (Published)" },
  { value: "DRAFT", label: "Draf Internal (Draft)" },
];

export default function GaleriCMSPage() {
  const {
    items,
    stats,
    addMedia,
    updateMedia,
    deleteMedia,
    toggleStatus,
    toggleFeatured,
    resetToDefault,
  } = useGaleri();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>("ALL");
  const [selectedKategori, setSelectedKategori] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Popover States
  const [openKategoriPopover, setOpenKategoriPopover] = useState(false);
  const [openStatusPopover, setOpenStatusPopover] = useState(false);

  // Dialog & Drawer States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GaleriItem | null>(null);
  const [inspectingItem, setInspectingItem] = useState<GaleriItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type Filter
      if (selectedMediaType !== "ALL" && item.type !== selectedMediaType) {
        return false;
      }
      // Kategori Filter
      if (
        selectedKategori !== "ALL" &&
        item.kategoriKegiatan !== selectedKategori
      ) {
        return false;
      }
      // Status Filter
      if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
        return false;
      }
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.deskripsi.toLowerCase().includes(q);
        const matchLokasi = item.lokasi?.toLowerCase().includes(q) || false;
        return matchTitle || matchDesc || matchLokasi;
      }
      return true;
    });
  }, [items, selectedMediaType, selectedKategori, selectedStatus, searchQuery]);

  // Handler: Open Add Dialog
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  // Handler: Open Edit Dialog
  const handleOpenEdit = (item: GaleriItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  // Handler: Save (Create or Update)
  const handleSave = (values: GaleriFormValues) => {
    if (editingItem) {
      updateMedia(editingItem.id, values);
      if (inspectingItem?.id === editingItem.id) {
        setInspectingItem((prev) => (prev ? { ...prev, ...values } : null));
      }
    } else {
      const created = addMedia(values);
      setInspectingItem(created);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus(id);
    if (inspectingItem?.id === id) {
      setInspectingItem((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
            }
          : null,
      );
    }
  };

  const handleToggleFeatured = (id: string) => {
    toggleFeatured(id);
    if (inspectingItem?.id === id) {
      setInspectingItem((prev) =>
        prev ? { ...prev, featured: !prev.featured } : null,
      );
    }
  };

  const deletingTarget = items.find((i) => i.id === deletingId);

  return (
    <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
      {/* 1. Header Page & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              CMS Galeri &amp; Dokumentasi Kegiatan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola dokumentasi arsip foto kegiatan, rekaman liputan video, dan
            postingan media sosial PIKI.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button onClick={handleOpenAdd} className="cursor-pointer">
            <Plus className="size-4 mr-2" />
            <span>Tambah Dokumentasi</span>
          </Button>
        </div>
      </div>

      {/* 3. Toolbar: Media Type Tabs, Search, Popover Filters & View Switcher */}
      <div className="flex flex-col gap-5">
        {/* Category Tabs (Segmented Control Track per StyleGuide & CMS Pengurus) */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center overflow-x-auto pb-1 max-w-full">
            <div
              role="tablist"
              aria-label="Filter Format Media"
              className="inline-flex items-center gap-1 p-1 rounded-md bg-muted/60 dark:bg-muted/40 border border-border"
            >
              {[
                {
                  id: "ALL" as const,
                  label: "Semua Format",
                  count: stats.total,
                  icon: Layers,
                },
                {
                  id: "PHOTO" as const,
                  label: "Dokumentasi Foto",
                  count: stats.photoCount,
                  icon: Camera,
                },
                {
                  id: "VIDEO" as const,
                  label: "Video Kegiatan",
                  count: stats.videoCount,
                  icon: Film,
                },
                {
                  id: "INSTAGRAM" as const,
                  label: "Instagram Post",
                  count: stats.instagramCount,
                  icon: FaInstagram,
                },
              ].map((tab) => {
                const isSelected = selectedMediaType === tab.id;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedMediaType(tab.id)}
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
              <List className="size-3.5" />
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
              title="Mode Tampilan Grid Visual"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Grid Visual</span>
            </button>
          </div>
        </div>

        {/* Search, Filters & View Mode Switcher Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box - 100% vertically centered icon with top-1/2 -translate-y-1/2 pointer-events-none */}
          <div className="relative flex-1 max-w-md flex items-center">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari dokumentasi kegiatan atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto">
            {/* Filter Popover Kategori - Wajib Popover per StyleGuide */}
            <Popover
              open={openKategoriPopover}
              onOpenChange={setOpenKategoriPopover}
            >
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openKategoriPopover}
                    className="justify-between min-w-[150px] font-normal cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Filter className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {selectedKategori === "ALL"
                          ? "Semua Kegiatan"
                          : selectedKategori}
                      </span>
                    </div>
                    <ChevronDown className="ml-2 size-3.5 shrink-0 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-64 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Filter kegiatan..." />
                  <CommandList>
                    <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="Semua Kegiatan"
                        onSelect={() => {
                          setSelectedKategori("ALL");
                          setOpenKategoriPopover(false);
                        }}
                        className="cursor-pointer flex items-center justify-between"
                      >
                        <span>Semua Kegiatan</span>
                        <Check
                          className={cn(
                            "size-3.5 text-primary",
                            selectedKategori === "ALL"
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                      {KATEGORI_GALERI_OPTIONS.map((cat) => (
                        <CommandItem
                          key={cat}
                          value={cat}
                          onSelect={() => {
                            setSelectedKategori(cat);
                            setOpenKategoriPopover(false);
                          }}
                          className="cursor-pointer flex items-center justify-between"
                        >
                          <span className="truncate">{cat}</span>
                          <Check
                            className={cn(
                              "size-3.5 text-primary",
                              selectedKategori === cat
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Filter Popover Status - Wajib Popover per StyleGuide */}
            <Popover
              open={openStatusPopover}
              onOpenChange={setOpenStatusPopover}
            >
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStatusPopover}
                    className="justify-between min-w-[150px] font-normal cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Filter className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {STATUS_FILTER_OPTIONS.find(
                          (o) => o.value === selectedStatus,
                        )?.label || "Pilih Status"}
                      </span>
                    </div>
                    <ChevronDown className="ml-2 size-3.5 shrink-0 opacity-50" />
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
                          setOpenStatusPopover(false);
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
                          <Check className="size-3.5 text-primary" />
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

      {/* 4. Main Display: Grid View vs Table View */}
      <div className="min-h-[40vh]">
        {viewMode === "grid" ? (
          <GaleriGridView
            items={filteredItems}
            onInspect={setInspectingItem}
            onEdit={handleOpenEdit}
            onDelete={setDeletingId}
            onToggleStatus={handleToggleStatus}
            onToggleFeatured={handleToggleFeatured}
          />
        ) : (
          <GaleriTableView
            items={filteredItems}
            onInspect={setInspectingItem}
            onEdit={handleOpenEdit}
            onDelete={setDeletingId}
            onToggleStatus={handleToggleStatus}
            onToggleFeatured={handleToggleFeatured}
          />
        )}
      </div>

      {/* 5. Editor Dialog Modal (Add & Edit) */}
      <GaleriEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        editingItem={editingItem}
        onSave={handleSave}
      />

      {/* 6. Slide-over Inspector Drawer with GSAP Right Slide-Over */}
      <GaleriDetailDrawer
        item={inspectingItem}
        allItems={filteredItems}
        onClose={() => setInspectingItem(null)}
        onEdit={handleOpenEdit}
        onDelete={setDeletingId}
        onToggleStatus={handleToggleStatus}
        onToggleFeatured={handleToggleFeatured}
        onNavigate={setInspectingItem}
      />

      {/* 7. Delete Confirmation Dialog */}
      <GaleriDeleteDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={deletingTarget?.title}
        onConfirm={() => {
          if (deletingId) {
            deleteMedia(deletingId);
            setDeletingId(null);
            if (inspectingItem?.id === deletingId) {
              setInspectingItem(null);
            }
          }
        }}
      />
    </div>
  );
}
