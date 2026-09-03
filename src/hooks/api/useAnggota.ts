import { useQuery, keepPreviousData } from "@tanstack/react-query";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface AnggotaItem {
  uuid: string;
  namaLengkap: string;
  noWa: string;
  provinsi: string;
  kotaDomisili: string;
  statusKeanggotaan: string;
  akun?: {
    email: string;
  };
  cabang?: {
    namaCabang: string;
    provinsi: string;
  };
  created_at: string;
}

export function useGetDaftarAnggota(params?: {
  search?: string;
  cabangUuid?: string;
  currentPage?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["anggota", "list", params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = Cookies.get("token");

      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.cabangUuid) queryParams.append("cabangUuid", params.cabangUuid);
      if (params?.currentPage) queryParams.append("currentPage", params.currentPage.toString());
      if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());

      const res = await fetch(
        `${API_BASE}/anggotas/?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      
      if (!res.ok) throw new Error("Gagal mengambil data daftar anggota");
      return res.json() as Promise<{
        success: boolean;
        data: AnggotaItem[];
        pagination: { total: number; currentPage: number; pageSize: number; totalPages: number };
      }>;
    },
  });
}
