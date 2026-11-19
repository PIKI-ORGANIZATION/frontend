import { format } from "date-fns";
import { id } from "date-fns/locale";
import { UserPayload } from "@/lib/utils";
import { isSuperAdmin } from "@/lib/rbac";

export type TingkatOrganisasi = "DPP" | "DPD" | "DPC";
export type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface NewsTaxonomy {
  uuid: string;
  nama_tag?: string;
  nama_kategori?: string;
  slug?: string;
}

export interface NewsCabang {
  uuid?: string;
  namaCabang: string;
  isCabang?: boolean;
  wilayah?: string | null;
  provinsi?: string | null;
  kabupatenKota?: string | null;
}

export interface NewsItem {
  uuid: string;
  judul: string;
  slug: string;
  ringkasan?: string | null;
  konten?: string;
  url_thumbnail_img?: string | null;
  statusNewsUtama: NewsStatus | string;
  jumlah_dibaca: number;
  jumlah_disukai?: number;
  durasi_baca?: number | null;
  published_at?: string | null;
  insert_at?: string;
  cabangUuid?: string | null;
  cabang?: NewsCabang | null;
  author?: { uuid?: string; username?: string; email?: string } | null;
  tags: NewsTaxonomy[];
  kategori: NewsTaxonomy[];
}

export interface NewsPagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

export function tingkatFromCabangName(
  nama?: string | null,
  isCabang?: boolean | null,
): TingkatOrganisasi {
  const name = (nama || "").toUpperCase();
  if (isCabang === false || name.includes("DPP") || name.includes("PUSAT")) {
    return "DPP";
  }
  if (name.includes("DPD") || name.includes("PROVINSI")) return "DPD";
  return "DPC";
}

export function tingkatOf(news: { cabang?: NewsCabang | null }): TingkatOrganisasi {
  if (!news.cabang?.namaCabang) return "DPP";
  return tingkatFromCabangName(news.cabang.namaCabang, news.cabang.isCabang);
}

export function tingkatLabel(tingkat: TingkatOrganisasi) {
  if (tingkat === "DPP") return "DPP Pusat";
  if (tingkat === "DPD") return "DPD Provinsi";
  return "DPC Kab/Kota";
}

export interface NewsScope {
  isManageAll: boolean;
  tingkat: TingkatOrganisasi;
  cabangId: string | null;
  cabangName: string;
  hasCabangBinding: boolean;
  permissions: string[];
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canArchive: boolean;
  canWrite: boolean;
  canCreateKategori: boolean;
  canCreateTag: boolean;
}

export function resolveNewsScope(user: UserPayload | null | undefined): NewsScope {
  const permissions = Array.isArray(user?.permissions)
    ? (user.permissions as string[])
    : [];
  const isManageAll = isSuperAdmin(user);
  const cabangName = typeof user?.cabang === "string" ? user.cabang : "";
  const cabangId =
    typeof user?.cabangId === "string" && user.cabangId.trim().length > 0
      ? user.cabangId.trim()
      : null;

  let tingkat: TingkatOrganisasi;
  if (isManageAll) {
    tingkat = "DPP";
  } else if (user?.tingkat === "DPD") {
    tingkat = "DPD";
  } else if (user?.tingkat === "DPC") {
    tingkat = "DPC";
  } else {
    const inferred = tingkatFromCabangName(cabangName, true);
    tingkat = inferred === "DPP" ? "DPC" : inferred;
  }

  const canCreate = isManageAll || permissions.includes("NEWS_UTAMA_CREATE");
  const canUpdate = isManageAll || permissions.includes("NEWS_UTAMA_UPDATE");
  const canArchive = isManageAll || permissions.includes("NEWS_UTAMA_ARCHIVE");
  const canCreateKategori =
    isManageAll || permissions.includes("NEWS_KATEGORI_CREATE");
  const canCreateTag = isManageAll || permissions.includes("NEWS_TAG_CREATE");
  const canRead =
    isManageAll ||
    permissions.includes("NEWS_UTAMA_READ") ||
    canCreate ||
    canUpdate;

  return {
    isManageAll,
    tingkat,
    cabangId,
    cabangName,
    hasCabangBinding: isManageAll || Boolean(cabangId),
    permissions,
    canRead,
    canCreate,
    canUpdate,
    canArchive,
    canWrite: canCreate || canUpdate,
    canCreateKategori,
    canCreateTag,
  };
}

/**
 * Resource/Cabang-level authorization check (Deny-by-Default) untuk satu item berita.
 * Selaras dengan backend newsUtama.controller.ts:
 * - Admin DPP (MANAGE_ALL_CABANG) dapat mengelola berita cabang mana pun.
 * - Admin DPD/DPC hanya dapat mengelola berita yang `cabangUuid === scope.cabangId`.
 * - Jika `scope` kosong atau non-DPP tidak terikat ke cabang (`!cabangId`) -> DITOLAK.
 */
export function canManageNewsItem(
  scope: NewsScope | null | undefined,
  item: Pick<NewsItem, "cabangUuid"> | null | undefined,
): boolean {
  if (!scope || !item) return false;
  if (scope.isManageAll) return true;
  if (!scope.cabangId) return false;
  return item.cabangUuid === scope.cabangId;
}

export function toNewsDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatNewsDate(value?: string | null) {
  if (!value) return "Belum terbit";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum terbit";
  return format(date, "d MMMM yyyy", { locale: id });
}

export function formatViewers(value?: number | null) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

export function slugifyJudul(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

export function plainNewsText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeNewsHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

export function normalizeNews(raw: unknown): NewsItem {
  const rec = asRecord(raw);
  const rawTags = Array.isArray(rec.tags) ? rec.tags : [];
  const rawKategori = Array.isArray(rec.kategori) ? rec.kategori : [];

  const tags = rawTags
    .map((item) => {
      const entry = asRecord(item);
      return (entry.tag ?? item) as NewsTaxonomy;
    })
    .filter((item): item is NewsTaxonomy =>
      Boolean(item && (item.uuid || item.nama_tag)),
    );

  const kategori = rawKategori
    .map((item) => {
      const entry = asRecord(item);
      return (entry.kategori ?? item) as NewsTaxonomy;
    })
    .filter((item): item is NewsTaxonomy =>
      Boolean(item && (item.uuid || item.nama_kategori)),
    );

  return {
    ...(rec as unknown as NewsItem),
    tags,
    kategori,
    jumlah_dibaca: Number(rec.jumlah_dibaca || 0),
  };
}

export function unwrapNewsList(payload: unknown): {
  items: NewsItem[];
  pagination: NewsPagination;
} {
  const rec = asRecord(payload);
  const data = asRecord(rec.data);
  const items = data.result ?? rec.result ?? [];
  const rawPagination = (data.pagination ?? rec.pagination) as
    | NewsPagination
    | undefined;
  const pagination: NewsPagination = rawPagination ?? {
    currentPage: 1,
    pageSize: 10,
    total: Array.isArray(items) ? items.length : 0,
  };
  return {
    items: (Array.isArray(items) ? items : []).map(normalizeNews),
    pagination,
  };
}

export function unwrapNewsDetail(payload: unknown): NewsItem {
  const rec = asRecord(payload);
  const data = asRecord(rec.data);
  const raw = data.result ?? rec.result ?? rec.data ?? payload;
  return normalizeNews(raw);
}
