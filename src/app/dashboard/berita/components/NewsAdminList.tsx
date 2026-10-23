"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Archive, Eye, Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdminNews, useArchiveNews, useNewsCabangOptions, useNewsScope } from "@/hooks/api/useNews";
import {
  formatNewsDate,
  formatViewers,
  tingkatFromCabangName,
  tingkatLabel,
  tingkatOf,
  TingkatOrganisasi,
} from "@/lib/news";

const STATUS = ["", "PUBLISHED", "DRAFT", "ARCHIVED"] as const;

export function NewsAdminList() {
  const scope = useNewsScope();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tingkat, setTingkat] = useState<"SEMUA" | TingkatOrganisasi>("SEMUA");
  const [cabangUuid, setCabangUuid] = useState("");
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const cabangQuery = useNewsCabangOptions(Boolean(scope?.isManageAll));
  const archiveNews = useArchiveNews();

  const query = useAdminNews({
    search: debouncedSearch || undefined,
    statusNewsUtama: status || undefined,
    cabangUuid: cabangUuid || undefined,
    currentPage: 1,
    pageSize: 100,
  });

  const items = (query.data?.items ?? []).filter((item) =>
    tingkat === "SEMUA" ? true : tingkatOf(item) === tingkat,
  );

  const grouped = useMemo(() => {
    const source = cabangQuery.data ?? [];
    return {
      DPP: source.filter((item) => tingkatFromCabangName(item.namaCabang, item.isCabang) === "DPP"),
      DPD: source.filter((item) => tingkatFromCabangName(item.namaCabang, item.isCabang) === "DPD"),
      DPC: source.filter((item) => tingkatFromCabangName(item.namaCabang, item.isCabang) === "DPC"),
    };
  }, [cabangQuery.data]);

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Redaksi {scope ? tingkatLabel(scope.tingkat) : ""}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Berita</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {!scope
              ? "Menyiapkan ruang redaksi sesuai cabang akun."
              : scope.isManageAll
                ? "Admin DPP melihat seluruh berita pusat, DPD provinsi, dan DPC kabupaten/kota, lalu dapat menulis atas nama cabang mana pun."
                : `Admin ${tingkatLabel(scope.tingkat)} hanya mengelola berita ${scope.cabangName || "cabang sendiri"}. Berita pusat dan cabang lain tidak ditampilkan.`}
          </p>
        </div>
        {scope?.canWrite && (
          <Button className="h-11" nativeButton={false} render={<Link href="/dashboard/berita/baru" />}>
            <Plus className="mr-1 h-4 w-4" />
            Tulis berita
          </Button>
        )}
      </div>

      <div className="grid gap-3 rounded-3xl bg-card p-4 ring-1 ring-border md:grid-cols-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari berita"
          className="md:col-span-2"
        />
        <Select
          items={{ __all__: "Semua status", PUBLISHED: "Terbit", DRAFT: "Draf", ARCHIVED: "Arsip" }}
          value={status || "__all__"}
          onValueChange={(value) => setStatus(!value || value === "__all__" ? "" : value)}
        >
          <SelectTrigger className="h-12 w-full px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS.map((item) => (
              <SelectItem key={item || "all"} value={item || "__all__"}>
                {item === "" ? "Semua status" : statusLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {scope?.isManageAll ? (
          <Select
            items={{
              __all__: "Semua cabang",
              ...Object.fromEntries(
                (cabangQuery.data ?? []).map((cabang) => [cabang.uuid, cabang.namaCabang]),
              ),
            }}
            value={cabangUuid || "__all__"}
            onValueChange={(value) => setCabangUuid(!value || value === "__all__" ? "" : value)}
          >
            <SelectTrigger className="h-12 w-full px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="__all__">Semua cabang</SelectItem>
              {(["DPP", "DPD", "DPC"] as const).map((item) => (
                <SelectGroup key={item}>
                  <SelectLabel>{tingkatLabel(item)}</SelectLabel>
                  {grouped[item].map((cabang) => (
                    <SelectItem key={cabang.uuid} value={cabang.uuid}>
                      {cabang.namaCabang}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex h-12 items-center rounded-md bg-muted px-3 text-sm">
            {scope?.cabangName || (scope ? tingkatLabel(scope.tingkat) : "")}
          </div>
        )}
        {scope?.isManageAll && (
          <div className="flex flex-wrap gap-2 md:col-span-4">
            {(["SEMUA", "DPP", "DPD", "DPC"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTingkat(item)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  tingkat === item ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {item === "SEMUA" ? "Semua tingkatan" : tingkatLabel(item)}
              </button>
            ))}
          </div>
        )}
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : query.isError ? (
        <p className="rounded-2xl bg-red-50 p-6 text-sm text-red-600">
          {(query.error as Error).message}
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-3xl bg-card p-10 text-center text-muted-foreground ring-1 ring-border">
          Belum ada berita pada saringan ini.
        </p>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          {items.map((item) => (
            <div key={item.uuid} className="flex flex-col gap-4 border-b border-border p-5 last:border-b-0 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{tingkatLabel(tingkatOf(item))}</Badge>
                  <Badge variant="outline">{statusLabel(item.statusNewsUtama)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatViewers(item.jumlah_dibaca)} pembaca
                  </span>
                </div>
                <h2 className="truncate text-base font-semibold">{item.judul}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.cabang?.namaCabang || "Tanpa cabang"} · {formatNewsDate(item.published_at || item.insert_at)} · /{item.slug}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {item.statusNewsUtama === "PUBLISHED" && (
                  <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/berita/${item.slug}`} />}>
                    <Eye className="h-4 w-4" />
                    Lihat
                  </Button>
                )}
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/dashboard/berita/${item.uuid}/edit`} />}>
                  <Pencil className="h-4 w-4" />
                  Ubah
                </Button>
                {scope?.canArchive && item.statusNewsUtama !== "ARCHIVED" && (
                  <Button variant="destructive" size="sm" onClick={() => setArchiveId(item.uuid)}>
                    <Archive className="h-4 w-4" />
                    Arsip
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(archiveId)}
        onOpenChange={(open) => !open && setArchiveId(null)}
        title="Arsipkan berita?"
        description="Berita yang diarsipkan hilang dari halaman publik. Admin cabang hanya dapat mengarsipkan berita miliknya."
        confirmText="Arsipkan"
        variant="destructive"
        onConfirm={() => {
          if (!archiveId) return;
          archiveNews.mutate(archiveId, {
            onSuccess: () => {
              toast.success("Berita diarsipkan");
              setArchiveId(null);
            },
            onError: (error) => toast.error(error.message),
          });
        }}
      />
    </section>
  );
}

function statusLabel(status: string) {
  if (status === "PUBLISHED") return "Terbit";
  if (status === "DRAFT") return "Draf";
  if (status === "ARCHIVED") return "Arsip";
  return status;
}
