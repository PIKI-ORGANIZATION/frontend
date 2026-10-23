import type { Metadata } from "next";
import { BeritaDetailView } from "@/components/news/BeritaDetailView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title,
    description: `Berita PIKI: ${title}`,
  };
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  return <BeritaDetailView slug={slug} />;
}
