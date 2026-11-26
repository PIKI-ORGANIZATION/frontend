"use client";

import { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  CalendlyCarousel,
  type CarouselItem,
} from "@/components/ui/connected-carousel";
import { usePublicStruktur } from "@/features/pengurus/hooks/usePengurus";
import { initialPengurusData } from "@/features/pengurus/data/dummyPengurusData";

export function StructureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  const { items, isLoaded } = usePublicStruktur();

  // Hanya tampilkan Pimpinan Inti yang berstatus PUBLISHED (fallback ke data awal)
  const pimpinanInti = useMemo(() => {
    const fallbackInti = initialPengurusData
      .filter((i) => i.kategori === "INTI" && i.status === "PUBLISHED")
      .sort((a, b) => a.urutan - b.urutan);

    if (!isLoaded || items.length === 0) {
      return fallbackInti;
    }

    const filtered = items
      .filter((i) => i.kategori === "INTI" && i.status === "PUBLISHED")
      .sort((a, b) => a.urutan - b.urutan);

    return filtered.length > 0 ? filtered : fallbackInti;
  }, [items, isLoaded]);

  const carouselItems = useMemo<CarouselItem[]>(
    () =>
      pimpinanInti.map((person) => {
        const photo = person.foto || "/footage/image1.webp";
        const roleLabel =
          person.bidang ||
          (person.periode && person.periode !== "-"
            ? `Dewan Pimpinan Pusat · ${person.periode}`
            : "Dewan Pimpinan Pusat");

        return {
          id: person.id,
          stat: person.jabatan,
          quote: person.deskripsi,
          author: person.nama,
          role: roleLabel,
          defaultImage: photo,
          selectedImage: photo,
          alt: `${person.nama} — ${person.jabatan}`,
        };
      }),
    [pimpinanInti],
  );

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current || !headingRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-16 md:py-28 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div
          ref={headingRef}
          className="text-center max-w-3xl mx-auto mb-10 md:mb-14"
        >
          <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-primary mb-3 md:mb-4">
            Kepengurusan
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
            Dewan Pimpinan Pusat
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Sinergi kepemimpinan untuk menggerakkan roda organisasi dan
            mewujudkan visi misi PIKI di seluruh Indonesia.
          </p>
        </div>

        <CalendlyCarousel
          items={carouselItems}
          aria-label="Pimpinan Inti Dewan Pimpinan Pusat"
        />
      </div>
    </section>
  );
}
