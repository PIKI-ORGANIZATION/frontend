"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { MediaType, MediaItem } from "./types";
import {
  CATEGORIES,
  type CategoryFilter,
  MEDIA_FILTERS,
  GALLERY_DATA,
} from "./data/galeriData";
import { GaleriSpotlight } from "./components/GaleriSpotlight";
import { GaleriCategoryFilter } from "./components/GaleriCategoryFilter";
import { GaleriMediaCard } from "./components/GaleriMediaCard";
import { GaleriLightboxModal } from "./components/GaleriLightboxModal";

export default function GaleriPage() {
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>("ALL");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("Semua Kegiatan");
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Filtered media items based on media type & searchable activity category
  const filteredItems = useMemo(() => {
    return GALLERY_DATA.filter((item) => {
      if (selectedMediaType !== "ALL" && item.type !== selectedMediaType) {
        return false;
      }
      if (
        selectedCategory !== "Semua Kegiatan" &&
        item.kategoriKegiatan !== selectedCategory
      ) {
        return false;
      }
      return true;
    });
  }, [selectedMediaType, selectedCategory]);

  const spotlightItem =
    GALLERY_DATA.find((item) => item.featured) || GALLERY_DATA[0];

  const handleShare = (item: MediaItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setHasCopied(true);
      toast.success("Tautan galeri berhasil disalin!");
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col selection:bg-primary">
      <section className="pt-28 pb-10 md:pt-36 md:pb-20 px-4 md:px-6 xl:px-0 max-w-7xl mx-auto w-full">
        {/* 1. Page Header */}
        <PageHeader
          align="center"
          eyebrow={""}
          title="Galeri & Dokumentasi"
          description="Jelajahi dokumentasi perjalanan, kegiatan, dan kontribusi PIKI dalam membangun bangsa serta melayani gereja. Setiap foto dan video mengabadikan langkah, kolaborasi, dan karya nyata organisasi."
        />

        {/* 2. Spotlight Highlight Banner (Hero) */}
        {spotlightItem && (
          <GaleriSpotlight
            item={spotlightItem}
            onSelect={setLightboxItem}
            onShare={handleShare}
            hasCopied={hasCopied}
          />
        )}

        {/* 3. Filtering Toolbar: Segmented Media Format Tabs & Searchable Popover Dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-border/60">
          {/* Format Tabs Switcher */}
          <div
            role="tablist"
            aria-label="Filter Tipe Media"
            className="inline-flex items-center p-1 rounded-lg bg-muted/60 dark:bg-muted/30 border border-border/80 overflow-x-auto max-w-full"
          >
            {MEDIA_FILTERS.map((filter) => {
              const isSelected = selectedMediaType === filter.value;
              const IconComponent = filter.icon;
              return (
                <button
                  key={filter.value}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedMediaType(filter.value)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer select-none",
                    isSelected
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40 font-normal",
                  )}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Searchable Activity / Slug Dropdown & Meta counter */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
            <span className="text-xs text-muted-foreground font-mono hidden sm:inline-block">
              {filteredItems.length} media
            </span>
            <GaleriCategoryFilter
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        {/* 4. Multimedia Grid with Reference PopLayout Card Animations */}
        <div className="min-h-[40vh]">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center gap-3">
              <Camera className="w-10 h-10 text-muted-foreground/40" />
              <h4 className="text-base font-semibold text-foreground">
                Tidak ada dokumentasi ditemukan
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                Belum ada konten media untuk kombinasi filter format dan
                kategori kegiatan yang dipilih.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMediaType("ALL");
                  setSelectedCategory("Semua Kegiatan");
                }}
                className="mt-2 text-xs cursor-pointer gap-2"
              >
                <RotateCcw className="size-3.5" />
                Reset Semua Filter
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
              aria-label="Daftar Galeri Media"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    role="listitem"
                  >
                    <GaleriMediaCard item={item} onSelect={setLightboxItem} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* 6. Lightbox Modal Dialog (Photos & Lazy YouTube Player) */}
      <GaleriLightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onShare={handleShare}
        hasCopied={hasCopied}
      />
    </main>
  );
}
