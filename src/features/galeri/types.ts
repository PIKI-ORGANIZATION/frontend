export type MediaType = "ALL" | "PHOTO" | "VIDEO" | "INSTAGRAM";

export type SingleMediaType = "PHOTO" | "VIDEO" | "INSTAGRAM";

export type StatusPublikasi = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export type SumberVideo = "YOUTUBE" | "UPLOAD";

export type PenempatanMedia = "BERANDA" | "GALERI";

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
  embedUrl?: string | null;
  kategoriKegiatan: string;
  tanggal: string; // Format ISO YYYY-MM-DD
  lokasi?: string | null;
  duration?: string | null;
  instagramUrl?: string | null;
  youtubeVideoId?: string | null;
  sumberVideo?: SumberVideo | null;
  penempatan?: PenempatanMedia[];
  featured?: boolean;
  urutan?: number | null;
  status: StatusPublikasi;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GaleriFormValues {
  title: string;
  deskripsi: string;
  type: SingleMediaType;
  url: string;
  thumbnailUrl?: string;
  embedUrl?: string | null;
  kategoriKegiatan: string;
  tanggal: string; // Format YYYY-MM-DD
  lokasi?: string | null;
  duration?: string | null;
  instagramUrl?: string | null;
  youtubeVideoId?: string | null;
  sumberVideo?: SumberVideo | null;
  penempatan?: PenempatanMedia[];
  featured?: boolean;
  urutan?: number | null;
  status: StatusPublikasi;
}

export interface GaleriStats {
  total: number;
  photoCount: number;
  videoCount: number;
  instagramCount: number;
  publishedCount: number;
  draftCount: number;
  archivedCount?: number;
  spotlightCount: number;
}

export interface GaleriApiResponse {
  success: boolean;
  message?: string;
  data: {
    result: GaleriItem[];
    pagination: {
      currentPage: number;
      pageSize: number;
      total: number;
      totalPages?: number;
    };
  };
}

export interface GaleriStatsApiResponse {
  success: boolean;
  message?: string;
  data: GaleriStats;
}

export interface GaleriPreviewApiResponse {
  success: boolean;
  message?: string;
  data: {
    type: SingleMediaType;
    url: string;
    title?: string | null;
    thumbnailUrl?: string | null;
    embedUrl?: string | null;
    youtubeVideoId?: string | null;
    duration?: string | null;
  };
}

export interface UploadFileResponse {
  success?: boolean;
  url: string;
  filename?: string;
  originalName?: string;
  size?: number;
  mimetype?: string;
}

/**
 * Format tanggal YYYY-MM-DD ke format ramah pengguna Indonesia
 */
export function formatTanggalIndo(
  dateStr?: string | null,
  options?: { month?: "short" | "long" },
): string {
  if (!dateStr) return "-";
  if (/[a-zA-Z]/.test(dateStr) && !dateStr.includes("T")) return dateStr;

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;

  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: options?.month || "short",
    year: "numeric",
  });
}

/**
 * Memastikan URL gambar aman untuk Next.js <Image /> agar tidak memicu error:
 * "Failed to construct 'URL': Invalid URL"
 */
export function getSafeImageSrc(
  src?: string | null,
  fallback = "/footage/image1.webp",
): string {
  if (!src || typeof src !== "string") return fallback;
  const trimmed = src.trim();
  if (!trimmed) return fallback;

  // Local assets (e.g. /footage/image1.webp)
  if (trimmed.startsWith("/")) return trimmed;

  // Data or Blob URLs
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;

  // Protocol-relative (//example.com/img.jpg)
  if (trimmed.startsWith("//")) {
    try {
      const parsed = new URL(`https:${trimmed}`);
      return parsed.href;
    } catch {
      return fallback;
    }
  }

  // Full HTTP/HTTPS URLs
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.href;
    } catch {
      return fallback;
    }
  }

  // Bare domains (e.g. images.unsplash.com/... or www.instagram.com/...)
  if (/^[\w-]+(\.[\w-]+)+[/#?]?.*$/i.test(trimmed)) {
    try {
      const parsed = new URL(`https://${trimmed}`);
      return parsed.href;
    } catch {
      return fallback;
    }
  }

  // Otherwise, random text (e.g. "aksdjbaksdjbasd") is not a valid URL
  return fallback;
}
