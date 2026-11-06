import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface RegistrasiItem {
  id: string;
  namaLengkap: string;
  email: string;
  noWa: string;
  statusVerifikasi: string;
  statusPembayaran?: string | null;
  dpd?: string | null;
  dpc?: string | null;
  kode_provinsi?: string | null;
  kode_kabupaten?: string | null;
  kotaDomisili?: string | null;
  dpp?: string;
  cabang?: {
    namaCabang: string;
    provinsi: string;
  } | null;
  created_at: string;
  fileKtpUrl: string;
  buktiBayarUrl?: string | null;
  catatanVerifikasi?: string | null;
  tglVerifikasi?: string | null;
  verifikatorUuid?: string | null;
}

export interface RegistrasiCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface RegistrasiListResponse {
  success: boolean;
  data: RegistrasiItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    counts?: RegistrasiCounts;
  };
}

export interface GetRegistrasiParams {
  statusVerifikasi?: "ALL" | "PENDING" | "APPROVED" | "REJECTED" | string;
  search?: string;
  currentPage?: number;
  pageSize?: number;
}

export function useGetRegistrasiList(params: GetRegistrasiParams = {}) {
  const { statusVerifikasi = "ALL", search, currentPage = 1, pageSize = 50 } = params;

  return useQuery({
    queryKey: ["registrasi", statusVerifikasi, search, currentPage, pageSize],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (statusVerifikasi && statusVerifikasi !== "ALL") {
        queryParams.set("statusVerifikasi", statusVerifikasi);
      }
      if (search && search.trim()) {
        queryParams.set("search", search.trim());
      }
      if (currentPage) {
        queryParams.set("skip", String((currentPage - 1) * pageSize));
      }
      if (pageSize) {
        queryParams.set("take", String(pageSize));
      }

      const qs = queryParams.toString();
      const endpoint = qs ? `/registrasi?${qs}` : "/registrasi";
      return apiFetch<RegistrasiListResponse>(endpoint);
    },
    staleTime: 15 * 1000,
  });
}

// Alias for backward compatibility
export function useGetRegistrasiPending(statusVerifikasi: string = "PENDING") {
  return useGetRegistrasiList({ statusVerifikasi });
}

export function useApproveRegistrasi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
      catatanVerifikasi,
    }: {
      id: string;
      action: "APPROVE" | "REJECT";
      catatanVerifikasi?: string;
    }) => {
      return apiFetch<{ success: boolean; message: string; data?: unknown }>(
        `/registrasi/${id}/verifikasi`,
        {
          method: "PATCH",
          body: JSON.stringify({
            action,
            catatanVerifikasi,
          }),
        },
      );
    },
    onSuccess: () => {
      // Invalidate query supaya tabel refresh otomatis
      queryClient.invalidateQueries({ queryKey: ["registrasi"] });
    },
  });
}
