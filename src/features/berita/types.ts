export type BeritaCategory =
  | "ORGANISASI"
  | "OPINI"
  | "KEBIJAKAN_PUBLIK"
  | "SEMINAR_KAJIAN"
  | "WILAYAH";

export type BeritaStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export interface PenulisInfo {
  nama: string;
  role?: string;
  avatarUrl?: string;
}

export interface ArtikelBerita {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  konten: string;
  kategori: BeritaCategory;
  penulis: PenulisInfo;
  status: BeritaStatus;
  bannerUrl: string;
  tags: string[];
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BeritaFormValues {
  judul: string;
  slug: string;
  kategori: BeritaCategory;
  penulisNama: string;
  status: BeritaStatus;
  ringkasan: string;
  bannerUrl: string;
  konten: string;
  tags: string;
}
