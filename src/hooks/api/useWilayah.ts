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
        json.data = json.data.map(
          (item: { dpd: string; [key: string]: unknown }) => ({
            ...item,
            dpp: item.dpd,
          }),
        );
      }
      return json;
    },
  });
}

export function useDpc(
  dppName: string | undefined,
  kodeProvinsi?: string | undefined,
) {
  return useQuery({
    queryKey: ["dpc", dppName, kodeProvinsi],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (dppName) q.set("dpd", dppName);
      if (kodeProvinsi) q.set("kode_provinsi", kodeProvinsi);

      const res = await fetch(
        `${API_BASE}/master-wilayah/dpc?${q.toString()}`,
      );
      if (!res.ok) throw new Error("Gagal mengambil data Kabupaten/Kota (DPC)");
      return res.json();
    },
    enabled: !!(dppName || kodeProvinsi),
  });
}
