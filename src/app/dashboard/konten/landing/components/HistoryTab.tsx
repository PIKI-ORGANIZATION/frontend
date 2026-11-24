"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { HistoryEvent } from "../types";
import { HistoryEditorDialog } from "./HistoryEditorDialog";
import { HistoryPreviewCard } from "./HistoryPreviewCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  SlidersHorizontal,
  Archive,
  AlertCircle,
  Building2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSejarah } from "@/features/sejarah/hooks/useSejarah";
import { getSafeImageSrc } from "@/features/galeri/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { resolveLandingCmsAccess, canWriteCabangItem } from "@/lib/rbac";
import { useCabangList } from "@/features/wilayah/hooks/useWilayah";

interface HistoryTabProps {
  events?: HistoryEvent[];
  setEvents?: React.Dispatch<React.SetStateAction<HistoryEvent[]>>;
  canManage?: boolean;
  enabled?: boolean;
}

export function HistoryTab({
  events: propEvents,
  setEvents,
  canManage = true,
  enabled = true,
}: HistoryTabProps) {
  const { user } = useCurrentUser();
  const access = useMemo(() => resolveLandingCmsAccess(user), [user]);
  const [selectedCabang, setSelectedCabang] = useState<string>("ALL");

  const { data: cabangList = [] } = useCabangList({
    pageSize: 500,
    enabled: enabled && access.scope !== "DPC",
  });

  const cabangNameMap = useMemo(() => {
    if (access.scope === "DPC") return undefined;
    const map: Record<string, string> = {};
    cabangList.forEach((c) => {
      map[c.uuid] = c.namaCabang;
    });
    return map;
  }, [access.scope, cabangList]);

  const canManageItem = useMemo(
    () => (item: HistoryEvent) =>
      canManage && canWriteCabangItem(user, item.cabangUuid),
    [canManage, user],
  );

  const {
    events: remoteEvents,
    isLoading,
    addEvent,
    updateEvent,
    toggleStatusEvent,
    archiveEvent,
    deleteEvent,
    uploadFoto,
  } = useSejarah({
    fixed: "all",
    fallbackIfEmpty: false,
    enabled,
    ...(access.canSelectCabang && selectedCabang !== "ALL"
      ? { cabangUuid: selectedCabang }
      : {}),
  });

  // Gunakan propEvents jika disediakan, atau gunakan remoteEvents dari API
  const effectiveEvents = propEvents && setEvents ? propEvents : remoteEvents;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED"
  >("ALL");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HistoryEvent | null>(null);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string>("");
  const [deletingTarget, setDeletingTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Filtered dataset
  const filteredEvents = useMemo(() => {
    return effectiveEvents
      .filter((item) => {
        const matchesStatus =
          statusFilter === "ALL" || item.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          item.year.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => a.order - b.order);
  }, [effectiveEvents, search, statusFilter]);

  const activePreviewEvent = useMemo(() => {
    if (selectedPreviewId) {
      const found = effectiveEvents.find((e) => e.id === selectedPreviewId);
      if (found) return found;
    }
    return filteredEvents[0] || effectiveEvents[0] || null;
  }, [effectiveEvents, selectedPreviewId, filteredEvents]);

  const handleOpenAdd = () => {
    if (!canManage || access.isUnlinkedBranchAdmin) return;
    setEditingEvent(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (item: HistoryEvent) => {
    if (!canManageItem(item)) return;
    setEditingEvent(item);
    setEditorOpen(true);
  };

  const handleToggleStatus = async (item: HistoryEvent) => {
    if (!canManageItem(item)) return;
    const newStatus = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    if (setEvents) {
      setEvents((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, status: newStatus } : e)),
      );
    }
    try {
      await toggleStatusEvent(item.id);
    } catch {
      // Toast error dikelola oleh hook
    }
  };

  const handleArchive = async (item: HistoryEvent) => {
    if (!canManageItem(item) || item.status === "ARCHIVED") return;
    if (setEvents) {
      setEvents((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, status: "ARCHIVED" } : e)),
      );
    }
    try {
      await archiveEvent(item.id);
    } catch {
      // Toast error dikelola oleh hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!canManage || !deletingTarget) return;
    const targetItem = effectiveEvents.find((e) => e.id === deletingTarget.id);
    if (targetItem && !canManageItem(targetItem)) return;
    const { id } = deletingTarget;
    if (setEvents) {
      setEvents((prev) => prev.filter((item) => item.id !== id));
    }
    try {
      await deleteEvent(id);
    } catch {
      // Toast error dikelola oleh hook
    } finally {
      setDeletingTarget(null);
    }
  };

  const handleSaveEvent = async (savedEvent: HistoryEvent) => {
    if (!canManage) return;
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, savedEvent);
      } else {
        await addEvent(savedEvent);
      }
      if (setEvents) {
        setEvents((prev) => {
          const exists = prev.some((item) => item.id === savedEvent.id);
          return exists
            ? prev.map((item) => (item.id === savedEvent.id ? savedEvent : item))
            : [...prev, savedEvent];
        });
      }
      setSelectedPreviewId(savedEvent.id);
      setEditorOpen(false);
    } catch {
      // Toast error dikelola oleh hook
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Cari tahun, peristiwa, kata kunci..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="w-40 shrink-0">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val)
                  setStatusFilter(
                    val as "ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED",
                  );
              }}
            >
              <SelectTrigger>
                <SlidersHorizontal className="w-3 h-3 text-muted-foreground mr-1 shrink-0" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {access.canSelectCabang && (
            <div className="w-48 shrink-0">
              <Select
                value={selectedCabang}
                onValueChange={(val) => {
                  if (val) setSelectedCabang(val);
                }}
              >
                <SelectTrigger aria-label="Filter wilayah cabang">
                  <Building2 className="w-3 h-3 text-muted-foreground mr-1 shrink-0" />
                  <SelectValue placeholder="Semua Wilayah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Wilayah</SelectItem>
                  {cabangList.map((c) => (
                    <SelectItem key={c.uuid} value={c.uuid}>
                      {c.namaCabang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {canManage && (
          <Button
            onClick={handleOpenAdd}
            size="sm"
            disabled={access.isUnlinkedBranchAdmin}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </Button>
        )}
      </div>

      {access.isUnlinkedBranchAdmin && (
        <div
          role="alert"
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Akun admin wilayah belum ditautkan ke Cabang</p>
            <p className="text-xs opacity-90 mt-0.5">
              Hubungi Superadmin DPP untuk menautkan akun Anda ke profil Cabang agar dapat menambah dan mengelola tonggak sejarah.
            </p>
          </div>
        </div>
      )}

      {/* 2. Content Layout: Data Table + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri: Tabel Peristiwa (lg:col-span-8) */}
        <div className="lg:col-span-8 rounded-lg ring-1 ring-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border/70 flex items-center justify-between text-xs md:text-sm font-medium text-muted-foreground bg-muted/20">
            <span>
              Menampilkan{" "}
              <strong className="text-foreground">
                {filteredEvents.length}
              </strong>{" "}
              peristiwa sejarah
            </span>
            <span className="text-xs md:text-[12px] hidden sm:inline">
              Klik baris untuk melihat pratinjau kartu
            </span>
          </div>

          {isLoading && effectiveEvents.length === 0 ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded bg-muted/60 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted/60 rounded w-1/4" />
                    <div className="h-3 bg-muted/40 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="font-medium text-foreground">
                Tidak ada peristiwa yang cocok.
              </p>
              <p>Coba sesuaikan kata kunci pencarian atau saringan status.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredEvents.map((item) => {
                const isSelected = item.id === (activePreviewEvent?.id || selectedPreviewId);
                const itemCanManage = canManageItem(item);
                const cabangLabel = item.cabangUuid
                  ? cabangNameMap?.[item.cabangUuid] || "Wilayah Cabang"
                  : "Pusat (DPP)";
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPreviewId(item.id)}
                    className={`px-4 py-4 md:px-5 md:py-5 lg:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Thumbnail Footage */}
                      <div className="w-12 h-12 rounded-sm bg-muted overflow-hidden shrink-0 border border-border/70 relative">
                        <Image
                          src={getSafeImageSrc(item.image, "/footage/image1.webp")}
                          alt={item.title}
                          fill
                          sizes="48px"
                          unoptimized={
                            item.image.startsWith("data:") ||
                            item.image.startsWith("blob:")
                          }
                          className="object-cover"
                        />
                      </div>

                      {/* Info Peristiwa */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-foreground text-xs bg-muted px-1.5 py-0.2 rounded border border-border/70">
                            {item.year}
                          </span>
                          <span className="font-semibold text-foreground text-base truncate">
                            {item.title}
                          </span>
                          <Badge
                            variant={
                              item.status === "PUBLISHED"
                                ? "default"
                                : "secondary"
                            }
                            className={`text-[10px] rounded-full px-2 py-0 font-medium ${
                              item.status === "PUBLISHED"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : item.status === "ARCHIVED"
                                  ? "bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {item.status === "PUBLISHED"
                              ? "Published"
                              : item.status === "ARCHIVED"
                                ? "Archived"
                                : "Draft"}
                          </Badge>
                          {cabangNameMap && (
                            <Badge variant="outline" className="text-[10px] font-normal">
                              {cabangLabel}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-1 text-xs md:text-[13px]">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Aksi Baris */}
                    {itemCanManage && (
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(item);
                          }}
                          aria-label={
                            item.status === "PUBLISHED"
                              ? `Jadikan draf ${item.title}`
                              : `Tayangkan ${item.title}`
                          }
                          title={
                            item.status === "PUBLISHED"
                              ? "Jadikan Draf"
                              : "Tayangkan ke Landing Page"
                          }
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              item.status === "PUBLISHED"
                                ? "text-emerald-500"
                                : "text-muted-foreground/50"
                            }`}
                          />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(item);
                          }}
                          aria-label={`Edit ${item.title}`}
                          title="Edit Peristiwa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        {item.status !== "ARCHIVED" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(item);
                            }}
                            aria-label={`Arsipkan ${item.title}`}
                            title="Arsipkan Peristiwa"
                          >
                            <Archive className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTarget({ id: item.id, title: item.title });
                          }}
                          aria-label={`Hapus ${item.title}`}
                          title="Hapus Peristiwa"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Live Preview Kartu Terpilih (lg:col-span-4) */}
        <div className="lg:col-span-4 sticky top-20">
          {activePreviewEvent ? (
            <HistoryPreviewCard event={activePreviewEvent} />
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground ring-1 ring-border rounded-lg bg-card">
              <Eye className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
              Pilih tonggak sejarah untuk melihat simulasi kartu publik.
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal Dialog */}
      {canManage && (
        <HistoryEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          event={editingEvent}
          canSelectCabang={access.canSelectCabang}
          cabangOptions={cabangList}
          onSave={handleSaveEvent}
          onUploadPhoto={uploadFoto}
        />
      )}

      {canManage && (
        <ConfirmDialog
          open={Boolean(deletingTarget)}
          onOpenChange={(open) => !open && setDeletingTarget(null)}
          title="Hapus Peristiwa Sejarah?"
          description={`Peristiwa "${deletingTarget?.title || ""}" akan dihapus dari daftar CMS dan linimasa publik PIKI.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
