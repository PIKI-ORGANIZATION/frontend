# Frontend Task Breakdown (Roadmap)

**Proyek:** Website Resmi & CMS Nasional PIKI  
**Arsitektur Desain:** Modular Monolith dengan standar acuan [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin.git)  
**Prinsip Desain:** Clean, Modern, User-Friendly, Flat & Border-based (`rounded-lg`, Tanpa shadow / `shadow-none` pada card & container), Deep Royal Blue palette, Full Light/Dark Mode precision (Theme-aware CSS Variables), Anti-AI Vibe.

> **Catatan Standar UI Kedepannya:** Seluruh kartu (card), kontainer, panel, dan tabel wajib menggunakan sudut membulat **`rounded-lg`** dan **meniadakan shadow** (`shadow-none`) agar tampilan terlihat flat, sangat bersih (_clean_), dan berkelas.

---

## FASE 1: Inisialisasi & Fondasi - [Selesai]

- [x] Setup Next.js App Router (React 19) & Tailwind CSS v4.
- [x] Inisialisasi Shadcn UI & Base UI primitives.
- [x] Instalasi dependensi (@tanstack/react-table v8, @tanstack/react-query, Zustand, GSAP, Recharts, Lucide, Date-fns, Sonner).
- [x] Setup Global Providers (`layout.tsx`) & TanStack Query Client.
- [x] Setup & Uji Coba Dark Mode (`next-themes`) dengan CSS Variables terpadu.
- [x] Pembuatan Dokumen PRD, StyleGuide, dan Tasks.

---

## FASE 2: Komponen Publik & Header/Footer - [Selesai]

- [x] Buat `Hero Section` dengan animasi GSAP & CTA pendaftaran anggota.
- [x] Buat komponen `Navbar` publik yang _sticky_, translusen (backdrop-blur), dan responsif.
- [x] Buat komponen `Footer` publik lengkap dengan navigasi sitemap dan tautan media sosial.

---

## FASE 3: Komponen UI & Layout Global (Standar `shadcn-admin`) - [Selesai]

- [x] Skema _routing_ Next.js App Router:
  - `(public)` untuk halaman depan (Landing, Berita, Jurnal, Profil).
  - `(auth)` untuk Login & Register.
  - `(dashboard)` untuk CMS Administrator DPP & DPC.
  - `(portal)` untuk Member Area / Portal Anggota.
- [x] **AppSidebar (Standar `satnaing/shadcn-admin` dengan Collapsible Submenu):**
  - [x] Header Branding resmi PIKI Nasional (Logo & Emblem, bersih tanpa dropdown workspace).
  - [x] Trigger Pencarian Cepat (_Command Palette_ `⌘K`) dengan live search hierarki modul & handler toast pengembangan.
  - [x] Pengelompokan modul khusus CMS Nasional:
    - [x] **Overview**: Dashboard Statistik Nasional & Modul Satu Data (`/dashboard`, badge: _Live_).
    - [x] **Manajemen Keanggotaan**: CMS Data Anggota (`/dashboard/anggota`), Verifikasi Pendaftar (`/dashboard/verifikasi`, badge: _New_), Approval DPP, Approval DPD, Approval DPC, Generator KTA Digital, Generator QR Code, Digital Signature Pengurus.
    - [x] **CMS Manajemen Konten**: CMS Landing Page, CMS Berita (`/dashboard/berita`), CMS Program Kerja, CMS Jurnal, CMS Galeri, CMS Struktur Organisasi, CMS Data Pengurus.
  - [x] Penghapusan grup "Pengaturan Akun" pada CMS sidebar sesuai arahan terbaru.
  - [x] Handler toast interaktif (_Sonner_ `toast.info`) "Modul [Nama] sedang dalam tahap pengembangan" tanpa redirect rute kosong.
  - [x] Anti-truncate label formatting (`truncate-none`, `whitespace-normal`, sidebar width 17.5rem / 280px).
  - [x] Footer sidebar minimalis (_PIKI CMS v2.4 • Online_).
- [x] **DashboardHeader (Standar `satnaing/shadcn-admin`):**
  - [x] _SidebarTrigger_ toggle buka/tutup menu.
  - [x] _Dynamic Breadcrumbs_ mengikuti rute aktif (`Dashboard > Satu Data`, `Dashboard > Manajemen > Daftar Anggota`, dll).
  - [x] _ThemeToggle_ dropdown (Light, Dark, System).
  - [x] _UserNav Profile Dropdown_ (Avatar inisial, role badge, email, tautan profil, dan tombol _Log out_ dengan _ConfirmDialog_).

---

## FASE 4: Website Publik & Etalase Informasi - [Selesai]

- [x] **Landing Page:**
  - [x] Hero Section interaktif dengan CTA pendaftaran.
  - [x] Section Visi Misi & Profil Organisasi.
  - [x] Section Highlight Berita Terbaru (Card grid).
  - [x] Section Statistik Nasional Anggota.
