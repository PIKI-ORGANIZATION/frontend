"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Settings2,
  Tags,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NewsCoverField } from "@/components/news/NewsCoverField";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateNews,
  useCreateNewsKategori,
  useCreateNewsTag,
  useNewsCabangOptions,
  useNewsScope,
  useNewsTaxonomy,
  useUpdateNews,
} from "@/hooks/api/useNews";
import {
  canManageNewsItem,
  NewsItem,
  plainNewsText,
  slugifyJudul,
  tingkatLabel,
  toNewsDatetimeLocal,
} from "@/lib/news";
import { cn } from "@/lib/utils";

const NewsEditor = dynamic(
  () => import("@/components/news/NewsEditor").then((mod) => mod.NewsEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-xl" />,
  },
);

export function NewsForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: NewsItem;
}) {
  const router = useRouter();
  const scope = useNewsScope();
  const taxonomy = useNewsTaxonomy();
  const cabangQuery = useNewsCabangOptions(Boolean(scope?.isManageAll));
  const createNews = useCreateNews();
  const updateNews = useUpdateNews(initial?.uuid || "new");
  const createKategori = useCreateNewsKategori();
  const createTag = useCreateNewsTag();

  const [showNewKategori, setShowNewKategori] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState("");
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const [judul, setJudul] = useState(initial?.judul || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [ringkasan, setRingkasan] = useState(initial?.ringkasan || "");
  const [konten, setKonten] = useState(initial?.konten || "");
  const [thumbnail, setThumbnail] = useState(initial?.url_thumbnail_img || "");
  const [status, setStatus] = useState(initial?.statusNewsUtama || "DRAFT");
  const [publishedAt, setPublishedAt] = useState(
    toNewsDatetimeLocal(initial?.published_at),
  );
  const [selectedCabangUuid, setSelectedCabangUuid] = useState<string | null>(
    initial?.cabangUuid ?? null,
  );
  const effectiveCabangUuid =
    selectedCabangUuid !== null ? selectedCabangUuid : (scope?.cabangId ?? "");
  const [kategori, setKategori] = useState<string[]>(
    initial?.kategori.map((item) => item.uuid) || [],
  );
  const [tags, setTags] = useState<string[]>(
    initial?.tags.map((item) => item.uuid) || [],
  );

  const cabangSelectOptions = useMemo(
    () => [
      { value: "__akun__", label: "Ikuti cabang akun DPP" },
      ...(cabangQuery.data ?? []).map((cabang) => ({
        value: cabang.uuid,
        label: cabang.namaCabang,
        subLabel: cabang.provinsi || undefined,
      })),
    ],
    [cabangQuery.data],
  );

  const { wordCount, readMinutes } = useMemo(() => {
    const plain = plainNewsText(konten);
    const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    return {
      wordCount: words,
      readMinutes: Math.max(1, Math.ceil(words / 200)),
    };
  }, [konten]);

  const pending = createNews.isPending || updateNews.isPending;

  const toggle = (
    list: string[],
    id: string,
    setter: (value: string[]) => void,
  ) => {
    setter(
      list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
    );
  };

  const handleAddKategori = () => {
    const nama = newKategoriName.trim();
    if (nama.length < 3) {
      toast.error("Nama kategori minimal 3 karakter");
      return;
    }
    const generatedSlug = slugifyJudul(nama);
    if (generatedSlug.length < 3) {
      toast.error("Nama kategori harus mengandung huruf atau angka yang valid");
      return;
    }
    createKategori.mutate(
      { nama, slug: generatedSlug },
      {
        onSuccess: (created) => {
          toast.success(`Kategori "${nama}" ditambahkan`);
          if (created?.uuid) {
            setKategori((prev) =>
              prev.includes(created.uuid) ? prev : [...prev, created.uuid],
            );
          }
          setNewKategoriName("");
          setShowNewKategori(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleAddTag = () => {
    const nama_tag = newTagName.trim();
    if (nama_tag.length < 2) {
      toast.error("Nama tag minimal 2 karakter");
      return;
    }
    if (!/^[a-zA-Z0-9\s-]+$/.test(nama_tag)) {
      toast.error("Nama tag hanya boleh huruf, angka, spasi, dan tanda hubung");
      return;
    }
    createTag.mutate(
      { nama_tag },
      {
        onSuccess: (created) => {
          toast.success(`Tag "${nama_tag}" ditambahkan`);
          if (created?.uuid) {
            setTags((prev) =>
              prev.includes(created.uuid) ? prev : [...prev, created.uuid],
            );
          }
          setNewTagName("");
          setShowNewTag(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!scope || !scope.hasCabangBinding) {
      return toast.error("Akun Anda belum memiliki cakupan cabang yang valid.");
    }
    if (mode === "create" && !scope.canCreate) {
      return toast.error("Anda tidak memiliki izin untuk membuat berita baru.");
    }
    if (
      mode === "edit" &&
      (!scope.canUpdate || !canManageNewsItem(scope, initial))
    ) {
      return toast.error(
        "Anda tidak memiliki izin untuk mengubah berita milik cabang ini.",
      );
    }
    if (judul.trim().length < 5) return toast.error("Judul minimal 5 karakter");
    if (!/^[a-z0-9-]{5,}$/.test(slug)) {
      return toast.error("Slug hanya huruf kecil, angka, dan tanda hubung");
    }
    const plain = plainNewsText(konten);
    if (plain.length < 10)
      return toast.error("Isi berita masih terlalu pendek");
    if (kategori.length === 0 || tags.length === 0) {
      return toast.error("Pilih minimal satu kategori dan satu tag");
    }
    if (
      status === "PUBLISHED" &&
      publishedAt &&
      Number.isNaN(new Date(publishedAt).getTime())
    ) {
      return toast.error("Tanggal terbit tidak valid");
    }

    const words = plain.split(/\s+/).filter(Boolean).length;
    const payload = {
      judul: judul.trim(),
      ringkasan: ringkasan.trim(),
      konten: konten.trim(),
      slug,
      url_thumbnail_img: thumbnail.trim() || null,
      statusNewsUtama: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      published_at:
        status === "PUBLISHED"
          ? publishedAt
            ? new Date(publishedAt).toISOString()
            : new Date().toISOString()
          : null,
      durasi_baca: Math.max(1, Math.ceil(words / 200)),
      kategori,
      tags,
      ...(scope?.isManageAll
        ? { cabangUuid: effectiveCabangUuid || null }
        : {}),
    };

    const action = mode === "create" ? createNews.mutate : updateNews.mutate;
    action(payload, {
      onSuccess: () => {
        toast.success(
          mode === "create" ? "Berita tersimpan" : "Berita diperbarui",
        );
        router.push("/dashboard/berita");
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-7xl flex-col gap-6 py-4 sm:py-6"
    >
      {/* 1. Sticky-style Editorial Header */}
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {mode === "create" ? "Tulis Berita Baru" : "Sunting Berita"}
            </h1>
            {scope && (
              <Badge
                variant="outline"
                className="h-5 rounded-md border-primary/25 bg-primary/10 px-2 text-[11px] font-medium text-primary"
              >
                Redaksi {tingkatLabel(scope.tingkat)}
              </Badge>
            )}
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {!scope
              ? "Menyiapkan ruang redaksi sesuai cabang akun."
              : scope.isManageAll
                ? "Anda dapat menerbitkan berita untuk Pusat (DPP), DPD provinsi, maupun DPC kabupaten/kota."
                : `Berita terkunci pada cabang ${scope.cabangName || tingkatLabel(scope.tingkat)}.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] tabular-nums text-muted-foreground">
            <Clock className="size-3 text-primary" aria-hidden="true" />
            {wordCount} kata · ~{readMinutes} mnt
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            nativeButton={false}
            render={<Link href="/dashboard/berita" />}
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Kembali
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={pending}
            className="cursor-pointer"
          >
            {pending ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-3.5" />
            )}
            {pending
              ? "Menyimpan..."
              : mode === "create"
                ? "Simpan Berita"
                : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      {/* 2. 2-Column SaaS Editorial Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Kolom Kiri (8 col): Ruang Penulisan */}
        <div className="space-y-5 lg:col-span-8">
          <div className="space-y-5 rounded-xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <FileText className="size-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-foreground">
                Konten Artikel
              </h2>
            </div>

            <Field label="Judul Berita">
              <Input
                value={judul}
                onChange={(event) => {
                  const nextJudul = event.target.value;
                  setJudul(nextJudul);
                  if (!slugTouched) setSlug(slugifyJudul(nextJudul));
                }}
                placeholder="Tuliskan judul berita yang jelas dan informatif..."
                className="h-11 text-base font-medium"
              />
            </Field>

            <Field label="Slug URL">
              <div className="flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
                <span className="border-r border-border bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground select-none">
                  /berita/
                </span>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(slugifyJudul(event.target.value));
                  }}
                  placeholder="judul-berita-anda"
                  className="h-9 flex-1 bg-transparent px-3 font-mono text-xs text-foreground outline-none"
                />
              </div>
            </Field>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Ringkasan</Label>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {ringkasan.length} karakter
                </span>
              </div>
              <Textarea
                value={ringkasan}
                onChange={(event) => setRingkasan(event.target.value)}
                placeholder="Ringkasan singkat 1–2 kalimat yang tampil pada daftar berita..."
                className="min-h-24 leading-relaxed"
              />
            </div>

            <Field label="Isi Berita">
              <NewsEditor value={konten} onChange={setKonten} />
            </Field>
          </div>
        </div>

        {/* Kolom Kanan (4 col): Sidebar Metadata Sticky */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:col-span-4">
          {/* Publikasi & Wilayah */}
          <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <Settings2 className="size-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-foreground">
                Publikasi &amp; Wilayah
              </h2>
            </div>

            <Field label="Status Publikasi">
              <Select
                items={{ DRAFT: "Draf", PUBLISHED: "Terbit", ARCHIVED: "Arsip" }}
                value={status}
                onValueChange={(value) => {
                  if (!value) return;
                  setStatus(value);
                  if (value === "PUBLISHED" && !publishedAt) {
                    setPublishedAt(toNewsDatetimeLocal(new Date().toISOString()));
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draf</SelectItem>
                  <SelectItem value="PUBLISHED">Terbit</SelectItem>
                  {mode === "edit" ? (
                    <SelectItem value="ARCHIVED">Arsip</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </Field>

            {status === "PUBLISHED" && (
              <Field label="Tanggal Terbit">
                <Input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(event) => setPublishedAt(event.target.value)}
                  className="dark:[color-scheme:dark]"
                />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Kosongkan untuk memakai waktu saat berita disimpan.
                </p>
              </Field>
            )}

            {scope?.isManageAll && (
              <Field label="Pemilik Berita (Wilayah / Cabang)">
                <SearchableSelect
                  value={effectiveCabangUuid || "__akun__"}
                  onValueChange={(value) =>
                    setSelectedCabangUuid(value === "__akun__" ? "" : value)
                  }
                  options={cabangSelectOptions}
                  placeholder="Pilih wilayah pemilik..."
                  searchPlaceholder="Cari wilayah / cabang..."
                  emptyMessage="Wilayah tidak ditemukan."
                  icon={<Building2 className="size-3.5 text-muted-foreground" />}
                  triggerClassName="h-9 rounded-sm px-3 dark:bg-input/30 dark:hover:bg-input/50"
                />
              </Field>
            )}
          </div>

          {/* Gambar Sampul */}
          <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <ImageIcon className="size-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-foreground">
                Gambar Sampul
              </h2>
            </div>
            <NewsCoverField value={thumbnail} onChange={setThumbnail} />
          </div>

          {/* Taksonomi: Kategori & Tag */}
          <div className="space-y-5 rounded-xl border border-border/80 bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <Tags className="size-4 text-primary" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-foreground">
                Kategori &amp; Tag
              </h2>
            </div>

            <Field label={`Kategori (${kategori.length} dipilih)`}>
              <div className="flex flex-wrap items-center gap-1.5">
                {(taxonomy.data?.kategori ?? []).map((item) => (
                  <ToggleChip
                    key={item.uuid}
                    active={kategori.includes(item.uuid)}
                    onClick={() => toggle(kategori, item.uuid, setKategori)}
                  >
                    {item.nama_kategori}
                  </ToggleChip>
                ))}
                {scope?.canCreateKategori && !showNewKategori && (
                  <button
                    type="button"
                    onClick={() => setShowNewKategori(true)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-primary/50 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Plus className="size-3" />
                    Kategori baru
                  </button>
                )}
              </div>
              {scope?.canCreateKategori && showNewKategori && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Input
                    value={newKategoriName}
                    onChange={(e) => setNewKategoriName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddKategori();
                      }
                    }}
                    placeholder="Nama kategori baru..."
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={createKategori.isPending}
                    onClick={handleAddKategori}
                    className="h-8 cursor-pointer px-2.5 text-xs"
                  >
                    {createKategori.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setShowNewKategori(false);
                      setNewKategoriName("");
                    }}
                    className="size-8 cursor-pointer text-muted-foreground"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}
            </Field>

            <Field label={`Tag (${tags.length} dipilih)`}>
              <div className="flex flex-wrap items-center gap-1.5">
                {(taxonomy.data?.tags ?? []).map((item) => (
                  <ToggleChip
                    key={item.uuid}
                    active={tags.includes(item.uuid)}
                    onClick={() => toggle(tags, item.uuid, setTags)}
                  >
                    {item.nama_tag}
                  </ToggleChip>
                ))}
                {scope?.canCreateTag && !showNewTag && (
                  <button
                    type="button"
                    onClick={() => setShowNewTag(true)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-primary/50 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Plus className="size-3" />
                    Tag baru
                  </button>
                )}
              </div>
              {scope?.canCreateTag && showNewTag && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Nama tag baru..."
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={createTag.isPending}
                    onClick={handleAddTag}
                    className="h-8 cursor-pointer px-2.5 text-xs"
                  >
                    {createTag.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setShowNewTag(false);
                      setNewTagName("");
                    }}
                    className="size-8 cursor-pointer text-muted-foreground"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}
            </Field>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted/50 text-muted-foreground hover:border-border hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
