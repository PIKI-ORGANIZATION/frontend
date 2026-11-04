import type { ComponentType } from "react";

export type MediaType = "ALL" | "PHOTO" | "VIDEO" | "INSTAGRAM";

export interface MediaItem {
  id: string;
  title: string;
  deskripsi: string;
  type: "PHOTO" | "VIDEO" | "INSTAGRAM";
  url: string;
  thumbnailUrl: string;
  embedUrl?: string | null;
  kategoriKegiatan: string;
  tanggal: string;
  lokasi?: string | null;
  duration?: string | null;
  instagramUrl?: string | null;
  youtubeVideoId?: string | null;
  featured?: boolean;
}

export interface MediaFilterOption {
  value: MediaType;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface CategoryOption {
  value: string;
  label: string;
}

