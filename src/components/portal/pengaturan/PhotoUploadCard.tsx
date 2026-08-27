"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { useUpdateProfile } from "@/hooks/api/useProfile";
import Cookies from "js-cookie";
import Image from "next/image";
import { toast } from "sonner";

interface PhotoUploadCardProps {
  currentImageUrl?: string | null;
  namaLengkap?: string;
}

export function PhotoUploadCard({
  currentImageUrl,
  namaLengkap,
}: PhotoUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Harap unggah file berupa gambar (JPEG, PNG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Maksimal ukuran foto adalah 2MB.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const token = Cookies.get("token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Gagal mengunggah foto.");
      }

      const fileUrl = data.url;

      // Update profile
      await updateProfile({ profileImg: fileUrl });

      toast.success("Foto profil Anda berhasil diubah.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengunggah foto.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const fallbackInitial = namaLengkap
    ? namaLengkap.charAt(0).toUpperCase()
    : "U";

  // URL fallback handler
  const getFullImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    // Remove /api/v1 from the base url if it's there
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "";
    return `${baseUrl}${url}`;
  };

  return (
    <div className="bg-card border rounded-xl p-6 flex flex-col items-center justify-center text-center w-full">
      <div className="relative group mb-6">
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-background shadow-lg bg-muted flex items-center justify-center relative">
          {currentImageUrl ? (
            <Image
              src={getFullImageUrl(currentImageUrl)}
              alt="Profile"
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <span className="text-6xl font-bold text-muted-foreground">
              {fallbackInitial}
            </span>
          )}

          {/* Hover Overlay */}
          <div
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-white mb-2" />
                <span className="text-white text-sm font-medium">
                  Ubah Foto
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-1">Foto Profil</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Gunakan foto formal dengan rasio 1:1. Maksimal 2MB (JPEG, PNG).
      </p>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mengunggah...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Pilih Foto Baru
          </>
        )}
      </button>
    </div>
  );
}
