import { getSafeImageSrc } from "@/features/galeri/types";

export type KategoriPengurus = "INTI" | "BIDANG" | "PENASEHAT";

export type StatusPublikasi = "PUBLISHED" | "DRAFT";

export interface PengurusItem {
  id: string;
  nama: string;
  jabatan: string;
  kategori: KategoriPengurus;
  bidang?: string;
  deskripsi: string;
  foto: string;
  urutan: number;
  periode: string;
  status: StatusPublikasi;
  email?: string;
  linkedin?: string;
  createdAt: string;
  updatedAt: string;
  // Metadata relasional backend (opsional untuk kompatibilitas fallback dummy)
  periodeUuid?: string;
  anggotaUuid?: string;
  jabatanUuid?: string;
  bidangUuid?: string | null;
  atasanUuid?: string | null;
  levelOverride?: number | null;
  cabangUuid?: string | null;
  cabangNama?: string | null;
}

export interface PengurusFormValues {
  nama: string;
  jabatan: string;
  kategori: KategoriPengurus;
  bidang?: string;
  deskripsi: string;
  foto: string;
  urutan: number;
  periode: string;
  status: StatusPublikasi;
  email?: string;
  linkedin?: string;
}

export interface PengurusStats {
  total: number;
  inti: number;
  bidang: number;
  penasehat: number;
  published: number;
  draft: number;
}

// =============================================================
// TIPE API BACKEND (PeriodeKepengurusan, StrukturOrganisasi, Jabatan, Bidang)
// =============================================================

export interface PeriodeKepengurusanItem {
  uuid: string;
  namaPeriode: string;
  tahunMulai: number;
  tahunSelesai: number;
  isAktif: boolean;
  cabangUuid?: string | null;
  cabang?: { namaCabang: string } | null;
  insert_at?: string;
  update_at?: string;
}

export interface PeriodeFormValues {
  namaPeriode: string;
  tahunMulai: number;
  tahunSelesai: number;
  isAktif?: boolean;
  cabangUuid?: string | null;
}

export interface JabatanItem {
  uuid: string;
  namaJabatan: string;
  levelJabatan: number;
}

export interface BidangItem {
  uuid: string;
  namaBidang: string;
}

export interface StrukturOrganisasiItem {
  uuid: string;
  periodeUuid: string;
  atasanUuid?: string | null;
  anggotaUuid: string;
  jabatanUuid: string;
  bidangUuid?: string | null;
  urutan?: number | null;
  levelOverride?: number | null;
  insert_at?: string;
  update_at?: string;
  anggota?: {
    uuid: string;
    namaLengkap: string;
    profileImg?: string | null;
    bio?: string | null;
    pesanKesan?: string | null;
    akun?: { email?: string | null } | null;
  } | null;
  periode?: {
    uuid: string;
    namaPeriode: string;
    tahunMulai: number;
    tahunSelesai: number;
    isAktif: boolean;
    cabangUuid?: string | null;
    cabang?: { namaCabang: string } | null;
  } | null;
  jabatan?: JabatanItem | null;
  bidang?: BidangItem | null;
}

export interface StrukturFormValues {
  periodeUuid: string;
  anggotaUuid: string;
  jabatanUuid: string;
  bidangUuid?: string | null;
  atasanUuid?: string | null;
  urutan?: number;
  levelOverride?: number | null;
}

/**
 * Mengelompokkan item StrukturOrganisasi backend ke kategori tampilan UI (INTI / BIDANG / PENASEHAT).
 */
export function resolveKategoriStruktur(
  item: StrukturOrganisasiItem,
): KategoriPengurus {
  const jab = (item.jabatan?.namaJabatan || "").toLowerCase();
  if (
    jab.includes("penasehat") ||
    jab.includes("penasihat") ||
    jab.includes("pakar") ||
    jab.includes("pembina")
  ) {
    return "PENASEHAT";
  }
  const effectiveLevel = item.levelOverride ?? item.jabatan?.levelJabatan ?? 1;
  if (item.bidangUuid || item.bidang?.namaBidang || effectiveLevel >= 3) {
    return "BIDANG";
  }
  return "INTI";
}

/**
 * Adapter dari StrukturOrganisasiItem (API Backend) ke PengurusItem (UI & Landing Page).
 */
export function toPengurusItem(item: StrukturOrganisasiItem): PengurusItem {
  const periodeLabel = item.periode
    ? `${item.periode.tahunMulai}-${item.periode.tahunSelesai}`
    : "-";

  return {
    id: item.uuid,
    nama: item.anggota?.namaLengkap || "Anggota PIKI",
    jabatan: item.jabatan?.namaJabatan || "Pengurus",
    kategori: resolveKategoriStruktur(item),
    bidang: item.bidang?.namaBidang || undefined,
    deskripsi:
      item.anggota?.bio ||
      item.anggota?.pesanKesan ||
      `Pengurus resmi Persatuan Inteligensia Kristen Indonesia (PIKI) masa bakti ${periodeLabel}.`,
    foto: getSafeImageSrc(item.anggota?.profileImg, "/footage/image1.webp"),
    urutan: item.urutan ?? item.jabatan?.levelJabatan ?? 1,
    periode: periodeLabel,
    status: item.periode?.isAktif ? "PUBLISHED" : "DRAFT",
    email: item.anggota?.akun?.email || undefined,
    createdAt: item.insert_at || new Date().toISOString(),
    updatedAt: item.update_at || new Date().toISOString(),
    periodeUuid: item.periodeUuid,
    anggotaUuid: item.anggotaUuid,
    jabatanUuid: item.jabatanUuid,
    bidangUuid: item.bidangUuid ?? null,
    atasanUuid: item.atasanUuid ?? null,
    levelOverride: item.levelOverride ?? null,
    cabangUuid: item.periode?.cabangUuid ?? null,
    cabangNama: item.periode?.cabang?.namaCabang ?? null,
  };
}
