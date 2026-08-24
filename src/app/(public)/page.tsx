import { LandingHero } from "@/components/landing/hero/LandingHero";
import { NewsSection } from "@/components/landing/profil/NewsSection";
import { AboutSection } from "@/components/landing/profil/AboutSection";
import { VisionMissionSection } from "@/components/landing/profil/VisionMissionSection";
import { HistorySection } from "@/components/landing/profil/HistorySection";
import { StructureSection } from "@/components/landing/profil/StructureSection";
import { ProgramSection } from "@/components/landing/profil/ProgramSection";
import { StatistikSection } from "@/components/landing/profil/StatistikSection";

export default function Home() {
  return (
    <main className="relative w-full overflow-x-clip">
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
