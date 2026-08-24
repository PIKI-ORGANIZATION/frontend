import { Navbar } from "@/components/layout/Navbar";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const DUMMY_AGENDA = [
  {
    id: 1,
    date: "15",
    month: "Okt",
    year: "2024",
    title: "Rapat Koordinasi Nasional (Rakornas) PIKI 2024",
    location: "Hotel Indonesia Kempinski, Jakarta",
    time: "08:00 - 16:00 WIB",
    category: "Nasional",
  },
  {
    id: 2,
    date: "28",
    month: "Okt",
    year: "2024",
    title: "Ibadah dan Perayaan Hari Sumpah Pemuda",
    location: "Gereja GPIB Immanuel, Jakarta Pusat",
    time: "17:00 - Selesai",
    category: "Ibadah",
  },
  {
    id: 3,
    date: "10",
    month: "Nov",
    year: "2024",
    title: "Seminar Kebangsaan: Peran Intelektual Kristen di Era Modern",
    location: "Aula Universitas Kristen Indonesia (UKI)",
    time: "09:00 - 13:00 WIB",
    category: "Pendidikan",
  },
  {
    id: 4,
    date: "01",
    month: "Des",
    year: "2024",
    title: "Aksi Sosial Donor Darah dan Pengobatan Gratis",
    location: "Klinik Pratama PGI, Jakarta",
    time: "08:00 - 12:00 WIB",
    category: "Sosial",
  },
];

export default function AgendaPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <section className="flex-1 w-full pt-32 pb-24 md:pt-40 md:pb-32 px-5 md:px-10 lg:px-30 mx-auto">
        {/* Header */}
        <PageHeader 
          align="center"
          eyebrow={<><CalendarDays className="w-4 h-4" /> Jadwal Kegiatan</>}
          title="Agenda PIKI"
          description="Ikuti dan berpartisipasi dalam berbagai kegiatan, seminar, ibadah, dan aksi sosial yang diselenggarakan oleh PIKI."
        />

        {/* Agenda List */}
        <div className="flex flex-col gap-6">
          {DUMMY_AGENDA.map((agenda) => (
            <div
              key={agenda.id}
              className="group flex flex-col md:flex-row bg-card border border-foreground/5 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Date Box */}
              <div className="md:w-48 bg-foreground/5 md:border-r border-foreground/10 flex flex-col items-center justify-center py-8 px-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <span className="text-sm font-bold uppercase tracking-wider mb-1 opacity-80">
                  {agenda.month}
                </span>
                <span className="text-5xl md:text-6xl font-black">
                  {agenda.date}
                </span>
                <span className="text-sm font-medium opacity-80 mt-1">
                  {agenda.year}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-foreground/5 text-foreground text-xs font-semibold rounded-full uppercase tracking-wider">
                    {agenda.category}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight group-hover:text-primary transition-colors">
                  {agenda.title}
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 opacity-70" />
                    {agenda.location}
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-foreground/20"></div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 opacity-70" />
                    {agenda.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