- [x] **Halaman Berita & Jurnal:** List artikel dengan filter kategori, paginasi, dan detail artikel.
- [x] **Halaman Profil & Struktur:** Visualisasi struktur organisasi berjenjang DPP PIKI.

---

## FASE 5: Sistem Autentikasi & Keanggotaan (Public/Anggota) - [95% Selesai]

- [x] Form **Pendaftaran Anggota Baru** (Multi-step form 4 langkah):
  - [x] Step 1: Data Diri (Nama, Tempat & Tanggal Lahir, Jenis Kelamin).
  - [x] Step 2: Kontak & Domisili (No. WhatsApp, Email, Alamat, Pilihan DPD & DPC).
  - [x] Step 3: Pendidikan & Pekerjaan (Tingkat Pendidikan, Pekerjaan, Bidang Minat).
  - [x] Step 4: Upload Dokumen KTP, Bukti Iuran & Checkbox Persetujuan UU PDP.
  - [x] Modal status registrasi & konfirmasi pendaftaran berhasil.
- [x] Halaman **Login** split-screen terintegrasi JWT cookie & RBAC redirect.
- [x] **Dashboard Anggota Pribadi & KTA Digital:**
  - [x] Tracking status verifikasi pendaftaran (Pending, Approved, Rejected).
  - [x] Tampilan visual **KTA Digital** interaktif (Kartu flip 3D, nomor KTA resmi `PP.KK.UUUU.DDMMYY`, Barcode & QR Code).
  - [x] Halaman **Profil Publik Anggota** (`/anggota/[uuid]`) untuk verifikasi identitas resmi via scan QR Code (dengan Dynamic SEO & OpenGraph).
  - [x] Fitur cetak/unduh KTA Digital.
- [ ] Fitur Scan QR Code / Absensi _Online_ terintegrasi (Fase lanjutan event/rapat kerja).

---

## FASE 6: CMS & Backoffice (Manajemen Keanggotaan & Verifikasi) - [Selesai]

- [x] **Komponen Reusable Data Table (Standar `shadcn-admin`):**
  - [x] `DataTableToolbar`: Pencarian nama/KTA, faceted-filter status KTA, tombol reset filter, dan _view-options_ pemilih kolom.
  - [x] `DataTableColumnHeader`: Sorting kolom asc/desc dengan ikon indikator.
  - [x] `DataTablePagination`: Rows-per-page, info halaman, dan navigasi first/prev/next/last.
  - [x] `DataTableFacetedFilter`: Multi-filter badge dengan hitungan item.
- [x] **Modul Daftar Anggota (`/dashboard/anggota`):**
  - [x] Tabel TanStack Table terintegrasi API server-side filtering (`search`, `statusKta`, `cabangUuid`, `pagination`).
  - [x] Modal detail anggota (**AnggotaDetailModal**) dengan UI Accordion (Data Diri, Organisasi, Pendidikan, dan Dokumen KTP/KTA).
- [x] **Modul Verifikasi Pendaftaran (`/dashboard/verifikasi`):**
  - [x] Tabel pendaftar berstatus pending untuk verifikator DPP & DPC.
  - [x] Modal review berkas pendaftar (preview KTP & detail formulir).
  - [x] Aksi Approval (`APPROVED_DPP`) dan Rejection dengan catatan verifikasi.
- [x] **Alur Penerbitan KTA Otomatis:**
  - [x] Penomoran KTA otomatis berbasis kode wilayah & tanggal lahir.
  - [x] Pembuatan otomatis akun login anggota (`Akun` & `AkunRole`).
  - [x] Pengiriman email kredensial akun & aktivasi KTA (Nodemailer).

---

## FASE 7: CMS Manajemen Konten & Persuratan (E-Office) - [Next Priority]

### 1. Manajemen Konten:

- [ ] **CMS Landing Page (`/dashboard/konten/landing`):**
  - [ ] Pengaturan konten hero section, banner utama, sambutan ketua umum, dan highlight fitur portal publik.
- [x] **CMS Berita (`/dashboard/berita`):**
  - [x] Tabel TanStack data artikel berita (Judul, Kategori, Penulis, Status Publish/Draft, Tanggal).
  - [x] Toolbar filter kategori & status publikasi dengan _faceted filter_ dan _search input_.
  - [x] Modal Editor Berita responsif dengan _Markdown Rich Text Editor_, toolbar format, hitung kata/karakter, dan galeri banner gambar.
  - [x] Modal Pratinjau Artikel lengkap dengan rendering naskah, metadata, dan informasi penulis.
  - [x] CRUD Aksi (Tambah baru, Edit berita, Hapus artikel, Toggle status tayang/draft, serta _Bulk Action_ publikasi/hapus massal).
