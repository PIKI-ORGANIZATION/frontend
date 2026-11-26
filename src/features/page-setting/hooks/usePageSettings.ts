"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  initialAboutVisionContent,
  initialHeroContent,
} from "@/app/dashboard/konten/landing/data/dummyLandingData";
import {
  AboutVisionContent,
  HeroContent,
} from "@/app/dashboard/konten/landing/types";
import {
  LANDING_SETTING_KEYS,
  LANDING_SETTING_META,
  PageSettingApiItem,
  PageSettingBulkResponse,
  PageSettingListResponse,
  parsePageSettingJson,
} from "../types";

const PUBLIC_KEYS_QUERY = `${LANDING_SETTING_KEYS.HERO},${LANDING_SETTING_KEYS.ABOUT_VISION}`;

function extractByKey(items: PageSettingApiItem[]) {
  const map: Record<string, PageSettingApiItem> = {};
  for (const item of items) {
    if (item?.key) map[item.key] = item;
  }
  return map;
}

/**
 * Mengambil pengaturan Hero & Visi-Misi untuk halaman publik (tanpa token).
 * Otomatis fallback ke konten default bila key belum tersimpan di server.
 */
export function usePublicLandingSettings() {
  const query = useQuery({
    queryKey: ["page-setting", "public", PUBLIC_KEYS_QUERY],
    queryFn: async () => {
      const res = await apiFetch<PageSettingBulkResponse>(
        `/page-setting/bulk?keys=${encodeURIComponent(PUBLIC_KEYS_QUERY)}`,
        { skipAuth: true },
      );
      return Array.isArray(res?.data?.data) ? res.data.data : [];
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const byKey = useMemo(
    () => extractByKey(query.data ?? []),
    [query.data],
  );

  const hero = useMemo(
    () =>
      parsePageSettingJson<HeroContent>(
        byKey[LANDING_SETTING_KEYS.HERO]?.value,
        initialHeroContent,
      ),
    [byKey],
  );

  const aboutVision = useMemo(
    () =>
      parsePageSettingJson<AboutVisionContent>(
        byKey[LANDING_SETTING_KEYS.ABOUT_VISION]?.value,
        initialAboutVisionContent,
      ),
    [byKey],
  );

  return {
    hero,
    aboutVision,
    isLoading: query.isLoading,
  };
}

/**
 * Mengelola pengaturan Hero & Visi-Misi untuk CMS Landing Page (`/api/v1/page-setting`).
 */
export function useAdminLandingSettings(enabled: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["page-setting", "admin", "landing"],
    enabled,
    queryFn: async () => {
      const res = await apiFetch<PageSettingListResponse>(
        "/page-setting?pageSize=50",
      );
      return Array.isArray(res?.data?.result) ? res.data.result : [];
    },
    staleTime: 30 * 1000,
  });

  const byKey = useMemo(
    () => extractByKey(query.data ?? []),
    [query.data],
  );

  const hero = useMemo(
    () =>
      parsePageSettingJson<HeroContent>(
        byKey[LANDING_SETTING_KEYS.HERO]?.value,
        initialHeroContent,
      ),
    [byKey],
  );

  const aboutVision = useMemo(
    () =>
      parsePageSettingJson<AboutVisionContent>(
        byKey[LANDING_SETTING_KEYS.ABOUT_VISION]?.value,
        initialAboutVisionContent,
      ),
    [byKey],
  );

  const upsertSetting = useMutation({
    mutationFn: async ({
      key,
      valueObj,
    }: {
      key: (typeof LANDING_SETTING_KEYS)[keyof typeof LANDING_SETTING_KEYS];
      valueObj: HeroContent | AboutVisionContent;
    }) => {
      const existing = byKey[key];
      const meta = LANDING_SETTING_META[key];
      const serialized = JSON.stringify(valueObj);

      if (existing?.uuid) {
        return apiFetch(`/page-setting/${existing.uuid}/update`, {
          method: "POST",
          body: JSON.stringify({
            nama: existing.nama || meta.nama,
            type: existing.type || meta.type,
            value: serialized,
          }),
        });
      }

      return apiFetch("/page-setting", {
        method: "POST",
        body: JSON.stringify({
          key,
          nama: meta.nama,
          type: meta.type,
          value: serialized,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-setting"] });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan pengaturan landing page.";
      toast.error(message);
    },
  });

  return {
    hero,
    aboutVision,
    isLoading: query.isLoading,
    upsertSetting,
  };
}
