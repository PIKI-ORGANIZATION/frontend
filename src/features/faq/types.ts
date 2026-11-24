export type FaqKategori = "UMUM" | "KEANGGOTAAN" | "PROGRAM" | "ORGANISASI";

export type FaqStatus = "ACTIVE" | "ARCHIVED";

export const FAQ_KATEGORI_OPTIONS: { value: FaqKategori; label: string }[] = [
  { value: "UMUM", label: "Umum" },
  { value: "KEANGGOTAAN", label: "Keanggotaan" },
  { value: "PROGRAM", label: "Program" },
  { value: "ORGANISASI", label: "Organisasi" },
];

export const FAQ_KATEGORI_LABELS: Record<FaqKategori, string> = {
  UMUM: "Umum",
  KEANGGOTAAN: "Keanggotaan",
  PROGRAM: "Program",
  ORGANISASI: "Organisasi",
};

export interface FaqApiItem {
  uuid: string;
  pertanyaan: string;
  jawaban: string;
  kategori: FaqKategori;
  urutan: number;
  isPublish: boolean;
  statusFAQ: FaqStatus;
  cabangUuid?: string | null;
  insert_at?: string;
  update_at?: string;
}

export interface FaqFormValues {
  pertanyaan: string;
  jawaban: string;
  kategori?: FaqKategori;
  urutan?: number;
  isPublish?: boolean;
  statusFAQ?: FaqStatus;
  cabangUuid?: string | null;
}

export interface FaqListResponse {
  success?: boolean;
  message?: string;
  data?: {
    result?: FaqApiItem[];
    pagination?: {
      currentPage: number;
      pageSize: number;
      total: number;
    };
  };
}
