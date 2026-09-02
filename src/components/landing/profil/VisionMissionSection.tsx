"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Target, Compass } from "lucide-react";

export function VisionMissionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    // Use mm (matchMedia) to handle responsive animations
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Desktop: Pin and parallax
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: visionRef.current,
        pinSpacing: false,
      });

      gsap.to(visionRef.current, {
        opacity: 0.2,
        scale: 0.95,
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: missionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full bg-background">
      {/* Visi Section (Sticky on Desktop) */}
      <div 
        ref={visionRef} 
        className="w-full min-h-screen flex items-center justify-center bg-muted/30 relative z-0 py-16 md:py-24"
      >
        <div className="max-w-5xl px-6 flex flex-col md:flex-row items-center gap-8 md:gap-20">
          <div className="w-24 h-24 md:w-48 md:h-48 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
            <Compass className="w-10 h-10 md:w-24 md:h-24 text-primary relative z-10" />
          </div>
          <div className="flex flex-col gap-4 md:gap-6 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">Visi PIKI</h2>
            <p className="text-lg sm:text-xl md:text-3xl text-muted-foreground leading-snug font-light">
              Mewujudkan komunitas intelektual Kristen yang <span className="font-semibold text-foreground">kritis</span>, <span className="font-semibold text-foreground">kreatif</span>, dan <span className="font-semibold text-foreground">transformatif</span> dalam rangka membangun masyarakat, bangsa, dan negara yang berkeadilan, damai, dan sejahtera.
            </p>
          </div>
        </div>
      </div>

      {/* Misi Section (Scrolls over Visi) */}
      <div 
        ref={missionRef}
        className="w-full min-h-screen flex items-center py-16 md:py-32 bg-card relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[2.5rem] md:rounded-t-[5rem]"
      >
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-24">
          <div className="flex flex-col gap-4 md:gap-6 lg:sticky lg:top-32 h-fit">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-primary/10 flex items-center justify-center mb-2 md:mb-4">
              <Target className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">Misi Organisasi</h2>
            <div className="w-16 md:w-20 h-1 bg-primary rounded-full mt-2" />
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mt-2 md:mt-4 font-light">
              PIKI memiliki misi mulia untuk menjawab tantangan zaman melalui peran aktif kaum intelektual dalam berbagai sektor strategis pembangunan nasional.
            </p>
          </div>
          
          <div className="flex flex-col gap-8 md:gap-12 lg:gap-16 pt-2 md:pt-4">
            {[
              "Meningkatkan kualitas sumber daya manusia (SDM) anggota melalui kajian, riset, dan pelatihan yang berkesinambungan.",
              "Mengadvokasi kebijakan publik yang berpihak pada keadilan, hak asasi manusia, dan kelestarian lingkungan hidup.",
              "Menjalin kemitraan strategis dengan gereja, pemerintah, lembaga swadaya masyarakat, dan institusi pendidikan nasional maupun internasional.",
              "Memperteguh panggilan etis intelektual Kristen dalam pencegahan korupsi dan pembangunan karakter bangsa yang berintegritas.",
            ].map((text, i) => (
               <div key={i} className="flex gap-4 md:gap-6 group">
                <span className="text-4xl sm:text-5xl md:text-7xl font-bold text-border group-hover:text-primary transition-colors duration-500 font-mono">
                  0{i + 1}
                </span>
                <p className="text-base sm:text-lg md:text-2xl text-foreground font-medium leading-relaxed pt-1 md:pt-4">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
