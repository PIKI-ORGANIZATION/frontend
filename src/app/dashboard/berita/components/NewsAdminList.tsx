"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Archive,
  Building2,
  Calendar,
  ExternalLink,
  Eye,
  MapPin,
  MoreVertical,
  Newspaper,
  Pencil,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SkeletonArticleList,
  SkeletonPageHeader,
} from "@/components/ui/skeleton-presets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AccessDeniedState } from "@/components/dashboard/AccessDeniedState";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useAdminNews,
  useArchiveNews,
  useNewsCabangOptions,
  useNewsScope,
} from "@/hooks/api/useNews";
import { getSafeImageSrc } from "@/features/galeri/types";
import {
  canManageNewsItem,
  formatNewsDate,
  formatViewers,
  tingkatLabel,
  tingkatOf,
  TingkatOrganisasi,
} from "@/lib/news";
import { cn } from "@/lib/utils";

const STATUS = ["", "PUBLISHED", "DRAFT", "ARCHIVED"] as const;

const STATUS_BADGE_MAP: Record<
  string,
  { label: string; dot: string; className: string }
> = {
  PUBLISHED: {
    label: "Terbit",
    dot: "bg-emerald-500",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  DRAFT: {
    label: "Draf",
    dot: "bg-amber-500",
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  ARCHIVED: {
    label: "Arsip",
    dot: "bg-muted-foreground",
    className: "border-border bg-muted/60 text-muted-foreground",
  },
};

export function NewsAdminList() {
  const scope = useNewsScope();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tingkat, setTingkat] = useState<"SEMUA" | TingkatOrganisasi>("SEMUA");
  const [cabangUuid, setCabangUuid] = useState("");
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 350);
  const cabangQuery = useNewsCabangOptions(Boolean(scope?.isManageAll));
  const archiveNews = useArchiveNews();

  const canFetchNews = Boolean(
    scope && scope.canRead && scope.hasCabangBinding,
  );

  // Muat daftar berita sesuai cakupan wilayah & cabang agar mini stats konsisten
  const query = useAdminNews(
    {
      search: debouncedSearch || undefined,
      cabangUuid: scope?.isManageAll ? cabangUuid || undefined : undefined,
      currentPage: 1,
      pageSize: 100,
    },
    { enabled: canFetchNews },
  );

  const rawItems = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  const stats = useMemo(() => {
    let published = 0;
    let draft = 0;
    let archived = 0;
    let totalViews = 0;
    for (const item of rawItems) {
      if (item.statusNewsUtama === "PUBLISHED") published++;
      else if (item.statusNewsUtama === "DRAFT") draft++;
      else if (item.statusNewsUtama === "ARCHIVED") archived++;
      totalViews += Number(item.jumlah_dibaca || 0);
    }
    return { total: rawItems.length, published, draft, archived, totalViews };
  }, [rawItems]);

  const items = useMemo(
    () =>
      rawItems.filter((item) => {
        if (status && item.statusNewsUtama !== status) return false;
        if (tingkat !== "SEMUA" && tingkatOf(item) !== tingkat) return false;
        return true;
      }),
    [rawItems, status, tingkat],
  );

  const cabangSelectOptions = useMemo(
    () => [
      { value: "__all__", label: "Semua Wilayah / Cabang" },
      ...(cabangQuery.data ?? []).map((c) => ({
        value: c.uuid,
        label: c.namaCabang,
        subLabel: c.provinsi || undefined,
      })),
    ],
    [cabangQuery.data],
  );

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(status) ||
    tingkat !== "SEMUA" ||
    Boolean(cabangUuid);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setTingkat("SEMUA");
    setCabangUuid("");
  };

  if (!scope) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col gap-6 py-4 sm:py-6">
        <SkeletonPageHeader showTabs tabCount={4} />
        <SkeletonArticleList count={5} label="Memuat ruang redaksi berita…" />
      </section>
    );
  }

  if (!scope.canRead) {
    return (
      <AccessDeniedState
        title="Akses CMS Berita Ditolak"
        description="Akun Anda tidak memiliki izin untuk membuka manajemen berita. Hubungi Administrator DPP untuk meminta hak akses redaksi."
        scopeLabel={`Cakupan: ${tingkatLabel(scope.tingkat)}`}
      />
    );
  }

  if (!scope.hasCabangBinding) {
    return (
      <AccessDeniedState
        title="Akun Belum Terhubung ke Cabang"
        description="Akun admin DPD/DPC Anda belum terhubung ke profil cabang mana pun sehingga berita tidak dapat dimuat atau dikelola. Hubungi Administrator DPP untuk menautkan akun ke cabang."
        scopeLabel={`Cakupan: ${tingkatLabel(scope.tingkat)}`}
      />
    );
  }

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-5 py-4 sm:py-6">
      {/* 1. Editorial Header */}
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                CMS Berita
              </h1>
              <Badge
                variant="outline"
                className="h-5 rounded-md border-primary/25 bg-primary/10 px-2 text-[11px] font-medium text-primary"
              >
                Redaksi {tingkatLabel(scope.tingkat)}
              </Badge>
            </div>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {scope.isManageAll
                ? "Kelola publikasi berita pusat (DPP), DPD provinsi, dan DPC kabupaten/kota dalam satu ruang redaksi."
                : `Kelola publikasi berita untuk cakupan ${scope.cabangName || tingkatLabel(scope.tingkat)}.`}
            </p>
          </div>
        </div>

        {scope.canCreate && (
          <Button
            size="sm"
            className="shrink-0 cursor-pointer self-start sm:self-center"
            nativeButton={false}
            render={<Link href="/dashboard/berita/baru" />}
          >
            <Plus className="mr-1.5 size-4" />
            <span>Tulis Berita</span>
          </Button>
        )}
      </div>

      {/* 2. Mini Stats Strip (Interactive Status Quick Filter) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Ringkasan status berita"
          className="flex flex-wrap items-center gap-2"
        >
          {[
            {
              value: "",
              label: "Total",
              count: stats.total,
              dot: "bg-primary",
            },
            {
              value: "PUBLISHED",
              label: "Terbit",
              count: stats.published,
              dot: "bg-emerald-500",
            },
            {
              value: "DRAFT",
              label: "Draf",
              count: stats.draft,
              dot: "bg-amber-500",
            },
            {
              value: "ARCHIVED",
              label: "Arsip",
              count: stats.archived,
              dot: "bg-muted-foreground",
            },
          ].map((stat) => {
            const isActive = status === stat.value;
            return (
              <button
                key={stat.label}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  setStatus(isActive && stat.value !== "" ? "" : stat.value)
                }
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isActive
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/70 bg-card/80 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
                )}
              >
                <span
                  className={cn("size-1.5 shrink-0 rounded-full", stat.dot)}
                  aria-hidden="true"
                />
                <span className="font-medium">{stat.label}</span>
                <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                  {stat.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          <Eye className="size-3.5 text-primary" aria-hidden="true" />
          <span>Total pembaca:</span>
          <strong className="font-mono tabular-nums text-foreground">
            {formatViewers(stats.totalViews)}
          </strong>
        </div>
      </div>

      {/* 3. Segmented Tingkatan Tabs + Filter Surface */}
      <div className="space-y-3 rounded-xl border border-border/80 bg-card/70 p-3.5 shadow-xs sm:p-4">
        {scope.isManageAll && (
          <div className="flex max-w-full items-center overflow-x-auto pb-0.5">
            <div
              role="tablist"
              aria-label="Filter tingkatan organisasi"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 p-1 dark:bg-muted/40"
            >
              {(["SEMUA", "DPP", "DPD", "DPC"] as const).map((item) => {
                const isSelected = tingkat === item;
                return (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setTingkat(item)}
                    className={cn(
                      "cursor-pointer select-none whitespace-nowrap rounded-sm px-3 py-1.5 text-xs transition-all",
                      "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                      isSelected
                        ? "bg-background font-medium text-foreground shadow-2xs"
                        : "font-normal text-muted-foreground hover:bg-background/40 hover:text-foreground",
                    )}
                  >
                    {item === "SEMUA" ? "Semua Tingkatan" : tingkatLabel(item)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch("")}
              placeholder="Cari judul, slug, atau ringkasan berita..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <div className="sm:w-40">
              <Select
                value={status || "__all__"}
                onValueChange={(value) =>
                  setStatus(!value || value === "__all__" ? "" : value)
                }
              >
                <SelectTrigger
                  aria-label="Filter status berita"
                  className="w-full"
                >
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((item) => (
                    <SelectItem key={item || "all"} value={item || "__all__"}>
                      {item === "" ? "Semua Status" : statusLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {scope.isManageAll ? (
              <div className="sm:w-56">
                <SearchableSelect
                  value={cabangUuid || "__all__"}
                  onValueChange={(value) =>
                    setCabangUuid(value === "__all__" ? "" : value)
                  }
                  options={cabangSelectOptions}
                  placeholder="Semua Wilayah / Cabang"
                  searchPlaceholder="Cari wilayah / cabang..."
                  emptyMessage="Wilayah tidak ditemukan."
                  icon={
                    <Building2 className="size-3.5 text-muted-foreground" />
                  }
                  triggerClassName="h-9 rounded-sm px-3 dark:bg-input/30 dark:hover:bg-input/50"
                />
              </div>
            ) : (
              <div className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border/70 bg-muted/40 px-3 text-xs font-medium text-muted-foreground">
                <MapPin
                  className="size-3.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="truncate">
                  {scope.cabangName || tingkatLabel(scope.tingkat)}
                </span>
              </div>
            )}

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="col-span-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground sm:col-span-1"
              >
                <RotateCcw className="mr-1.5 size-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Elevated Article List */}
      {query.isLoading ? (
        <SkeletonArticleList count={5} label="Memuat daftar berita…" />
      ) : query.isError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Gagal memuat daftar berita</p>
            <p className="mt-0.5 text-xs opacity-90">
              {(query.error as Error).message}
            </p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <Newspaper
            className="size-9 text-muted-foreground/40"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold text-foreground">
            {hasActiveFilters
              ? "Tidak ada berita yang cocok"
              : "Belum ada artikel berita"}
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {hasActiveFilters
              ? "Coba ubah kata kunci pencarian, status, atau pilihan wilayah cabang."
              : "Mulai publikasikan kabar organisasi pertama melalui tombol Tulis Berita."}
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 cursor-pointer"
            >
              Reset Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const badge =
              STATUS_BADGE_MAP[item.statusNewsUtama] ?? STATUS_BADGE_MAP.DRAFT;
            const thumb = item.url_thumbnail_img
              ? getSafeImageSrc(item.url_thumbnail_img, "")
              : "";
            const canEdit = scope.canUpdate && canManageNewsItem(scope, item);
            const canArchive =
              scope.canArchive &&
              canManageNewsItem(scope, item) &&
              item.statusNewsUtama !== "ARCHIVED";

            return (
              <article
                key={item.uuid}
                className="group flex flex-col gap-4 rounded-xl border border-border/75 bg-card/85 p-3.5 shadow-2xs transition-colors hover:border-border hover:bg-card sm:flex-row sm:items-center sm:p-4"
              >
                {/* Thumbnail 16:10 */}
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted sm:w-36 md:w-40">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={item.judul}
                      fill
                      sizes="(max-width: 640px) 100vw, 160px"
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <Newspaper className="size-6" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Konten Artikel */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 gap-1.5 rounded-md px-2 text-[11px] font-medium",
                        badge.className,
                      )}
                    >
                      <span
                        className={cn("size-1.5 rounded-full", badge.dot)}
                        aria-hidden="true"
                      />
                      {badge.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="h-5 rounded-md border-border/60 bg-muted/40 px-2 text-[11px] font-medium text-muted-foreground"
                    >
                      {tingkatLabel(tingkatOf(item))}
                    </Badge>
                    <span className="inline-flex h-5 items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 text-[11px] text-muted-foreground">
                      <MapPin
                        className="size-3 shrink-0 opacity-75"
                        aria-hidden="true"
                      />
                      <span className="max-w-[160px] truncate">
                        {item.cabang?.namaCabang || "Pusat (DPP)"}
                      </span>
                    </span>
                  </div>

                  <h2 className="line-clamp-1 text-sm font-semibold leading-snug text-foreground sm:text-base">
                    {item.judul}
                  </h2>

                  {item.ringkasan && (
                    <p className="line-clamp-1 text-xs leading-relaxed text-muted-foreground">
                      {item.ringkasan}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar
                        className="size-3 opacity-70"
                        aria-hidden="true"
                      />
                      {formatNewsDate(item.published_at || item.insert_at)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Eye className="size-3 opacity-70" aria-hidden="true" />
                      {formatViewers(item.jumlah_dibaca)} pembaca
                    </span>
                    <span className="hidden truncate font-mono text-[11px] opacity-70 md:inline">
                      /{item.slug}
                    </span>
                  </div>
                </div>

                {/* Aksi Cepat + Menu ⋮ */}
                <div className="flex shrink-0 items-center justify-end gap-1.5 sm:self-center">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 cursor-pointer px-3 text-xs"
                      nativeButton={false}
                      render={
                        <Link href={`/dashboard/berita/${item.uuid}/edit`} />
                      }
                    >
                      <Pencil className="mr-1.5 size-3.5" />
                      Sunting
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Menu aksi berita: ${item.judul}`}
                          className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                        />
                      }
                    >
                      <MoreVertical className="size-4" aria-hidden="true" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      sideOffset={6}
                      className="min-w-44"
                    >
                      {item.statusNewsUtama === "PUBLISHED" && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          nativeButton={false}
                          render={
                            <Link
                              href={`/berita/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          <ExternalLink className="size-4 shrink-0" />
                          <span>Lihat di Publik</span>
                        </DropdownMenuItem>
                      )}

                      {canEdit && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          nativeButton={false}
                          render={
                            <Link
                              href={`/dashboard/berita/${item.uuid}/edit`}
                            />
                          }
                        >
                          <Pencil className="size-4 shrink-0" />
                          <span>Sunting Berita</span>
                        </DropdownMenuItem>
                      )}

                      {canArchive && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => setArchiveId(item.uuid)}
                          >
                            <Archive className="size-4 shrink-0" />
                            <span>Arsipkan</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(archiveId)}
        onOpenChange={(open) => !open && setArchiveId(null)}
        title="Arsipkan berita?"
        description="Berita yang diarsipkan akan disembunyikan dari halaman publik. Admin cabang hanya dapat mengarsipkan berita miliknya."
        confirmText="Ya, Arsipkan"
        cancelText="Batal"
        variant="destructive"
        onConfirm={() => {
          if (!archiveId) return;
          archiveNews.mutate(archiveId, {
            onSuccess: () => {
              toast.success("Berita berhasil diarsipkan");
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
