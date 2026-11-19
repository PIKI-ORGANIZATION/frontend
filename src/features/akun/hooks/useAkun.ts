"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  AkunItem,
  AkunListParams,
  AkunListResponse,
  CreateAkunPayload,
  UpdateAkunPayload,
} from "../types";

export function useAkunList(params?: AkunListParams) {
  const search = params?.search;
  const statusAkun = params?.statusAkun;
  const currentPage = params?.currentPage || 1;
  const pageSize = params?.pageSize || 10;
  const enabled = params?.enabled ?? true;

  return useQuery({
    queryKey: ["akuns", "list", { search, statusAkun, currentPage, pageSize }],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (search?.trim()) q.append("search", search.trim());
      if (statusAkun) q.append("statusAkun", statusAkun);
      q.append("currentPage", String(currentPage));
      q.append("pageSize", String(pageSize));

      const res = await apiFetch<AkunListResponse>(`/akuns?${q.toString()}`);
      const list = res?.data?.result ?? res?.result ?? [];
      const pagination = res?.data?.pagination ?? res?.pagination ?? {
        currentPage,
        pageSize,
        total: list.length,
      };

      return {
        data: Array.isArray(list) ? (list as AkunItem[]) : [],
        pagination,
      };
    },
    enabled,
    staleTime: 20 * 1000,
  });
}

export function useCreateAkun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAkunPayload) => {
      return apiFetch<AkunItem>("/akuns", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["akuns"] });
      toast.success("Akun admin berhasil dibuat");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal membuat akun baru");
    },
  });
}

export function useUpdateAkun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, ...body }: UpdateAkunPayload) => {
      return apiFetch<AkunItem>(`/akuns/${uuid}/update`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["akuns"] });
      queryClient.invalidateQueries({ queryKey: ["anggota"] });
      toast.success(
        "Data akun & hak akses berhasil diperbarui. Perubahan berlaku setelah pengguna login ulang.",
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal memperbarui akun");
    },
  });
}

export function useDeleteAkun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      return apiFetch<{ message?: string }>(`/akuns/${uuid}/delete`, {
        method: "POST",
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["akuns"] });
      toast.success(res?.message || "Akun berhasil dinonaktifkan");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menonaktifkan akun");
    },
  });
}
