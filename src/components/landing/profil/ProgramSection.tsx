"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const PROGRAMS = [
  {
    id: 1,
    title: "Satu Data PIKI",
    category: "Transformasi Digital",
    desc: "Membangun sistem informasi dan database keanggotaan terintegrasi secara nasional untuk memudahkan konsolidasi organisasi secara real-time.",
    image: "/footage/image1.webp",
  },
  {
    id: 2,
    title: "Kajian Kebijakan",
    category: "Advokasi & Riset",
    desc: "Melakukan penelitian ilmiah dan memberikan rekomendasi strategis terhadap berbagai isu kebangsaan, hukum, dan Hak Asasi Manusia.",
    image: "/footage/image2.jpeg",
  },
  {
    id: 3,
    title: "Kaderisasi Pemimpin",
    category: "Pendidikan",
    desc: "Program pelatihan kepemimpinan khusus bagi pemuda dan profesional Kristen untuk mempersiapkan generasi pemimpin masa depan.",
    image: "/footage/image3.jpg",
  },
  {
    id: 4,
    title: "Ekonomi Kerakyatan",
    category: "Pemberdayaan",
    desc: "Mendorong semangat kewirausahaan serta mendampingi UMKM yang dikelola oleh anggota masyarakat di berbagai daerah.",
    image: "/footage/image1.webp",
  },
];

export function ProgramSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // List items reveal animation
      gsap.fromTo(
        ".program-item",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full py-32 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 program-item">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-4">Agenda Strategis</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Program Kerja Utama</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-md font-light leading-relaxed">
            Langkah konkrit yang kami lakukan untuk memberikan dampak positif secara berkesinambungan.
          </p>
        </div>

        <div className="flex flex-col border-t border-border/50">
          {PROGRAMS.map((program, i) => (
            <div
              key={program.id}
              className="program-item group relative border-b border-border/50 py-10 md:py-14 flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Background Hover Effect */}
              <div className="absolute inset-0 bg-muted/30 scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-out -z-10" />

              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12 md:w-1/2 z-10">
                <span className="text-2xl font-mono text-muted-foreground font-light hidden md:block">0{i + 1}</span>
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-3 group-hover:text-primary transition-colors">{program.title}</h3>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {program.category}
                  </span>
                </div>
              </div>

              <div className="md:w-1/3 z-10">
                <p className="text-muted-foreground leading-relaxed font-light">{program.desc}</p>
              </div>

              <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full border border-border group-hover:border-primary group-hover:bg-primary transition-colors duration-500 z-10 shrink-0">
                <ArrowUpRight className="w-6 h-6 text-foreground group-hover:text-primary-foreground transition-colors" />
              </div>

              {/* Floating Image powered by Framer Motion (Desktop Only) */}
              <AnimatePresence>
                {hoveredIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="hidden lg:block absolute left-[55%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[220px] rounded-2xl overflow-hidden shadow-2xl z-20 pointer-events-none"
                  >
                    <Image
                      src={program.image}
                      alt={program.title}
                      fill
                      className="object-cover"
                      sizes="350px"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
