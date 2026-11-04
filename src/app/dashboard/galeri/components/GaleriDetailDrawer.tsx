"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Archive,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Star,
  Camera,
  Film,
  ExternalLink,
  User,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GaleriItem, formatTanggalIndo, getSafeImageSrc } from "@/features/galeri/types";
import { cn } from "@/lib/utils";

interface GaleriDetailDrawerProps {
  item: GaleriItem | null;
  allItems?: GaleriItem[];
  onClose: () => void;
  onEdit: (item: GaleriItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onNavigate?: (item: GaleriItem) => void;
}

const emptySubscribe = () => () => {};

export function GaleriDetailDrawer({
  item,
  allItems = [],
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  onNavigate,
}: GaleriDetailDrawerProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Maintain active item & rendering state cleanly across animations
  const [prevItem, setPrevItem] = useState<GaleriItem | null>(item);
  const [activeItem, setActiveItem] = useState<GaleriItem | null>(item);
  const [isRendered, setIsRendered] = useState<boolean>(Boolean(item));

  // Canonical React pattern: sync state when props change during render
  if (item !== prevItem) {
    setPrevItem(item);
    if (item) {
      setActiveItem(item);
      setIsRendered(true);
    }
  }

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  const lastAnimatedIdRef = useRef<string | null>(null);

  // Smooth GSAP Close sequence (slides panel from left to right exit: x: 0% -> 100%)
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    // 1. Quick fade out of inner content
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.15,
        ease: "power2.in",
        overwrite: "auto",
      });
    }

    // 2. Fade out overlay backdrop
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    }

    // 3. Smooth slide of panel from 0% to 100% (right exit)
    if (drawerRef.current) {
      gsap.to(drawerRef.current, {
        x: "100%",
        duration: 0.45,
        ease: "power3.in",
        overwrite: "auto",
        onComplete: () => {
          isClosingRef.current = false;
          lastAnimatedIdRef.current = null;
          setIsRendered(false);
          onClose();
        },
      });
    } else {
      isClosingRef.current = false;
      lastAnimatedIdRef.current = null;
      setIsRendered(false);
      onClose();
    }
  }, [onClose]);

  // Entrance & Item Switch Animation via GSAP
  useEffect(() => {
    if (!item) return;

    const isFirstOpen = lastAnimatedIdRef.current === null;
    lastAnimatedIdRef.current = item.id;
    isClosingRef.current = false;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (isFirstOpen) {
      // Fade in backdrop overlay
      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      }

      // Slide drawer in from right (100% -> 0%)
      if (drawerRef.current) {
        gsap.fromTo(
          drawerRef.current,
          { x: "100%" },
          {
            x: "0%",
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          },
        );
      }

      // Staged fade in for inner content
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            delay: 0.15,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      }
    } else {
      // Switching item while drawer is already open -> gentle crossfade
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
          },
        );
      }
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [item]);

  // Escape key listener to close drawer cleanly
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !isClosingRef.current) {
        handleClose();
      }
    };
    if (isRendered) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isRendered, handleClose]);

  // Track view mode per item idiomatically without useEffect cascading render
  const [selectedViewMode, setSelectedViewMode] = useState<{
    itemId: string;
    mode: "embed" | "cover";
  } | null>(null);

  const igViewMode =
    selectedViewMode && selectedViewMode.itemId === activeItem?.id
      ? selectedViewMode.mode
      : "embed";

  const setIgViewMode = (mode: "embed" | "cover") => {
    if (!activeItem) return;
    setSelectedViewMode({ itemId: activeItem.id, mode });
  };

  const igEmbedUrl = useMemo(() => {
    if (!activeItem || activeItem.type !== "INSTAGRAM") return null;
    if (activeItem.embedUrl) return activeItem.embedUrl;
    const targetUrl = activeItem.instagramUrl || activeItem.url || "";
    const match = targetUrl.match(
      /instagram\.com\/(?:[\w.]+\/)?(p|reels?|tv)\/([a-zA-Z0-9_-]+)/i,
    );
    if (!match) return null;
    const postType = match[1].toLowerCase().startsWith("reel") ? "reel" : "p";
    return `https://www.instagram.com/${postType}/${match[2]}/embed`;
  }, [activeItem]);

  const isVideoFile =
    Boolean(activeItem) &&
    activeItem?.type === "VIDEO" &&
    !activeItem.youtubeVideoId &&
    Boolean(activeItem?.url);

  if (!isMounted || !isRendered || !activeItem) {
    return null;
  }

  const currentIndex = allItems.findIndex((m) => m.id === activeItem.id);
  const isBlobOrData =
    activeItem.url?.startsWith("data:") ||
    activeItem.url?.startsWith("blob:") ||
    activeItem.thumbnailUrl?.startsWith("data:") ||
    activeItem.thumbnailUrl?.startsWith("blob:");

  const handleNavigate = (nextItem: GaleriItem) => {
    setActiveItem(nextItem);
    onNavigate?.(nextItem);
  };

  const drawerElement = (
    <div
      id="galeri-detail-drawer-portal"
      className="fixed inset-0 z-50 overflow-hidden pointer-events-auto"
    >
      {/* Backdrop Overlay */}
      <div
        ref={overlayRef}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs opacity-0 cursor-pointer transition-colors"
        aria-hidden="true"
      />

      {/* Slide-over Right Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detail dokumentasi: ${activeItem.title}`}
        className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden will-change-transform"
        style={{ transform: "translateX(100%)" }}
      >
        {/* 1. Header Toolbar: Circular Close Button & Navigation Counter */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border/60 bg-muted/20 shrink-0">
          <button
            type="button"
            aria-label="Tutup panel detail dokumentasi"
            onClick={handleClose}
            className="w-9 h-9 cursor-pointer relative flex items-center justify-center rounded-full border border-border/80 hover:bg-muted text-foreground transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>

          {allItems.length > 0 && currentIndex !== -1 && (
            <div className="flex items-center gap-2">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={() => handleNavigate(allItems[currentIndex - 1])}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Dokumentasi sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <span className="text-xs sm:text-sm font-mono text-muted-foreground font-semibold px-2.5 py-0.5 rounded-full bg-muted/60 border border-border/40">
                {currentIndex + 1}/{allItems.length}
              </span>

              {currentIndex < allItems.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleNavigate(allItems[currentIndex + 1])}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Dokumentasi selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          <div ref={contentRef} className="flex flex-col gap-6 opacity-0">
            {/* Media Hero Showcase */}
            <div
              className={cn(
                "rounded-xl overflow-hidden border border-border/80 bg-black shadow-xs w-full relative transition-all duration-300",
                activeItem.type === "INSTAGRAM" && igViewMode === "embed"
                  ? "aspect-4/5 sm:aspect-square max-h-[520px]"
                  : "aspect-video",
              )}
            >
              {/* Optional view toggle for Instagram items */}
              {activeItem.type === "INSTAGRAM" && igEmbedUrl && activeItem.thumbnailUrl && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 p-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-white shadow-md">
                  <button
                    type="button"
                    onClick={() => setIgViewMode("embed")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                      igViewMode === "embed"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-white/80 hover:text-white hover:bg-white/10",
                    )}
                  >
                    Live Embed
                  </button>
                  <button
                    type="button"
                    onClick={() => setIgViewMode("cover")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                      igViewMode === "cover"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-white/80 hover:text-white hover:bg-white/10",
                    )}
                  >
                    Cover Card
                  </button>
                </div>
              )}

              {activeItem.type === "VIDEO" && activeItem.youtubeVideoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeItem.youtubeVideoId}?rel=0`}
                  title={activeItem.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : isVideoFile ? (
                <video
                  src={activeItem.url}
                  controls
                  playsInline
                  poster={activeItem.thumbnailUrl}
                  className="w-full h-full object-contain"
                >
                  Peramban Anda tidak mendukung pemutar video HTML5.
                </video>
              ) : activeItem.type === "INSTAGRAM" ? (
                igViewMode === "embed" && igEmbedUrl ? (
                  <iframe
                    key={igEmbedUrl}
                    src={igEmbedUrl}
                    title={activeItem.title}
                    className="w-full h-full border-0 bg-background"
                    loading="lazy"
                  />
                ) : (
                  <Image
                    src={getSafeImageSrc(activeItem.thumbnailUrl)}
                    alt={activeItem.title}
                    fill
                    className="object-cover"
                    unoptimized={isBlobOrData}
                    sizes="(max-width: 640px) 100vw, 650px"
                  />
                )
              ) : (
                <Image
                  src={getSafeImageSrc(activeItem.url || activeItem.thumbnailUrl)}
                  alt={activeItem.title}
                  fill
                  className="object-cover"
                  unoptimized={isBlobOrData}
                  sizes="(max-width: 640px) 100vw, 650px"
                />
              )}
            </div>

            {/* Badges & Status Strip */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Media Format Badge */}
              {activeItem.type === "PHOTO" && (
                <Badge
                  variant="outline"
                  className="text-[11px] py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 flex items-center gap-1.5"
                >
                  <Camera className="size-3" /> Foto Dokumentasi
                </Badge>
              )}
              {activeItem.type === "VIDEO" && (
                <Badge
                  variant="outline"
                  className="text-[11px] py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 flex items-center gap-1.5"
                >
                  <Film className="size-3" /> Liputan Video
                </Badge>
              )}
              {activeItem.type === "INSTAGRAM" && (
                <Badge
                  variant="outline"
                  className="text-[11px] py-0.5 bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20 flex items-center gap-1.5"
                >
                  <FaInstagram className="size-3" /> Instagram Post
                </Badge>
              )}

              {/* Kategori Kegiatan Badge */}
              <Badge
                variant="outline"
                className="text-[11px] py-0.5 bg-muted text-muted-foreground border-border/80"
              >
                {activeItem.kategoriKegiatan}
              </Badge>

              {/* Status Publikasi Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] py-0.5",
                  activeItem.status === "PUBLISHED"
                    ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                    : activeItem.status === "ARCHIVED"
                      ? "text-slate-600 bg-slate-500/10 border-slate-500/20"
                      : "text-amber-600 bg-amber-500/10 border-amber-500/20",
                )}
              >
                {activeItem.status === "PUBLISHED" ? (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Tayang Publik
                  </>
                ) : activeItem.status === "ARCHIVED" ? (
                  <>
                    <Archive className="w-3 h-3 mr-1" />
                    Diarsipkan
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Draf Internal
                  </>
                )}
              </Badge>

              {/* Spotlight Badge */}
              {activeItem.featured && (
                <Badge className="bg-amber-500 text-white text-[10px] py-0.5 flex items-center gap-1 border-0 shadow-2xs">
                  <Sparkles className="size-3" /> Spotlight Unggulan
                </Badge>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {activeItem.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {activeItem.deskripsi}
              </p>
            </div>

            {/* Information & Metadata Card (Linear / Stripe style per StyleGuide) */}
            <div className="space-y-4 py-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Informasi &amp; Metadata Kegiatan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Calendar className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Tanggal Kegiatan
                    </span>
                    <span className="font-medium text-foreground font-mono">
                      {formatTanggalIndo(activeItem.tanggal, { month: "long" })}
                    </span>
                  </div>
                </div>

                {activeItem.lokasi && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Lokasi Kegiatan
                      </span>
                      <span className="font-medium text-foreground">
                        {activeItem.lokasi}
                      </span>
                    </div>
                  </div>
                )}

                {activeItem.duration && (
                  <div className="flex items-start gap-2.5">
                    <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Durasi Tayang
                      </span>
                      <span className="font-medium text-foreground font-mono">
                        {activeItem.duration}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  <User className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Penerbit / Pengunggah
                    </span>
                    <span className="font-medium text-foreground">
                      Sekretariat DPP PIKI
                    </span>
                  </div>
                </div>
              </div>

              {/* External Link Action if Available */}
              {(activeItem.instagramUrl ||
                (activeItem.type === "VIDEO" && activeItem.url)) && (
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Tautan Sumber Asli
                  </span>
                  <a
                    href={activeItem.instagramUrl || activeItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                  >
                    <span>
                      {activeItem.type === "INSTAGRAM"
                        ? "Buka Postingan Instagram"
                        : "Buka Tautan YouTube"}
                    </span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Audit / Timestamp Info */}
            <div className="text-[11px] text-muted-foreground/80 flex items-center justify-between px-1">
              <span>ID: {activeItem.id}</span>
              <span>
                Terakhir diubah:{" "}
                {activeItem.updatedAt
                  ? new Date(activeItem.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Baru saja"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Footer Action Bar */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between gap-2 mt-auto shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleClose();
              onDelete(activeItem.id);
            }}
            className="text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Hapus</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={activeItem.type !== "VIDEO" || activeItem.status === "ARCHIVED"}
              onClick={() => onToggleFeatured(activeItem.id)}
              title={
                activeItem.type !== "VIDEO"
                  ? "Hanya video yang dapat dijadikan spotlight utama"
                  : activeItem.status === "ARCHIVED"
                    ? "Item yang diarsipkan tidak dapat dijadikan spotlight"
                    : activeItem.featured
                      ? "Hapus dari Spotlight Utama"
                      : "Jadikan Spotlight Utama"
              }
              className={cn(
                "cursor-pointer",
                (activeItem.type !== "VIDEO" || activeItem.status === "ARCHIVED") &&
                  "opacity-40 cursor-not-allowed",
              )}
            >
              <Star
                className={cn(
                  "w-3.5 h-3.5 mr-1.5",
                  activeItem.featured && "fill-amber-500 text-amber-500",
                )}
              />
              <span>
                {activeItem.featured ? "Batal Spotlight" : "Set Spotlight"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(activeItem.id)}
              className="cursor-pointer"
            >
              {activeItem.status === "PUBLISHED" ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                  Jadikan Draf
                </>
              ) : activeItem.status === "ARCHIVED" ? (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Terbitkan
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Tayangkan
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={() => {
                handleClose();
                onEdit(activeItem);
              }}
              className="cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Ubah Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerElement, document.body);
}
