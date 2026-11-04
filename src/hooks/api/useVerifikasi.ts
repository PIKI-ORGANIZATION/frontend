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
}

export interface RegistrasiListResponse {
  success: boolean;
  data: RegistrasiItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export function useGetRegistrasiPending(statusVerifikasi: string = "PENDING_VERIFIKASI_DPP") {
  return useQuery({
    queryKey: ["registrasi", "pending", statusVerifikasi],
    queryFn: async () => {
      const endpoint = statusVerifikasi
        ? `/registrasi?statusVerifikasi=${encodeURIComponent(statusVerifikasi)}`
        : "/registrasi";
      return apiFetch<RegistrasiListResponse>(endpoint);
    },
    staleTime: 15 * 1000,
  });
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
