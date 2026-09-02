"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const DUMMY_NEWS = [
  {
    id: 1,
    title: "Kongres Nasional PIKI Ke-VI Sukses Diselenggarakan di Jakarta",
    date: "12 Agustus 2024",
    category: "Kegiatan",
    image: "/footage/image1.webp",
  },
  {
    id: 2,
    title: "Sidang Pleno DPP Membahas Program Kerja Strategis 2024-2029",
    date: "05 September 2024",
    category: "Organisasi",
    image: "/footage/image2.jpeg",
  },
  {
    id: 3,
    title: "Pelantikan Pengurus DPD Provinsi Bali Periode 2024-2029",
    date: "20 September 2024",
    category: "Daerah",
    image: "/footage/image3.jpg",
  },
];

export function NewsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!headerRef.current || !contentRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Parallax fade-out effect for the header as the content scrolls up
      gsap.to(headerRef.current, {
        opacity: 0,
        scale: 0.95,
        ease: "none",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 60%", // start fading when content reaches 60% from the top
          end: "top 20%", // finish fading when content reaches 20% from the top
          scrub: true,
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full bg-card ">
      {/* Header Section (Native Sticky) */}
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

      {/* Content Section (Scrolls over Header) */}
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
              <Button
                variant="ghost"
                className="group hidden md:flex items-center gap-2"
              >
                Lihat Semua Berita
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {DUMMY_NEWS.map((news) => (
              <article
                key={news.id}
                className="group flex flex-col gap-5 cursor-pointer"
              >
                {/* Image Container with overflow hidden for zoom effect */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-background/95 backdrop-blur-md text-xs font-medium rounded-full shadow-sm">
                      {news.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <time>{news.date}</time>
                  </div>
                  <h3 className="text-xl font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {news.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary mt-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                    Baca selengkapnya
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile button */}
          <Link href="/berita" className="w-full mt-10 md:hidden block">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              Lihat Semua Berita
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
