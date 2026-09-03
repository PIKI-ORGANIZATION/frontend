import { Suspense } from "react";
import type { Metadata } from "next";
import { LandingHero } from "@/components/landing/hero/LandingHero";
import { NewsSection } from "@/components/landing/profil/NewsSection";
import { AboutSection } from "@/components/landing/profil/AboutSection";
import { VisionMissionSection } from "@/components/landing/profil/VisionMissionSection";
import { HistorySection } from "@/components/landing/profil/HistorySection";
import { StructureSection } from "@/components/landing/profil/StructureSection";
import { ProgramSection } from "@/components/landing/profil/ProgramSection";
import { StatistikSection } from "@/components/landing/profil/StatistikSection";

export const metadata: Metadata = {
  title: "Beranda | PIKI - Persatuan Intelegensia Kristen Indonesia",
  description: "Selamat datang di website resmi Persatuan Intelegensia Kristen Indonesia. Daftarkan diri Anda dan jadilah bagian dari PIKI.",
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "Persatuan Intelegensia Kristen Indonesia",
    alternateName: "PIKI",
    url: "https://dpp-piki.org/",
    logo: "https://dpp-piki.org/logo1.png",
    description: "Website Resmi dan Sistem Informasi Persatuan Intelegensia Kristen Indonesia (PIKI).",
  };

  return (
    <main className="relative w-full overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section  */}
      <div className="sticky top-0 h-dvh w-full z-0 flex flex-col">
        <LandingHero />
      </div>

      {/* Profil Organisasi, News Section & Footer (Scroll over hero) */}
      <div className="relative z-20 bg-background">
        <AboutSection />
        <VisionMissionSection />
        <StatistikSection />
        <HistorySection />
        <StructureSection />
        <ProgramSection />
        <NewsSection />
      </div>
    </main>
  );
}
