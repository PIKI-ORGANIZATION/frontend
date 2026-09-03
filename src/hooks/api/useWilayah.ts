import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useDpp() {
  return useQuery({
    queryKey: ["dpp"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/master-wilayah/dpd`);
      if (!res.ok) throw new Error("Gagal mengambil data Provinsi (DPD)");
      const json = await res.json();
      if (json.data) {
        // Map dpd back to dpp for frontend state compatibility
        json.data = json.data.map((item: { dpd: string; [key: string]: unknown }) => ({ ...item, dpp: item.dpd }));
      }
      return json;
    },
  });
}

export function useDpc(dppName: string | undefined) {
  return useQuery({
    queryKey: ["dpc", dppName],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/master-wilayah/dpc?dpd=${encodeURIComponent(dppName!)}`,
      );
      if (!res.ok) throw new Error("Gagal mengambil data Kabupaten/Kota (DPC)");
      return res.json();
    },
    enabled: !!dppName,
  });
}
