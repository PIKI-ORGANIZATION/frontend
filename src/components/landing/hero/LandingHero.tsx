"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { HeroCardSwap } from "@/components/landing/hero/HeroCardSwap";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-animate", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.1,
      });
    }, textRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] items-center">
      {/* Kiri: Teks */}
      <div
        ref={textRef}
        className="flex flex-col gap-7 py-24 lg:py-0 px-6 md:px-10 lg:pl-16 xl:pl-24"
      >
        {/* Eyebrow */}
        <p className="hero-animate text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
          Persatuan Intelegensia Kristen Indonesia
        </p>

        {/* Heading */}
        <h1 className="hero-animate text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.05]">
          Sistem Informasi
          <br />
          <span className="text-primary">KTA Digital</span>
        </h1>

        {/* Sub */}
        <p className="hero-animate text-base text-muted-foreground max-w-sm leading-relaxed">
          Platform keanggotaan terpadu — pendataan, verifikasi, dan administrasi
          organisasi secara digital.
        </p>

        {/* CTAs */}
        <div className="hero-animate flex items-center gap-3 flex-wrap">
          <Button className="gap-2 px-6 py-5 rounded-lg text-sm font-medium">
            Daftar Sekarang
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Button>
          <Button
            variant="outline"
            className="px-6 py-5 rounded-lg text-sm font-medium"
          >
            Pelajari Lebih Lanjut
          </Button>
        </div>
      </div>

      {/* Kanan: CardSwap */}
      <div className="relative h-10 lg:h-[100dvh] overflow-visible">
        <HeroCardSwap />
      </div>
    </div>
  );
}
