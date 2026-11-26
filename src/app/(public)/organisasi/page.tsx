"use client";

import { VisionMissionSection } from "@/components/landing/profil/VisionMissionSection";
import { HistorySection } from "@/components/landing/profil/HistorySection";
import { StructureSection } from "@/components/landing/profil/StructureSection";
import { ContactSection } from "@/components/landing/profil/ContactSection";
import { PageHeader } from "@/components/ui/page-header";
import { usePublicLandingSettings } from "@/features/page-setting/hooks/usePageSettings";

export default function OrganisasiPage() {
  const { aboutVision } = usePublicLandingSettings();

  return (
    <main className="w-full bg-background flex flex-col">
      {/* Header Section */}
      <section className="flex-1 w-full pt-32 pb-24 md:pt-40 md:pb-32 px-5 md:px-10 lg:px-30 mx-auto">
        <PageHeader
          eyebrow={aboutVision.aboutTagline}
          title={`${aboutVision.aboutTitle} ${aboutVision.aboutHighlight}`.trim()}
          description={aboutVision.aboutDescription}
        />
      </section>

      {/* Visi Misi Section (Reusable) */}
      <VisionMissionSection />

      {/* Sejarah Section (Reusable) */}
      <HistorySection />

      {/* Struktur Organisasi Section */}
      <StructureSection />

      {/* Contact Section */}
      <ContactSection />
    </main>
  );
}
