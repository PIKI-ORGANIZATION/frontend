import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useDpp() {
  return useQuery({
    queryKey: ["dpp"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/master-wilayah/dpp`);
      if (!res.ok) throw new Error("Gagal mengambil data Provinsi (DPP)");
      return res.json();
    },
  });
}

export function useDpc(dppName: string | undefined) {
  return useQuery({
    queryKey: ["dpc", dppName],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/master-wilayah/dpc?dpp=${encodeURIComponent(dppName!)}`,
      );
      if (!res.ok) throw new Error("Gagal mengambil data Kabupaten/Kota (DPC)");
      return res.json();
    },
    enabled: !!dppName,
  });
}