- [ ] **CMS Program Kerja (`/dashboard/konten/program-kerja`):**
  - [ ] Manajemen agenda & linimasa program kerja strategis organisasi (Nasional & Wilayah).
  - [ ] Pengaturan status pelaksanaan kegiatan, target capaian, dan dokumentasi laporan.
- [ ] **CMS Jurnal & Riset Ilmiah (`/dashboard/jurnal`):**
  - [ ] Manajemen berkas PDF jurnal, metadata abstrak, volume, nomor edisi penerbitan, dan indeksasi akademis.
- [ ] **CMS Galeri (`/dashboard/konten/galeri`):**
  - [ ] Manajemen album dokumentasi foto resolusi tinggi dan upload multi-media.
  - [ ] Integrasi galeri video, embed YouTube, dan dokumentasi kegiatan resmi organisasi.
- [ ] **CMS Struktur Organisasi (`/dashboard/konten/struktur`):**
  - [ ] Visualisasi & editor bagan struktur organisasi kepengurusan PIKI (DPP, DPD, DPC).
- [ ] **CMS Data Pengurus (`/dashboard/konten/pengurus`):**
  - [ ] Master data profil fungsionaris pengurus (Nama, Jabatan/Bidang, SK Penetapan, Masa Bakti, dan Foto Resmi).

### 2. Administrasi & Persuratan (E-Office):

- [ ] **Sistem Persuratan & E-Office (`/dashboard/surat`):**
  - [ ] Form pembuatan surat resmi organisasi dengan template otomatis.
  - [ ] Generator nomor surat otomatis berbasis klasifikasi dan tingkatan (DPP/DPD/DPC).
  - [ ] Arsip digital surat masuk & surat keluar.

---

## FASE 8: Dashboard Statistik & Modul "Satu Data PIKI" - [Selesai]

- [x] **Komponen Chart Resmi Shadcn UI (`@/components/ui/chart.tsx`):**
  - [x] `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, dan `ChartLegend`.
  - [x] Integrasi Recharts v3 dengan dukungan penuh **Light Mode & Dark Mode** via CSS Variables native (`--chart-1` s/d `--chart-5`, `--border`, `--muted-foreground`).
- [x] **Halaman Analitik Utama (`/dashboard`):**
  - [x] 4 Kartu Metrik Utama (_Total Anggota_, _KTA Aktif_, _Antrean Verifikasi DPP_, _Jaringan Wilayah DPD/DPC_).
  - [x] Tab Navigasi (_Ringkasan & Wilayah_, _Demografi & Profesi_, _Kepatuhan & KTA_).
  - [x] Tombol Segarkan data (_Live Refetch_).
- [x] **Visualisasi Data Sebaran Wilayah (`WilayahBarChart`):**
  - [x] Grafik batang komparasi (_Total Pendaftar_ vs _KTA Aktif_) untuk 10 DPD terbesar.
  - [x] Tooltip responsif berlatar popover dengan kontras tinggi di kedua tema.
- [x] **Visualisasi Demografi & Profesi (`DemografiCharts`):**
  - [x] Donut Chart komposisi tingkat pendidikan (S1, S2, S3, Diploma, SMA) dengan interaksi segmen _hover_.
  - [x] Horizontal Bar Chart distribusi bidang profesi & kepakaran (Akademisi, Hukum, ASN, Medis, Bisnis, Teknologi).
- [x] **Kartu Pendaftar & Aktivitas Terkini (`RecentRegistrations`):**
  - [x] Daftar 5 pendaftar terbaru secara _real-time_ dari API dengan pintasan ke verifikasi.
- [x] **Fitur Ekspor Satu Data PIKI (`DataExportDialog`):**
  - [x] Unduh rekapan basis data anggota dalam format **Excel/CSV** (dengan _UTF-8 BOM_ `\uFEFF` untuk dukungan karakter penuh di Microsoft Excel/Sheets) dan **JSON Raw**.
  - [x] Filter lingkup ekspor (_Semua Anggota_, _Hanya KTA Aktif_, atau _Hanya Antrean Verifikasi_).

---

## FASE 9: Polish, Testing, & Finalisasi - [Sedang Berjalan]

- [x] Standardisasi Desain UI/UX mengacu pada `satnaing/shadcn-admin` (Clean, professional, Royal Blue accent, anti-AI vibe).
- [x] Validasi TypeScript (`npx tsc --noEmit`): 0 Errors.
- [x] Validasi Linter (`npm run lint`): 0 Errors.
- [x] Optimasi SEO & Metadata (Sitemap.xml, robots.txt, dynamic OG tag).
- [ ] Audit aksesibilitas (WAI-ARIA, navigasi keyboard, kontras warna).
- [ ] Pengujian E2E alur registrasi, verifikasi, hingga penerbitan KTA.
- [ ] Sinkronisasi database migration & deployment server production.
