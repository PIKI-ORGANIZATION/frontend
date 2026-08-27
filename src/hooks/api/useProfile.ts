import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Type untuk respon GET /auth/me
export interface ProfileResponse {
  uuid: string;
  email: string;
  username: string;
  statusAkun: string;
  namaLengkap?: string;
  namaPanggil?: string;
  profileImg?: string;
  tempatLahir?: string;
  tanggalLahir?: string | null;
  alamat?: string;
  pendidikanUuid?: string;
  pekerjaanUuid?: string;
  noWa?: string;
  bidangStudiUuid?: string;
  bidangMinatUuid?: string;
  provinsi?: string;
  kotaDomisili?: string;
  bio?: string;
  pesanKesan?: string;
  angkatan?: string;
  instagram?: string;
  facebook?: string;
  cabang?: {
    uuid: string;
    namaCabang: string;
  };
}

// 1. Fetch Data Profil (GET /auth/me)
export const useGetProfile = () => {
  return useQuery<ProfileResponse, Error>({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = Cookies.get("token");
      if (!token) throw new Error("Tidak ada token otorisasi");

      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil data profil");
      }

      return data.data; // Backend returns { message, data: { ... } }
    },
  });
};

// 2. Update Data Profil (POST /auth/profile)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; data?: ProfileResponse }, Error, Partial<ProfileResponse>>({
    mutationFn: async (payload) => {
      const token = Cookies.get("token");
      if (!token) throw new Error("Tidak ada token otorisasi");

      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui profil");
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate query "profile" agar otomatis me-refresh data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// 3. Ubah Password (POST /auth/change-password)
export const useChangePassword = () => {
  return useMutation<{ message: string }, Error, { oldPassword: string; newPassword: string }>({
    mutationFn: async (payload) => {
      const token = Cookies.get("token");
      if (!token) throw new Error("Tidak ada token otorisasi");

      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengubah password");
      }

      return data;
    },
  });
};
