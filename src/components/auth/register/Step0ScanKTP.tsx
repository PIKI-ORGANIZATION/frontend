import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRegistrasiStore } from "@/store/useRegistrasiStore";
import {
  ArrowRight,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";

export function Step0ScanKTP({ onNext }: { onNext: () => void }) {
  const { data, updateData } = useRegistrasiStore();
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(
    data.ktpFile || null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    data.ktpFile ? URL.createObjectURL(data.ktpFile) : null,
  );

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Ukuran file maksimal 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrorMsg("File harus berupa gambar (JPG/PNG)");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  const handleScanKtp = async () => {
    if (!selectedFile) {
      setErrorMsg("Pilih foto KTP terlebih dahulu");
      return;
    }

    setIsScanning(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("ktp", selectedFile);

      const res = await fetch(`${API_BASE}/registrasi/scan-ktp`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error("Sistem kesulitan membaca KTP Anda. Pastikan foto terang dan jelas, atau silakan klik 'Isi Manual' untuk melanjutkan.");
      }

      if (result.success && result.data) {
        if (!result.data.isValidKtp) {
          throw new Error("Gambar tidak terdeteksi sebagai KTP. Pastikan gambar jelas, atau silakan pilih 'Isi Manual'.");
        }

        const { nik, namaLengkap, tempatTglLahir } = result.data.extractedData;

        let parsedDate = "";
        if (tempatTglLahir) {
          const match = tempatTglLahir.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
          if (match) {
            const [_, day, month, year] = match;
            parsedDate = `${year}-${month}-${day}`;
          }
        }

        // Simpan ke global store
        updateData({
          ktpFile: selectedFile,
          nik: nik || "",
          namaLengkap: namaLengkap || "",
          tanggalLahir: parsedDate,
          isOcrValid: result.data.isValidKtp,
        });

        onNext();
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message || "Gagal memproses gambar. Silakan coba lagi atau pilih 'Isi Manual'.");
      } else {
        setErrorMsg("Gagal memproses gambar. Silakan coba lagi atau pilih 'Isi Manual'.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSkip = () => {
    if (selectedFile) {
      updateData({ ktpFile: selectedFile, isOcrValid: false });
      onNext();
    } else {
      setErrorMsg("Foto KTP wajib diunggah walaupun Anda ingin mengisi manual");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Scan KTP</h2>
        <p className="text-muted-foreground">
          Unggah foto KTP Anda untuk mempercepat pengisian data pendaftaran.
          Pastikan foto KTP terlihat jelas dan terang.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-primary/5 relative overflow-hidden transition-all hover:bg-primary/10">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileChange}
            disabled={isScanning}
          />

          {previewUrl ? (
            <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden shadow-sm border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview KTP"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white font-medium flex items-center gap-2">
                  <UploadCloud className="w-5 h-5" /> Ganti Foto
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="font-medium text-lg">
                  Sentuh untuk mengunggah foto KTP
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Mendukung format JPG, JPEG, PNG (Maks. 5MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400 rounded-xl text-sm flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2">
            <X className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={handleScanKtp}
          disabled={!selectedFile || isScanning}
        >
          {isScanning ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {isScanning ? "Memproses KTP..." : "Scan & Lanjutkan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full sm:w-auto shrink-0"
          onClick={handleSkip}
          disabled={!selectedFile || isScanning}
        >
          Isi Manual <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
