"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  DpdItem,
  DpcItem,
  MasterProvinsi,
  MasterKabupaten,
  CabangItem,
  CabangFormValues,
  RoleItem,
  DpdFormValues,
  DpcFormValues,
  LinkCabangPayload,
  AssignAdminCabangPayload,
  PaginationMeta,
} from "../types";

interface ApiResponseWithPagination<T> {
  success?: boolean;
  message?: string;
  data?: T[] | { result?: T[] };
  result?: T[];
  meta?: PaginationMeta;
  pagination?: PaginationMeta;
}

function extractArrayData<T>(res: ApiResponseWithPagination<T> | null | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res.data)) return res.data;
  if (res.data && !Array.isArray(res.data) && Array.isArray(res.data.result)) {
    return res.data.result;
  }
  if (Array.isArray(res.result)) return res.result;
  return [];
}

// -------------------------------------------------------------
// 1. DPD HOOKS
// -------------------------------------------------------------

export function useDpdList(params?: {
  search?: string;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  const search = params?.search;
  const currentPage = params?.currentPage || 1;
  const pageSize = params?.pageSize || 10;
  const enabled = params?.enabled ?? true;

  return useQuery({
    queryKey: ["wilayah", "dpd", { search, currentPage, pageSize }],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (search?.trim()) q.append("search", search.trim());
      q.append("currentPage", String(currentPage));
      q.append("pageSize", String(pageSize));

      const res = await apiFetch<ApiResponseWithPagination<DpdItem>>(
        `/dpd?${q.toString()}`,
      );
      const list = [...extractArrayData(res)];
      // Urutkan default berdasarkan kode provinsi terkecil
      list.sort((a: DpdItem, b: DpdItem) => Number(a.kodeProvinsi) - Number(b.kodeProvinsi));
      const meta = res?.meta || res?.pagination || {
        total: list.length,
        page: currentPage,
        limit: pageSize,
      };
      return { data: list, meta };
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useCreateDpd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DpdFormValues) => {
      return apiFetch<{ success: boolean; message: string; data: DpdItem }>(
        "/dpd",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wilayah", "dpd"] });
      toast.success(res.message || "DPD berhasil ditambahkan");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan DPD");
    },
  });
}

export function useUpdateDpd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<DpdFormValues>;
    }) => {
      return apiFetch<{ success: boolean; message: string; data: DpdItem }>(
        `/dpd/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wilayah", "dpd"] });
      toast.success(res.message || "Data DPD berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui DPD");
    },
  });
}

export function useDeleteDpd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<{ success: boolean; message: string }>(`/dpd/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wilayah", "dpd"] });
      toast.success(res.message || "DPD berhasil dinonaktifkan");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus DPD");
    },
  });
}

// -------------------------------------------------------------
// 2. DPC HOOKS
// -------------------------------------------------------------

