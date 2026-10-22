import { Metadata } from "next";
import { BeritaFeature } from "@/features/berita";

export const metadata: Metadata = {
  title: "Manajemen Berita & Publikasi | Persatuan Inteligensia Kristen Indonesia",
  description:
    "CMS Manajemen Konten Pers Resmi, Opini Intelektual, Seminar, dan Publikasi Berita Digital DPP PIKI.",
};

export default function BeritaPage() {
  return <BeritaFeature />;
}
