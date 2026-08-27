import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useRegistrasiStore } from "@/store/useRegistrasiStore";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "motion/react";
import Image from "next/image";

interface Props {
  onPrev: () => void;
  onSuccess: () => void;
}

export function Step4Pembayaran({ onPrev, onSuccess }: Props) {
  const { data, updateData } = useRegistrasiStore();
  const [file, setFile] = useState<File | null>(data.buktiBayarFile || null);
  const [preview, setPreview] = useState<string | null>(
    data.buktiBayarFile ? URL.createObjectURL(data.buktiBayarFile) : null,
  );
  const [ktpFile, setKtpFile] = useState<File | null>(data.ktpFile || null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(
    data.ktpFile ? URL.createObjectURL(data.ktpFile) : null,
  );
  const [isKtpDragging, setIsKtpDragging] = useState(false);
  const ktpFileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [agreed3, setAgreed3] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKtpFile = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    if (
      !selectedFile.type.startsWith("image/") &&
      selectedFile.type !== "application/pdf"
    ) {
      toast.error("Format file harus berupa gambar atau PDF");
      return;
    }

    setKtpFile(selectedFile);
    updateData({ ktpFile: selectedFile });

    if (selectedFile.type.startsWith("image/")) {
      setKtpPreview(URL.createObjectURL(selectedFile));
    } else {
      setKtpPreview(null);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    // allow image or pdf
    if (
      !selectedFile.type.startsWith("image/") &&
      selectedFile.type !== "application/pdf"
    ) {
      toast.error("Format file harus berupa gambar atau PDF");
      return;
    }

    setFile(selectedFile);
    updateData({ buktiBayarFile: selectedFile });

    if (selectedFile.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (!file) {
      toast.error("Silakan unggah bukti pembayaran terlebih dahulu");
      return;
    }
    
    if (!ktpFile) {
      toast.error("Silakan unggah dokumen KTP terlebih dahulu");
      return;
    }

    if (!agreed1 || !agreed2 || !agreed3) {
      toast.error("Harap centang semua kotak persetujuan (Kebenaran Data, PDP, Kerahasiaan) di bagian bawah sebelum mendaftar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      // 1. Upload KTP
      const ktpFormData = new FormData();
      ktpFormData.append("file", ktpFile);
      const ktpRes = await fetch(`${baseUrl}/upload/bukti-transfer`, {
        method: "POST",
        body: ktpFormData,
      });
      const ktpUploadData = await ktpRes.json();
      if (!ktpRes.ok) throw new Error(ktpUploadData.error || "Gagal mengunggah foto KTP");
      
      // 2. Upload Bukti Transfer
      const buktiFormData = new FormData();
      buktiFormData.append("file", file);
      const buktiRes = await fetch(`${baseUrl}/upload/bukti-transfer`, {
        method: "POST",
        body: buktiFormData,
      });
      const buktiUploadData = await buktiRes.json();
      if (!buktiRes.ok) throw new Error(buktiUploadData.error || "Gagal mengunggah bukti pembayaran");

      // 3. Submit Registrasi
      const payload = {
        nik: data.nik,
        namaLengkap: data.namaLengkap,
        tanggalLahir: data.tanggalLahir || new Date().toISOString(), // Fallback if missing
        noWa: data.noWa,
        email: data.email,
        confirmEmail: data.confirmEmail || data.email,
        alamatDomisili: data.alamatDomisili,
        tingkatPendidikan: data.tingkatPendidikan,
        pekerjaan: data.pekerjaan,
        minatBidang: data.minatBidang,
        motivasiBergabung: data.motivasiBergabung,
        dpp: data.dpp,
        dpc: data.dpc,
        kode_provinsi: data.kode_provinsi,
        kode_kabupaten: data.kode_kabupaten,
        setujuKebenaranData: agreed1,
        setujuPengelolaanData: agreed2,
        setujuKerahasiaanData: agreed3,
        fileKtpUrl: ktpUploadData.url,
        buktiBayarUrl: buktiUploadData.url,
      };

      const submitRes = await fetch(`${baseUrl}/registrasi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        throw new Error(submitData.message || submitData.error || "Gagal mengirim data pendaftaran");
      }

      toast.success("Pendaftaran berhasil disubmit!");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pendaftaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <div className="space-y-3">
        <p className="text-muted-foreground text-base max-w-[65ch]">
          Selesaikan pendaftaran dengan mentransfer Iuran Anggota bulan pertama.
          Setelah pembayaran berhasil, KTA Anda akan langsung diterbitkan.
        </p>
      </div>

      {/* Invoice / Tagihan Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="bg-muted/50 px-6 py-4 flex items-center justify-between border-b">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Detail Tagihan
          </span>
          <span className="text-sm font-semibold">Iuran Bulan ke-1</span>
        </div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Total Pembayaran
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tighter">
                Rp 25.000
              </span>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-border"></div>
          <div className="md:hidden h-px w-full bg-border"></div>

          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">BCA (Bank Central Asia)</p>
                <p className="text-xs text-muted-foreground">
                  a.n. Persatuan Intelegensia Kristen Indonesia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-muted">
              <code className="text-xl font-mono font-semibold tracking-wide flex-1 text-center">
                123 456 7890
              </code>
              <Button
                size="sm"
                variant="secondary"
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText("1234567890");
                  toast.success("Nomor rekening disalin ke clipboard");
                }}
              >
                Salin
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">
            Unggah KTP <span className="text-red-500">*</span>
          </label>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isKtpDragging
              ? "border-primary bg-primary/5"
              : ktpFile
                ? "border-green-500/50 bg-green-50/50 dark:bg-green-500/10"
                : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsKtpDragging(true);
          }}
          onDragLeave={() => setIsKtpDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsKtpDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleKtpFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => !ktpFile && ktpFileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={ktpFileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleKtpFile(e.target.files[0]);
              }
            }}
          />

          {ktpFile ? (
            <div className="space-y-5">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                  KTP berhasil diunggah
                </p>
                <p
                  className="text-sm text-muted-foreground max-w-[200px] mx-auto truncate"
                  title={ktpFile.name}
                >
                  {ktpFile.name}
                </p>
              </div>

              {ktpPreview && (
                <div className="mt-4 flex justify-center">
                  <div className="relative w-40 h-52 rounded-xl overflow-hidden border shadow-sm group">
                    <Image
                      src={ktpPreview}
                      alt="Preview KTP"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setKtpFile(null);
                  setKtpPreview(null);
                  updateData({ ktpFile: null });
                  if (ktpFileInputRef.current) ktpFileInputRef.current.value = "";
                }}
              >
                Ganti Dokumen
              </Button>
            </div>
          ) : (
            <div className="space-y-4 cursor-pointer py-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                <Upload className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-sm">
                  Klik atau Tarik & Lepas KTP di sini
                </p>
                <p className="text-xs text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                  Format yang didukung: JPG, PNG, atau PDF. Maksimal ukuran file
                  5MB.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">
            Unggah Bukti Transfer <span className="text-red-500">*</span>
          </label>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : file
                ? "border-green-500/50 bg-green-50/50 dark:bg-green-500/10"
                : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {file ? (
            <div className="space-y-5">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Bukti berhasil diunggah
                </p>
                <p
                  className="text-sm text-muted-foreground max-w-[200px] mx-auto truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
              </div>

              {preview && (
                <div className="mt-4 flex justify-center">
                  <div className="relative w-40 h-52 rounded-xl overflow-hidden border shadow-sm group">
                    <Image
                      src={preview}
                      alt="Preview Bukti"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                  updateData({ buktiBayarFile: null });
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Ganti Dokumen
              </Button>
            </div>
          ) : (
            <div className="space-y-4 cursor-pointer py-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                <Upload className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-sm">
                  Klik atau Tarik & Lepas file di sini
                </p>
                <p className="text-xs text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
                  Format yang didukung: JPG, PNG, atau PDF. Maksimal ukuran file
                  5MB.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Persetujuan Syarat & Ketentuan */}
      <div className="space-y-4 pt-6 border-t mt-8">
        <h3 className="text-sm font-semibold">Persetujuan Pendaftaran</h3>
        <div className="space-y-3">
          <label className="flex flex-row items-start space-x-3 rounded-md border p-4 shadow-sm cursor-pointer hover:bg-muted/30">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
              checked={agreed1}
              onChange={(e) => setAgreed1(e.target.checked)}
            />
            <div className="space-y-1 leading-none">
              <span className="text-sm font-medium leading-none">Kebenaran Data</span>
              <p className="text-sm text-muted-foreground mt-1">
                Saya menyatakan bahwa seluruh data yang diberikan adalah benar dan dapat dipertanggungjawabkan.
              </p>
            </div>
          </label>

          <label className="flex flex-row items-start space-x-3 rounded-md border p-4 shadow-sm cursor-pointer hover:bg-muted/30">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
              checked={agreed2}
              onChange={(e) => setAgreed2(e.target.checked)}
            />
            <div className="space-y-1 leading-none">
              <span className="text-sm font-medium leading-none">Pengelolaan Data (UU PDP)</span>
              <p className="text-sm text-muted-foreground mt-1">
                Saya menyetujui data pribadi saya dikelola oleh organisasi sesuai dengan Undang-Undang Pelindungan Data Pribadi (UU PDP).
              </p>
            </div>
          </label>

          <label className="flex flex-row items-start space-x-3 rounded-md border p-4 shadow-sm cursor-pointer hover:bg-muted/30">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
              checked={agreed3}
              onChange={(e) => setAgreed3(e.target.checked)}
            />
            <div className="space-y-1 leading-none">
              <span className="text-sm font-medium leading-none">Kerahasiaan Data</span>
              <p className="text-sm text-muted-foreground mt-1">
                Saya menyetujui jaminan kerahasiaan data yang ditetapkan oleh organisasi.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t mt-8">
        <Button
          type="button"
          variant="ghost"
          onClick={onPrev}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <Button
          onClick={handleNext}
          disabled={!file || !ktpFile || isSubmitting}
          className="gap-2 px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Sedang Memproses...
            </>
          ) : (
            "Kirim Pendaftaran"
          )}
        </Button>
      </div>
    </motion.div>
  );
}
