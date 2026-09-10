import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface PublicAnggotaProfile {
  uuid: string;
  namaLengkap: string;
  noKta: string | null;          // Nomor Anggota
  profileImg: string | null;     // Foto profil
  noWa: string | null;
  provinsi: string | null;
  kotaDomisili: string | null;
  statusKeanggotaan: string;     // "AKTIF" | "NON_MEMBER" | dll
  statusKta: string | null;      // "ACTIVE" | "INACTIVE"
  tglAktivasiKta: string | null; // Tanggal aktivasi (berlaku sejak)
  email: string | null;
  insert_at: string;             // Bergabung sejak
  cabang: {
    uuid: string;
    namaCabang: string;
    provinsi: string;
  } | null;
  pendidikanRef: { nama: string } | null;
  pekerjaanRef: { nama: string } | null;
  bidangStudiRef: { nama: string } | null;
  bidangMinatRef: { nama: string } | null;
  registrasi: {
    id: string;
    statusVerifikasi: string;
    statusPembayaran: string;
    langkahSekarang: number;
    dpd: string | null;
    dpc: string | null;
    tglPersetujuanPdp: string | null;
  } | null;
}

export function usePublicAnggota(uuid: string) {
  return useQuery<{ success: boolean; data: PublicAnggotaProfile }>({
    queryKey: ["public-anggota", uuid],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/anggotas/public/profile/${uuid}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Profil tidak ditemukan");
      }
      return res.json();
    },
    enabled: Boolean(uuid),
    staleTime: 1000 * 60 * 5, // 5 menit
    retry: 1,
  });
}
