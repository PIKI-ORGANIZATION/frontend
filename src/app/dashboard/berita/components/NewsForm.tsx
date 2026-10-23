"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NewsCoverField } from "@/components/news/NewsCoverField";

const NewsEditor = dynamic(
  () => import("@/components/news/NewsEditor").then((mod) => mod.NewsEditor),
  {
    ssr: false,
    loading: () => <div className="h-80 animate-pulse rounded-xl bg-muted" />,
  },
);
import {
  useCreateNews,
  useNewsCabangOptions,
  useNewsScope,
  useNewsTaxonomy,
  useUpdateNews,
} from "@/hooks/api/useNews";
import {
  NewsItem,
  plainNewsText,
  slugifyJudul,
  tingkatFromCabangName,
  tingkatLabel,
} from "@/lib/news";

export function NewsForm({ mode, initial }: { mode: "create" | "edit"; initial?: NewsItem }) {
  const router = useRouter();
  const scope = useNewsScope();
  const taxonomy = useNewsTaxonomy();
  const cabangQuery = useNewsCabangOptions(Boolean(scope?.isManageAll));
  const createNews = useCreateNews();
  const updateNews = useUpdateNews(initial?.uuid || "new");

  const [judul, setJudul] = useState(initial?.judul || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [ringkasan, setRingkasan] = useState(initial?.ringkasan || "");
  const [konten, setKonten] = useState(initial?.konten || "");
  const [thumbnail, setThumbnail] = useState(initial?.url_thumbnail_img || "");
  const [status, setStatus] = useState(initial?.statusNewsUtama || "DRAFT");
  const [cabangUuid, setCabangUuid] = useState(initial?.cabangUuid || "");
  const [kategori, setKategori] = useState<string[]>(
    initial?.kategori.map((item) => item.uuid) || [],
  );
  const [tags, setTags] = useState<string[]>(initial?.tags.map((item) => item.uuid) || []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugifyJudul(judul));
  }, [judul, slugTouched]);

  useEffect(() => {
    if (initial?.cabangUuid || !scope?.cabangId) return;
    setCabangUuid((current) => current || scope.cabangId || "");
  }, [initial?.cabangUuid, scope?.cabangId]);

  const cabangItems = useMemo(() => {
    const labels: Record<string, string> = {
      __akun__: "Ikuti cabang akun DPP",
    };
    if (scope?.cabangId) labels[scope.cabangId] = scope.cabangName || "DPP Pusat";
    if (initial?.cabangUuid && initial.cabang?.namaCabang) {
      const place = initial.cabang.provinsi ? ` · ${initial.cabang.provinsi}` : "";
      labels[initial.cabangUuid] = `${initial.cabang.namaCabang}${place}`;
    }
    for (const cabang of cabangQuery.data ?? []) {
      labels[cabang.uuid] = cabang.provinsi
        ? `${cabang.namaCabang} · ${cabang.provinsi}`
        : cabang.namaCabang;
    }
    return labels;
  }, [cabangQuery.data, initial, scope?.cabangId, scope?.cabangName]);

  const groupedCabang = useMemo(() => {
    const items = cabangQuery.data ?? [];
    return {
      DPP: items.filter((item) => tingkatFromCabangName(item.namaCabang, item.isCabang) === "DPP"),
      DPD: items.filter((item) => tingkatFromCabangName(item.namaCabang, item.isCabang) === "DPD"),
      DPC: items.filter((item) => tingkatFromCabangName(item.namaCabang, item.isCabang) === "DPC"),
    };
  }, [cabangQuery.data]);

  const pending = createNews.isPending || updateNews.isPending;

  const toggle = (list: string[], id: string, setter: (value: string[]) => void) => {
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (judul.trim().length < 5) return toast.error("Judul minimal 5 karakter");
    if (!/^[a-z0-9-]{5,}$/.test(slug)) {
      return toast.error("Slug hanya huruf kecil, angka, dan tanda hubung");
    }
    const plain = plainNewsText(konten);
    if (plain.length < 10) return toast.error("Isi berita masih terlalu pendek");
    if (kategori.length === 0 || tags.length === 0) {
      return toast.error("Pilih minimal satu kategori dan satu tag");
    }

    const words = plain.split(/\s+/).filter(Boolean).length;
    const payload = {
      judul: judul.trim(),
      ringkasan: ringkasan.trim(),
      konten: konten.trim(),
      slug,
      url_thumbnail_img: thumbnail.trim() || null,
      statusNewsUtama: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      durasi_baca: Math.max(1, Math.ceil(words / 200)),
      kategori,
      tags,
      ...(scope?.isManageAll ? { cabangUuid: cabangUuid || null } : {}),
    };

    const action = mode === "create" ? createNews.mutate : updateNews.mutate;
    action(payload, {
      onSuccess: () => {
        toast.success(mode === "create" ? "Berita tersimpan" : "Berita diperbarui");
        router.push("/dashboard/berita");
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {scope ? tingkatLabel(scope.tingkat) : "Redaksi"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {mode === "create" ? "Tulis berita" : "Sunting berita"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {!scope
              ? "Menyiapkan ruang redaksi sesuai cabang akun."
              : scope.isManageAll
                ? "Sebagai admin DPP Anda dapat menaruh berita di pusat, DPD provinsi, atau DPC kabupaten/kota."
                : `Berita ini terkunci pada cabang ${scope.cabangName || tingkatLabel(scope.tingkat)}. Pilihan cabang lain diabaikan server.`}
          </p>
        </div>
        <Button type="button" variant="outline" nativeButton={false} render={<Link href="/dashboard/berita" />}>
          Kembali
        </Button>
      </div>

      <div className="grid gap-6 rounded-3xl bg-card p-6 ring-1 ring-border md:grid-cols-2">
        <Field label="Judul" className="md:col-span-2">
          <Input value={judul} onChange={(event) => setJudul(event.target.value)} placeholder="Judul berita" />
        </Field>
        <Field label="Slug">
          <Input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugifyJudul(event.target.value));
            }}
          />
        </Field>
        <Field label="Status">
          <Select
            items={{ DRAFT: "Draf", PUBLISHED: "Terbit", ARCHIVED: "Arsip" }}
            value={status}
            onValueChange={(value) => value && setStatus(value)}
          >
            <SelectTrigger className="h-12 w-full px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draf</SelectItem>
              <SelectItem value="PUBLISHED">Terbit</SelectItem>
              {mode === "edit" ? <SelectItem value="ARCHIVED">Arsip</SelectItem> : null}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Ringkasan" className="md:col-span-2">
          <Textarea value={ringkasan} onChange={(event) => setRingkasan(event.target.value)} className="min-h-24" />
        </Field>
        <Field label="Gambar sampul" className="md:col-span-2">
          <NewsCoverField value={thumbnail} onChange={setThumbnail} />
        </Field>
        {scope?.isManageAll && (
          <Field label="Pemilik berita" className="md:col-span-2">
            <Select
              items={cabangItems}
              value={cabangUuid || "__akun__"}
              onValueChange={(value) => setCabangUuid(!value || value === "__akun__" ? "" : value)}
            >
              <SelectTrigger className="h-12 w-full px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="__akun__">Ikuti cabang akun DPP</SelectItem>
                {(["DPP", "DPD", "DPC"] as const).map((tingkat) => (
                  <SelectGroup key={tingkat}>
                    <SelectLabel>{tingkatLabel(tingkat)}</SelectLabel>
                    {groupedCabang[tingkat].map((cabang) => (
                      <SelectItem key={cabang.uuid} value={cabang.uuid}>
                        {cabang.namaCabang}
                        {cabang.provinsi ? ` · ${cabang.provinsi}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
        <Field label="Kategori" className="md:col-span-2">
          <div className="flex flex-wrap gap-2">
            {(taxonomy.data?.kategori ?? []).map((item) => (
              <ToggleChip
                key={item.uuid}
                active={kategori.includes(item.uuid)}
                onClick={() => toggle(kategori, item.uuid, setKategori)}
              >
                {item.nama_kategori}
              </ToggleChip>
            ))}
          </div>
        </Field>
        <Field label="Tag" className="md:col-span-2">
          <div className="flex flex-wrap gap-2">
            {(taxonomy.data?.tags ?? []).map((item) => (
              <ToggleChip
                key={item.uuid}
                active={tags.includes(item.uuid)}
                onClick={() => toggle(tags, item.uuid, setTags)}
              >
                {item.nama_tag}
              </ToggleChip>
            ))}
          </div>
        </Field>
        <Field label="Isi berita" className="md:col-span-2">
          <NewsEditor value={konten} onChange={setKonten} />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="h-11 px-6">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan berita
        </Button>
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
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      <Label>{label}</Label>
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
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
