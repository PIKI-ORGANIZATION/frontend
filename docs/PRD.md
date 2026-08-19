# PRD: Website Resmi & CMS Nasional PIKI (Satu Data PIKI)

## 1. Problem Statement
Banyak aktivitas organisasi PIKI yang melibatkan ribuan anggota dan pengurus dari tingkat pusat (DPP) hingga cabang (DPC) masih dikelola secara terpisah dan manual. Akibatnya, proses konsolidasi data nasional, validasi keanggotaan, penerbitan KTA, serta pengarsipan surat memakan waktu lama dan rentan duplikasi. Tidak adanya data terpusat juga menyulitkan penyusunan statistik *real-time* untuk pengambilan keputusan strategis tingkat nasional.

## 2. Goals
- **G1:** Konsolidasi Data Nasional -> ukurannya: 100% data pendaftaran anggota terekam dalam satu basis data ("Satu Data PIKI") tanpa duplikasi.
- **G2:** Otomatisasi KTA -> ukurannya: KTA Digital terbit secara otomatis seketika setelah alur persetujuan (approval) berjenjang selesai.
- **G3:** Kemudahan Akses Informasi -> ukurannya: Jurnal, berita, dan galeri tersedia untuk publik dalam satu portal resmi yang terpusat.
- **G4:** Digitalisasi Administrasi -> ukurannya: Seluruh surat keluar memiliki nomor otomatis dan arsip digital yang rapi.

## 3. Target User
- **Admin DPC (Cabang):** Pengurus tingkat kabupaten/kota. Butuh alat untuk mendaftarkan/memverifikasi anggota di wilayahnya dan mengurus surat cabang.
- **Admin DPD (Daerah):** Pengurus tingkat provinsi. Butuh memverifikasi data dari DPC dan memantau statistik wilayah provinsinya.
- **Admin DPP (Pusat):** Pengurus tingkat nasional. Pemegang otoritas tertinggi untuk finalisasi approval KTA, persetujuan akhir, dan melihat statistik nasional.
- **Anggota (Member):** Intelektual Kristen. Mau mendaftar secara online tanpa ribet, butuh mengunduh KTA Digital untuk identitas dan absensi.
- **Publik:** Masyarakat umum dan akademisi. Butuh membaca berita, jurnal ilmiah, dan melihat profil organisasi PIKI.

## 4. User Stories
- **US-1 (P1):** Sebagai **calon anggota**, saya ingin mendaftar secara online supaya data saya langsung masuk ke sistem DPC tujuan tanpa perlu isi formulir kertas.
- **US-2 (P1):** Sebagai **admin DPC**, saya ingin menyetujui/menolak pendaftaran anggota baru di wilayah saya supaya data bisa diteruskan ke tingkat DPD.
- **US-3 (P1):** Sebagai **anggota terverifikasi**, saya ingin melihat dan mengunduh KTA Digital berbasis QR Code supaya saya memiliki bukti keanggotaan resmi yang sah.
- **US-4 (P1):** Sebagai **admin DPP**, saya ingin melihat dashboard statistik nasional secara *real-time* supaya saya bisa memantau pertumbuhan organisasi per provinsi/profesi.
- **US-5 (P2):** Sebagai **pengurus (DPC/DPD/DPP)**, saya ingin membuat surat dengan template dan penomoran otomatis supaya administrasi organisasi tertata rapi.
- **US-6 (P2):** Sebagai **publik**, saya ingin membaca publikasi jurnal dan berita supaya mengetahui agenda dan kontribusi pemikiran PIKI.

## 5. Functional Requirements
- **FR-1 (P1):** Sistem pendaftaran anggota (*multi-step form* mencakup identitas, profesi, pilihan DPC).
- **FR-2 (P1):** Sistem *Approval Workflow* berjenjang untuk keanggotaan (Status: Pending DPC -> Pending DPD -> Pending DPP -> Approved).
- **FR-3 (P1):** Generator KTA Digital dinamis (terdapat QR Code untuk verifikasi, *watermark*, dan visual tanda tangan pengurus).
- **FR-4 (P1):** Dashboard CMS dengan *Role-Based Access Control* (RBAC) yang ketat membedakan hak akses Admin DPC, DPD, dan DPP.
- **FR-5 (P1):** Dashboard visualisasi data statistik (Infografis jumlah anggota berdasarkan provinsi, kabupaten, pendidikan, dan profesi).
- **FR-6 (P2):** Modul Publikasi: CMS untuk Berita, Jurnal Ilmiah, Galeri Foto/Video, dan Agenda.
- **FR-7 (P2):** Modul E-Office: Sistem *template* surat, penomoran surat otomatis, dan arsip digital berjenjang.
- **FR-8 (P3):** Modul Absensi *online* yang memindai (*scan*) QR Code dari KTA Digital anggota.

## 6. Non-Functional Requirements
- **NFR-1 (P1):** Keamanan & Privasi: Data anggota (terutama NIK KTP dan kontak) harus tersimpan secara terenkripsi dan aman. QR Code KTA tidak boleh mudah dipalsukan.
- **NFR-2 (P1):** Kinerja (*Performance*): Waktu *load* halaman portal publik dan CMS harus di bawah 3 detik di perangkat *mobile* maupun *desktop*.
- **NFR-3 (P1):** Skalabilitas: Database harus dirancang untuk menampung puluhan hingga ratusan ribu data anggota secara berkelanjutan tanpa mengorbankan kecepatan statistik *real-time*.
- **NFR-4 (P2):** *Mobile-First UX*: Website publik dan dashboard keanggotaan harus sangat responsif dan nyaman digunakan di HP, mengingat anggota akan sering membuka KTA Digital via *smartphone*.

## 7. Scope
**IN (versi 1.0):**
- Portal Web Publik (Landing page, Profil, Berita, Jurnal, Galeri).
- Sistem Pendaftaran Anggota & Login.
- Alur *Approval* Keanggotaan Berjenjang (DPC -> DPD -> DPP).
- Generator KTA Digital (QR Code & Watermark).
- Dashboard Statistik Nasional (Satu Data PIKI).
- Manajemen Hak Akses (RBAC) Admin Pusat, Daerah, Cabang.

**OUT (nanti / versi 2.0):**
- Pembayaran iuran anggota secara *online* terintegrasi (*Payment Gateway*).
- Tanda Tangan Digital yang tersertifikasi secara hukum oleh Penyelenggara Sertifikasi Elektronik (PSrE) Kominfo (untuk E-Office).
- Aplikasi Mobile Native terpisah (iOS / Android) di App Store / Play Store.
