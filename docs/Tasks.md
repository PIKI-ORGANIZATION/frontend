# Frontend Task Breakdown (Roadmap)

**Proyek:** Website Resmi & CMS Nasional PIKI

Dokumen ini berisi pemecahan tugas (_micro-tasking_) untuk mempermudah pengerjaan secara bertahap menggunakan AI dan tim _developer_. Beri tanda `[x]` untuk tugas yang sudah selesai.

**Note:** Implementasikan dengan Reusable Component dan Reusable Logic dan clean code

---

## FASE 1: Inisialisasi & Fondasi (Selesai)

- [x] Setup Next.js 15 App Router & Tailwind CSS v4.
- [x] Inisialisasi Shadcn UI.
- [x] Instalasi dependensi (Zustand, TanStack Query, GSAP, Lenis, Lucide, Date-fns).
- [x] Setup Global Providers (`layout.tsx`).
- [x] Setup & Uji Coba Dark Mode (`next-themes`).
- [x] Pembuatan Dokumen PRD, StyleGuide, dan Tasks.

---

## FASE 2: Inisialisasi & Fondasi (Selesai)

- [x] buat `Hero Section`
- [x] Buat komponen `Navbar` publik (Menu, Logo, Tombol Login/Daftar) yang _sticky_ dan efek translusen.
- [x] Buat komponen `Footer` publik lengkap dengan navigasi sitemap dan _embed_ media sosial.

---

## FASE 3: Komponen UI & Layout Global

_(Fase ini membangun kerangka cangkang aplikasi sebelum masuk ke logika data)_

- [ ] Buat skema _routing_ di Next.js:
  - `(public)` untuk halaman depan (Landing, Berita, dll).
  - `(auth)` untuk Login & Register.
  - `(dashboard)` untuk CMS dan Member Area.
- [ ] Buat layout Dashboard (Sidebar Kiri & Topbar Kanan) menggunakan komponen Shadcn `Sidebar`.
- [ ] Buat komponen `PageHeader` untuk judul setiap halaman CMS dengan _breadcrumbs_.

---

## FASE 4: Website Publik & Etalase Informasi

- [ ] **Landing Page:**
  - Hero Section dengan animasi GSAP (Judul, CTA ke pendaftaran).
  - Section Visi Misi & Profil Singkat.
  - Section Highlight Berita Terbaru (Card grid).
  - Section Statistik Nasional (Counter angka animasi).
- [ ] **Halaman Berita & Jurnal:** List artikel dengan filter kategori, paginasi, dan detail artikel (_Rich Text Rendering_).
- [ ] **Halaman Profil & Struktur:** Visualisasi struktur organisasi berjenjang.

---

## FASE 5: Sistem Autentikasi & Keanggotaan (Public/Anggota)

- [ ] Buat form **Pendaftaran Anggota Baru** (Multi-step form):
  - Step 1: Data Diri (KTP, Nama, Foto).
  - Step 2: Kontak & Profesi.
  - Step 3: Pilihan DPC & DPD tempat mendaftar.
- [ ] Halaman **Login** dengan UI _split-screen_ (kiri ilustrasi/logo, kanan form).
- [ ] **Dashboard Anggota Pribadi:**
  - Status Verifikasi (Menunggu DPC -> Menunggu DPD -> Menunggu DPP -> Selesai).
  - Tampilan visual **KTA Digital** (Kartu flip/3D) dengan QR Code.
- [ ] Fitur Scan QR Code / Absensi _Online_ terintegrasi.

---

## FASE 6: CMS & Backoffice (Manajemen Keanggotaan & Approval)

_(Pengerjaan menggunakan dummy JSON / API dari Backend)_

- [ ] Buat tabel "Daftar Anggota" menggunakan TanStack Table & Shadcn.
- [ ] Implementasi fitur _Filter_, _Sort_, dan _Search_ pada tabel anggota.
- [ ] Buat Modal/Dialog detail anggota untuk proses **Approval Berjenjang**.
- [ ] Buat fitur Generator KTA (Tombol untuk menerbitkan KTA jika disetujui DPP).

---

## FASE 7: CMS Manajemen Konten & Persuratan

- [ ] Buat antarmuka CRUD (Create, Read, Update, Delete) untuk Berita & Jurnal.
- [ ] Integrasikan _Rich Text Editor_ (misal: TipTap) untuk penulisan artikel.
- [ ] **Sistem Persuratan:**
  - Buat form pembuatan template surat.
  - Buat sistem urutan/generator nomor otomatis berbasis UI (Pemilihan klasifikasi surat).
  - Halaman Arsip Surat masuk/keluar.

---

## FASE 8: Dashboard Statistik & Modul "Satu Data"

- [ ] Buat halaman Visualisasi Data Nasional.
- [ ] Integrasikan _charting library_ (misal: Recharts) untuk grafik tingkat pendidikan, profesi.
- [ ] Integrasikan _map/choropleth_ (opsional) untuk sebaran anggota per provinsi.

---

## FASE 9: Polish, Testing, & Finalisasi

- [ ] Audit aksesibilitas (WAI-ARIA, tab navigasi).
- [ ] Pengujian animasi (pastikan Lenis & GSAP berjalan mulus tanpa FPS drop).
- [ ] Pengujian integrasi akhir dengan API Backend (_Error handling_ pada React Query).
- [ ] _Deployment_ ke Vercel atau _hosting_ tujuan.
