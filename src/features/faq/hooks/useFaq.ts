"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  FaqApiItem,
  FaqFormValues,
  FaqKategori,
  FaqListResponse,
  FaqStatus,
} from "../types";

export interface FaqFilterParams {
  search?: string;
  kategori?: FaqKategori | "ALL";
  status?: FaqStatus | "ALL";
  cabangUuid?: string;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
}

function buildFaqQueryString(params?: FaqFilterParams): string {
  const p = new URLSearchParams();
  if (params?.search?.trim()) p.append("search", params.search.trim());
  if (params?.kategori && params.kategori !== "ALL") {
    p.append("kategori", params.kategori);
  }
  if (params?.status && params.status !== "ALL") {
    p.append("status", params.status);
  }
  if (params?.cabangUuid && params.cabangUuid !== "ALL") {
    p.append("cabangUuid", params.cabangUuid);
  }
  if (params?.currentPage) {
    p.append("currentPage", String(params.currentPage));
  }
  if (params?.pageSize) {
    p.append("pageSize", String(params.pageSize));
  }
  return p.toString();
}

export function useFaqList(params?: FaqFilterParams) {
  const qs = useMemo(() => buildFaqQueryString(params), [params]);
  const enabled = params?.enabled ?? true;

  return useQuery({
    queryKey: ["faq", "admin", qs],
    enabled,
    queryFn: async () => {
      const endpoint = qs ? `/faq?${qs}` : "/faq";
      const res = await apiFetch<FaqListResponse>(endpoint);
      return {
        items: Array.isArray(res?.data?.result) ? res.data.result : [],
        pagination: res?.data?.pagination ?? {
          currentPage: 1,
          pageSize: 50,
          total: 0,
        },
      };
    },
    staleTime: 30 * 1000,
  });
}

export function useFaqMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["faq"] });
  };

  const createFaq = useMutation({
    mutationFn: async (values: FaqFormValues) => {
      return apiFetch<{ message?: string; data?: FaqApiItem }>("/faq", {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("FAQ berhasil ditambahkan!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan FAQ");
    },
  });

  const updateFaq = useMutation({
    mutationFn: async ({
      uuid,
      values,
    }: {
      uuid: string;
      values: Partial<FaqFormValues>;
    }) => {
      return apiFetch<{ message?: string; data?: FaqApiItem }>(
        `/faq/${uuid}/update`,
        {
          method: "POST",
          body: JSON.stringify(values),
        },
      );
    },
    onSuccess: () => {
      invalidate();
      toast.success("FAQ berhasil diperbarui!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui FAQ");
    },
  });

  const archiveFaq = useMutation({
    mutationFn: async (uuid: string) => {
      return apiFetch<{ message?: string }>(`/faq/${uuid}/archive`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("FAQ berhasil diarsipkan.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mengarsipkan FAQ");
    },
  });

  return { createFaq, updateFaq, archiveFaq };
}

/**
 * Hook publik (stateless, tanpa token Authorization) untuk halaman Beranda & /faq.
 */
export function usePublicFaq(params?: {
  kategori?: FaqKategori | "ALL";
  search?: string;
  pageSize?: number;
}) {
  const qs = useMemo(
    () =>
      buildFaqQueryString({
        kategori: params?.kategori,
        search: params?.search,
        pageSize: params?.pageSize ?? 50,
      }),
    [params?.kategori, params?.search, params?.pageSize],
  );

  const query = useQuery({
    queryKey: ["faq", "public", qs],
    queryFn: async () => {
      const endpoint = qs ? `/faq?${qs}` : "/faq";
      const res = await apiFetch<FaqListResponse>(endpoint, { skipAuth: true });
      return Array.isArray(res?.data?.result) ? res.data.result : [];
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const items: FaqApiItem[] = useMemo(() => query.data ?? [], [query.data]);

  return {
    items,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
