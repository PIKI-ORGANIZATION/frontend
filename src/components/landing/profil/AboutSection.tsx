"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Background Image Clip Path Animation
      gsap.fromTo(
        imageRef.current,
        {
          clipPath: "inset(20% 20% 20% 20% round 32px)",
          scale: 1.2,
          filter: "brightness(0.5)",
        },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          scale: 1,
          filter: "brightness(1)",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "center center",
            scrub: 1,
          },
        },
      );

      // Text Reveal Animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "center 80%",
          end: "bottom center",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        ".about-text",
        { y: 100, opacity: 0, rotateX: -45 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          stagger: 0.15,
          duration: 1.2,
          ease: "power3.out",
          transformOrigin: "center top",
        },
      )
        .fromTo(
          ".about-line",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: "power3.out" },
          "-=0.6",
        )
        .fromTo(
          ".about-desc",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.6",
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-background overflow-hidden py-32 flex items-center justify-center"
    >
      {/* Background Parallax Element */}
      <div className="absolute inset-0 z-0 pointer-events-none" ref={imageRef}>
        <Image
          src="/footage/image2.jpeg"
          alt="PIKI Background"
          fill
          className="object-cover opacity-20 dark:opacity-17"
          sizes="100vw"
        />
        {/* Gradients to blend smoothly with adjacent sections */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-8 about-desc opacity-0">
          Tentang Organisasi
        </p>

        <div className="perspective-[1000px] mb-10 w-full">
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-bold tracking-tighter leading-[1.1]">
            <div className="overflow-hidden pb-2">
              <div className="about-text block">Wadah Perhimpunan</div>
            </div>
            <div className="overflow-hidden pb-2">
              <div className="about-text block text-primary">
                Intelektual Kristen
              </div>
            </div>
          </h2>
        </div>

        <div
          className="about-line w-24 h-1.5 bg-primary mb-12 origin-center rounded-full opacity-0"
          style={{ opacity: 1 }}
        />

        <p className="about-desc max-w-3xl text-lg md:text-2xl text-muted-foreground leading-relaxed opacity-0 font-light">
          Persatuan Intelegensia Kristen Indonesia (PIKI) terpanggil untuk
          mengaktualisasikan pelayanan di tengah dinamika masyarakat, bangsa,
          dan negara berdasarkan nilai-nilai Kristiani demi terwujudnya keadilan
          dan kesejahteraan.
        </p>
      </div>
    </section>
  );
}
