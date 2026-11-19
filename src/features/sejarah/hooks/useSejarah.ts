"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  SejarahItem,
  SejarahFormValues,
  SejarahApiResponse,
  HistoryEvent,
  HistoryStatus,
  toHistoryEvent,
  toSejarahPayload,
  DEFAULT_FALLBACK_HISTORY,
} from "../types";

export interface SejarahFilterParams {
  search?: string;
  currentPage?: number;
  pageSize?: number;
  fixed?: "all";
  status?: HistoryStatus;
  fallbackIfEmpty?: boolean;
  enabled?: boolean;
  /** Mode publik: tidak mengirim token Authorization dan hanya mengambil status PUBLISHED */
  publicMode?: boolean;
}

interface UploadResponse {
  url?: string;
  data?: { url?: string };
}

/**
 * Hook utama pengelolaan data Sejarah PIKI terintegrasi dengan backend API (/api/v1/sejarah).
 * Menggunakan React Query untuk caching, sinkronisasi data instan, dan penanganan mutasi.
 */
export function useSejarah(filters?: SejarahFilterParams) {
  const queryClient = useQueryClient();

  const fixed = filters?.fixed;
  const status = filters?.status;
  const search = filters?.search;
  const currentPage = filters?.currentPage;
  const pageSize = filters?.pageSize;
  const fallbackIfEmpty = filters?.fallbackIfEmpty;
  const isEnabled = filters?.enabled ?? true;
  const publicMode = filters?.publicMode ?? false;

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (!publicMode && fixed) {
      p.append("fixed", fixed);
    }
    if (publicMode) {
      p.append("status", "PUBLISHED");
    } else if (status) {
      p.append("status", status);
    }
    if (search?.trim()) {
      p.append("search", search.trim());
    }
    if (currentPage) {
      p.append("currentPage", String(currentPage));
    }
    if (pageSize) {
      p.append("pageSize", String(pageSize));
    }
    return p.toString();
  }, [fixed, status, search, currentPage, pageSize, publicMode]);

  // 1. Fetch Daftar Sejarah
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SejarahApiResponse>({
    queryKey: ["sejarah", publicMode ? "public" : "admin", queryParams],
    enabled: isEnabled,
    queryFn: async () => {
      const endpoint = queryParams ? `/sejarah?${queryParams}` : "/sejarah";
      const res = await apiFetch<SejarahApiResponse>(endpoint, {
        skipAuth: publicMode,
      });
      return res;
    },
    staleTime: 30 * 1000,
  });

  // Ekstrak array item Sejarah dari response backend ApiResponse.success({ result, pagination })
  const items: SejarahItem[] = useMemo(() => {
    if (!apiResponse) return [];
    if (
      apiResponse.data &&
      "result" in apiResponse.data &&
      Array.isArray(apiResponse.data.result)
    ) {
      return apiResponse.data.result;
    }
    if (Array.isArray(apiResponse.result)) {
      return apiResponse.result;
    }
    if (Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }
    return [];
  }, [apiResponse]);

  // Transform SejarahItem[] dari backend ke HistoryEvent[] untuk frontend
  const events: HistoryEvent[] = useMemo(() => {
    if (items.length > 0) {
      return items.map(toHistoryEvent);
    }
    // Jika data dari backend kosong dan opsi fallbackIfEmpty aktif
    if (fallbackIfEmpty) {
      return DEFAULT_FALLBACK_HISTORY;
    }
    return [];
  }, [items, fallbackIfEmpty]);

  const pagination = useMemo(() => {
    if (apiResponse?.data && "pagination" in apiResponse.data) {
      return apiResponse.data.pagination;
    }
    if (apiResponse?.pagination) {
      return apiResponse.pagination;
    }
    return {
      currentPage: 1,
      pageSize: 10,
      total: events.length,
    };
  }, [apiResponse, events.length]);

  const invalidateSejarah = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["sejarah"] });
  }, [queryClient]);

  // 2. Mutasi Tambah Sejarah
  const addMutation = useMutation({
    mutationFn: async (payload: SejarahFormValues) => {
      const res = await apiFetch<{ message: string }>("/sejarah", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res;
    },
    onSuccess: () => {
      invalidateSejarah();
      toast.success("Tonggak sejarah berhasil ditambahkan.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan tonggak sejarah");
    },
  });

  // 3. Mutasi Update Sejarah
  const updateMutation = useMutation({
    mutationFn: async ({
      uuid,
      payload,
    }: {
      uuid: string;
      payload: Partial<SejarahFormValues>;
    }) => {
      const res = await apiFetch<{ message: string; data: SejarahItem }>(
        `/sejarah/${uuid}/update`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      invalidateSejarah();
      toast.success("Tonggak sejarah berhasil diperbarui.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui tonggak sejarah");
    },
  });

  // 4. Mutasi Toggle Status (PUBLISHED <-> DRAFT; ARCHIVED -> PUBLISHED)
  const toggleStatusMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const res = await apiFetch<{ message: string; data: SejarahItem }>(
        `/sejarah/${uuid}/toggle-status`,
        {
          method: "POST",
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      invalidateSejarah();
      const label =
        data?.statusSejarah === "PUBLISHED" ? "Tayang (Published)" : "Draf (Draft)";
      toast.success(`Status diubah menjadi ${label}.`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mengubah status tonggak sejarah");
    },
  });

  // 5. Mutasi Arsipkan Sejarah (ARCHIVED)
  const archiveMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const res = await apiFetch<{ message: string; data: SejarahItem }>(
        `/sejarah/${uuid}/archive`,
        {
          method: "POST",
        },
      );
      return res.data;
    },
    onSuccess: () => {
      invalidateSejarah();
      toast.success("Tonggak sejarah berhasil diarsipkan.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mengarsipkan tonggak sejarah");
    },
  });

  // 6. Mutasi Delete Sejarah (Soft Delete -> deleted_at)
  const deleteMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const res = await apiFetch<{ message: string }>(
        `/sejarah/${uuid}/delete`,
        {
          method: "POST",
        },
      );
      return res;
    },
    onSuccess: () => {
      invalidateSejarah();
      toast.success("Tonggak sejarah berhasil dihapus.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus tonggak sejarah");
    },
  });

  // 5. Upload Foto Dokumentasi (Maks 5MB)
  const uploadFoto = useCallback(async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Ukuran berkas melebihi batas 5MB");
    }
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiFetch<UploadResponse>("/upload", {
      method: "POST",
      body: formData,
    });

    const url = res.url || res.data?.url;
    if (!url) {
      throw new Error("Gagal memperoleh URL foto dari server");
    }
    return url;
  }, []);

  // Helper actions dengan adapter
  const addEvent = useCallback(
    (event: Partial<HistoryEvent>) => {
      const payload = toSejarahPayload(event);
      return addMutation.mutateAsync(payload);
    },
    [addMutation],
  );

  const updateEvent = useCallback(
    (id: string, event: Partial<HistoryEvent>) => {
      const payload = toSejarahPayload(event);
      return updateMutation.mutateAsync({ uuid: id, payload });
    },
    [updateMutation],
  );

  const toggleStatusEvent = useCallback(
    (id: string) => {
      return toggleStatusMutation.mutateAsync(id);
    },
    [toggleStatusMutation],
  );

  const archiveEvent = useCallback(
    (id: string) => {
      return archiveMutation.mutateAsync(id);
    },
    [archiveMutation],
  );

  const deleteEvent = useCallback(
    (id: string) => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  return {
    events,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    addEvent,
    updateEvent,
    toggleStatusEvent,
    archiveEvent,
    deleteEvent,
    uploadFoto,
    isSubmitting:
      addMutation.isPending ||
      updateMutation.isPending ||
      toggleStatusMutation.isPending ||
      archiveMutation.isPending ||
      deleteMutation.isPending,
  };
}
