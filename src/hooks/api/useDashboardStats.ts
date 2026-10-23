import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface DashboardStatsData {
  totalAnggota: number;
  totalBerita: number;
  totalKelasGrit: number;
  pendingApprovalCount: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil statistik dashboard");
      }

      const json = await res.json();
      return json.data as DashboardStatsData;
    },
    staleTime: 1000 * 60 * 2, // 2 menit
  });
}
