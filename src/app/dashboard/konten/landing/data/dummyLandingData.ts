import { HistoryEvent, HeroContent, AboutVisionContent } from "../types";

export const initialHistoryEvents: HistoryEvent[] = [
  {
    id: "hist-1963",
    year: "1963",
    title: "Lahirnya PIKI",
    desc: "Berdiri di Jakarta atas kesadaran pentingnya partisipasi cendekiawan Kristen dalam pembangunan bangsa dan negara.",
    fullNarrative:
      "Persatuan Intelegensia Kristen Indonesia (PIKI) resmi didirikan di Jakarta sebagai wadah perhimpunan para cendekiawan dan profesional Kristen. Kelahiran PIKI dimotori oleh tekad untuk berkontribusi aktif dalam pembangunan nasional, pemikiran kebangsaan, dan pelayanan sosial kemasyarakatan berlandaskan nilai-nilai Kristiani yang universal.",
    image: "/footage/image1.webp",
    location: "Jakarta",
    keyFigure: "Tokoh Perintis PIKI",
    order: 1,
    status: "PUBLISHED",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "hist-1970",
    year: "1970",
    title: "Konsolidasi Organisasi",
    desc: "Membentuk cabang-cabang (DPC) dan daerah (DPD) di berbagai provinsi untuk memperluas jangkauan pelayanan ke seluruh pelosok negeri.",
    fullNarrative:
      "Memasuki dekade 1970-an, PIKI melakukan konsolidasi organisasi secara masif. Struktur Dewan Pimpinan Daerah (DPD) dan Dewan Pimpinan Cabang (DPC) mulai dibentuk di kota-kota strategis di Jawa, Sumatera, Sulawesi, Maluku, dan Papua guna menghimpun para intelektual lokal dalam menjawab tantangan kedaerahan.",
    image: "/footage/image2.jpeg",
    location: "Nasional",
    keyFigure: "Pengurus Wilayah & Cabang",
    order: 2,
    status: "PUBLISHED",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "hist-1998",
    year: "1998",
    title: "Era Reformasi",
    desc: "PIKI turut aktif menyuarakan pembaruan dan demokratisasi melalui berbagai kajian lintas disiplin dan pernyataan sikap organisasi.",
    fullNarrative:
      "Dalam gelombang transisi politik nasional 1998, PIKI menjadi salah satu pilar intelektual yang aktif menyuarakan penegakan hak asasi manusia, reformasi konstitusi, kebebasan beragama, dan penguatan nilai-nilai demokrasi kebangsaan melalui sumbangan pemikiran lintas disiplin ilmu.",
    image: "/footage/image3.jpg",
    location: "Jakarta",
    keyFigure: "Cendekiawan & Akademisi PIKI",
    order: 3,
    status: "PUBLISHED",
    createdAt: "2024-01-03T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
  },
  {
    id: "hist-2010",
    year: "2010",
    title: "Program Revitalisasi",
    desc: "Fokus pada pemberdayaan generasi muda dan profesional Kristen untuk menjawab tantangan era globalisasi dan digital.",
    fullNarrative:
      "PIKI meluncurkan inisiatif revitalisasi kelembagaan dengan merangkul lebih banyak generasi muda, profesional muda, dan akademisi masa depan. Program kaderisasi dan penguatan kapasitas intelektual diperkuat untuk menghadapi dinamika globalisasi dan kemajuan sains-teknologi.",
    image: "/footage/image1.webp",
    location: "Nasional",
    keyFigure: "Generasi Muda PIKI",
    order: 4,
    status: "PUBLISHED",
    createdAt: "2024-01-04T00:00:00.000Z",
    updatedAt: "2024-01-04T00:00:00.000Z",
  },
  {
    id: "hist-2024",
    year: "2024",
    title: "Transformasi Digital",
    desc: "Peluncuran Sistem CMS Nasional & Satu Data PIKI untuk manajemen keanggotaan terpusat dan penerbitan KTA Digital otomatis.",
    fullNarrative:
      "Era baru tata kelola organisasi ditandai dengan peluncuran Ekosistem Digital PIKI: portal satu data nasional, pendaftaran anggota online terverifikasi berjenjang, dan penerbitan Kartu Tanda Anggota (KTA) Digital berbasis QR Code otentik guna memastikan transparansi serta akurasi keanggotaan nasional.",
    image: "/footage/image2.jpeg",
    location: "Pusat & Wilayah",
    keyFigure: "DPP PIKI Nasional",
    order: 5,
    status: "PUBLISHED",
    createdAt: "2024-01-05T00:00:00.000Z",
    updatedAt: "2024-01-05T00:00:00.000Z",
  },
];

export const initialHeroContent: HeroContent = {
  eyebrow: "Persatuan Intelegensia Kristen Indonesia",
  title: "Sistem Informasi",
  highlight: "KTA Digital",
  subtitle:
    "Platform keanggotaan terpadu — pendataan, verifikasi, dan administrasi organisasi secara digital.",
  primaryCtaText: "Daftar Anggota",
  primaryCtaUrl: "/register",
  secondaryCtaText: "Masuk Portal",
  secondaryCtaUrl: "/login",
  updatedAt: "2024-10-28T00:00:00.000Z",
};

export const initialAboutVisionContent: AboutVisionContent = {
  aboutTagline: "Tentang Organisasi",
  aboutTitle: "Wadah Perhimpunan",
  aboutHighlight: "Intelektual Kristen",
  aboutDescription:
    "Persatuan Intelegensia Kristen Indonesia (PIKI) terpanggil untuk mengaktualisasikan pelayanan di tengah dinamika masyarakat, bangsa, dan negara berdasarkan nilai-nilai Kristiani demi terwujudnya keadilan dan kesejahteraan.",
  visionTitle: "Visi PIKI",
  visionText:
    "Mewujudkan komunitas intelektual Kristen yang kritis, kreatif, dan transformatif dalam rangka membangun masyarakat, bangsa, dan negara yang berkeadilan, damai, dan sejahtera.",
  missionPoints: [
    "Meningkatkan kualitas sumber daya manusia (SDM) anggota melalui kajian, riset, dan pelatihan yang berkesinambungan.",
    "Mengadvokasi kebijakan publik yang berpihak pada keadilan, hak asasi manusia, dan kelestarian lingkungan hidup.",
    "Menjalin kemitraan strategis dengan gereja, pemerintah, lembaga swadaya masyarakat, dan institusi pendidikan nasional maupun internasional.",
    "Memperteguh panggilan etis intelektual Kristen dalam pencegahan korupsi dan pembangunan karakter bangsa yang berintegritas.",
  ],
  updatedAt: "2024-10-28T00:00:00.000Z",
};
