"use client";

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PengurusItem } from "@/features/pengurus/types";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Users,
  Mail,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PengurusDetailDrawerProps {
  item: PengurusItem | null;
  allItems: PengurusItem[];
  onClose: () => void;
  onEdit: (item: PengurusItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onNavigate?: (item: PengurusItem) => void;
}

const emptySubscribe = () => () => {};

export function PengurusDetailDrawer({
  item,
  allItems,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  onNavigate,
}: PengurusDetailDrawerProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Maintain active member and rendering state cleanly across animations
  const [prevItem, setPrevItem] = useState<PengurusItem | null>(item);
  const [activeMember, setActiveMember] = useState<PengurusItem | null>(item);
  const [isRendered, setIsRendered] = useState<boolean>(Boolean(item));

  // Canonical React pattern: update state when props change during render
  if (item !== prevItem) {
    setPrevItem(item);
    if (item) {
      setActiveMember(item);
      setIsRendered(true);
    }
  }

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  const lastAnimatedIdRef = useRef<string | null>(null);

  // Smooth GSAP Close sequence (slides from left to right: x: 0% -> 100%)
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

    // 3. Smooth slide of panel from 0% to 100% (right to left exit)
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

  // Entrance & Member Switch Animation via GSAP
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
      // Switching member while drawer is already open -> gentle crossfade
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

  // Escape key listener to close drawer
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

  if (!isMounted || !isRendered || !activeMember) {
    return null;
  }

  const currentIndex = allItems.findIndex((m) => m.id === activeMember.id);
  const isBlobOrData =
    activeMember.foto?.startsWith("data:") ||
    activeMember.foto?.startsWith("blob:");

  const handleNavigate = (nextItem: PengurusItem) => {
    setActiveMember(nextItem);
    onNavigate?.(nextItem);
  };

  const drawerElement = (
    <div
      id="pengurus-detail-drawer-portal"
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
        aria-label={`Detail pengurus: ${activeMember.nama}`}
        className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden will-change-transform"
        style={{ transform: "translateX(100%)" }}
      >
        {/* 1. Header Toolbar: Circular Close Button & Navigation Counter */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border/60 bg-muted/20 shrink-0">
          <button
            type="button"
            aria-label="Tutup panel detail pengurus"
            onClick={handleClose}
            className="w-9 h-9 cursor-pointer relative flex items-center justify-center rounded-full border border-border/80 hover:bg-muted text-foreground transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={() => handleNavigate(allItems[currentIndex - 1])}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Pengurus sebelumnya"
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
                title="Pengurus selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          <div ref={contentRef} className="flex flex-col gap-6 opacity-0">
            {/* Hero Profile: Portrait Image & Typography */}
            <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
              {/* Featured Portrait Photo */}
              <div className="w-36 sm:w-44 aspect-[3/4] rounded-xl overflow-hidden relative shrink-0 border border-border/80 shadow-xs bg-muted">
                {activeMember.foto ? (
                  <Image
                    src={activeMember.foto}
                    alt={activeMember.nama}
                    fill
                    unoptimized={isBlobOrData}
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 144px, 176px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Users className="w-10 h-10 opacity-30" />
                  </div>
                )}
              </div>

              {/* Identity & Badges */}
              <div className="flex-1 flex flex-col items-start gap-2 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeMember.kategori === "INTI" && (
                    <Badge
                      variant="outline"
                      className="text-[11px] py-0.5 bg-primary/10 text-primary border-primary/20"
                    >
                      Pimpinan Inti DPP
                    </Badge>
                  )}
                  {activeMember.kategori === "BIDANG" && (
                    <Badge
                      variant="outline"
                      className="text-[11px] py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    >
                      {activeMember.bidang || "Dewan Bidang"}
                    </Badge>
                  )}
                  {activeMember.kategori === "PENASEHAT" && (
                    <Badge
                      variant="outline"
                      className="text-[11px] py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                    >
                      Dewan Penasehat
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] py-0.5",
                      activeMember.status === "PUBLISHED"
                        ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                        : "text-amber-600 bg-amber-500/10 border-amber-500/20",
                    )}
                  >
                    {activeMember.status === "PUBLISHED" ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Tayang Publik
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Draf Internal
                      </>
                    )}
                  </Badge>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {activeMember.nama}
                </h2>

                <p className="text-sm sm:text-base font-medium text-muted-foreground">
                  {activeMember.jabatan}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
                  <span className="px-2 py-0.5 rounded-sm bg-muted text-foreground/80 font-medium">
                    Urutan #{activeMember.urutan}
                  </span>
                  <span>•</span>
                  <span>Masa Bakti {activeMember.periode}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-border/60" />

            {/* Narrative / Bio Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Profil &amp; Rekam Jejak
              </h4>
              <div className="rounded-xl p-4 sm:p-5 border border-border/80 bg-card shadow-2xs">
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {activeMember.deskripsi ||
                    "Pengurus resmi Dewan Pimpinan Pusat Persatuan Inteligensia Kristen Indonesia (PIKI) yang aktif berkontribusi dalam perumusan kebijakan, pengabdian masyarakat, dan pengembangan keilmuan nasional."}
                </p>
              </div>
            </div>

            {/* Social & Contact Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              {activeMember.email && (
                <a
                  href={`mailto:${activeMember.email}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{activeMember.email}</span>
                </a>
              )}
              {activeMember.linkedin && (
                <a
                  href={activeMember.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Profil LinkedIn / Web</span>
                </a>
              )}
            </div>

            {/* System & Organization Metadata */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-3">
              <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Informasi Organisasi &amp; Status
              </h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Kategori Kepengurusan
                  </span>
                  <span className="font-semibold text-foreground">
                    {activeMember.kategori === "INTI"
                      ? "Pimpinan Inti DPP"
                      : activeMember.kategori === "BIDANG"
                        ? "Dewan Pengurus & Bidang"
                        : "Dewan Penasehat & Pakar"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Departemen / Bidang Kerja
                  </span>
                  <span className="font-semibold text-foreground">
                    {activeMember.bidang || "Pimpinan Nasional"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Periode Resmi
                  </span>
                  <span className="font-medium text-foreground">
                    {activeMember.periode}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Terakhir Diperbarui
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(activeMember.updatedAt).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
              </div>
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
              onDelete(activeMember.id);
            }}
            className="text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Hapus Pengurus
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(activeMember.id)}
              className="cursor-pointer"
            >
              {activeMember.status === "PUBLISHED" ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                  Jadikan Draf
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
                onEdit(activeMember);
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
