import { format } from "date-fns";
import { id } from "date-fns/locale";
import { UserPayload } from "@/lib/utils";

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

export function resolveNewsScope(user: UserPayload | null | undefined) {
  const permissions = Array.isArray(user?.permissions)
    ? (user.permissions as string[])
    : [];
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isManageAll =
    permissions.includes("MANAGE_ALL_CABANG") ||
    roles.some((role) => ["SUPER_ADMIN", "ADMIN_DPP"].includes(role.toUpperCase()));
  const cabangName = typeof user?.cabang === "string" ? user.cabang : "";
  const isCabang = user?.isCabang === true;
  const tingkat: TingkatOrganisasi =
    isManageAll || !isCabang ? "DPP" : tingkatFromCabangName(cabangName, true);

  return {
    isManageAll,
    tingkat,
    cabangId: typeof user?.cabangId === "string" ? user.cabangId : null,
    cabangName,
    permissions,
    canArchive:
      isManageAll || permissions.includes("NEWS_UTAMA_ARCHIVE"),
    canWrite:
      isManageAll ||
      permissions.includes("NEWS_UTAMA_CREATE") ||
      permissions.includes("NEWS_UTAMA_UPDATE"),
  };
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

export function normalizeNews(raw: any): NewsItem {
  const tags = Array.isArray(raw?.tags)
    ? raw.tags
        .map((item: any) => item?.tag ?? item)
        .filter((item: any) => item && (item.uuid || item.nama_tag))
    : [];
  const kategori = Array.isArray(raw?.kategori)
    ? raw.kategori
        .map((item: any) => item?.kategori ?? item)
        .filter((item: any) => item && (item.uuid || item.nama_kategori))
    : [];

  return {
    ...raw,
    tags,
    kategori,
    jumlah_dibaca: Number(raw?.jumlah_dibaca || 0),
  };
}

export function unwrapNewsList(payload: any): {
  items: NewsItem[];
  pagination: NewsPagination;
} {
  const items = payload?.data?.result ?? payload?.result ?? [];
  const pagination = payload?.data?.pagination ??
    payload?.pagination ?? {
      currentPage: 1,
      pageSize: 10,
      total: Array.isArray(items) ? items.length : 0,
    };
  return {
    items: (Array.isArray(items) ? items : []).map(normalizeNews),
    pagination,
  };
}

export function unwrapNewsDetail(payload: any): NewsItem {
  const raw = payload?.data?.result ?? payload?.result ?? payload?.data ?? payload;
  return normalizeNews(raw);
}
