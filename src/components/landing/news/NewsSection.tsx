"use client";

import Image from "next/image";
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
  {
    id: 4,
    title: "Audiensi Pengurus Pusat dengan Kementerian Agama RI",
    date: "10 Oktober 2024",
    category: "Audiensi",
    image: "/footage/image1.webp",
  },
  {
    id: 5,
    title: "FGD: Peran Intelektual Kristen dalam Pembangunan Nasional",
    date: "28 Oktober 2024",
    category: "Diskusi",
    image: "/footage/image2.jpeg",
  },
  {
    id: 6,
    title: "Pelatihan Kepemimpinan Pemuda Kristen Tingkat Nasional",
    date: "15 November 2024",
    category: "Pelatihan",
    image: "/footage/image3.jpg",
  },
];

export function NewsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(containerRef.current, {
        borderTopLeftRadius: "50vw",
        borderTopRightRadius: "50vw",
      });

      // Animate curve to straight when scrolling
      gsap.to(containerRef.current, {
        borderTopLeftRadius: "0vw",
        borderTopRightRadius: "0vw",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom", // when the top of the section hits the bottom of the viewport
          end: "top center", // when the top of the section hits the center of the viewport
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-20 bg-background border-t border-border/40 shadow-[0_-20px_50px_rgba(0,0,0,0.07)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.7)] overflow-hidden"
    >
      <section className="w-full py-24 px-6 md:px-10 lg:px-16 xl:px-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-3">
              Kabar Terbaru
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Berita & Informasi PIKI
            </h2>
          </div>
          <Button
            variant="ghost"
            className="group hidden md:flex items-center gap-2"
          >
            Lihat Semua Berita
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <span className="px-3 py-1.5 bg-background/90 backdrop-blur-md text-xs font-medium rounded-full shadow-sm">
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
        <Button
          variant="outline"
          className="w-full mt-10 md:hidden flex items-center justify-center gap-2"
        >
          Lihat Semua Berita
          <ArrowRight className="w-4 h-4" />
        </Button>
      </section>
    </div>
  );
}
