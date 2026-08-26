import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { RegistrasiItem } from "./useVerifikasi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useGetDaftarAnggota(params?: {
  search?: string;
  cabangUuid?: string;
}) {
  return useQuery({
    queryKey: ["anggota", "list", params],
    queryFn: async () => {
      const token = Cookies.get("token");

      const queryParams = new URLSearchParams({
        statusKta: "AKTIF", // Hanya yang KTAP-nya aktif
      });

      if (params?.search) queryParams.append("search", params.search);
      if (params?.cabangUuid)
        queryParams.append("cabangUuid", params.cabangUuid);

      const res = await fetch(
        `${API_BASE}/registrasi?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Gagal mengambil data daftar anggota");
      return res.json() as Promise<{
        data: RegistrasiItem[];
        meta: { total: number; page: number; limit: number };
      }>;
    },
  });
}
