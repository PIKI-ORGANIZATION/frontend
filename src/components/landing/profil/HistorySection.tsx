"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useSejarah } from "@/features/sejarah/hooks/useSejarah";
import { getSafeImageSrc } from "@/features/galeri/types";

export function HistorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Ambil data sejarah aktif dari API backend dengan fallback otomatis
  const { events } = useSejarah({ fallbackIfEmpty: true });

  useEffect(() => {
    if (events.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current || !wrapperRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const totalWidth = wrapper.scrollWidth - window.innerWidth;

      // Horizontal Scroll Tween
      const scrollTween = gsap.to(wrapper, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          end: () => "+=" + totalWidth,
        },
      });

      // Progress Bar Tween
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: () => "+=" + totalWidth,
              scrub: 1,
            },
          },
        );
      }

      // Grayscale/Monochrome Effect for Images
      const cards = gsap.utils.toArray(".history-card") as HTMLElement[];
      cards.forEach((card) => {
        const img = card.querySelector(".history-img");

        // Starts grayscale, turns color smoothly as it approaches center
        gsap.fromTo(
          img,
          { filter: "grayscale(100%)" },
          {
            filter: "grayscale(0%)",
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: "left 85%",
              end: "center 55%",
              scrub: true,
            },
          },
        );

        // Stays color in the middle, then turns back to grayscale smoothly as it leaves
        gsap.to(img, {
          filter: "grayscale(100%)",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            containerAnimation: scrollTween,
            start: "center 45%",
            end: "right 15%",
            scrub: true,
          },
        });
      });
    });

    // Fallback for mobile (Native horizontal scroll)
    mm.add("(max-width: 767px)", () => {
      const cards = gsap.utils.toArray(".history-card") as HTMLElement[];
      cards.forEach((card) => {
        const img = card.querySelector(".history-img");

        gsap.fromTo(
          img,
          { filter: "grayscale(100%)" },
          {
            filter: "grayscale(0%)",
            ease: "none",
            scrollTrigger: {
              trigger: card,
              scroller: ".no-scrollbar",
              horizontal: true,
              start: "left 85%",
              end: "center 55%",
              scrub: true,
            },
          },
        );

        gsap.to(img, {
          filter: "grayscale(100%)",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            scroller: ".no-scrollbar",
            horizontal: true,
            start: "center 45%",
            end: "right 15%",
            scrub: true,
          },
        });
      });
    });

    return () => mm.revert();
  }, [events]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-card border-y border-border/50 shadow-inner flex flex-col justify-start overflow-hidden"
    >
      {/* Absolute Header */}
      <div className="absolute top-12 md:top-16 left-6 md:left-16 z-20 pointer-events-none">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary">
          Sejarah PIKI
        </h2>
      </div>

      {/* The scrolling container */}
      <div className="w-full h-full overflow-x-auto md:overflow-hidden no-scrollbar snap-x snap-mandatory">
        <div
          ref={wrapperRef}
          className="flex gap-6 md:gap-24 w-max h-full items-start px-6 md:px-[10vw] pt-28 md:pt-48 pb-12 md:pb-0"
        >
          {events.map((item, i) => (
            <div
              key={item.id || i}
              className="history-card w-[85vw] md:w-[60vw] lg:w-[45vw] flex flex-col justify-start snap-center shrink-0 group"
            >
              <div className="relative w-full aspect-[16/10] md:aspect-video rounded-2xl md:rounded-3xl overflow-hidden mb-6 md:mb-8 shadow-2xl">
                <Image
                  src={getSafeImageSrc(item.image, "/footage/image1.webp")}
                  alt={item.title}
                  fill
                  className="history-img object-cover transition-transform duration-700 group-hover:scale-105 grayscale"
                  sizes="(max-width: 768px) 85vw, (max-width: 1024px) 60vw, 45vw"
                />

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                {/* Overlay Year Text */}
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full flex items-end justify-between">
                  <span className="text-5xl sm:text-6xl md:text-8xl font-black text-white/90 tracking-tighter drop-shadow-lg leading-none">
                    {item.year}
                  </span>

                  {/* Decorative dot line */}
                  <div className="hidden md:flex items-center gap-2 mb-4">
                    <div className="w-16 h-px bg-white/50" />
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:gap-4 max-w-2xl px-2">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="text-base md:text-xl text-muted-foreground leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicator for Desktop */}
      <div className="hidden md:block absolute bottom-12 left-16 right-16 h-[2.3px] bg-border z-10 overflow-hidden rounded-full">
        <div
          ref={progressRef}
          className="w-full h-full bg-primary rounded-full scale-x-0"
        />
      </div>
    </section>
  );
}
