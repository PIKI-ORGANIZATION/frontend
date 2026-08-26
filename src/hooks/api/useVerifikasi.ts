import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface RegistrasiItem {
  id: string;
  namaLengkap: string;
  email: string;
  noWa: string;
  statusVerifikasi: string;
  dpp: string;
  dpc: string;
  cabang: {
    namaCabang: string;
    provinsi: string;
  } | null;
  created_at: string;
  fileKtpUrl: string;
  buktiBayarUrl?: string | null;
}

export function useGetRegistrasiPending() {
  return useQuery({
    queryKey: ["registrasi", "pending"],
    queryFn: async () => {
      const token = Cookies.get("token");
      // Fetch data dengan status PENDING_VERIFIKASI_DPP
      const res = await fetch(`${API_BASE}/registrasi?statusVerifikasi=PENDING_VERIFIKASI_DPP`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Gagal mengambil data registrasi pending");
      return res.json() as Promise<{ data: RegistrasiItem[] }>;
    },
  });
}

export function useApproveRegistrasi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, catatanVerifikasi }: { id: string; status: "APPROVED_DPP" | "REJECTED", catatanVerifikasi?: string }) => {
      const token = Cookies.get("token");
      const res = await fetch(`${API_BASE}/registrasi/${id}/verifikasi`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          actorNama: "SUPER_ADMIN", // Sementara di hardcode untuk role super_admin
          catatanVerifikasi,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal memproses verifikasi");
      }



      return res.json();
    },
    onSuccess: () => {
      // Invalidate query supaya tabel refresh otomatis
      queryClient.invalidateQueries({ queryKey: ["registrasi", "pending"] });
    },
  });
}
