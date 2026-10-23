import type { Metadata } from "next";
import { BeritaPublicView } from "@/components/news/BeritaPublicView";

export const metadata: Metadata = {
  title: "Berita",
  description:
    "Berita resmi Persatuan Inteligensia Kristen Indonesia dari DPP, DPD, dan DPC, lengkap dengan kategori, slug, dan jumlah pembaca.",
};

export default function BeritaPage() {
  return <BeritaPublicView />;
}
