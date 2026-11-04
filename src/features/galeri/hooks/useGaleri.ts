"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  GaleriItem,
  GaleriFormValues,
  GaleriStats,
  GaleriApiResponse,
  GaleriStatsApiResponse,
  GaleriPreviewApiResponse,
  UploadFileResponse,
  MediaType,
  StatusPublikasi,
  getSafeImageSrc,
} from "../types";
import { initialGaleriData } from "../data/initialGaleriData";

export interface GaleriFilterParams {
  type?: MediaType;
  kategori?: string;
  status?: StatusPublikasi | "ALL";
  search?: string;
  penempatan?: "BERANDA" | "GALERI";
  currentPage?: number;
  pageSize?: number;
  fixed?: "all";
  fetchStats?: boolean;
}

/**
 * Hook utama pengelolaan data galeri terintegrasi dengan backend API (/api/v1/galeri).
 * Menggunakan React Query untuk caching, sinkronisasi data instan, dan penanganan mutasi.
 */
export function useGaleri(filters?: GaleriFilterParams) {
  const queryClient = useQueryClient();

  // 1. Fetch Daftar Galeri
  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    // Default CMS mengambil semua status jika fixed=all
    p.append("fixed", filters?.fixed || "all");

    if (filters?.type && filters.type !== "ALL") {
      p.append("type", filters.type);
    }
    if (filters?.kategori && filters.kategori !== "ALL") {
      p.append("kategori", filters.kategori);
    }
    if (filters?.status && filters.status !== "ALL") {
      p.append("status", filters.status);
    }
    if (filters?.search?.trim()) {
      p.append("search", filters.search.trim());
    }
    if (filters?.penempatan) {
      p.append("penempatan", filters.penempatan);
    }
    if (filters?.currentPage) {
      p.append("currentPage", filters.currentPage.toString());
    }
    if (filters?.pageSize) {
      p.append("pageSize", filters.pageSize.toString());
    }
    return p.toString();
  }, [filters]);

  const {
    data: apiListData,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: ["galeri", "list", queryParams],
    queryFn: async () => {
      try {
        const res = await apiFetch<GaleriApiResponse>(`/galeri?${queryParams}`);
        // Backend format: { success, data: { result: [...], pagination: {...} } }
        if (res?.data?.result && Array.isArray(res.data.result)) {
          return res.data;
        }
        return {
          result: initialGaleriData,
          pagination: {
            currentPage: 1,
            pageSize: initialGaleriData.length,
            total: initialGaleriData.length,
          },
        };
      } catch (err) {
        console.warn("Gagal mengambil data galeri dari API, menggunakan data cadangan:", err);
        return {
          result: initialGaleriData,
          pagination: {
            currentPage: 1,
            pageSize: initialGaleriData.length,
            total: initialGaleriData.length,
          },
        };
      }
    },
    staleTime: 30 * 1000,
  });

  // 2. Fetch Statistik Galeri (Hanya dijalankan jika fetchStats diaktifkan)
  const shouldFetchStats = filters?.fetchStats ?? true;

  const {
    data: apiStatsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["galeri", "stats"],
    queryFn: async () => {
      try {
        const res = await apiFetch<GaleriStatsApiResponse>("/galeri/stats");
        if (res?.data && typeof res.data.total === "number") {
          return res.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: shouldFetchStats,
    staleTime: 30 * 1000,
  });

  const rawItems = apiListData?.result || initialGaleriData;
  const items: GaleriItem[] = useMemo(() => {
    return rawItems.map((item) => ({
      ...item,
      thumbnailUrl: getSafeImageSrc(
        item.thumbnailUrl,
        item.type === "PHOTO" ? getSafeImageSrc(item.url) : "/footage/image1.webp",
      ),
    }));
  }, [rawItems]);
  const pagination = apiListData?.pagination || {
    currentPage: 1,
    pageSize: items.length,
    total: items.length,
  };

  // Hitung fallback statistik jika backend stats belum termuat
  const stats: GaleriStats = useMemo(() => {
    if (apiStatsData) return apiStatsData;

    let photoCount = 0;
    let videoCount = 0;
    let instagramCount = 0;
    let publishedCount = 0;
    let draftCount = 0;
    let spotlightCount = 0;

    for (const item of items) {
      if (item.type === "PHOTO") photoCount++;
      else if (item.type === "VIDEO") videoCount++;
      else if (item.type === "INSTAGRAM") instagramCount++;

      if (item.status === "PUBLISHED") publishedCount++;
      else draftCount++;

      if (item.featured) spotlightCount++;
    }

    return {
      total: items.length,
      photoCount,
      videoCount,
      instagramCount,
      publishedCount,
      draftCount,
      spotlightCount,
    };
  }, [apiStatsData, items]);

  // Invalidate queries helper
  const invalidateGaleri = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["galeri"] });
  }, [queryClient]);

  // 3. Mutasi Tambah Media
  const addMutation = useMutation({
    mutationFn: async (values: GaleriFormValues) => {
      const res = await apiFetch<{ success: boolean; data: GaleriItem }>(
        "/galeri",
        {
          method: "POST",
          body: JSON.stringify(values),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      invalidateGaleri();
      toast.success("Dokumentasi baru berhasil ditambahkan!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan dokumentasi");
    },
  });

  // 4. Mutasi Ubah Media
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<GaleriFormValues>;
    }) => {
      const res = await apiFetch<{ success: boolean; data: GaleriItem }>(
        `/galeri/${id}/update`,
        {
          method: "POST",
          body: JSON.stringify(values),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      invalidateGaleri();
      toast.success("Dokumentasi berhasil diperbarui!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui dokumentasi");
    },
  });

  // 5. Mutasi Toggle Status (PUBLISHED ⇄ DRAFT)
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch<{ success: boolean; data: GaleriItem }>(
        `/galeri/${id}/toggle-status`,
        {
          method: "POST",
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      invalidateGaleri();
      toast.success(
        data?.status === "PUBLISHED"
          ? "Dokumentasi telah ditayangkan ke publik!"
          : "Dokumentasi dialihkan ke draf internal.",
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mengubah status publikasi");
    },
  });

  // 6. Mutasi Toggle Spotlight / Featured
  const toggleFeaturedMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch<{ success: boolean; data: GaleriItem }>(
        `/galeri/${id}/toggle-featured`,
        {
          method: "POST",
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      invalidateGaleri();
      toast.success(
        data?.featured
          ? "Spotlight diaktifkan! Dokumentasi ini tampil di area sorotan utama."
          : "Spotlight dinonaktifkan.",
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mengubah status spotlight");
    },
  });

  // 7. Mutasi Hapus Media (Soft Delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<{ success: boolean; message: string }>(
        `/galeri/${id}/delete`,
        {
          method: "POST",
        },
      );
      return id;
    },
    onSuccess: () => {
      invalidateGaleri();
      toast.success("Dokumentasi berhasil dihapus.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus dokumentasi");
    },
  });

  // 7b. Mutasi Arsip Media
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch<{ success: boolean; data: GaleriItem }>(
        `/galeri/${id}/archive`,
        {
          method: "POST",
        },
      );
      return res.data;
    },
    onSuccess: () => {
      invalidateGaleri();
      toast.success("Dokumentasi berhasil diarsipkan.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mengarsipkan dokumentasi");
    },
  });

  // 8. Upload Foto (Maksimal 5MB)
  const uploadFoto = useCallback(async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Ukuran foto maksimal 5MB");
    }
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiFetch<{ url?: string; data?: { url: string } }>(
      "/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    const uploadedUrl = res.url || res.data?.url;
    if (!uploadedUrl) {
      throw new Error("Gagal memperoleh URL foto dari server");
    }
    return uploadedUrl;
  }, []);

  // 9. Upload Video Lokal (Maksimal 50MB)
  const uploadVideo = useCallback(
    async (file: File): Promise<UploadFileResponse> => {
      if (file.size > 50 * 1024 * 1024) {
        throw new Error(
          "Ukuran video melebihi batas maksimal 50MB. Silakan kompres video atau gunakan tautan YouTube.",
        );
      }
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch<UploadFileResponse>("/upload/video", {
        method: "POST",
        body: formData,
      });

      if (!res.url) {
        throw new Error("Gagal memperoleh URL video dari server");
      }
      return res;
    },
    [],
  );

  // 10. Pratinjau Tautan Eksternal (YouTube & Instagram)
  const previewMedia = useCallback(
    async (
      url: string,
      type?: "VIDEO" | "INSTAGRAM",
    ): Promise<GaleriPreviewApiResponse["data"]> => {
      // Auto-detect type if not explicitly supplied
      const resolvedType =
        type || (/instagram\.com/i.test(url) ? "INSTAGRAM" : "VIDEO");

      const res = await apiFetch<GaleriPreviewApiResponse>("/galeri/preview", {
        method: "POST",
        body: JSON.stringify({ url: url.trim(), type: resolvedType }),
      });
      return res.data;
    },
    [],
  );

  // Wrapper functions for backwards-compatibility with existing component props
  const addMedia = useCallback(
    (values: GaleriFormValues) => {
      return addMutation.mutateAsync(values);
    },
    [addMutation],
  );

  const updateMedia = useCallback(
    (id: string, values: Partial<GaleriFormValues>) => {
      return updateMutation.mutateAsync({ id, values });
    },
    [updateMutation],
  );

  const toggleStatus = useCallback(
    (id: string) => {
      return toggleStatusMutation.mutateAsync(id);
    },
    [toggleStatusMutation],
  );

  const toggleFeatured = useCallback(
    (id: string) => {
      return toggleFeaturedMutation.mutateAsync(id);
    },
    [toggleFeaturedMutation],
  );

  const deleteMedia = useCallback(
    (id: string) => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const archiveMedia = useCallback(
    (id: string) => {
      return archiveMutation.mutateAsync(id);
    },
    [archiveMutation],
  );

  return {
    items,
    pagination,
    stats,
    isLoading: isListLoading || isStatsLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
    refetchStats,
    addMedia,
    updateMedia,
    deleteMedia,
    archiveMedia,
    toggleStatus,
    toggleFeatured,
    uploadFoto,
    uploadVideo,
    previewMedia,
    isSubmitting:
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      archiveMutation.isPending,
  };
}
