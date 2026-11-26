"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useSejarah } from "@/features/sejarah/hooks/useSejarah";
import { getSafeImageSrc } from "@/features/galeri/types";

const pad = (n: number) => String(n).padStart(2, "0");

export function HistorySection() {
  const containerRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  // Ambil data sejarah aktif dari API backend dengan fallback otomatis
  const { events } = useSejarah({ fallbackIfEmpty: true, publicMode: true });

  useEffect(() => {
    if (events.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    const mm = gsap.matchMedia();

    // Desktop: horizontal scroll ter-pin. Hanya properti compositor (transform & opacity).
    // Pengguna dengan prefers-reduced-motion mendapat scroller horizontal native tanpa pin.
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const getDistance = () =>
          Math.max(0, wrapper.scrollWidth - window.innerWidth);

        const setProgress = progressRef.current
          ? (gsap.quickSetter(progressRef.current, "scaleX") as (
              v: number,
            ) => void)
          : null;

        let lastIndex = -1;
        const total = events.length;

        const scrollTween = gsap.to(wrapper, {
          x: () => -getDistance(),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: container,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            scrub: 0.8,
            start: "top top",
            end: () => "+=" + getDistance(),
            onUpdate: () => {
              // Ikuti tween yang sudah di-smooth agar bar & kartu selalu sinkron
              const p = scrollTween.progress();
              setProgress?.(p);

              const index = Math.min(total - 1, Math.round(p * (total - 1)));
              if (index !== lastIndex && counterRef.current) {
                lastIndex = index;
                counterRef.current.textContent = `${pad(index + 1)} / ${pad(total)}`;
              }
            },
          },
        });

        const cards = gsap.utils.toArray<HTMLElement>(".history-card");
        cards.forEach((card) => {
          const media = card.querySelector<HTMLElement>(".history-media");
          const year = card.querySelector<HTMLElement>(".history-year");

          // Fokus kartu: membesar & menyala saat di tengah, meredup saat menjauh
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            })
            .fromTo(
              card,
              { opacity: 0.35, scale: 0.94 },
              { opacity: 1, scale: 1, ease: "power1.out", duration: 0.4 },
            )
            .to(card, { opacity: 1, scale: 1, duration: 0.2 })
            .to(card, {
              opacity: 0.35,
              scale: 0.94,
              ease: "power1.in",
              duration: 0.4,
            });

          // Parallax foto: bergerak lebih lambat dari kartu (kedalaman)
          if (media) {
            gsap.fromTo(
              media,
              { xPercent: -8 },
              {
                xPercent: 8,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: scrollTween,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            );
          }

          // Parallax tahun: bergerak sedikit lebih cepat dari kartu
          if (year) {
            gsap.fromTo(
              year,
              { x: 60 },
              {
                x: -60,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: scrollTween,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            );
          }
        });
      },
    );

    return () => mm.revert();
  }, [events]);

  return (
    <section
      ref={containerRef}
      aria-label="Sejarah PIKI"
      className="relative flex h-screen w-full flex-col overflow-hidden border-y border-border/50 bg-background"
    >
      {/* Header */}
      <div className="pointer-events-none absolute left-6 top-10 z-20 md:left-16 md:top-14">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary md:text-sm">
          Perjalanan Organisasi
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Sejarah PIKI
        </h2>
      </div>

      {/* Scroller */}
      <div className="no-scrollbar h-full w-full snap-x snap-mandatory overflow-x-auto md:snap-none md:overflow-hidden md:motion-reduce:snap-x md:motion-reduce:overflow-x-auto">
        <div
          ref={wrapperRef}
          className="flex h-full w-max items-center gap-6 px-6 pb-16 pt-32 will-change-transform md:gap-20 md:px-[10vw] md:pb-24 md:pt-40"
        >
          {events.map((item, i) => (
            <article
              key={item.id || i}
              className="history-card group flex w-[85vw] shrink-0 snap-center flex-col will-change-transform md:w-[52vw] lg:w-[40vw]"
            >
              {/* Foto */}
              <div className="relative mb-6 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60 md:mb-8 md:rounded-3xl">
                <div className="history-media absolute inset-y-0 -left-[10%] w-[120%] will-change-transform">
                  <Image
                    src={getSafeImageSrc(item.image, "/footage/image1.webp")}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 62vw, 48vw"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              {/* Teks */}
              <div className="flex flex-col gap-3 px-1 md:gap-4">
                <div className="flex items-center gap-4">
                  <span className="history-year text-5xl font-black leading-none tracking-tighter text-primary will-change-transform md:text-7xl">
                    {item.year}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-gradient-to-r from-border to-transparent"
                  />
                </div>
                <h3 className="text-xl font-bold leading-snug text-foreground md:text-3xl">
                  {item.title}
                </h3>
                <p className="line-clamp-4 max-w-xl text-sm font-light leading-relaxed text-muted-foreground md:text-lg">
                  {item.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Progress (desktop) */}
      <div
        aria-hidden="true"
        className="absolute bottom-10 left-16 right-16 z-10 hidden items-center gap-4 md:flex"
      >
        <span
          ref={counterRef}
          className="font-mono text-xs tabular-nums text-muted-foreground"
        >
          {`01 / ${pad(events.length)}`}
        </span>
        <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-border">
          <div
            ref={progressRef}
            className="h-full w-full origin-left scale-x-0 rounded-full bg-primary will-change-transform"
          />
        </div>
      </div>
    </section>
  );
}
