import { Navbar } from "@/components/layout/Navbar";
import { LandingHero } from "@/components/landing/hero/LandingHero";
import { NewsSection } from "@/components/landing/news/NewsSection";

export default function Home() {
  return (
    <main className="relative w-full overflow-x-clip bg-background text-foreground">
      {/* Global Fixed Navbar */}
      <Navbar />

      {/* Hero Section - sticky so it stays in place while scrolling */}
      <div className="sticky top-0 h-dvh w-full z-0 flex flex-col">
        <LandingHero />
      </div>

      {/* News Section */}
      <NewsSection />
    </main>
  );
}
