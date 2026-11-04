"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { CenteredLoadingOverlay } from "@/components/ui/centered-loading-overlay";
import {
  Camera,
  Film,
  Sparkles,
  ChevronsUpDown,
  Check,
  Calendar,
  Clock,
  MapPin,
  Link2,
  Upload,
  Loader2,
  AlertCircle,
  FileVideo,
  Globe,
  Plus,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import {
  GaleriItem,
  GaleriFormValues,
  KategoriGaleri,
  KATEGORI_GALERI_OPTIONS,
  SingleMediaType,
  StatusPublikasi,
  SumberVideo,
  PenempatanMedia,
  formatTanggalIndo,
  getSafeImageSrc,
} from "@/features/galeri/types";
import { useGaleri } from "@/features/galeri/hooks/useGaleri";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GaleriEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: GaleriItem | null;
  onSave: (values: GaleriFormValues) => void;
}

// Helper to extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Helper to extract Instagram post/reel code, strip tracking params, and normalize canonical URL
function normalizeInstagramUrl(rawUrl: string): {
  cleanUrl: string;
  postType: "p" | "reel";
  code: string;
  embedUrl: string;
} | null {
  if (!rawUrl) return null;
  const match = rawUrl
    .trim()
    .match(/instagram\.com\/(?:[\w.]+\/)?(p|reels?|tv)\/([a-zA-Z0-9_-]+)/i);
  if (!match) return null;
  const postType = match[1].toLowerCase().startsWith("reel") ? "reel" : "p";
  const code = match[2];
  return {
    cleanUrl: `https://www.instagram.com/${postType}/${code}/`,
    postType,
    code,
    embedUrl: `https://www.instagram.com/${postType}/${code}/embed`,
  };
}

interface GaleriEditorFormProps {
  editingItem: GaleriItem | null;
  onSave: (values: GaleriFormValues) => void;
  onCancel: () => void;
}

