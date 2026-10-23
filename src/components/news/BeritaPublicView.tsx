"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Eye, MapPin, Search } from "lucide-react";
import { usePublicNews, useNewsTaxonomy } from "@/hooks/api/useNews";
import { NewsCover } from "@/components/news/NewsCover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import {
  formatNewsDate,
  formatViewers,
  NewsItem,
  tingkatLabel,
  tingkatOf,
  TingkatOrganisasi,
} from "@/lib/news";

const TINGKAT: Array<"SEMUA" | TingkatOrganisasi> = ["SEMUA", "DPP", "DPD", "DPC"];

const ease = [0.22, 1, 0.36, 1] as const;

export function BeritaPublicView() {
  const [search, setSearch] = useState("");
  const [tingkat, setTingkat] = useState<(typeof TINGKAT)[number]>("SEMUA");
  const [kategori, setKategori] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const listQuery = usePublicNews({
    search: debouncedSearch || undefined,
    kategori: kategori || undefined,
    currentPage: page,
    pageSize: 12,
  });
  const popularQuery = usePublicNews({ sort: "populer", pageSize: 5, currentPage: 1 });
  const taxonomy = useNewsTaxonomy();

  const items = useMemo(() => {
    const source = listQuery.data?.items ?? [];
    if (tingkat === "SEMUA") return source;
    return source.filter((item) => tingkatOf(item) === tingkat);
  }, [listQuery.data?.items, tingkat]);

  const popular = popularQuery.data?.items ?? [];
  const hero = items[0];
  const rest = items.slice(1);
  const total = listQuery.data?.pagination.total ?? 0;
  const pageSize = listQuery.data?.pagination.pageSize ?? 12;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-7xl px-6 pb-6 pt-32 md:px-10 md:pt-40">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-primary md:text-sm"
        >
          Publikasi
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          className="mt-4 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl"
        >
          Berita PIKI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease }}
          className="mt-5 max-w-2xl text-base font-light leading-relaxed text-muted-foreground md:text-lg"
        >
          Kabar dari DPP, DPD, dan DPC. Setiap tulisan menyimpan kategori, slug, dan jumlah pembacanya.
        </motion.p>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-24 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mb-8 flex flex-col gap-4"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari judul, ringkasan, atau isi berita"
                className="h-12 bg-card pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {TINGKAT.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTingkat(item)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-300 ${
                    tingkat === item
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground ring-1 ring-border hover:bg-muted"
                  }`}
                >
                  {item === "SEMUA" ? "Semua tingkatan" : tingkatLabel(item)}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <FilterChip active={!kategori} onClick={() => { setKategori(""); setPage(1); }}>
                Semua kategori
              </FilterChip>
              {(taxonomy.data?.kategori ?? []).map((item) => (
                <FilterChip
                  key={item.uuid}
                  active={kategori === item.uuid}
                  onClick={() => {
                    setKategori(item.uuid);
                    setPage(1);
                  }}
                >
                  {item.nama_kategori}
                </FilterChip>
              ))}
            </div>
          </motion.div>

          {listQuery.isLoading ? (
            <div className="h-[420px] animate-pulse rounded-3xl bg-muted" />
          ) : listQuery.isError ? (
            <p className="rounded-3xl bg-card p-8 text-sm text-red-600 ring-1 ring-border">
              Berita belum dapat dimuat. Pastikan layanan API sedang berjalan.
            </p>
          ) : !hero ? (
            <p className="rounded-3xl bg-card p-10 text-muted-foreground ring-1 ring-border">
              Belum ada berita pada saringan ini.
            </p>
          ) : (
            <div className="flex flex-col gap-10">
              <HeroArticle news={hero} />
              <div className="grid gap-8 sm:grid-cols-2">
                {rest.map((news, index) => (
                  <ArticleCard key={news.uuid} news={news} index={index} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Halaman {page} dari {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => setPage((value) => value + 1)}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="sticky top-28 rounded-3xl bg-card p-6 ring-1 ring-border md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Pilihan redaksi
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Berita Terpopuler PIKI</h2>
            <ol className="mt-6 flex flex-col">
              {popularQuery.isLoading && (
                <li className="h-24 animate-pulse rounded-2xl bg-muted" />
              )}
              {!popularQuery.isLoading && popular.length === 0 && (
                <li className="text-sm text-muted-foreground">Belum ada data pembaca.</li>
              )}
              {popular.map((news, index) => (
                <li key={news.uuid} className="border-t border-border/70 py-4 first:border-t-0 first:pt-0">
                  <Link href={`/berita/${news.slug}`} className="group grid grid-cols-[auto_1fr] gap-4">
                    <span className="text-2xl font-light text-primary/70 transition-colors duration-300 group-hover:text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {tingkatLabel(tingkatOf(news))} · {formatViewers(news.jumlah_dibaca)} pembaca
                      </span>
                      <span className="mt-1 block text-sm font-medium leading-snug transition-colors duration-300 group-hover:text-primary">
                        {news.judul}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </motion.div>
        </aside>
      </section>
    </main>
  );
}

function FilterChip({
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
      className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors duration-300 ${
        active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function HeroArticle({ news }: { news: NewsItem }) {
  const category = news.kategori[0]?.nama_kategori || "Berita";
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease }}
    >
      <Link href={`/berita/${news.slug}`} className="group block">
        <article className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          <div className="relative aspect-[16/10] overflow-hidden">
            <NewsCover
              src={news.url_thumbnail_img}
              alt={news.judul}
              priority
              className="transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
              <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">{category}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">{tingkatLabel(tingkatOf(news))}</span>
              </div>
              <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">{news.judul}</h2>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-6 md:p-8">
            <p className="text-base font-light leading-relaxed text-muted-foreground">{news.ringkasan}</p>
            <MetaRow news={news} />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function ArticleCard({ news, index }: { news: NewsItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay: (index % 2) * 0.08, ease }}
    >
      <Link href={`/berita/${news.slug}`} className="group">
        <article className="flex h-full flex-col gap-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            <NewsCover
              src={news.url_thumbnail_img}
              alt={news.judul}
              className="transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              <span>{news.kategori[0]?.nama_kategori || "Berita"}</span>
              <span className="text-muted-foreground">/</span>
              <span>{tingkatLabel(tingkatOf(news))}</span>
            </div>
            <h3 className="text-xl font-bold leading-snug tracking-tight transition-colors duration-300 group-hover:text-primary">
              {news.judul}
            </h3>
            <p className="line-clamp-3 text-sm font-light leading-relaxed text-muted-foreground">{news.ringkasan}</p>
            <MetaRow news={news} />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function MetaRow({ news }: { news: NewsItem }) {
  return (
    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-muted-foreground">
      <span>{formatNewsDate(news.published_at || news.insert_at)}</span>
      <span className="inline-flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {formatViewers(news.jumlah_dibaca)}
      </span>
      {news.durasi_baca ? (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {news.durasi_baca} mnt
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        {news.cabang?.namaCabang || tingkatLabel(tingkatOf(news))}
      </span>
    </div>
  );
}
