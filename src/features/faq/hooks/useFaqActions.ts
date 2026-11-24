"use client";

import { useCallback } from "react";
import { FaqApiItem } from "../types";
import { useFaqMutations } from "./useFaq";

/**
 * Aksi cepat CMS FAQ (toggle tayang, pulihkan, duplikat, arsip).
 * Error sudah ditampilkan sebagai toast oleh `useFaqMutations`,
 * sehingga di sini hanya ditelan agar tidak menjadi unhandled rejection.
 */
export function useFaqActions() {
  const { createFaq, updateFaq, archiveFaq } = useFaqMutations();

  const togglePublish = useCallback(
    async (item: FaqApiItem) => {
      await updateFaq
        .mutateAsync({ uuid: item.uuid, values: { isPublish: !item.isPublish } })
        .catch(() => undefined);
    },
    [updateFaq],
  );

  const restore = useCallback(
    async (item: FaqApiItem) => {
      await updateFaq
        .mutateAsync({ uuid: item.uuid, values: { statusFAQ: "ACTIVE" } })
        .catch(() => undefined);
    },
    [updateFaq],
  );

  const archive = useCallback(
    async (item: FaqApiItem) => {
      await archiveFaq.mutateAsync(item.uuid).catch(() => undefined);
    },
    [archiveFaq],
  );

  const duplicate = useCallback(
    async (item: FaqApiItem, keepCabang: boolean) => {
      await createFaq
        .mutateAsync({
          pertanyaan: `${item.pertanyaan} (Salinan)`,
          jawaban: item.jawaban,
          kategori: item.kategori,
          urutan: item.urutan + 1,
          isPublish: false,
          statusFAQ: "ACTIVE",
          // Hanya DPP yang boleh menentukan cabang; admin wilayah dikunci backend.
          ...(keepCabang ? { cabangUuid: item.cabangUuid ?? null } : {}),
        })
        .catch(() => undefined);
    },
    [createFaq],
  );

  return {
    createFaq,
    updateFaq,
    archiveFaq,
    togglePublish,
    restore,
    archive,
    duplicate,
  };
}
