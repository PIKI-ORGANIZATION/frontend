import Image from "next/image";
import { Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

const DUMMY_NEWS = [
  {
    id: 1,
    title: "Kongres Nasional PIKI Ke-VI Sukses Diselenggarakan di Jakarta",
    date: "12 Agustus 2024",
    category: "Kegiatan",
    image: "/footage/image1.webp",
  },
  {
    id: 2,
    title: "Sidang Pleno DPP Membahas Program Kerja Strategis 2024-2029",
    date: "05 September 2024",
    category: "Organisasi",
    image: "/footage/image2.jpeg",
  },
  {
    id: 3,
    title: "Pelantikan Pengurus DPD Provinsi Bali Periode 2024-2029",
    date: "20 September 2024",
    category: "Daerah",
    image: "/footage/image3.jpg",
  },
  {
    id: 4,
    title: "Dialog Nasional Kebangsaan Menjelang Pemilu 2024",
    date: "10 Oktober 2023",
    category: "Kegiatan",
    image: "/footage/image1.webp",
  },
  {
    id: 5,
    title: "Kunjungan Kasih dan Aksi Sosial di Panti Asuhan",
    date: "25 Desember 2023",
    category: "Sosial",
    image: "/footage/image2.jpeg",
  },
  {
    id: 6,
    title: "FGD: Peran Pemuda Kristen dalam Pembangunan Daerah",
    date: "15 Januari 2024",
    category: "Diskusi",
    image: "/footage/image3.jpg",
  },
];

export default function BeritaPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <section className="flex-1 w-full pt-32 pb-24 md:pt-40 md:pb-32 px-5 md:px-10 lg:px-30 mx-auto">
        {/* Header */}
        <PageHeader
          eyebrow="Publikasi"
          title="Berita Terbaru"
          description="Ikuti perkembangan terkini mengenai kegiatan, advokasi, dan kontribusi nyata pergerakan organisasi di seluruh Indonesia."
        />

        {/* News Grid (Bento/Staggered Feel) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-x-8 md:gap-y-16">
          {DUMMY_NEWS.map((news) => (
            <article
              key={news.id}
              className="group flex flex-col gap-5 cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1.5 bg-background/95 backdrop-blur-md text-xs font-medium rounded-full shadow-sm text-foreground">
                    {news.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <time>{news.date}</time>
                </div>
                <h3 className="text-xl font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {news.title}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-primary mt-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                  Baca selengkapnya
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination / Load More */}
        <div className="mt-20 flex justify-center">
          <Button
            variant="outline"
            className="rounded-full px-8 py-6 text-sm font-medium tracking-wide"
          >
            Muat Lebih Banyak
          </Button>
        </div>
      </section>
    </main>
  );
}
