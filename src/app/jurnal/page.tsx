import { BookOpen, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

const DUMMY_JURNAL = [
  {
    id: 1,
    title:
      "Peran Pemuda Kristen dalam Transformasi Digital dan Pembangunan Ekonomi Daerah",
    authors: "Dr. Alexander Sihombing, M.Th, et al.",
    year: "2024",
    volume: "Vol. 12 No. 2",
    abstract:
      "Penelitian ini mengkaji bagaimana peran pemuda Kristen dalam menghadapi era transformasi digital, khususnya dalam memberikan dampak pada pembangunan ekonomi di daerah...",
  },
  {
    id: 2,
    title: "Teologi Publik dan Keterlibatan Gereja dalam Isu Keadilan Sosial",
    authors: "Pdt. Maria Nainggolan, Ph.D",
    year: "2023",
    volume: "Vol. 11 No. 4",
    abstract:
      "Sebuah tinjauan sistematis tentang bagaimana teologi publik di Indonesia dapat menjadi landasan bagi gereja untuk berpartisipasi aktif dalam advokasi keadilan sosial...",
  },
  {
    id: 3,
    title:
      "Evaluasi Program Pemberdayaan Masyarakat Berbasis Nilai Kekristenan",
    authors: "Prof. Budi Setyawan",
    year: "2023",
    volume: "Vol. 11 No. 3",
    abstract:
      "Studi kasus pada program pemberdayaan masyarakat di pedesaan yang diprakarsai oleh DPD PIKI Provinsi Sumatera Utara...",
  },
  {
    id: 4,
    title: "Etika Kepemimpinan Kristen di Ruang Publik Masa Kini",
    authors: "Dr. Yohanis Tan, M.A",
    year: "2022",
    volume: "Vol. 10 No. 1",
    abstract:
      "Menelusuri tantangan dan peluang bagi para pemimpin Kristen yang berkarya di sektor pemerintahan dan swasta dalam menjaga integritas...",
  },
];

export default function JurnalPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <section className="flex-1 w-full pt-32 pb-24 md:pt-40 md:pb-32 px-5 md:px-10 lg:px-30 mx-auto">
        {/* Header */}
        <PageHeader
          eyebrow={
            <>
              <BookOpen className="w-4 h-4" /> Jurnal & Publikasi Ilmiah
            </>
          }
          title="Kajian Akademis"
          description="Kumpulan jurnal, artikel ilmiah, dan publikasi penelitian yang berkontribusi pada pembangunan pemikiran dan praksis nilai-nilai kekristenan di Indonesia."
          border={true}
        />

        {/* Jurnal List */}
        <div className="flex flex-col gap-12">
          {DUMMY_JURNAL.map((jurnal) => (
            <article
              key={jurnal.id}
              className="flex flex-col md:flex-row gap-6 md:gap-12 group"
            >
              <div className="md:w-1/4 flex flex-col gap-1 pt-1 border-t-2 border-transparent group-hover:border-primary transition-colors">
                <span className="text-2xl font-bold">{jurnal.year}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {jurnal.volume}
                </span>
              </div>

              <div className="md:w-3/4 flex flex-col gap-4">
                <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {jurnal.title}
                </h2>

                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <User className="w-4 h-4" />
                  {jurnal.authors}
                </div>

                <p className="text-muted-foreground leading-relaxed mt-2">
                  {jurnal.abstract}
                </p>

                <div className="mt-4 flex gap-4">
                  <Button className="rounded-full px-6 gap-2">
                    <Download className="w-4 h-4" />
                    Unduh PDF
                  </Button>
                  <Button variant="outline" className="rounded-full px-6">
                    Baca Abstrak
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination / Load More */}
        <div className="mt-24 flex justify-center border-t border-foreground/10 pt-12">
          <Button
            variant="ghost"
            className="rounded-full px-8 py-6 text-sm font-medium tracking-wide"
          >
            Tampilkan Jurnal Lainnya
          </Button>
        </div>
      </section>
    </main>
  );
}
