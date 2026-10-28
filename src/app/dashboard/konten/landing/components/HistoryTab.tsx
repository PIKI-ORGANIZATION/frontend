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
} from "lucide-react";
import { toast } from "sonner";

interface HistoryTabProps {
  events: HistoryEvent[];
  setEvents: React.Dispatch<React.SetStateAction<HistoryEvent[]>>;
}

export function HistoryTab({ events, setEvents }: HistoryTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PUBLISHED" | "DRAFT"
  >("ALL");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HistoryEvent | null>(null);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string>(
    events[0]?.id || "",
  );

  // Filtered dataset
  const filteredEvents = useMemo(() => {
    return events
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
  }, [events, search, statusFilter]);

  const activePreviewEvent = useMemo(() => {
    return (
      events.find((e) => e.id === selectedPreviewId) ||
      filteredEvents[0] ||
      events[0] ||
      null
    );
  }, [events, selectedPreviewId, filteredEvents]);

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (item: HistoryEvent) => {
    setEditingEvent(item);
    setEditorOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setEvents((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
          toast.success(
            `Status "${item.title}" diubah menjadi ${
              newStatus === "PUBLISHED" ? "Tayang (Published)" : "Draf (Draft)"
            }`,
          );
          return {
            ...item,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      }),
    );
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus peristiwa "${title}"?`)) {
      setEvents((prev) => prev.filter((item) => item.id !== id));
      toast.success(`Tonggak sejarah "${title}" berhasil dihapus.`);
    }
  };

  const handleSaveEvent = (savedEvent: HistoryEvent) => {
    setEvents((prev) => {
      const exists = prev.some((item) => item.id === savedEvent.id);
      if (exists) {
        toast.success(`Data "${savedEvent.title}" berhasil diperbarui.`);
        return prev.map((item) =>
          item.id === savedEvent.id ? savedEvent : item,
        );
      } else {
        toast.success(
          `Tonggak sejarah baru "${savedEvent.title}" berhasil ditambahkan.`,
        );
        return [...prev, savedEvent];
      }
    });
    setSelectedPreviewId(savedEvent.id);
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

          <div className="w-36 shrink-0">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val) setStatusFilter(val as "ALL" | "PUBLISHED" | "DRAFT");
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
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleOpenAdd} size="sm">
          <Plus className="w-3.5 h-3.5" />
          Tambah
        </Button>
      </div>

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

          {filteredEvents.length === 0 ? (
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
                const isSelected = item.id === selectedPreviewId;
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
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/70 relative">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="48px"
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
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {item.status === "PUBLISHED"
                              ? "Published"
                              : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-1 text-xs md:text-[13px]">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Aksi Baris */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(item.id);
                        }}
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
                        title="Edit Peristiwa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id, item.title);
                        }}
                        title="Hapus Peristiwa"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
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
      <HistoryEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        event={editingEvent}
        onSave={handleSaveEvent}
      />
    </div>
  );
}
