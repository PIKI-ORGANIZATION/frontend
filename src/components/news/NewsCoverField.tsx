"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewsCover } from "@/components/news/NewsCover";

const MIN_WIDTH = 1200;
const MIN_HEIGHT = 675;
const MAX_EDGE = 1920;
const MAX_BYTES = 5 * 1024 * 1024;
const MIN_RATIO = 1.25;
const MAX_RATIO = 1.9;

function assertCoverSize(width: number, height: number) {
  const ratio = width / height;
  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    throw new Error("Foto sampul minimal 1200×675 px agar tetap tajam di berita utama.");
  }
  if (ratio < MIN_RATIO || ratio > MAX_RATIO) {
    throw new Error("Gunakan foto lanskap 4:3 (1600×1200) atau 16:9 (1600×900), sesuai sampul berita PIKI.");
  }
}

function readImageSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Gambar tidak bisa dibuka. Periksa tautannya."));
    image.src = src;
  });
}

function readFileImage(file: File) {
  const url = URL.createObjectURL(file);
  return readImageSize(url).finally(() => URL.revokeObjectURL(url));
}

function resizeCover(file: File) {
  const url = URL.createObjectURL(file);
  return new Promise<File>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.round(image.naturalWidth * scale);
      const height = Math.round(image.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Gagal memproses foto"));
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Gagal memproses foto"));
            return;
          }
          resolve(new File([blob], "sampul-berita.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Foto tidak bisa dibaca"));
    };
    image.src = url;
  });
}

async function uploadCover(file: File) {
  const body = new FormData();
  body.append("file", file);
  const token = Cookies.get("token");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) {
    throw new Error(payload.error || payload.message || "Gagal mengunggah sampul");
  }
  return payload.url as string;
}

export function NewsCoverField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const applyUrl = async () => {
    const next = draft.trim();
    if (!next) {
      onChange("");
      return;
    }
    if (!/^https?:\/\//i.test(next)) {
      toast.error("URL sampul harus diawali http:// atau https://");
      setDraft(value);
      return;
    }
    setBusy(true);
    try {
      const size = await readImageSize(next);
      assertCoverSize(size.width, size.height);
      onChange(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sampul tidak sesuai");
      setDraft(value);
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Unggah JPG, PNG, WebP, atau GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Ukuran berkas maksimal 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const size = await readFileImage(file);
      assertCoverSize(size.width, size.height);
      const prepared =
        file.type === "image/gif" || Math.max(size.width, size.height) <= MAX_EDGE
          ? file
          : await resizeCover(file);
      if (prepared.size > MAX_BYTES) {
        throw new Error("Foto masih lebih dari 5 MB setelah diperkecil.");
      }
      const url = await uploadCover(prepared);
      onChange(url);
      toast.success("Sampul terunggah");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah sampul");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[16rem_1fr] md:items-start">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted ring-1 ring-border">
        <NewsCover src={value} alt="Pratinjau sampul berita" />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (draft.trim() !== value) void applyUrl();
          }}
          placeholder="https://..."
          disabled={busy}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
            <ImagePlus className="mr-1 h-4 w-4" />
            Unggah foto
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                onChange("");
                setDraft("");
              }}
            >
              Hapus sampul
            </Button>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Pratinjau memakai rasio 4:3 seperti berita utama di beranda. Foto lanskap 4:3
          (1600×1200) atau 16:9 (1600×900), lebar minimal 1200 px, maksimal 5 MB.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
      </div>
    </div>
  );
}
