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
  data?: T[];
  result?: T[];
  meta?: PaginationMeta;
  pagination?: PaginationMeta;
}

// -------------------------------------------------------------
// 1. DPD HOOKS
// -------------------------------------------------------------

export function useDpdList(params?: {
  search?: string;
  currentPage?: number;
  pageSize?: number;
}) {
  const search = params?.search;
  const currentPage = params?.currentPage || 1;
  const pageSize = params?.pageSize || 10;

  return useQuery({
    queryKey: ["wilayah", "dpd", { search, currentPage, pageSize }],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (search?.trim()) q.append("search", search.trim());
      q.append("currentPage", String(currentPage));
      q.append("pageSize", String(pageSize));

      const res = await apiFetch<any>(
        `/dpd?${q.toString()}`,
      );
      const raw = res?.data?.result ?? res?.data ?? res?.result ?? [];
      const list = Array.isArray(raw) ? raw : [];
      // Urutkan default berdasarkan kode provinsi terkecil
      list.sort((a: DpdItem, b: DpdItem) => Number(a.kodeProvinsi) - Number(b.kodeProvinsi));
      const meta = res?.meta || res?.pagination || {
        total: list.length,
        page: currentPage,
        limit: pageSize,
      };
      return { data: list as DpdItem[], meta };
    },
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
}) {
  const search = params?.search;
  const kode_provinsi = params?.kode_provinsi;
  const currentPage = params?.currentPage || 1;
  const pageSize = params?.pageSize || 10;

  return useQuery({
    queryKey: ["wilayah", "dpc", { search, kode_provinsi, currentPage, pageSize }],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (search?.trim()) q.append("search", search.trim());
      if (kode_provinsi?.trim()) q.append("kode_provinsi", kode_provinsi.trim());
      q.append("currentPage", String(currentPage));
      q.append("pageSize", String(pageSize));

      const res = await apiFetch<any>(
        `/dpd-dpc?${q.toString()}`,
      );
      const raw = res?.data?.result ?? res?.data ?? res?.result ?? [];
      const list = Array.isArray(raw) ? raw : [];
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
      return { data: list as DpcItem[], meta };
    },
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

export function useMasterProvinsi() {
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
}) {
  const search = params?.search;
  const currentPage = params?.currentPage || 1;
  const pageSize = params?.pageSize || 100;

  return useQuery({
    queryKey: ["wilayah", "cabang", { search, currentPage, pageSize }],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (search?.trim()) q.append("search", search.trim());
      q.append("currentPage", String(currentPage));
      q.append("pageSize", String(pageSize));
      q.append("fixed", "all");

      const res = await apiFetch<any>(`/cabang?${q.toString()}`);

      const raw = res?.data?.result ?? res?.result ?? res?.data ?? [];
      const list = Array.isArray(raw) ? raw : [];
      return list as CabangItem[];
    },
    staleTime: 30 * 1000,
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

export function useRolesList() {
  return useQuery({
    queryKey: ["roles", "list"],
    queryFn: async () => {
      const res = await apiFetch<{
        success?: boolean;
        message?: string;
        data?: RoleItem[];
        result?: RoleItem[];
      }>("/roles?pageSize=100");
      const list = res.data || res.result || [];
      return list;
    },
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

