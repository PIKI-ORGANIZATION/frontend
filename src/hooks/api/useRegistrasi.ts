import { useMutation } from "@tanstack/react-query";
import { RegistrasiData } from "../../store/useRegistrasiStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function useSubmitRegistrasi() {
  return useMutation({
    mutationFn: async (data: RegistrasiData) => {
      // 1. Upload KTP to public upload route
      if (!data.ktpFile) {
        throw new Error("File KTP wajib diunggah.");
      }
      const ktpFormData = new FormData();
      ktpFormData.append("file", data.ktpFile);

      const uploadRes = await fetch(`${API_BASE}/upload/bukti-transfer`, {
        method: "POST",
        body: ktpFormData,
      });

      if (!uploadRes.ok) {
        throw new Error(
          "Gagal mengunggah foto KTP. Pastikan ukuran file sesuai dan berformat gambar.",
        );
      }

      const uploadData = await uploadRes.json();
      const fileKtpUrl = uploadData.url;

      // 2. Map data to backend schema
      const payload = {
        nik: data.nik,
        namaLengkap: data.namaLengkap,
        tanggalLahir: data.tanggalLahir,
        noWa: data.noWa,
        email: data.email,
        confirmEmail: data.confirmEmail,
        password: data.password,
        alamatDomisili: data.alamatDomisili,
        fileKtpUrl: fileKtpUrl,
        dpp: data.dpp,
        dpc: data.dpc,
        kode_provinsi: data.kode_provinsi,
        kode_kabupaten: data.kode_kabupaten,
        tingkatPendidikan: data.tingkatPendidikan,
        pekerjaan: data.pekerjaan,
        minatBidang: data.minatBidang,
        motivasiBergabung: data.motivasiBergabung,
        setujuKebenaranData: data.setujuKebenaranData,
        setujuPengelolaanData: data.setujuPengelolaanData,
        setujuKerahasiaanData: data.setujuKerahasiaanData,
      };

      // 3. Submit JSON to registrasi
      const res = await fetch(`${API_BASE}/registrasi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            "Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi.",
        );
      }

      return res.json();
    },
  });
}
