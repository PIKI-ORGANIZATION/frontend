"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";

const STRUCTURE_DATA = [
  {
    role: "Sekretaris Jenderal",
    name: "BENYAMIN PATONDOK,",
    desc: "Mengelola administrasi, operasional harian, dan kerja-kerja rumah tangga organisasi.",
    image: "/footage/pimpinan/sekjen.png",
  },
  {
    role: "Ketua Umum",
    name: "MARUARAR SIRAIT",
    desc: "Memimpin arah strategis nasional organisasi.",
    image: "/footage/pimpinan/ketum.jpg",
  },
  {
    role: "Bendahara Umum",
    name: "JUNIVER GIRSANG",
    desc: "Mengelola dan mengawasi keuangan organisasi.",
    image: "/footage/pimpinan/bendahara.jpg",
  },
];

export function StructureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Heading Reveal
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

      // Staggered Grid Reveal
      const cards = gsap.utils.toArray(".structure-card");
      gsap.fromTo(
        cards,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".structure-grid",
            start: "top 80%",
          },
        },
      );

      // Image Parallax Effect
      const images = gsap.utils.toArray(".structure-img-inner");
      images.forEach((img: any) => {
        gsap.to(img, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div ref={headingRef} className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-4">
            Kepengurusan
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Dewan Pimpinan Pusat
          </h2>
          <p className="text-lg text-muted-foreground">
            Sinergi kepemimpinan untuk menggerakkan roda organisasi dan
            mewujudkan visi misi PIKI di seluruh Indonesia.
          </p>
        </div>

        <div className="structure-grid grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
          {STRUCTURE_DATA.map((person, i) => (
            <div
              key={i}
              className="structure-card flex flex-col group cursor-pointer"
            >
              {/* Image Container with Parallax inner */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-muted">
                {/* Parallax inner wrapper, scaled up so it has room to move */}
                <div className="structure-img-inner absolute inset-[-15%] w-[130%] h-[130%]">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                {/* Vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80" />

                {/* Role Badge */}
                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur text-primary-foreground text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  {person.role}
                </div>
              </div>

              {/* Text Info */}
              <div className="flex flex-col gap-2 px-2">
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {person.name}
                </h3>
                <p className="text-sm font-semibold text-primary/80 uppercase tracking-wide">
                  {person.role}
                </p>
                <p className="text-muted-foreground mt-2 line-clamp-2">
                  {person.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}