"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArtikelBerita, BeritaCategory, BeritaStatus } from "../types";
import {
  BERITA_CATEGORIES,
  BERITA_STATUSES,
  PRESET_BANNERS,
} from "../constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "./markdown-renderer";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link2,
  Code,
  Eye,
  FileEdit,
  Tag,
  User,
  Layers,
  CheckCircle,
  X,
} from "lucide-react";

interface BeritaEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ArtikelBerita | null;
  onSave: (
    berita: Omit<ArtikelBerita, "id" | "views" | "createdAt" | "updatedAt"> & {
      id?: string;
    }
  ) => void;
}

interface BeritaEditorContentProps {
  initialData?: ArtikelBerita | null;
  onClose: () => void;
  onSave: (
    berita: Omit<ArtikelBerita, "id" | "views" | "createdAt" | "updatedAt"> & {
      id?: string;
    }
  ) => void;
}

function BeritaEditorContent({
  initialData,
  onClose,
  onSave,
}: BeritaEditorContentProps) {
  const isEditing = !!initialData;

  const [activeTab, setActiveTab] = useState<"konten" | "metadata">("konten");
  const [editorMode, setEditorMode] = useState<"tulis" | "pratinjau">("tulis");

  // Initialized directly with initialData, eliminating cascading setState in effect
  const [judul, setJudul] = useState(initialData?.judul || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [kategori, setKategori] = useState<BeritaCategory>(
    initialData?.kategori || "SEMINAR_KAJIAN"
  );
  const [status, setStatus] = useState<BeritaStatus>(
    initialData?.status || "PUBLISHED"
  );
  const [penulisNama, setPenulisNama] = useState(
    initialData?.penulis.nama || "Biro Media & Publikasi DPP PIKI"
  );
  const [penulisRole, setPenulisRole] = useState(
    initialData?.penulis.role || "DPP PIKI"
  );
  const [ringkasan, setRingkasan] = useState(initialData?.ringkasan || "");
  const [konten, setKonten] = useState(
    initialData?.konten ||
      `## Latar Belakang & Urgensi

Tuliskan pengantar berita di sini...

### Poin Utama Kegiatan:
1. Poin pertama pembahasan.
2. Poin kedua rekomendasi kebijakan.
3. Tindak lanjut program wilayah.

> "Kutipan pernyataan narasumber atau pimpinan organisasi."`
  );
  const [bannerUrl, setBannerUrl] = useState(
    initialData?.bannerUrl || PRESET_BANNERS[0].url
  );
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags.join(", ") || "PIKI, Cendekiawan, Publikasi"
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug from judul if slug is empty or user is creating
  const handleJudulChange = (val: string) => {
    setJudul(val);
    if (!isEditing || slug === "") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 60);
      setSlug(generatedSlug);
    }
  };

  // Markdown Helper Actions
  const insertMarkdown = (
    before: string,
    after: string = "",
    defaultText: string = "teks"
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultText;
    const replacement = `${before}${selected}${after}`;

    const newContent =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    setKonten(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  // Submit Handler
  const handleSubmit = (overrideStatus?: BeritaStatus) => {
    if (!judul.trim()) {
      alert("Judul artikel tidak boleh kosong.");
      return;
    }

    const finalStatus = overrideStatus || status;
    const tagsArray = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      id: initialData?.id,
      judul,
      slug: slug || judul.toLowerCase().replace(/\s+/g, "-"),
      kategori,
      status: finalStatus,
      penulis: {
        nama: penulisNama.trim() || "DPP PIKI",
        role: penulisRole.trim() || undefined,
        avatarUrl:
          initialData?.penulis.avatarUrl ||
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      },
      ringkasan,
      konten,
      bannerUrl: bannerUrl.trim() || PRESET_BANNERS[0].url,
      tags: tagsArray,
      publishedAt:
        finalStatus === "PUBLISHED"
          ? initialData?.publishedAt || new Date().toISOString()
          : null,
    });
  };

  const wordCount = konten.trim() ? konten.trim().split(/\s+/).length : 0;
  const charCount = konten.length;

  return (
    <>
      {/* 1. Dialog Header */}
      <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileEdit className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {isEditing ? "Edit Artikel Berita" : "Tambah Artikel Berita Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Kelola naskah publikasi, metadata editorial, dan media banner organisasi.
              </DialogDescription>
            </div>
          </div>

          {/* Quick Status Tag & Close Button */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`hidden sm:inline-flex text-xs ${
                status === "PUBLISHED"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                  status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {status === "PUBLISHED" ? "Mode Tayang" : "Mode Draft"}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
              title="Tutup Dialog"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Tutup</span>
            </Button>
          </div>
        </div>
      </DialogHeader>

      {/* 2. Main Navigation Tabs */}
      <div className="px-6 pt-3 bg-card border-b border-border/60">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "konten" | "metadata")}
        >
          <TabsList className="bg-muted/80 p-0.5 rounded-md h-8">
            <TabsTrigger
              value="konten"
              className="text-xs px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow-none rounded"
            >
              <FileEdit className="h-3.5 w-3.5 mr-1.5" />
              Konten & Naskah
            </TabsTrigger>
            <TabsTrigger
              value="metadata"
              className="text-xs px-3 py-1 data-[state=active]:bg-background data-[state=active]:shadow-none rounded"
            >
              <Layers className="h-3.5 w-3.5 mr-1.5" />
              Metadata, Penulis & Banner
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 3. Scrollable Tab Contents with min-h-0 and data-lenis-prevent */}
      <div
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 space-y-4"
      >
        {activeTab === "konten" && (
          <div className="space-y-4">
            {/* Judul Artikel */}
            <div className="space-y-1.5">
              <Label htmlFor="judul" className="text-xs font-semibold">
                Judul Artikel <span className="text-destructive">*</span>
              </Label>
              <Input
                id="judul"
                placeholder="Contoh: DPP PIKI Gelar Simposium Nasional Transformasi Digital..."
                value={judul}
                onChange={(e) => handleJudulChange(e.target.value)}
                className="h-10 text-sm font-medium bg-background border-border/80"
              />
            </div>

            {/* Ringkasan / Lead Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="ringkasan" className="text-xs font-semibold">
                  Ringkasan Berita (Lead Paragraph)
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {ringkasan.length}/250 karakter
                </span>
              </div>
              <Textarea
                id="ringkasan"
                rows={2}
                maxLength={250}
                placeholder="Ringkasan 1-2 kalimat pengantar yang akan tampil pada kartu artikel..."
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
                className="text-xs resize-none bg-background border-border/80"
              />
            </div>

            {/* Markdown Rich Editor Section */}
            <div className="space-y-1.5 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <Label className="text-xs font-semibold">
                  Isi Konten Artikel (Markdown Format)
                </Label>

                {/* Mode Tulis vs Pratinjau */}
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded border border-border/60">
                  <button
                    type="button"
                    onClick={() => setEditorMode("tulis")}
                    className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] rounded transition-colors ${
                      editorMode === "tulis"
                        ? "bg-background text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FileEdit className="h-3 w-3" />
                    Tulis
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("pratinjau")}
                    className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] rounded transition-colors ${
                      editorMode === "pratinjau"
                        ? "bg-background text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    Pratinjau
                  </button>
                </div>
              </div>

              {editorMode === "tulis" ? (
                <div className="border border-border/80 rounded-lg overflow-hidden bg-background">
                  {/* Markdown Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-muted/40 border-b border-border/60 text-muted-foreground">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("**", "**", "teks tebal")}
                      className="h-7 w-7 p-0"
                      title="Tebal (Bold)"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("*", "*", "teks miring")}
                      className="h-7 w-7 p-0"
                      title="Miring (Italic)"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <div className="h-4 w-px bg-border/60 mx-0.5" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("## ", "\n", "Judul Bagian")}
                      className="h-7 w-7 p-0"
                      title="Heading 2"
                    >
                      <Heading2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("### ", "\n", "Subjudul")}
                      className="h-7 w-7 p-0"
                      title="Heading 3"
                    >
                      <Heading3 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="h-4 w-px bg-border/60 mx-0.5" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        insertMarkdown("> ", "\n", "Kutipan pernyataan...")
                      }
                      className="h-7 w-7 p-0"
                      title="Kutipan (Blockquote)"
                    >
                      <Quote className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("- ", "\n", "Poin daftar")}
                      className="h-7 w-7 p-0"
                      title="Daftar Bullet"
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        insertMarkdown("1. ", "\n", "Poin berurutan")
                      }
                      className="h-7 w-7 p-0"
                      title="Daftar Berurutan"
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                    </Button>
                    <div className="h-4 w-px bg-border/60 mx-0.5" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        insertMarkdown("[", "](https://example.com)", "Teks Tautan")
                      }
                      className="h-7 w-7 p-0"
                      title="Tautan Link"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        insertMarkdown("```\n", "\n```", "kode sumber")
                      }
                      className="h-7 w-7 p-0"
                      title="Blok Kode"
                    >
                      <Code className="h-3.5 w-3.5" />
                    </Button>

                    <div className="ml-auto text-[11px] text-muted-foreground/80 px-2 font-mono">
                      {wordCount} kata · {charCount} kar
                    </div>
                  </div>

                  {/* Textarea Editor */}
                  <Textarea
                    ref={textareaRef}
                    rows={12}
                    placeholder="Ketik naskah artikel Anda di sini..."
                    value={konten}
                    onChange={(e) => setKonten(e.target.value)}
                    className="border-0 rounded-none focus-visible:ring-0 p-3 font-mono text-xs leading-relaxed resize-none"
                  />
                </div>
              ) : (
                /* Live Render Preview Tab */
                <div
                  data-lenis-prevent
                  className="border border-border/80 rounded-lg p-5 bg-card min-h-[300px] max-h-[360px] overflow-y-auto overscroll-contain"
                >
                  {konten ? (
                    <MarkdownRenderer content={konten} />
                  ) : (
                    <p className="text-muted-foreground italic text-xs">
                      Belum ada konten yang ditulis.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "metadata" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kategori Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Kategori Publikasi <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={kategori}
                  onValueChange={(val) => setKategori(val as BeritaCategory)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {BERITA_CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        className="text-xs"
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Publikasi */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Status Penerbitan <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as BeritaStatus)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {BERITA_STATUSES.map((st) => (
                      <SelectItem
                        key={st.value}
                        value={st.value}
                        className="text-xs"
                      >
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Penulis Nama */}
              <div className="space-y-1.5">
                <Label htmlFor="penulis" className="text-xs font-semibold">
                  Nama Penulis / Kontributor
                </Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="penulis"
                    value={penulisNama}
                    onChange={(e) => setPenulisNama(e.target.value)}
                    placeholder="Nama Lengkap & Gelar"
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Jabatan / Afiliasi Penulis */}
              <div className="space-y-1.5">
                <Label htmlFor="penulisRole" className="text-xs font-semibold">
                  Jabatan / Afiliasi
                </Label>
                <Input
                  id="penulisRole"
                  value={penulisRole}
                  onChange={(e) => setPenulisRole(e.target.value)}
                  placeholder="Contoh: Bidang Hukum DPP PIKI"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Slug URL Customizer */}
            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-xs font-semibold">
                Slug URL Web (Permalink)
              </Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1.5 rounded-md border border-border">
                  https://dpp-piki.org/berita/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-artikel-berita"
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Tags / Kata Kunci */}
            <div className="space-y-1.5">
              <Label htmlFor="tags" className="text-xs font-semibold">
                Tag / Kata Kunci (Pisahkan dengan koma)
              </Label>
              <div className="relative">
                <Tag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Contoh: Simposium, Etika AI, Kebijakan Publik"
                  className="pl-8 h-9 text-xs"
                />
              </div>
              {/* Live tag badges */}
              <div className="flex flex-wrap gap-1 mt-1">
                {tagsInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] font-mono px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Banner Gambar Section */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Gambar Banner Utama (Rasio 16:9)
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  URL Langsung atau Pilih Preset
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Preset Banner Selector */}
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground">
                  Atau pilih gambar preset bertema kegiatan PIKI:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_BANNERS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBannerUrl(preset.url)}
                      className={`group relative aspect-video rounded-md overflow-hidden border transition-all text-left ${
                        bannerUrl === preset.url
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border/80 hover:border-foreground/40 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                        <span className="text-[9px] text-white font-medium line-clamp-1">
                          {preset.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Live Preview Box */}
              {bannerUrl && (
                <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden border border-border/80 bg-muted mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerUrl}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded">
                    Pratinjau Banner
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Dialog Footer (Solid bg-card) */}
      <DialogFooter className="px-6 py-3.5 border-t border-border/80 bg-card flex flex-row items-center justify-between sm:justify-between shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Batal
        </Button>

        <div className="flex items-center gap-2">
          {status !== "DRAFT" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                handleSubmit("DRAFT");
                onClose();
              }}
              className="text-xs gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              Simpan Sebagai Draft
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => {
              handleSubmit(status === "DRAFT" ? "DRAFT" : "PUBLISHED");
              onClose();
            }}
            className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {isEditing ? "Simpan Perubahan" : "Simpan & Publikasikan"}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

export function BeritaEditorDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: BeritaEditorDialogProps) {
  // Lock body scroll when editor is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl h-[92vh] max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-lg shadow-none border border-border/80 bg-card text-card-foreground"
      >
        {open && (
          <BeritaEditorContent
            key={initialData ? initialData.id : "new-article"}
            initialData={initialData}
            onClose={() => onOpenChange(false)}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
