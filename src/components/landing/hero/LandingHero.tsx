"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { HeroCardSwap } from "@/components/landing/hero/HeroCardSwap";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
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
    <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] items-center relative">
      {/* Decorative background for mobile */}
      <div className="absolute inset-0 z-0 overflow-hidden lg:hidden pointer-events-none">
        <div className="absolute top-[10%] -left-[20%] w-[70%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Kiri: Teks */}
      <div
        ref={textRef}
        className="flex flex-col gap-5 sm:gap-7 pt-24 pb-8 sm:py-16 md:py-24 lg:py-0 px-6 sm:px-8 md:px-10 lg:pl-16 xl:pl-24 z-10 items-center text-center lg:items-start lg:text-left"
      >
        {/* Eyebrow */}
        <p className="hero-animate text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
          Persatuan Intelegensia Kristen Indonesia
        </p>

        {/* Heading */}
        <h1 className="hero-animate text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.1] lg:leading-[1.05]">
          Sistem Informasi
          <br />
          <span className="text-primary">KTA Digital</span>
        </h1>

        {/* Sub */}
        <p className="hero-animate text-sm sm:text-base text-muted-foreground max-w-xs sm:max-w-md lg:max-w-sm leading-relaxed mx-auto lg:mx-0">
          Platform keanggotaan terpadu — pendataan, verifikasi, dan administrasi
          organisasi secara digital.
        </p>

        {/* CTAs */}
        <div className="hero-animate flex items-center justify-center lg:justify-start gap-3 flex-wrap">
          <Link href="/register">
            <Button className="gap-2 px-5 py-4 sm:px-6 sm:py-5 rounded-lg text-xs sm:text-sm font-medium">
              Daftar Sekarang
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
          </Link>
          <Link href="/organisasi">
            <Button
              variant="outline"
              className="px-5 py-4 sm:px-6 sm:py-5 rounded-lg text-xs sm:text-sm font-medium"
            >
              Pelajari Lebih Lanjut
            </Button>
          </Link>
        </div>
      </div>

      {/* Kanan: CardSwap */}
      <div className="hidden lg:block relative w-full lg:h-[100dvh] overflow-visible">
        <HeroCardSwap />
      </div>
    </div>
  );
}
