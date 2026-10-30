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

