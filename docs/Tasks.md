# Frontend Task Breakdown (Roadmap)
**Proyek:** Website Resmi & CMS Nasional PIKI

Dokumen ini berisi pemecahan tugas (*micro-tasking*) untuk mempermudah pengerjaan secara bertahap menggunakan AI dan tim *developer*. Beri tanda `[x]` untuk tugas yang sudah selesai.

---

## FASE 1: Inisialisasi & Fondasi (Selesai)
- [x] Setup Next.js 15 App Router & Tailwind CSS v4.
- [x] Inisialisasi Shadcn UI.
- [x] Instalasi dependensi (Zustand, TanStack Query, GSAP, Lenis, Lucide, Date-fns).
- [x] Setup Global Providers (`layout.tsx`).
- [x] Setup & Uji Coba Dark Mode (`next-themes`).
- [x] Pembuatan Dokumen PRD, StyleGuide, dan Tasks.

---

## FASE 2: Komponen UI & Layout Global
*(Fase ini membangun kerangka cangkang aplikasi sebelum masuk ke logika data)*
- [ ] Buat skema *routing* di Next.js:
  - `(public)` untuk halaman depan (Landing, Berita, dll).
  - `(auth)` untuk Login & Register.
  - `(dashboard)` untuk CMS dan Member Area.
- [ ] Buat komponen `Navbar` publik (Menu, Logo, Tombol Login/Daftar) yang *sticky* dan efek translusen.
- [ ] Buat komponen `Footer` publik lengkap dengan navigasi sitemap dan *embed* media sosial.
- [ ] Buat layout Dashboard (Sidebar Kiri & Topbar Kanan) menggunakan komponen Shadcn `Sidebar`.
- [ ] Buat komponen `PageHeader` untuk judul setiap halaman CMS dengan *breadcrumbs*.

---

## FASE 3: Website Publik & Etalase Informasi
- [ ] **Landing Page:**
  - Hero Section dengan animasi GSAP (Judul, CTA ke pendaftaran).
  - Section Visi Misi & Profil Singkat.
  - Section Highlight Berita Terbaru (Card grid).
  - Section Statistik Nasional (Counter angka animasi).
- [ ] **Halaman Berita & Jurnal:** List artikel dengan filter kategori, paginasi, dan detail artikel (*Rich Text Rendering*).
- [ ] **Halaman Profil & Struktur:** Visualisasi struktur organisasi berjenjang.

---

## FASE 4: Sistem Autentikasi & Keanggotaan (Public/Anggota)
- [ ] Buat form **Pendaftaran Anggota Baru** (Multi-step form):
  - Step 1: Data Diri (KTP, Nama, Foto).
  - Step 2: Kontak & Profesi.
  - Step 3: Pilihan DPC & DPD tempat mendaftar.
- [ ] Halaman **Login** dengan UI *split-screen* (kiri ilustrasi/logo, kanan form).
- [ ] **Dashboard Anggota Pribadi:**
  - Status Verifikasi (Menunggu DPC -> Menunggu DPD -> Menunggu DPP -> Selesai).
  - Tampilan visual **KTA Digital** (Kartu flip/3D) dengan QR Code.
- [ ] Fitur Scan QR Code / Absensi *Online* terintegrasi.

---

## FASE 5: CMS & Backoffice (Manajemen Keanggotaan & Approval)
*(Pengerjaan menggunakan dummy JSON / API dari Backend)*
- [ ] Buat tabel "Daftar Anggota" menggunakan TanStack Table & Shadcn.
- [ ] Implementasi fitur *Filter*, *Sort*, dan *Search* pada tabel anggota.
- [ ] Buat Modal/Dialog detail anggota untuk proses **Approval Berjenjang**.
- [ ] Buat fitur Generator KTA (Tombol untuk menerbitkan KTA jika disetujui DPP).

---

## FASE 6: CMS Manajemen Konten & Persuratan
- [ ] Buat antarmuka CRUD (Create, Read, Update, Delete) untuk Berita & Jurnal.
- [ ] Integrasikan *Rich Text Editor* (misal: TipTap) untuk penulisan artikel.
- [ ] **Sistem Persuratan:**
  - Buat form pembuatan template surat.
  - Buat sistem urutan/generator nomor otomatis berbasis UI (Pemilihan klasifikasi surat).
  - Halaman Arsip Surat masuk/keluar.

---

## FASE 7: Dashboard Statistik & Modul "Satu Data"
- [ ] Buat halaman Visualisasi Data Nasional.
- [ ] Integrasikan *charting library* (misal: Recharts) untuk grafik tingkat pendidikan, profesi.
- [ ] Integrasikan *map/choropleth* (opsional) untuk sebaran anggota per provinsi.

---

## FASE 8: Polish, Testing, & Finalisasi
- [ ] Audit aksesibilitas (WAI-ARIA, tab navigasi).
- [ ] Pengujian animasi (pastikan Lenis & GSAP berjalan mulus tanpa FPS drop).
- [ ] Pengujian integrasi akhir dengan API Backend (*Error handling* pada React Query).
- [ ] *Deployment* ke Vercel atau *hosting* tujuan.