function GaleriEditorForm({
  editingItem,
  onSave,
  onCancel,
}: GaleriEditorFormProps) {
  const { uploadFoto, uploadVideo, previewMedia } = useGaleri();

  // Compute initial states directly from props
  const [type, setType] = useState<SingleMediaType>(
    editingItem?.type || "PHOTO",
  );
  const [sumberVideo, setSumberVideo] = useState<SumberVideo>(
    editingItem?.sumberVideo || (editingItem?.type === "VIDEO" && !editingItem.youtubeVideoId ? "UPLOAD" : "YOUTUBE"),
  );
  const [title, setTitle] = useState(editingItem?.title || "");
  const [deskripsi, setDeskripsi] = useState(editingItem?.deskripsi || "");
  const isInitialCustom = Boolean(
    editingItem?.kategoriKegiatan &&
    !KATEGORI_GALERI_OPTIONS.includes(editingItem.kategoriKegiatan as KategoriGaleri),
  );
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(isInitialCustom);
  const [customKategori, setCustomKategori] = useState<string>(
    isInitialCustom ? editingItem?.kategoriKegiatan || "" : "",
  );
  const [kategori, setKategori] = useState<string>(
    isInitialCustom
      ? "Lainnya"
      : editingItem?.kategoriKegiatan || "Kongres & Pelantikan",
  );
  const [url, setUrl] = useState(editingItem?.url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    editingItem?.thumbnailUrl || "",
  );

  // Default ISO YYYY-MM-DD
  const defaultDate = editingItem?.tanggal
    ? (editingItem.tanggal.includes("T") ? editingItem.tanggal.split("T")[0] : editingItem.tanggal)
    : new Date().toISOString().split("T")[0];
  const [tanggal, setTanggal] = useState<string>(defaultDate);

  const [lokasi, setLokasi] = useState(editingItem?.lokasi || "");
  const [duration, setDuration] = useState(editingItem?.duration || "");
  const [featured, setFeatured] = useState(
    Boolean(editingItem?.featured && editingItem?.type === "VIDEO" && editingItem?.status !== "ARCHIVED"),
  );
  const [status, setStatus] = useState<StatusPublikasi>(
    editingItem?.status || "PUBLISHED",
  );
  const [penempatan, setPenempatan] = useState<PenempatanMedia[]>(
    editingItem?.penempatan || ["GALERI"],
  );

  // Upload & Preview states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [uploadedVideoInfo, setUploadedVideoInfo] = useState<{
    originalName?: string;
    size?: number;
  } | null>(null);

  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Date parsing for CalendarPicker
  const parsedDate = useMemo(() => {
    if (!tanggal) return undefined;
    const parts = tanggal.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return undefined;
  }, [tanggal]);

  // Derived YouTube ID and Thumbnail
  const youtubeId =
    type === "VIDEO" && sumberVideo === "YOUTUBE" ? extractYouTubeId(url) : null;

  // Derived Instagram Info
  const instagramInfo = useMemo(() => {
    if (type !== "INSTAGRAM" || !url) return null;
    return normalizeInstagramUrl(url);
  }, [type, url]);

  const effectiveThumbnail =
    thumbnailUrl ||
    (type === "VIDEO" && youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : "");

  // Auto-verify URL when changed (Debounced 400ms) per Modern Web Guidance
  const lastVerifiedUrlRef = useRef<string>("");

  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      lastVerifiedUrlRef.current = "";
      return;
    }

    if (trimmed === lastVerifiedUrlRef.current) return;

    if (type === "VIDEO" && sumberVideo === "YOUTUBE") {
      const yId = extractYouTubeId(trimmed);
      if (!yId) return;

      const timer = setTimeout(async () => {
        try {
          setIsPreviewing(true);
          lastVerifiedUrlRef.current = trimmed;
          const preview = await previewMedia(trimmed, "VIDEO");
          if (preview) {
            if (!title && preview.title) setTitle(preview.title);
            if (preview.thumbnailUrl && !thumbnailUrl) {
              setThumbnailUrl(preview.thumbnailUrl);
            }
            if (preview.duration && !duration) {
              setDuration(preview.duration);
            }
          }
        } catch {
          // Graceful fallback: client regex already extracted valid YouTube ID
        } finally {
          setIsPreviewing(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    }

    if (type === "INSTAGRAM") {
      const ig = normalizeInstagramUrl(trimmed);
      if (!ig) return;

      // Automatically strip tracking query parameters to keep DB canonical
      if (trimmed !== ig.cleanUrl) {
        setUrl(ig.cleanUrl);
        return;
      }

      const timer = setTimeout(async () => {
        try {
          setIsPreviewing(true);
          lastVerifiedUrlRef.current = ig.cleanUrl;
          await previewMedia(ig.cleanUrl, "INSTAGRAM");
        } catch {
          // Graceful fallback
        } finally {
          setIsPreviewing(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [url, type, sumberVideo, previewMedia, title, thumbnailUrl, duration]);

  // Handle instant onPaste normalization for Instagram URLs
  const handleInstagramPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text");
      const ig = normalizeInstagramUrl(text);
      if (ig) {
        e.preventDefault();
        setUrl(ig.cleanUrl);
      }
    },
    [],
  );

  // Handle Photo Upload
  const handlePhotoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadMessage("Mengunggah foto...");
      const uploadedUrl = await uploadFoto(file);
      setUrl(uploadedUrl);
      if (!thumbnailUrl) setThumbnailUrl(uploadedUrl);
      toast.success("Foto berhasil diunggah!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunggah foto",
      );
    } finally {
      setIsUploading(false);
      setUploadMessage(null);
      if (e.target) e.target.value = "";
    }
  };

  // Handle Video Upload (Max 50MB)
  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error(
        "Ukuran file video melebihi batas 50MB. Harap kompres video atau gunakan tautan YouTube.",
      );
      if (e.target) e.target.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setUploadMessage(
        `Mengunggah video (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`,
      );
      const res = await uploadVideo(file);
      setUrl(res.url);
      setUploadedVideoInfo({
        originalName: res.originalName || file.name,
        size: res.size || file.size,
      });
      toast.success("Video lokal berhasil diunggah!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunggah video",
      );
    } finally {
      setIsUploading(false);
      setUploadMessage(null);
      if (e.target) e.target.value = "";
    }
  };

  // Handle Cover Thumbnail Upload
  const handleThumbFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadMessage("Mengunggah cover...");
      const uploadedUrl = await uploadFoto(file);
      setThumbnailUrl(uploadedUrl);
      toast.success("Gambar cover berhasil diunggah!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunggah cover",
      );
    } finally {
      setIsUploading(false);
      setUploadMessage(null);
      if (e.target) e.target.value = "";
    }
  };


  const togglePenempatan = (target: PenempatanMedia) => {
    if (penempatan.includes(target)) {
      if (penempatan.length === 1) {
        toast.warning("Media harus tampil minimal di satu lokasi.");
        return;
      }
      setPenempatan(penempatan.filter((p) => p !== target));
    } else {
      setPenempatan([...penempatan, target]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul dokumentasi wajib diisi");
      return;
    }

    if (!url.trim()) {
      toast.error("URL atau file media wajib disertakan");
      return;
    }

    if (isCustomCategory && !customKategori.trim()) {
      toast.error("Nama kategori kegiatan kustom wajib diisi");
      return;
    }

    if (!tanggal.trim()) {
      toast.error("Tanggal pelaksanaan kegiatan wajib dipilih");
      return;
    }

    // Determine final thumbnail (Sanitized against invalid URLs)
    let finalThumbnail = getSafeImageSrc(effectiveThumbnail, "/footage/image1.webp");
    if (finalThumbnail === "/footage/image1.webp" && type === "PHOTO" && url.trim()) {
      finalThumbnail = getSafeImageSrc(url.trim(), "/footage/image1.webp");
    }

    const finalKategori = isCustomCategory
      ? customKategori.trim()
      : kategori.trim();

    const finalFeatured =
      type === "VIDEO" && status !== "ARCHIVED" ? featured : false;

    const finalUrl =
      type === "INSTAGRAM" && instagramInfo
        ? instagramInfo.cleanUrl
        : url.trim();

    const payload: GaleriFormValues = {
      title: title.trim(),
      deskripsi: deskripsi.trim(),
      type,
      url: finalUrl,
      thumbnailUrl: finalThumbnail,
      kategoriKegiatan: finalKategori,
      tanggal: tanggal.trim() || defaultDate,
      lokasi: lokasi.trim() || undefined,
      duration: type === "VIDEO" ? duration.trim() || undefined : undefined,
      youtubeVideoId:
        type === "VIDEO" && sumberVideo === "YOUTUBE" && youtubeId
          ? youtubeId
          : undefined,
      sumberVideo: type === "VIDEO" ? sumberVideo : null,
      instagramUrl: type === "INSTAGRAM" ? finalUrl : undefined,
      penempatan,
      featured: finalFeatured,
      status,
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      {/* 1. Tipe Media Selector */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Format Media Dokumentasi
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              value: "PHOTO" as const,
              label: "Galeri Foto",
              icon: Camera,
              color: "text-blue-600",
            },
            {
              value: "VIDEO" as const,
              label: "Video Liputan",
              icon: Film,
              color: "text-red-600",
            },
            {
              value: "INSTAGRAM" as const,
              label: "Feed Instagram",
              icon: FaInstagram,
              color: "text-pink-600",
            },
          ].map((t) => {
            const isSelected = type === t.value;
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setType(t.value);
                  if (t.value !== "VIDEO") {
                    setFeatured(false);
                  }
                  if (t.value !== type) {
                    setUrl("");
                    setThumbnailUrl("");
                    setUploadedVideoInfo(null);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                    : "border-border/80 bg-card hover:bg-muted text-muted-foreground",
                )}
              >
                <Icon className={cn("size-5", isSelected ? t.color : "")} />
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected && "font-semibold text-foreground",
                  )}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Media Specific Inputs & Upload Handler */}
      <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-4">
        {/* === A. VIDEO TAB === */}
        {type === "VIDEO" && (
          <div className="space-y-4">
            {/* Sumber Video Selector: YouTube vs Upload 50MB */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-muted/60 border border-border/60 max-w-sm">
              <button
                type="button"
                onClick={() => {
                  setSumberVideo("YOUTUBE");
                  setUrl("");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer",
                  sumberVideo === "YOUTUBE"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <FaYoutube className="size-3.5 text-red-600" />
                <span>Tautan YouTube</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSumberVideo("UPLOAD");
                  setUrl("");
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer",
                  sumberVideo === "UPLOAD"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Upload className="size-3.5 text-blue-600" />
                <span>Upload Video (Maks 50MB)</span>
              </button>
            </div>

            {/* YouTube Link Mode */}
            {sumberVideo === "YOUTUBE" ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="video-url" className="text-xs font-medium">
                      URL Video YouTube <span className="text-rose-500">*</span>
                    </Label>
                    {youtubeId && (
                      <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                        <Check className="size-3" /> Terdeteksi (ID: {youtubeId})
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="video-url"
                      placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                    <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Mendukung link video, shorts, atau embed resmi YouTube. Tautan diverifikasi secara otomatis.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="video-duration" className="text-xs font-medium">
                      Durasi Video (Opsional)
                    </Label>
                    <div className="relative">
                      <Input
                        id="video-duration"
                        placeholder="Contoh: 14:32 atau 08:45"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="video-thumb" className="text-xs font-medium">
                      URL Thumbnail Kustom (Opsional)
                    </Label>
                    <Input
                      id="video-thumb"
                      placeholder="Biarkan kosong untuk thumbnail otomatis"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Live YouTube Preview */}
                {youtubeId ? (
                  <div className="pt-2">
                    <p className="text-xs font-semibold mb-1.5 text-emerald-600 flex items-center gap-1">
                      <Check className="size-3.5" /> Video Terverifikasi (ID: {youtubeId})
                    </p>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-md border border-border">
                      <CenteredLoadingOverlay
                        isLoading={isPreviewing}
                        message="Memverifikasi video YouTube..."
                      />
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
                        title="Live Preview YouTube"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  url.trim() && (
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" /> Tautan belum dikenali sebagai URL YouTube yang valid.
                    </p>
                  )
                )}
              </div>
            ) : (
              /* Local Video Upload Mode (Max 50MB) */
              <div className="space-y-3">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />

                <div className="border-2 border-dashed border-border rounded-xl p-5 text-center bg-card hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-2">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileVideo className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Pilih Berkas Video (MP4, WebM, MOV)
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Batas maksimal file: 50MB. Disimpan di server internal PIKI.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => videoInputRef.current?.click()}
                    className="cursor-pointer gap-2 mt-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>{uploadMessage || "Mengunggah..."}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5" />
                        <span>Pilih Berkas Video</span>
                      </>
                    )}
                  </Button>
                </div>

                {url && (
                  <div className="p-3 rounded-lg border border-border/80 bg-background flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileVideo className="size-4 text-primary shrink-0" />
                      <div className="truncate">
                        <span className="font-medium block truncate text-foreground">
                          {uploadedVideoInfo?.originalName || url.split("/").pop()}
                        </span>
                        {uploadedVideoInfo?.size && (
                          <span className="text-[10px] text-muted-foreground">
                            {(uploadedVideoInfo.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 shrink-0">
                      Tersimpan di Server
                    </Badge>
                  </div>
                )}

                {/* Cover Thumbnail for Uploaded Video */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-medium">
                    Gambar Cover Video (Wajib untuk Video Lokal) <span className="text-rose-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="URL Gambar Cover atau unggah file..."
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      required={sumberVideo === "UPLOAD"}
                    />
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => thumbInputRef.current?.click()}
                      className="cursor-pointer shrink-0"
                    >
                      <Camera className="size-3.5 mr-1" />
                      Unggah Cover
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === B. PHOTO TAB === */}
        {type === "PHOTO" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="photo-url" className="text-xs font-medium">
                URL Foto Resolusi Tinggi <span className="text-rose-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="photo-url"
                    placeholder="https://... atau tempel URL foto"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (!thumbnailUrl) setThumbnailUrl(e.target.value);
                    }}
                    required
                  />
                  <Camera className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => photoInputRef.current?.click()}
                  className="cursor-pointer shrink-0 gap-1.5"
                >
                  {isUploading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  <span>Unggah Foto</span>
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Format didukung: JPEG, PNG, WebP (maksimal 5MB).
              </p>
            </div>

            {/* Live Photo Preview */}
            {(url.trim() || thumbnailUrl.trim()) && (
              <div className="pt-2">
                <p className="text-xs font-semibold mb-1 text-muted-foreground">
                  Pratinjau Foto:
                </p>
                <div className="relative aspect-16/9 w-full max-h-48 rounded-xl overflow-hidden bg-muted border border-border">
                  <Image
                    src={getSafeImageSrc(thumbnailUrl.trim() || url.trim())}
                    alt="Preview Foto"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* === C. INSTAGRAM TAB === */}
        {type === "INSTAGRAM" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ig-url" className="text-xs font-medium">
                  URL Postingan / Reel Instagram <span className="text-rose-500">*</span>
                </Label>
                {instagramInfo && (
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <Check className="size-3" /> {instagramInfo.postType === "reel" ? "Reels" : "Post"} Terdeteksi (ID: {instagramInfo.code})
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="ig-url"
                  placeholder="https://www.instagram.com/p/... atau https://www.instagram.com/reel/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onPaste={handleInstagramPaste}
                  required
                />
                <FaInstagram className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Mendukung post foto, carousel, dan video Reels publik. Tautan diverifikasi otomatis dan parameter tracking langsung dibersihkan.
              </p>
            </div>

            {/* Live Instagram Embed Preview */}
            {instagramInfo ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="size-3.5" /> Pratinjau Feed Instagram
                  </p>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ID: {instagramInfo.code}
                  </span>
                </div>
                <div className="relative aspect-4/5 max-h-[460px] w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-card border border-border shadow-xs">
                  <CenteredLoadingOverlay
                    isLoading={isPreviewing}
                    message="Memverifikasi tautan Instagram..."
                  />
                  <iframe
                    src={instagramInfo.embedUrl}
                    title="Pratinjau Live Instagram"
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              url.trim() && (
                <p className="text-xs text-amber-600 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" /> Tautan belum dikenali sebagai link Post/Reel Instagram yang valid.
                </p>
              )
            )}

            {/* Cover / Thumbnail Post Instagram */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ig-thumb" className="text-xs font-medium">
                  Gambar Cover / Thumbnail Post <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Wajib untuk kartu galeri
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="ig-thumb"
                  placeholder="URL cover postingan Instagram..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  required
                />
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => thumbInputRef.current?.click()}
                  className="cursor-pointer shrink-0 gap-1.5"
                >
                  {isUploading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  <span>Unggah Cover</span>
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Unggah tangkapan layar atau gambar cover postingan untuk kartu galeri publik.
              </p>
            </div>

            {thumbnailUrl.trim() && (
              <div className="pt-2">
                <p className="text-xs font-semibold mb-1 text-muted-foreground">
                  Pratinjau Cover Grid:
                </p>
                <div className="relative aspect-square size-36 rounded-xl overflow-hidden bg-muted border border-border shadow-xs">
                  <Image
                    src={getSafeImageSrc(thumbnailUrl.trim())}
                    alt="Preview Instagram"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. General Information Fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="media-title" className="text-xs font-medium">
            Judul Dokumentasi / Acara <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="media-title"
            placeholder="Contoh: Kongres Nasional DPP PIKI 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kategori Kegiatan - Wajib menggunakan Popover per StyleGuide dengan Opsi Lainnya */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Kategori Kegiatan <span className="text-rose-500">*</span>
            </Label>
            <Popover
              open={openCategoryPopover}
              onOpenChange={setOpenCategoryPopover}
            >
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCategoryPopover}
                    className="w-full justify-between cursor-pointer font-normal"
                  >
                    <span className="truncate">
                      {isCustomCategory
                        ? customKategori
                          ? `Lainnya: ${customKategori}`
                          : "Lainnya (Kategori Kustom)"
                        : kategori}
                    </span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-72 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Cari kategori kegiatan..." />
                  <CommandList>
                    <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {KATEGORI_GALERI_OPTIONS.map((opt) => (
                        <CommandItem
                          key={opt}
                          value={opt}
                          onSelect={() => {
                            setKategori(opt);
                            setIsCustomCategory(false);
                            setOpenCategoryPopover(false);
                          }}
                          className="cursor-pointer flex items-center justify-between"
                        >
                          <span>{opt}</span>
                          <Check
                            className={cn(
                              "size-4 text-primary",
                              !isCustomCategory && kategori === opt
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                      <CommandItem
                        value="Lainnya"
                        onSelect={() => {
                          setKategori("Lainnya");
                          setIsCustomCategory(true);
                          setOpenCategoryPopover(false);
                        }}
                        className="cursor-pointer flex items-center justify-between border-t border-border/60 text-primary font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <Plus className="size-3.5" />
                          <span>Lainnya (Ketik Baru)...</span>
                        </span>
                        <Check
                          className={cn(
                            "size-4 text-primary",
                            isCustomCategory ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Input custom nama kegiatan jika memilih 'Lainnya' */}
            {isCustomCategory && (
              <div className="pt-1.5 space-y-1 animate-in fade-in-50 duration-200">
                <Input
                  placeholder="Ketikkan nama kategori kegiatan baru..."
                  value={customKategori}
                  onChange={(e) => setCustomKategori(e.target.value)}
                  maxLength={100}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Nama kategori khusus ini akan disimpan dan tampil di filter.
                </p>
              </div>
            )}
          </div>

          {/* Tanggal Pelaksanaan (Date Picker Komponen seperti Registrasi Anggota) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Tanggal Pelaksanaan <span className="text-rose-500">*</span>
            </Label>
            <Popover open={openDatePicker} onOpenChange={setOpenDatePicker} modal={false}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-between font-normal text-left cursor-pointer",
                      !tanggal && "text-muted-foreground",
                    )}
                  >
                    <span>
                      {tanggal
                        ? formatTanggalIndo(tanggal, { month: "long" })
                        : "Pilih tanggal pelaksanaan"}
                    </span>
                    <Calendar className="size-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={parsedDate}
                  onSelect={(date) => {
                    if (date) {
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, "0");
                      const d = String(date.getDate()).padStart(2, "0");
                      setTanggal(`${y}-${m}-${d}`);
                    }
                    setOpenDatePicker(false);
                  }}
                  captionLayout="dropdown-years"
                  defaultMonth={parsedDate || new Date()}
                  startMonth={new Date(2010, 0)}
                  endMonth={new Date(2035, 11)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Lokasi Pelaksanaan */}
        <div className="space-y-1.5">
          <Label htmlFor="media-location" className="text-xs font-medium">
            Lokasi Pelaksanaan (Opsional)
          </Label>
          <div className="relative">
            <Input
              id="media-location"
              placeholder="Contoh: Grand Sahid Jaya, Jakarta Pusat"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Deskripsi */}
        <div className="space-y-1.5">
          <Label htmlFor="media-desc" className="text-xs font-medium">
            Deskripsi Dokumentasi
          </Label>
          <Textarea
            id="media-desc"
            placeholder="Rangkum momen penting, delegasi yang hadir, dan hasil yang dicapai dalam kegiatan ini..."
            rows={3}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Controls: Penempatan, Spotlight Highlight & Publication Status */}
      <div className="space-y-4 pt-3 border-t border-border">
        {/* Penempatan Tampil */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">
            Penempatan Tampil Konten
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => togglePenempatan("GALERI")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between",
                penempatan.includes("GALERI")
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                <Globe className="size-4 shrink-0" />
                <span className="text-xs">Halaman Galeri Publik</span>
              </div>
              <input
                type="checkbox"
                checked={penempatan.includes("GALERI")}
                readOnly
                className="size-4 rounded accent-primary pointer-events-none"
              />
            </button>

            <button
              type="button"
              onClick={() => togglePenempatan("BERANDA")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between",
                penempatan.includes("BERANDA")
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 shrink-0" />
                <span className="text-xs">Beranda Utama (Landing)</span>
              </div>
              <input
                type="checkbox"
                checked={penempatan.includes("BERANDA")}
                readOnly
                className="size-4 rounded accent-primary pointer-events-none"
              />
            </button>
          </div>
        </div>

        {/* Spotlight & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Spotlight Toggle (Khusus Video & Non-Archived) */}
          <div
            className={cn(
              "p-3.5 rounded-xl border border-border/80 bg-card flex items-center justify-between gap-3 transition-opacity",
              (type !== "VIDEO" || status === "ARCHIVED") && "opacity-60 bg-muted/20",
            )}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles
                  className={cn(
                    "size-4",
                    type === "VIDEO" && status !== "ARCHIVED"
                      ? "text-amber-500"
                      : "text-muted-foreground",
                  )}
                />
                <span className="text-xs font-semibold text-foreground">
                  Spotlight Utama
                </span>
                {type !== "VIDEO" && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground py-0">
                    Khusus Video
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {type !== "VIDEO"
                  ? "Hanya video yang dapat dijadikan spotlight utama."
                  : status === "ARCHIVED"
                    ? "Item arsip tidak dapat dijadikan spotlight."
                    : "Tampil di sorotan 3D hero. Maksimal 1 video aktif."}
              </p>
            </div>
            <input
              type="checkbox"
              id="featured-toggle"
              checked={featured && type === "VIDEO" && status !== "ARCHIVED"}
              disabled={type !== "VIDEO" || status === "ARCHIVED"}
              onChange={(e) => setFeatured(e.target.checked)}
              className="size-4.5 rounded accent-primary cursor-pointer disabled:cursor-not-allowed"
            />
          </div>

          {/* Status Publikasi (3 Jenis: Draf, Tayang, Arsip) */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-card flex flex-col justify-between gap-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground">
                Status Publikasi
              </span>
              <p className="text-[11px] text-muted-foreground">
                {status === "PUBLISHED"
                  ? "Tayang langsung ke publik"
                  : status === "DRAFT"
                    ? "Tersimpan sebagai draf internal"
                    : "Diarsipkan (tidak tampil ke publik)"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setStatus("DRAFT")}
                className={cn(
                  "py-1 px-2 rounded-md text-xs font-medium text-center transition-colors cursor-pointer",
                  status === "DRAFT"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                Draf
              </button>
              <button
                type="button"
                onClick={() => setStatus("PUBLISHED")}
                className={cn(
                  "py-1 px-2 rounded-md text-xs font-medium text-center transition-colors cursor-pointer",
                  status === "PUBLISHED"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                Tayang
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatus("ARCHIVED");
                  setFeatured(false);
                }}
                className={cn(
                  "py-1 px-2 rounded-md text-xs font-medium text-center transition-colors cursor-pointer",
                  status === "ARCHIVED"
                    ? "bg-slate-500/15 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                Arsip
              </button>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isUploading}
          className="cursor-pointer font-medium"
        >
          {isUploading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              <span>Menyimpan Media...</span>
            </>
          ) : (
            editingItem ? "Simpan Perubahan" : "Tambah Media"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function GaleriEditorDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
}: GaleriEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {editingItem ? "Edit Dokumentasi Media" : "Tambah Dokumentasi Media"}
          </DialogTitle>
          <DialogDescription>
            Kelola arsip foto, video liputan YouTube / lokal (hingga 50MB), atau konten Instagram resmi PIKI.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <GaleriEditorForm
            key={editingItem?.id || "create-new"}
            editingItem={editingItem}
            onSave={(values) => {
              onSave(values);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
