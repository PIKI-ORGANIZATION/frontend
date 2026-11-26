export type PageSettingType = "TEXT" | "NUMBER" | "ARRAY" | "IMAGE";

export interface PageSettingApiItem {
  uuid: string;
  key: string;
  nama: string;
  type: PageSettingType;
  value: string;
  insert_at?: string;
  update_at?: string;
}

export interface PageSettingBulkResponse {
  success?: boolean;
  data?: {
    data?: PageSettingApiItem[];
  };
}

export interface PageSettingListResponse {
  success?: boolean;
  data?: {
    result?: PageSettingApiItem[];
    pagination?: {
      currentPage: number;
      pageSize: number;
      total: number;
    };
  };
}

export const LANDING_SETTING_KEYS = {
  HERO: "home_hero",
  ABOUT_VISION: "home_about_vision",
} as const;

export const LANDING_SETTING_META: Record<
  (typeof LANDING_SETTING_KEYS)[keyof typeof LANDING_SETTING_KEYS],
  { nama: string; type: PageSettingType }
> = {
  home_hero: { nama: "Hero Section & CTA Beranda", type: "TEXT" },
  home_about_vision: { nama: "Tentang Organisasi & Visi-Misi", type: "TEXT" },
};

/**
 * Mengurai JSON dari kolom `value` pada PageSetting dengan fallback aman.
 */
export function parsePageSettingJson<T extends object>(
  rawValue: string | undefined | null,
  fallback: T,
): T {
  if (!rawValue || typeof rawValue !== "string") return fallback;
  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fallback;
    }
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}
