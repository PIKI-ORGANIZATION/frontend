"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Calendar,
  Camera,
  Film,
  MapPin,
  Play,
  Sparkles,
  ZoomIn,
  ExternalLink,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePublicGaleri } from "@/features/galeri/hooks/useGaleri";
import {
  GaleriItem,
  MediaType,
  formatTanggalIndo,
  getSafeImageSrc,
} from "@/features/galeri/types";
import { GaleriLightboxModal } from "@/app/(public)/galeri/components/GaleriLightboxModal";
import type { MediaItem } from "@/app/(public)/galeri/types";

function toMediaItem(item: GaleriItem): MediaItem {
  return {
    id: item.id,
    title: item.title,
    deskripsi: item.deskripsi,
    type: item.type,
    url: item.url,
    thumbnailUrl: item.thumbnailUrl,
    embedUrl: item.embedUrl,
    kategoriKegiatan: item.kategoriKegiatan,
    tanggal: item.tanggal || "",
    lokasi: item.lokasi,
    duration: item.duration,
    instagramUrl: item.instagramUrl,
    youtubeVideoId: item.youtubeVideoId,
    featured: item.featured,
  };
}

function MediaTypeBadge({ type }: { type: GaleriItem["type"] }) {
  if (type === "VIDEO") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
        <Film className="h-3.5 w-3.5" />
        <span>Video</span>
      </span>
    );
  }
  if (type === "INSTAGRAM") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
        <FaInstagram className="h-3.5 w-3.5" />
        <span>Instagram</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
      <Camera className="h-3.5 w-3.5" />
      <span>Foto</span>
    </span>
  );
}

function SafeGalleryImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const finalSrc = hasError ? "/footage/image1.webp" : getSafeImageSrc(src);

  return (
    <Image
      src={finalSrc}
      alt={alt}
      fill
      priority={priority}
      loading={priority ? undefined : "lazy"}
      sizes={sizes}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

interface GalleryCardProps {
  item: GaleriItem;
  onSelect: (item: GaleriItem) => void;
  variant: "hero" | "compact" | "standard";
}

function GalleryCard({ item, onSelect, variant }: GalleryCardProps) {
  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
      aria-label={`Lihat dokumentasi ${item.title}`}
      className={cn(
        "gallery-reveal group relative overflow-hidden rounded-2xl border border-border/70 bg-background cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
        isHero && "h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[460px]",
        isCompact && "flex flex-col sm:flex-row lg:flex-row h-full",
        variant === "standard" && "flex flex-col h-full",
      )}
    >
      {isHero ? (
        <>
          <SafeGalleryImage
            src={item.thumbnailUrl}
            alt={item.title}
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15 transition-opacity duration-300 group-hover:from-black/90" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {item.featured && (
                <Badge className="bg-primary text-primary-foreground border-0 text-xs font-medium px-2.5 py-1 gap-1 shadow-xs">
                  <Sparkles className="h-3 w-3" />
                  Sorotan
                </Badge>
              )}
              {item.kategoriKegiatan && (
                <span className="rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
                  {item.kategoriKegiatan}
                </span>
              )}
            </div>
            <MediaTypeBadge type={item.type} />
          </div>

          {/* Center Play Indicator for Videos */}
          {item.type === "VIDEO" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-xl transition-transform duration-300 group-hover:scale-110">
                <Play className="h-7 w-7 ml-0.5 fill-primary text-primary" />
              </div>
            </div>
          )}

          {/* Bottom Editorial Caption */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 flex flex-col gap-2.5 text-white">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80">
              {item.tanggal && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <time>{formatTanggalIndo(item.tanggal, { month: "long" })}</time>
                </span>
              )}
              {item.lokasi && (
                <span className="inline-flex items-center gap-1.5 truncate max-w-[260px]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.lokasi}</span>
                </span>
              )}
              {item.type === "VIDEO" && item.duration && (
                <span className="rounded bg-white/15 px-2 py-0.5 font-mono text-xs backdrop-blur-xs">
                  {item.duration}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug tracking-tight line-clamp-2 group-hover:text-primary-foreground transition-colors">
              {item.title}
            </h3>
            {item.deskripsi && (
              <p className="text-sm text-white/80 line-clamp-2 font-light leading-relaxed max-w-2xl">
                {item.deskripsi}
              </p>
            )}
          </div>
        </>
      ) : isCompact ? (
        <>
          <div className="relative aspect-[16/10] sm:aspect-auto sm:w-44 lg:w-48 shrink-0 overflow-hidden bg-muted">
            <SafeGalleryImage
              src={item.thumbnailUrl}
              alt={item.title}
              sizes="(max-width: 640px) 100vw, 200px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {item.type === "VIDEO" && (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Play className="h-4 w-4 ml-0.5 fill-primary text-primary" />
                </div>
              </div>
            )}
            <div className="absolute top-2.5 left-2.5">
              <MediaTypeBadge type={item.type} />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 gap-2.5 min-w-0">
            <div className="space-y-1.5">
              {item.kategoriKegiatan && (
                <span className="text-xs font-semibold text-primary">
                  {item.kategoriKegiatan}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              {item.deskripsi && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.deskripsi}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
              {item.tanggal && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <time>{formatTanggalIndo(item.tanggal, { month: "long" })}</time>
                </span>
              )}
              {item.lokasi && (
                <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.lokasi}</span>
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            <SafeGalleryImage
              src={item.thumbnailUrl}
              alt={item.title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
              {item.kategoriKegiatan && (
                <span className="rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs truncate max-w-[65%]">
                  {item.kategoriKegiatan}
                </span>
              )}
              <MediaTypeBadge type={item.type} />
            </div>

            {item.type === "VIDEO" && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-colors group-hover:bg-black/35">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Play className="h-5 w-5 ml-0.5 fill-primary text-primary" />
                </div>
                {item.duration && (
                  <span className="absolute bottom-3 right-3 rounded bg-black/75 px-2 py-0.5 font-mono text-xs text-white backdrop-blur-xs">
                    {item.duration}
                  </span>
                )}
              </div>
            )}

            {item.type !== "VIDEO" && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md">
                  {item.type === "INSTAGRAM" ? (
                    <ExternalLink className="h-5 w-5" />
                  ) : (
                    <ZoomIn className="h-5 w-5" />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between p-5 gap-3">
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              {item.deskripsi && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.deskripsi}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
              {item.tanggal && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <time>{formatTanggalIndo(item.tanggal, { month: "long" })}</time>
                </span>
              )}
              {item.lokasi && (
                <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.lokasi}</span>
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </article>
  );
}

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<MediaType>("ALL");
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const { items, isLoading } = usePublicGaleri({
    penempatan: "BERANDA",
    currentPage: 1,
    pageSize: 6,
  });

  // Hitung tipe media yang tersedia di data Beranda agar filter tidak menampilkan tab kosong
  const availableFilters = useMemo(() => {
    const types = new Set(items.map((item) => item.type));
    const list: Array<{ value: MediaType; label: string }> = [
      { value: "ALL", label: "Semua" },
    ];
    if (types.has("PHOTO")) list.push({ value: "PHOTO", label: "Foto" });
    if (types.has("VIDEO")) list.push({ value: "VIDEO", label: "Video" });
    if (types.has("INSTAGRAM")) list.push({ value: "INSTAGRAM", label: "Instagram" });
    return list;
  }, [items]);

  const effectiveFilter: MediaType = useMemo(() => {
    if (availableFilters.some((f) => f.value === activeFilter)) {
      return activeFilter;
    }
    return "ALL";
  }, [activeFilter, availableFilters]);

  const filteredItems = useMemo(() => {
    const base =
      effectiveFilter === "ALL"
        ? items
        : items.filter((item) => item.type === effectiveFilter);

    // Prioritaskan item featured sebagai kartu sorotan utama di posisi pertama
    const featuredIdx = base.findIndex((i) => i.featured);
    if (featuredIdx > 0) {
      const copy = [...base];
      const [featuredItem] = copy.splice(featuredIdx, 1);
      return [featuredItem, ...copy];
    }
    return base;
  }, [items, effectiveFilter]);

  useEffect(() => {
    if (!sectionRef.current || filteredItems.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gallery-reveal",
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [filteredItems.length]);

  const currentLightboxIndex = lightboxItem
    ? filteredItems.findIndex((i) => i.id === lightboxItem.id)
    : -1;

  const handleSelectItem = (item: GaleriItem) => {
    setLightboxItem(toMediaItem(item));
  };

  const handleNextLightbox = () => {
    if (currentLightboxIndex === -1 || filteredItems.length <= 1) return;
    const next = filteredItems[(currentLightboxIndex + 1) % filteredItems.length];
    setLightboxItem(toMediaItem(next));
  };

  const handlePrevLightbox = () => {
    if (currentLightboxIndex === -1 || filteredItems.length <= 1) return;
    const prev =
      filteredItems[
        (currentLightboxIndex - 1 + filteredItems.length) % filteredItems.length
      ];
    setLightboxItem(toMediaItem(prev));
  };

  const handleShare = (item: MediaItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/galeri`
        : "/galeri";

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(`${item.title} — ${shareUrl}`)
        .then(() => {
          setHasCopied(true);
          toast.success("Tautan dokumentasi berhasil disalin");
          setTimeout(() => setHasCopied(false), 2000);
        })
        .catch(() => {
          toast.error("Gagal menyalin tautan");
        });
    }
  };

  const heroItem = filteredItems[0];
  const sideItems = filteredItems.length >= 3 ? filteredItems.slice(1, 3) : [];
  const bottomItems =
    filteredItems.length >= 3
      ? filteredItems.slice(3, 6)
      : filteredItems.slice(1);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-card border-t border-border/60 py-16 md:py-28"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* 1. Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-primary">
              Dokumentasi Kegiatan
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Galeri Momen PIKI
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
              Rekaman visual kongres, kajian pakar, dan kontribusi nyata
              cendekiawan Kristen di seluruh Indonesia.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
            {availableFilters.length > 2 && (
              <div
                role="tablist"
                aria-label="Filter tipe media galeri beranda"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 p-1"
              >
                {availableFilters.map((filter) => {
                  const isActive = effectiveFilter === filter.value;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveFilter(filter.value)}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            )}

            <Link href="/galeri" className="hidden md:inline-flex">
              <Button variant="ghost" className="group h-10 px-4 text-sm gap-2">
                <span>Lihat Semua Galeri</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 min-h-[380px] rounded-2xl bg-muted animate-pulse" />
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex-1 min-h-[180px] rounded-2xl bg-muted animate-pulse" />
              <div className="flex-1 min-h-[180px] rounded-2xl bg-muted animate-pulse" />
            </div>
          </div>
        )}

        {/* 3. Empty State (jika belum ada item PUBLISHED bertanda BERANDA) */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 px-6 py-14 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Dokumentasi Beranda Belum Tersedia
            </h3>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Foto, video kegiatan, dan arsip publikasi PIKI dapat Anda jelajahi
              langsung melalui halaman galeri lengkap.
            </p>
            <Link href="/galeri" className="mt-2">
              <Button variant="outline" className="h-10 px-5 text-sm gap-2">
                <span>Jelajahi Arsip Galeri</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* 4. Adaptive Editorial Bento Grid */}
        {!isLoading && filteredItems.length === 1 && heroItem && (
          <div className="w-full">
            <GalleryCard
              item={heroItem}
              onSelect={handleSelectItem}
              variant="hero"
            />
          </div>
        )}

        {!isLoading && filteredItems.length === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onSelect={handleSelectItem}
                variant="standard"
              />
            ))}
          </div>
        )}

        {!isLoading && filteredItems.length >= 3 && heroItem && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7">
                <GalleryCard
                  item={heroItem}
                  onSelect={handleSelectItem}
                  variant="hero"
                />
              </div>

              <div className="lg:col-span-5 grid grid-cols-1 gap-6">
                {sideItems.map((item) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    onSelect={handleSelectItem}
                    variant="compact"
                  />
                ))}
              </div>
            </div>

            {bottomItems.length > 0 && (
              <div
                className={cn(
                  "grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6",
                  bottomItems.length >= 3 && "lg:grid-cols-3",
                )}
              >
                {bottomItems.map((item) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    onSelect={handleSelectItem}
                    variant="standard"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Mobile CTA Button */}
        {!isLoading && filteredItems.length > 0 && (
          <Link href="/galeri" className="mt-10 block md:hidden w-full">
            <Button
              variant="outline"
              className="w-full h-11 text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>Lihat Semua Galeri</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Lightbox Modal Terintegrasi (Foto HD / YouTube / Video MP4 / Instagram) */}
      <GaleriLightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onShare={handleShare}
        hasCopied={hasCopied}
        onNext={filteredItems.length > 1 ? handleNextLightbox : undefined}
        onPrev={filteredItems.length > 1 ? handlePrevLightbox : undefined}
        totalItems={filteredItems.length}
        currentIndex={currentLightboxIndex >= 0 ? currentLightboxIndex : undefined}
      />
    </section>
  );
}
