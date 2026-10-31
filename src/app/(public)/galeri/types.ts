import type { ComponentType } from "react";

export type MediaType = "ALL" | "PHOTO" | "VIDEO" | "INSTAGRAM";

export interface MediaItem {
  id: string;
  title: string;
  deskripsi: string;
  type: "PHOTO" | "VIDEO" | "INSTAGRAM";
  url: string;
  thumbnailUrl: string;
  kategoriKegiatan: string;
  tanggal: string;
  lokasi?: string;
  duration?: string;
  instagramUrl?: string;
  youtubeVideoId?: string;
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

