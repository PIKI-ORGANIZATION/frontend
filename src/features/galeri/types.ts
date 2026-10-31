export type MediaType = "ALL" | "PHOTO" | "VIDEO" | "INSTAGRAM";

export type SingleMediaType = "PHOTO" | "VIDEO" | "INSTAGRAM";

export type StatusPublikasi = "PUBLISHED" | "DRAFT";

export const KATEGORI_GALERI_OPTIONS = [
  "Kongres & Pelantikan",
  "Kajian & Diskusi Pakar",
  "Bakti Sosial",
  "Kerjasama Lembaga",
] as const;

export type KategoriGaleri = (typeof KATEGORI_GALERI_OPTIONS)[number];

export interface GaleriItem {
  id: string;
  title: string;
  deskripsi: string;
  type: SingleMediaType;
  url: string;
  thumbnailUrl: string;
  kategoriKegiatan: string;
  tanggal: string;
  lokasi?: string;
  duration?: string;
  instagramUrl?: string;
  youtubeVideoId?: string;
  featured?: boolean;
  status: StatusPublikasi;
  createdAt?: string;
  updatedAt?: string;
}

export interface GaleriFormValues {
  title: string;
  deskripsi: string;
  type: SingleMediaType;
  url: string;
  thumbnailUrl: string;
  kategoriKegiatan: string;
  tanggal: string;
  lokasi?: string;
  duration?: string;
  instagramUrl?: string;
  youtubeVideoId?: string;
  featured?: boolean;
  status: StatusPublikasi;
}

export interface GaleriStats {
  total: number;
  photoCount: number;
  videoCount: number;
  instagramCount: number;
  publishedCount: number;
  draftCount: number;
  spotlightCount: number;
}
