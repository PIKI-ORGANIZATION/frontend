"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  PeriodeKepengurusanItem,
  PeriodeFormValues,
  StrukturOrganisasiItem,
  StrukturFormValues,
  JabatanItem,
  BidangItem,
  PengurusItem,
  toPengurusItem,
} from "../types";

interface ApiListEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: {
    result?: T[];
    pagination?: {
      currentPage: number;
      pageSize: number;
      total: number;
    };
  };
}

function extractResult<T>(res: ApiListEnvelope<T> | undefined): T[] {
  return Array.isArray(res?.data?.result) ? res.data.result : [];
}

// =============================================================
// 1. PERIODE KEPENGURUSAN HOOKS
// =============================================================

export function usePeriodeList(params?: {
  search?: string;
  fixed?: "all";
  pageSize?: number;
  enabled?: boolean;
}) {
  const search = params?.search;
  const fixed = params?.fixed ?? "all";
  const pageSize = params?.pageSize ?? 100;
  const enabled = params?.enabled ?? true;

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (fixed) p.append("fixed", fixed);
    if (search?.trim()) p.append("search", search.trim());
    p.append("pageSize", String(pageSize));
    return p.toString();
  }, [fixed, search, pageSize]);

  return useQuery({
    queryKey: ["pengurus", "periode", qs],
    enabled,
    queryFn: async () => {
      const res = await apiFetch<ApiListEnvelope<PeriodeKepengurusanItem>>(
        `/periode-kepengurusan/admin?${qs}`,
      );
      return extractResult(res);
    },
    staleTime: 30 * 1000,
  });
}

export function usePeriodeMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["pengurus"] });
  };

  const createPeriode = useMutation({
    mutationFn: async (values: PeriodeFormValues) => {
      return apiFetch<{ message?: string; data?: PeriodeKepengurusanItem }>(
        "/periode-kepengurusan",
        {
          method: "POST",
          body: JSON.stringify(values),
        },
      );
    },
    onSuccess: () => {
      invalidate();
      toast.success("Periode kepengurusan berhasil ditambahkan!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan periode kepengurusan");
    },
  });

  const updatePeriode = useMutation({
    mutationFn: async ({
      uuid,
      values,
    }: {
      uuid: string;
      values: Partial<PeriodeFormValues>;
    }) => {
      return apiFetch<{ message?: string; data?: PeriodeKepengurusanItem }>(
        `/periode-kepengurusan/${uuid}/update`,
        {
          method: "POST",
          body: JSON.stringify(values),
        },
      );
    },
    onSuccess: () => {
      invalidate();
      toast.success("Periode kepengurusan berhasil diperbarui!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui periode kepengurusan");
    },
  });

  const deletePeriode = useMutation({
    mutationFn: async (uuid: string) => {
      return apiFetch<{ message?: string }>(
        `/periode-kepengurusan/${uuid}/delete`,
        { method: "POST" },
      );
    },
    onSuccess: () => {
      invalidate();
      toast.success("Periode kepengurusan berhasil dihapus.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus periode kepengurusan");
    },
  });

  return { createPeriode, updatePeriode, deletePeriode };
}

// =============================================================
// 2. STRUKTUR ORGANISASI HOOKS (ADMIN)
// =============================================================

export function useStrukturList(params?: {
  periodeUuid?: string;
  search?: string;
  fixed?: "all";
  pageSize?: number;
  enabled?: boolean;
}) {
  const periodeUuid = params?.periodeUuid;
  const search = params?.search;
  const fixed = params?.fixed ?? "all";
  const pageSize = params?.pageSize ?? 200;
  const enabled = params?.enabled ?? true;

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (fixed) p.append("fixed", fixed);
    if (periodeUuid && periodeUuid !== "ALL") p.append("periodeUuid", periodeUuid);
    if (search?.trim()) p.append("search", search.trim());
    p.append("pageSize", String(pageSize));
    return p.toString();
  }, [fixed, periodeUuid, search, pageSize]);

  return useQuery({
    queryKey: ["pengurus", "struktur", qs],
    enabled,
    queryFn: async () => {
      const res = await apiFetch<ApiListEnvelope<StrukturOrganisasiItem>>(
        `/struktur-organisasi/admin?${qs}`,
      );
      return extractResult(res);
    },
    staleTime: 30 * 1000,
  });
}

export function useStrukturMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["pengurus"] });
  };

  const createStruktur = useMutation({
    mutationFn: async (values: StrukturFormValues) => {
      return apiFetch<{ message?: string; data?: StrukturOrganisasiItem }>(
        "/struktur-organisasi",
        {
          method: "POST",
          body: JSON.stringify(values),
        },
      );
    },
    onSuccess: () => {
      invalidate();
      toast.success("Pengurus berhasil ditambahkan ke struktur!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan pengurus");
    },
  });

  const updateStruktur = useMutation({
    mutationFn: async ({
      uuid,
      values,
    }: {
      uuid: string;
      values: Partial<StrukturFormValues>;
    }) => {
      return apiFetch<{ message?: string; data?: StrukturOrganisasiItem }>(
        `/struktur-organisasi/${uuid}/update`,
        {
          method: "POST",
          body: JSON.stringify(values),
        },
      );
    },
    onSuccess: () => {
      invalidate();
      toast.success("Data struktur pengurus berhasil diperbarui!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui data pengurus");
    },
  });

  const deleteStruktur = useMutation({
    mutationFn: async (uuid: string) => {
      return apiFetch<{ message?: string }>(
        `/struktur-organisasi/${uuid}/delete`,
        { method: "POST" },
      );
    },
    onSuccess: () => {
      invalidate();
      toast.success("Pengurus berhasil dihapus dari struktur.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus pengurus dari struktur");
    },
  });

  return { createStruktur, updateStruktur, deleteStruktur };
}

// =============================================================
// 3. MASTER JABATAN & BIDANG HOOKS
// =============================================================

export function useJabatanList(enabled = true) {
  return useQuery({
    queryKey: ["pengurus", "jabatan"],
    enabled,
    queryFn: async () => {
      const res = await apiFetch<ApiListEnvelope<JabatanItem>>(
        "/jabatan?pageSize=100",
      );
      return extractResult(res);
    },
    staleTime: 60 * 1000,
  });
}

export function useBidangList(enabled = true) {
  return useQuery({
    queryKey: ["pengurus", "bidang"],
    enabled,
    queryFn: async () => {
      const res = await apiFetch<ApiListEnvelope<BidangItem>>(
        "/bidang?pageSize=100",
      );
      return extractResult(res);
    },
    staleTime: 60 * 1000,
  });
}

// =============================================================
// 4. PUBLIC STRUKTUR HOOK (STATELESS, TANPA TOKEN AUTHORIZATION)
// =============================================================

export function usePublicStruktur(params?: {
  periodeUuid?: string;
  pageSize?: number;
}) {
  const periodeUuid = params?.periodeUuid;
  const pageSize = params?.pageSize ?? 100;

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (periodeUuid) p.append("periodeUuid", periodeUuid);
    p.append("pageSize", String(pageSize));
    return p.toString();
  }, [periodeUuid, pageSize]);

  const query = useQuery({
    queryKey: ["pengurus", "public", qs],
    queryFn: async () => {
      const res = await apiFetch<ApiListEnvelope<StrukturOrganisasiItem>>(
        `/struktur-organisasi?${qs}`,
        { skipAuth: true },
      );
      return extractResult(res).map(toPengurusItem);
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const items: PengurusItem[] = useMemo(
    () => query.data ?? [],
    [query.data],
  );

  return {
    items,
    isLoaded: !query.isLoading,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
