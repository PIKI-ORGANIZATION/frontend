"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArtikelBerita, BeritaCategory, BeritaStatus } from "../types";
import { BERITA_CATEGORIES, BERITA_STATUSES } from "../constants";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  FileClock,
  Calendar,
} from "lucide-react";

interface GetBeritaColumnsProps {
  onPreview: (berita: ArtikelBerita) => void;
  onEdit: (berita: ArtikelBerita) => void;
  onToggleStatus: (berita: ArtikelBerita) => void;
  onDelete: (berita: ArtikelBerita) => void;
}

export function getBeritaColumns({
  onPreview,
  onEdit,
  onToggleStatus,
  onDelete,
}: GetBeritaColumnsProps): ColumnDef<ArtikelBerita>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: "judul",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Artikel Berita" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-start gap-3 min-w-[320px] max-w-[480px]">
            {/* Banner Thumbnail */}
            <div
              onClick={() => onPreview(item)}
              className="relative w-14 h-11 shrink-0 rounded-md overflow-hidden bg-muted border border-border/80 cursor-pointer group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.bannerUrl}
                alt={item.judul}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            {/* Title & Excerpt */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                onClick={() => onPreview(item)}
                className="font-medium text-sm text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1"
                title={item.judul}
              >
                {item.judul}
              </span>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.ringkasan}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {item.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] text-muted-foreground/80 font-mono bg-muted/60 px-1.5 py-0.2 rounded"
                  >
                    #{t}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-[10px] text-muted-foreground/60 font-mono">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "kategori",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kategori" />
      ),
      cell: ({ row }) => {
        const catValue = row.getValue("kategori") as BeritaCategory;
        const config =
          BERITA_CATEGORIES.find((c) => c.value === catValue) ||
          BERITA_CATEGORIES[0];
        const Icon = config.icon;

        return (
          <Badge
            variant="outline"
            className={`gap-1.5 font-normal text-[11px] py-2 px-2 rounded-md ${config.badgeClass}`}
          >
            <Icon className="h-3 w-3 shrink-0 opacity-70" />
            <span>{config.label}</span>
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const statusValue = row.getValue("status") as BeritaStatus;
        const config =
          BERITA_STATUSES.find((s) => s.value === statusValue) ||
          BERITA_STATUSES[1];

        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-0.5 rounded-md text-[11px] font-normal border ${config.badgeClass}`}
            >
              {statusValue === "PUBLISHED"
                ? "Tayang"
                : statusValue === "DRAFT"
                  ? "Draft"
                  : "Arsip"}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "penulis",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Penulis" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const initials = item.penulis.nama
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("");

        return (
          <div className="flex items-center gap-2 min-w-[150px]">
            <Avatar className="h-6 w-6 rounded-md border border-border">
              {item.penulis.avatarUrl && (
                <AvatarImage
                  src={item.penulis.avatarUrl}
                  alt={item.penulis.nama}
                />
              )}
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground line-clamp-1">
                {item.penulis.nama}
              </span>
              {item.penulis.role && (
                <span className="text-[10px] text-muted-foreground line-clamp-1">
                  {item.penulis.role}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "views",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dibaca" />
      ),
      cell: ({ row }) => {
        const views = row.getValue("views") as number;
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Eye className="h-3 w-3 opacity-70" />
            <span>{views.toLocaleString("id-ID")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tanggal" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const dateStr = item.publishedAt || item.createdAt;
        const formatted = new Date(dateStr).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 opacity-60" />
            <span>{formatted}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                />
              }
            >
              <span className="sr-only">Buka menu aksi</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">
                Aksi Artikel
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onPreview(item)}>
                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                Pratinjau Artikel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" />
                Edit Berita
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(item)}>
                {item.status === "PUBLISHED" ? (
                  <>
                    <FileClock className="mr-2 h-4 w-4 text-amber-500" />
                    Jadikan Draft
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                    Publikasikan
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Artikel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
