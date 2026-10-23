"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Eye, MapPin } from "lucide-react";
import { usePublicNews, usePublicNewsBySlug } from "@/hooks/api/useNews";
import { NewsCover } from "@/components/news/NewsCover";
import {
  formatNewsDate,
  formatViewers,
  sanitizeNewsHtml,
  tingkatLabel,
  tingkatOf,
} from "@/lib/news";

const ease = [0.22, 1, 0.36, 1] as const;

export function BeritaDetailView({ slug }: { slug: string }) {
  const detail = usePublicNewsBySlug(slug);
  const popular = usePublicNews({ sort: "populer", pageSize: 5 });
  const news = detail.data;

  if (detail.isLoading) {
    return (
      <main className="min-h-screen bg-background px-6 pt-36">
        <div className="mx-auto h-80 max-w-5xl animate-pulse rounded-3xl bg-muted" />
      </main>
    );
  }

  if (detail.isError || !news || news.statusNewsUtama !== "PUBLISHED") {
    return (
      <main className="min-h-screen bg-background px-6 pt-36">
        <div className="mx-auto max-w-xl rounded-3xl bg-card p-10 text-center ring-1 ring-border">
          <h1 className="text-3xl font-bold tracking-tight">Berita tidak tersedia</h1>
          <p className="mt-3 text-muted-foreground">
            Tulisan ini belum terbit atau tautannya sudah berubah.
          </p>
          <Link href="/berita" className="mt-6 inline-flex text-sm font-semibold text-primary">
            Kembali ke daftar berita
          </Link>
        </div>
      </main>
    );
  }

  const category = news.kategori[0]?.nama_kategori || "Berita";

  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto w-full max-w-6xl px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Link href="/berita" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Semua berita
          </Link>
        </motion.div>

        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
                <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">{category}</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  {tingkatLabel(tingkatOf(news))}
                </span>
                {news.kategori.slice(1).map((item) => (
                  <span key={item.uuid} className="rounded-full bg-card px-3 py-1 text-muted-foreground ring-1 ring-border">
                    {item.nama_kategori}
                  </span>
                ))}
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                {news.judul}
              </h1>
              {news.ringkasan && (
                <p className="mt-6 max-w-3xl text-lg font-light leading-relaxed text-muted-foreground">{news.ringkasan}</p>
              )}
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground">
                <span>{formatNewsDate(news.published_at || news.insert_at)}</span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {formatViewers(news.jumlah_dibaca)} pembaca
                </span>
                {news.durasi_baca ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {news.durasi_baca} menit baca
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {news.cabang?.namaCabang || "PIKI"}
                </span>
                <span className="text-primary">/{news.slug}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.12, ease }}
              className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl bg-muted"
            >
              <NewsCover src={news.url_thumbnail_img} alt={news.judul} priority />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="news-body mt-10 max-w-3xl text-[17px] leading-8 text-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeNewsHtml(news.konten || "") }}
            />

            {news.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {news.tags.map((tag) => (
                  <span key={tag.uuid} className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
                    #{tag.nama_tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Paling banyak dibaca
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Berita Terpopuler PIKI</h2>
              <ol className="mt-6 flex flex-col gap-3">
                {(popular.data?.items ?? [])
                  .filter((item) => item.slug !== news.slug)
                  .map((item, index) => (
                    <motion.li
                      key={item.uuid}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.15 + index * 0.06, ease }}
                    >
                      <Link href={`/berita/${item.slug}`} className="group block rounded-2xl bg-card p-4 ring-1 ring-border transition-colors duration-300 hover:bg-muted/60">
                        <span className="text-[11px] uppercase tracking-[0.16em] text-primary">
                          {String(index + 1).padStart(2, "0")} · {formatViewers(item.jumlah_dibaca)} pembaca
                        </span>
                        <span className="mt-1 block font-medium leading-snug transition-colors duration-300 group-hover:text-primary">
                          {item.judul}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
              </ol>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
