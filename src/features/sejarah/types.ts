import { getSafeImageSrc } from "@/features/galeri/types";

export type SejarahStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type HistoryStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

/**
 * Model data Sejarah sesuai schema Prisma di backend
 */
export interface SejarahItem {
  uuid: string;
  timeline: string;
  judul: string;
  deskripsiTimeline: string;
  gambar?: string | null;
  urutan?: number | null;
  statusSejarah: SejarahStatus;
  cabangUuid?: string | null;
  insert_at?: string;
  insert_by?: string | null;
  update_at?: string;
  update_by?: string | null;
}

/**
 * Payload untuk membuat atau mengupdate data sejarah ke API
 */
export interface SejarahFormValues {
  timeline: string;
  judul: string;
  deskripsiTimeline: string;
  gambar?: string | null;
  urutan?: number | null;
  statusSejarah?: SejarahStatus;
  cabangUuid?: string | null;
}

/**
 * Struktur response pagination dari GET /api/v1/sejarah
 */
export interface SejarahPagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface SejarahData {
  result: SejarahItem[];
  pagination: SejarahPagination;
}

export interface SejarahApiResponse {
  success?: boolean;
  message?: string;
  data?: SejarahData | SejarahItem[];
  result?: SejarahItem[];
  pagination?: SejarahPagination;
}

/**
 * Interface presentasi UI untuk komponen CMS & Landing Page
 */
export interface HistoryEvent {
  id: string;
  year: string;
  title: string;
  desc: string;
  fullNarrative?: string;
  image: string;
  location?: string;
  keyFigure?: string;
  order: number;
  status: HistoryStatus;
  cabangUuid?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Adapter dari SejarahItem (Backend) ke HistoryEvent (Frontend UI)
 */
export function toHistoryEvent(item: SejarahItem): HistoryEvent {
  const status: HistoryStatus =
    item.statusSejarah === "PUBLISHED" || item.statusSejarah === "ARCHIVED"
      ? item.statusSejarah
      : "DRAFT";

  return {
    id: item.uuid,
    year: item.timeline,
    title: item.judul,
    desc: item.deskripsiTimeline,
    image: getSafeImageSrc(item.gambar, "/footage/image1.webp"),
    order: item.urutan ?? 0,
    status,
    cabangUuid: item.cabangUuid ?? null,
    createdAt: item.insert_at,
    updatedAt: item.update_at,
  };
}

/**
 * Adapter dari HistoryEvent (Frontend UI) ke SejarahFormValues (Backend Payload)
 */
export function toSejarahPayload(
  data: Partial<HistoryEvent> & {
    year?: string;
    title?: string;
    desc?: string;
    image?: string;
    order?: number;
    status?: HistoryStatus;
    cabangUuid?: string | null;
  },
): SejarahFormValues {
  return {
    timeline: (data.year || "").trim(),
    judul: (data.title || "").trim(),
    deskripsiTimeline: (data.desc || "").trim(),
    gambar: data.image?.trim() || "/footage/image1.webp",
    urutan: typeof data.order === "number" ? data.order : 1,
    ...(data.status && { statusSejarah: data.status }),
    ...(data.cabangUuid !== undefined && { cabangUuid: data.cabangUuid }),
  };
}

/**
 * Data perintis awal sebagai fallback aman jika database belum memiliki data
 */
export const DEFAULT_FALLBACK_HISTORY: HistoryEvent[] = [
  {
    id: "default-1",
    year: "1963",
    title: "Lahirnya PIKI",
    desc: "Berdiri di Jakarta atas kesadaran pentingnya partisipasi cendekiawan Kristen dalam pembangunan bangsa dan negara.",
    image: "/footage/image1.webp",
    order: 1,
    status: "PUBLISHED",
  },
  {
    id: "default-2",
    year: "1970",
    title: "Konsolidasi Organisasi",
    desc: "Membentuk cabang-cabang (DPC) dan daerah (DPD) di berbagai provinsi untuk memperluas jangkauan pelayanan ke seluruh pelosok negeri.",
    image: "/footage/image2.jpeg",
    order: 2,
    status: "PUBLISHED",
  },
  {
    id: "default-3",
    year: "1998",
    title: "Era Reformasi",
    desc: "PIKI turut aktif menyuarakan pembaruan dan demokratisasi melalui berbagai kajian lintas disiplin dan pernyataan sikap organisasi.",
    image: "/footage/image3.jpg",
    order: 3,
    status: "PUBLISHED",
  },
  {
    id: "default-4",
    year: "2010",
    title: "Program Revitalisasi",
    desc: "Fokus pada pemberdayaan generasi muda dan profesional Kristen untuk menjawab tantangan era globalisasi dan digital.",
    image: "/footage/image1.webp",
    order: 4,
    status: "PUBLISHED",
  },
  {
    id: "default-5",
    year: "2024",
    title: "Transformasi Digital",
    desc: "Peluncuran Sistem CMS Nasional & Satu Data PIKI untuk manajemen keanggotaan terpusat dan penerbitan KTA Digital otomatis.",
    image: "/footage/image2.jpeg",
    order: 5,
    status: "PUBLISHED",
  },
];