export function useDpcList(params?: {
  search?: string;
  kode_provinsi?: string;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  const search = params?.search;
  const kode_provinsi = params?.kode_provinsi;
  const currentPage = params?.currentPage || 1;
  const pageSize = params?.pageSize || 10;
  const enabled = params?.enabled ?? true;

  return useQuery({
    queryKey: ["wilayah", "dpc", { search, kode_provinsi, currentPage, pageSize }],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (search?.trim()) q.append("search", search.trim());
      if (kode_provinsi?.trim()) q.append("kode_provinsi", kode_provinsi.trim());
      q.append("currentPage", String(currentPage));
      q.append("pageSize", String(pageSize));

      const res = await apiFetch<ApiResponseWithPagination<DpcItem>>(
        `/dpd-dpc?${q.toString()}`,
      );
      const list = [...extractArrayData(res)];
      // Urutkan default berdasarkan kode provinsi lalu kabupaten terkecil
      list.sort((a: DpcItem, b: DpcItem) => {
        const provDiff = Number(a.kode_provinsi) - Number(b.kode_provinsi);
        if (provDiff !== 0) return provDiff;
        return Number(a.kode_kabupaten) - Number(b.kode_kabupaten);
      });
      const meta = res?.meta || res?.pagination || {
        total: list.length,
        page: currentPage,
        limit: pageSize,
      };
      return { data: list, meta };
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useAllDpcList(enabled = true) {
  return useQuery({
    queryKey: ["wilayah", "dpc", "all"],
    queryFn: async () => {
      const pageSize = 100;
      const firstRes = await apiFetch<ApiResponseWithPagination<DpcItem>>(
        `/dpd-dpc?currentPage=1&pageSize=${pageSize}`,
      );
      const firstPageData = extractArrayData(firstRes);
      const total = firstRes?.meta?.total ?? firstRes?.pagination?.total ?? firstPageData.length;
      const totalPages = Math.max(Math.ceil(total / pageSize), 1);

      let combined = [...firstPageData];

      if (totalPages > 1) {
        const remainingRequests: Promise<ApiResponseWithPagination<DpcItem>>[] = [];
        for (let page = 2; page <= totalPages; page++) {
          remainingRequests.push(
            apiFetch<ApiResponseWithPagination<DpcItem>>(
              `/dpd-dpc?currentPage=${page}&pageSize=${pageSize}`,
            ),
          );
        }
        const remainingResponses = await Promise.all(remainingRequests);
        for (const res of remainingResponses) {
          combined = combined.concat(extractArrayData(res));
        }
      }

      // Deduplikasi berdasarkan id untuk menjaga konsistensi lintas halaman
      const dedupedMap = new Map<number, DpcItem>();
      for (const item of combined) {
        dedupedMap.set(item.id, item);
      }

      const list = Array.from(dedupedMap.values()).sort((a, b) => {
        const provDiff = Number(a.kode_provinsi) - Number(b.kode_provinsi);
        if (provDiff !== 0) return provDiff;
        return Number(a.kode_kabupaten) - Number(b.kode_kabupaten);
      });

      return {
        data: list,
        meta: {
          total: total || list.length,
          page: 1,
          limit: list.length,
        },
      };
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useCreateDpc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DpcFormValues) => {
      return apiFetch<{ success: boolean; message: string; data: DpcItem }>(
        "/dpd-dpc",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wilayah", "dpc"] });
      toast.success(res.message || "DPC berhasil ditambahkan");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan DPC");
    },
  });
}

export function useUpdateDpc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<DpcFormValues>;
    }) => {
      return apiFetch<{ success: boolean; message: string; data: DpcItem }>(
        `/dpd-dpc/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wilayah", "dpc"] });
      toast.success(res.message || "Data DPC berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui DPC");
    },
  });
}

export function useDeleteDpc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiFetch<{ success: boolean; message: string }>(`/dpd-dpc/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wilayah", "dpc"] });
      toast.success(res.message || "DPC berhasil dinonaktifkan");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus DPC");
    },
  });
}

// -------------------------------------------------------------
// 3. MASTER WILAYAH HOOKS
// -------------------------------------------------------------

export function useMasterProvinsi(enabled = true) {
  return useQuery({
    queryKey: ["master-wilayah", "provinsi"],
    queryFn: async () => {
      const res = await apiFetch<{
        success: boolean;
        message: string;
        data: MasterProvinsi[];
      }>("/master-wilayah/master-provinsi");
      const list = res.data || [];
      // Urutkan default berdasarkan kode provinsi terkecil
      return [...list].sort(
        (a, b) => Number(a.kode_provinsi) - Number(b.kode_provinsi),
      );
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMasterKabupaten(kodeProvinsi?: string | null) {
  return useQuery({
    queryKey: ["master-wilayah", "kabupaten", kodeProvinsi],
    queryFn: async () => {
      if (!kodeProvinsi) return [];
      const res = await apiFetch<{
        success: boolean;
        message: string;
        data: MasterKabupaten[];
      }>(`/master-wilayah/master-kabupaten?kode_provinsi=${encodeURIComponent(kodeProvinsi)}`);
      const list = res.data || [];
      // Urutkan default berdasarkan kode kabupaten terkecil
      return [...list].sort(
        (a, b) => Number(a.kode_kabupaten) - Number(b.kode_kabupaten),
      );
    },
    enabled: Boolean(kodeProvinsi),
    staleTime: 5 * 60 * 1000,
  });
}

// -------------------------------------------------------------
// 4. CABANG & LINKING HOOKS
// -------------------------------------------------------------

export function useCabangList(params?: {
  search?: string;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  const search = params?.search;
  const currentPage = params?.currentPage || 1;
  const pageSize = params?.pageSize || 500;
  const enabled = params?.enabled ?? true;

  return useQuery({
    queryKey: ["wilayah", "cabang", { search, currentPage, pageSize }],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (search?.trim()) q.append("search", search.trim());
      q.append("currentPage", String(currentPage));
      q.append("pageSize", String(pageSize));
      q.append("fixed", "all");

      const res = await apiFetch<ApiResponseWithPagination<CabangItem>>(
        `/cabang?${q.toString()}`,
      );

      return extractArrayData(res);
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useCreateCabang() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CabangFormValues) => {
      return apiFetch<{ message?: string; data?: { message?: string; total?: number } }>(
        "/cabang",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
      toast.success(
        res?.data?.message || res?.message || "Profil Cabang berhasil ditambahkan",
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan profil Cabang");
    },
  });
}

export function useUpdateCabang() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      uuid,
      payload,
    }: {
      uuid: string;
      payload: Partial<CabangFormValues>;
    }) => {
      return apiFetch<{ message?: string; data?: { message?: string } }>(
        `/cabang/${uuid}/update`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
      toast.success(
        res?.data?.message || res?.message || "Profil Cabang berhasil diperbarui",
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui profil Cabang");
    },
  });
}

export function useDeleteCabang() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      return apiFetch<{ message?: string; data?: { message?: string } }>(
        `/cabang/${uuid}/delete`,
        {
          method: "POST",
        },
      );
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
      toast.success(
        res?.data?.message || res?.message || "Profil Cabang berhasil dinonaktifkan",
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menonaktifkan profil Cabang");
    },
  });
}

export function useTautkanCabang() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LinkCabangPayload) => {
      return apiFetch<{ message: string; data?: unknown }>(
        `/cabang/${payload.cabangUuid}/update`,
        {
          method: "POST",
          body: JSON.stringify({
            dpdId: payload.dpdId !== undefined ? payload.dpdId : null,
            dpcId: payload.dpcId !== undefined ? payload.dpcId : null,
          }),
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
      toast.success("Tautan Cabang berhasil diperbarui");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui tautan Cabang");
    },
  });
}

// -------------------------------------------------------------
// 5. ROLE & AKUN ASSIGNMENT HOOKS
// -------------------------------------------------------------

export function useRolesList(enabled = true) {
  return useQuery({
    queryKey: ["roles", "list"],
    queryFn: async () => {
      const res = await apiFetch<ApiResponseWithPagination<RoleItem>>(
        "/roles?pageSize=100",
      );
      return extractArrayData(res);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAssignAkunCabang() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      akunUuid,
      cabangUuid,
      roleUuids,
    }: AssignAdminCabangPayload) => {
      return apiFetch<{ message: string; data?: unknown }>(
        `/akuns/${akunUuid}/update`,
        {
          method: "POST",
          body: JSON.stringify({
            cabangUuid,
            roleUuids,
          }),
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anggota"] });
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
      toast.success("Penugasan admin cabang berhasil disimpan");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menyimpan penugasan admin");
    },
  });
}

