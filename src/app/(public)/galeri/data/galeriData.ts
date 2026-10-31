import { Camera, Film, Layers } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import type { MediaFilterOption, MediaItem } from "../types";

export const CATEGORIES = [
  "Semua Kegiatan",
  "Kongres & Pelantikan",
  "Kajian & Diskusi Pakar",
  "Bakti Sosial",
  "Kerjasama Lembaga",
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];

export const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] =
  CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

export const MEDIA_FILTERS: MediaFilterOption[] = [
  { value: "ALL", label: "Semua Media", icon: Layers },
  { value: "PHOTO", label: "Galeri Foto", icon: Camera },
  { value: "VIDEO", label: "Video Liputan", icon: Film },
  { value: "INSTAGRAM", label: "Feed Instagram", icon: FaInstagram },
];

export const GALLERY_DATA: MediaItem[] = [
  {
    id: "kongres-2024-highlight",
    title:
      "Kongres Nasional DPP PIKI 2024: Membangun Bangsa Berintegritas & Cendekia",
    deskripsi:
      "Rekaman paripurna pembukaan Kongres Nasional DPP PIKI yang dihadiri perwakilan DPD dari 34 provinsi, merumuskan arah gerak kebangsaan dan kontribusi cendekiawan Kristen dalam menyongsong Indonesia Emas.",
    type: "VIDEO",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "/footage/image1.webp",
    kategoriKegiatan: "Kongres & Pelantikan",
    tanggal: "15 Oktober 2024",
    lokasi: "Grand Sahid Jaya, Jakarta",
    duration: "14:32",
    youtubeVideoId: "dQw4w9WgXcQ",
    featured: true,
  },
  {
    id: "pelantikan-dewan-pakar",
    title: "Pengukuhan Dewan Penasehat & Pengurus Harian Periode 2024–2029",
    deskripsi:
      "Momen khidmat pengukuhan jajaran pengurus pusat PIKI yang dipimpin oleh tokoh rohani dan pimpinan lembaga keumatan nasional.",
    type: "PHOTO",
    url: "/footage/image2.jpeg",
    thumbnailUrl: "/footage/image2.jpeg",
    kategoriKegiatan: "Kongres & Pelantikan",
    tanggal: "16 Oktober 2024",
    lokasi: "Jakarta Pusat",
  },
  {
    id: "kajian-etika-digital",
    title: "Kajian Pakar: Transformasi Digital & Ketahanan Etika Publik",
    deskripsi:
      "Diskusi panel cendekiawan lintas disiplin ilmu membahas tantangan disrupsi kecerdasan buatan (AI) serta penguatan etika kebangsaan di ruang digital.",
    type: "VIDEO",
    url: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    thumbnailUrl: "/footage/image3.jpg",
    kategoriKegiatan: "Kajian & Diskusi Pakar",
    tanggal: "28 September 2024",
    lokasi: "Auditorium CSIS, Jakarta",
    duration: "08:45",
    youtubeVideoId: "M7lc1UVf-VE",
  },
  {
    id: "baksos-pendidikan-pesisir",
    title: "Aksi Peduli Kasih & Beasiswa Pendidikan Anak Pesisir",
    deskripsi:
      "Penyaluran 200 paket beasiswa perlengkapan sekolah dan renovasi sudut baca literasi anak di wilayah binaan DPD PIKI.",
    type: "PHOTO",
    url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop",
    kategoriKegiatan: "Bakti Sosial",
    tanggal: "12 September 2024",
    lokasi: "Kepulauan Seribu, DKI Jakarta",
  },
  {
    id: "ig-pilkada-damai",
    title:
      "Pernyataan Sikap Moral DPP PIKI Terkait Pilkada Serentak Damai 2024",
    deskripsi:
      "Seruan kebangsaan pimpinan cendekiawan Kristen untuk menjaga integritas, kejujuran proses demokrasi, dan menolak politisasi SARA.",
    type: "INSTAGRAM",
    url: "https://www.instagram.com/piki.official/",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop",
    kategoriKegiatan: "Kerjasama Lembaga",
    tanggal: "05 September 2024",
    instagramUrl: "https://www.instagram.com/piki.official/",
  },
  {
    id: "workshop-kepemimpinan-muda",
    title: "Lokakarya Kepemimpinan Etis Cendekiawan Masa Depan",
    deskripsi:
      "Pembekalan kepemimpinan publik dan diplomasi kebangsaan bagi 70 aktivis mahasiswa dan akademisi muda perwakilan universitas se-Indonesia.",
    type: "PHOTO",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop",
    kategoriKegiatan: "Kajian & Diskusi Pakar",
    tanggal: "20 Agustus 2024",
    lokasi: "Wisma Kinasih, Bogor",
  },
  {
    id: "dialog-ketahanan-ekonomi",
    title: "Dialog Interaktif: Penguatan Ketahanan Pangan & Ekonomi Kerakyatan",
    deskripsi:
      "Paparan rekomendasi strategis Dewan Pakar Ekonomi PIKI yang disampaikan dalam seminar nasional bersama pelaku UMKM.",
    type: "VIDEO",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
    kategoriKegiatan: "Kajian & Diskusi Pakar",
    tanggal: "08 Agustus 2024",
    lokasi: "Surabaya, Jawa Timur",
    duration: "18:20",
    youtubeVideoId: "dQw4w9WgXcQ",
  },
  {
    id: "audiensi-lembaga-negara",
    title: "Audiensi Resmi Dewan Pimpinan Pusat Bersama Lembaga Tinggi Negara",
    deskripsi:
      "Pertemuan audiensi dalam rangka penyerahan naskah kebijakan (policy brief) terkait penguatan nilai-nilai Pancasila di era globalisasi.",
    type: "PHOTO",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
    kategoriKegiatan: "Kerjasama Lembaga",
    tanggal: "17 Juli 2024",
    lokasi: "Kompleks Parlemen, Jakarta",
  },
  {
    id: "ig-kemerdekaan-ri",
    title: "Refleksi HUT Kemerdekaan RI: Menjaga Api Semangat Kaum Cendekia",
    deskripsi:
      "Pesan kebangsaan peringatan kemerdekaan Indonesia untuk terus berkarya menghadirkan keadilan sosial dan integritas ilmu pengetahuan.",
    type: "INSTAGRAM",
    url: "https://www.instagram.com/piki.official/",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    kategoriKegiatan: "Kerjasama Lembaga",
    tanggal: "17 Agustus 2024",
    instagramUrl: "https://www.instagram.com/piki.official/",
  },
];

export const INSTAGRAM_PREVIEWS = [
  "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=300&auto=format&fit=crop",
];

export const SPOTLIGHT_HERO_IMAGES = [
  {
    src: "/footage/image1.webp",
    alt: "Kongres Nasional DPP PIKI 2024",
  },
  {
    src: "/footage/image2.jpeg",
    alt: "Pengukuhan Dewan Penasehat & Pengurus Harian",
  },
  {
    src: "/footage/image3.jpg",
    alt: "Kajian Pakar Transformasi Digital",
  },
  {
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop",
    alt: "Aksi Peduli Kasih & Beasiswa Pendidikan",
  },
  {
    src: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop",
    alt: "Pernyataan Sikap Moral DPP PIKI",
  },
  {
    src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
    alt: "Lokakarya Kepemimpinan Etis Cendekiawan",
  },
  {
    src: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
    alt: "Dialog Interaktif Ketahanan Pangan & Ekonomi",
  },
  {
    src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
    alt: "Audiensi Resmi Dewan Pimpinan Pusat",
  },
  {
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    alt: "Refleksi HUT Kemerdekaan RI",
  },
];


