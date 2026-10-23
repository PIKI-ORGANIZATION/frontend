"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { usePublicNews } from "@/hooks/api/useNews";
import { NewsCover } from "@/components/news/NewsCover";
import { formatNewsDate, formatViewers, NewsItem, tingkatLabel, tingkatOf } from "@/lib/news";

export function NewsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = usePublicNews({ pageSize: 5, currentPage: 1 });
  const articles = data?.items ?? [];
  const highlight = articles[0];
  const latest = articles.slice(1);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!headerRef.current || !contentRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      gsap.to(headerRef.current, {
        opacity: 0,
        scale: 0.95,
        ease: "none",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 60%",
          end: "top 20%",
          scrub: true,
        },
      });
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    if (!contentRef.current || articles.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".news-reveal",
        { y: 56, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 78%",
          },
        },
      );
    }, contentRef);

    return () => ctx.revert();
  }, [articles.length]);

  return (
    <section ref={containerRef} className="relative w-full bg-card">
      <div
        ref={headerRef}
        className="w-full sticky top-24 flex flex-col items-center justify-center bg-card z-0 py-12 md:py-20 px-6"
      >
        <div className="max-w-3xl flex flex-col items-center text-center gap-3 md:gap-4">
          <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-primary">
            Kabar Terbaru
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Berita & Informasi PIKI
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light mt-1 md:mt-2">
            Ikuti perkembangan terkini mengenai kegiatan, advokasi, dan
            kontribusi nyata pergerakan organisasi di seluruh Indonesia.
          </p>
        </div>
      </div>

      <div
        ref={contentRef}
        className="w-full bg-background relative z-10 rounded-t-[2.5rem] md:rounded-t-[4rem] pt-12 md:pt-24 pb-16 md:pb-32"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center w-full">
          <div className="w-full flex justify-between items-end mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
              Artikel Pilihan
            </h3>
            <Link href="/berita">
              <Button variant="ghost" className="group hidden md:flex items-center gap-2">
                Lihat Semua Berita
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {isLoading && (
            <div className="grid w-full gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 aspect-[4/3] animate-pulse rounded-3xl bg-muted" />
              <div className="lg:col-span-5 flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            </div>
          )}

          {!isLoading && !highlight && (
            <p className="w-full rounded-3xl bg-card py-16 text-center text-muted-foreground">
              Berita terbit akan tampil di sini.
            </p>
          )}

          {highlight && (
            <div className="grid w-full items-start gap-8 lg:grid-cols-12 lg:gap-12">
              <HighlightCard news={highlight} />
              <div className="news-reveal lg:col-span-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Berita terbaru
                </p>
                <div className="flex flex-col">
                  {latest.map((news) => (
                    <LatestRow key={news.uuid} news={news} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <Link href="/berita" className="w-full mt-10 md:hidden block">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              Lihat Semua Berita
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HighlightCard({ news }: { news: NewsItem }) {
  return (
    <Link href={`/berita/${news.slug}`} className="news-reveal group lg:col-span-7">
      <article className="flex flex-col gap-5">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
          <NewsCover
            src={news.url_thumbnail_img}
            alt={news.judul}
            priority
            className="transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
              Berita Utama
            </span>
            <span className="rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-md">
              {news.kategori[0]?.nama_kategori || tingkatLabel(tingkatOf(news))}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Meta news={news} />
          <h3 className="text-2xl font-bold leading-snug tracking-tight transition-colors duration-300 group-hover:text-primary md:text-4xl">
            {news.judul}
          </h3>
          {news.ringkasan && (
            <p className="line-clamp-3 text-base font-light leading-relaxed text-muted-foreground">
              {news.ringkasan}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

function LatestRow({ news }: { news: NewsItem }) {
  return (
    <Link
      href={`/berita/${news.slug}`}
      className="group flex gap-4 border-b border-border/70 py-4 transition-colors first:pt-0"
    >
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted">
        <NewsCover
          src={news.url_thumbnail_img}
          alt={news.judul}
          className="transition-transform duration-700 ease-out group-hover:scale-110"
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {news.kategori[0]?.nama_kategori || tingkatLabel(tingkatOf(news))}
        </span>
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors duration-300 group-hover:text-primary md:text-base">
          {news.judul}
        </h4>
        <Meta news={news} />
      </div>
    </Link>
  );
}

function Meta({ news }: { news: NewsItem }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" />
        <time>{formatNewsDate(news.published_at || news.insert_at)}</time>
      </span>
      <span className="inline-flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {formatViewers(news.jumlah_dibaca)}
      </span>
    </div>
  );
}
