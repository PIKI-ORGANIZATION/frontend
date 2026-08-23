import { LandingHero } from "@/components/landing/hero/LandingHero";
import { NewsSection } from "@/components/landing/news/NewsSection";
import { MinimalFooter } from "@/components/ui/minimal-footer";

export default function Home() {
  return (
    <main className="relative w-full overflow-x-clip">
      {/* Hero Section  */}
      <div className="sticky top-0 h-dvh w-full z-0 flex flex-col">
        <LandingHero />
      </div>

      {/* News Section & Footer (Scroll over hero) */}
      <div className="relative z-20">
        <NewsSection />
        <MinimalFooter />
      </div>
    </main>
  );
}
