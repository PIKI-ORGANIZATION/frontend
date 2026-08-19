# Frontend Style Guide & Design Principles
**Proyek:** PIKI Web App & CMS Nasional

Panduan ini berfungsi sebagai rujukan utama (*Single Source of Truth*) untuk pengembangan *user interface* (UI) dan *user experience* (UX) guna memastikan hasil yang sangat premium, elegan, modern, dan profesional.

---

## 1. Core Principles
1. **Premium & Profesional:** Hindari desain "murahan" (seperti warna mencolok yang tidak harmonis, *spacing* yang terlalu sempit, atau komponen yang terlihat kotak kaku tanpa efek kedalaman).
2. **Glassmorphism & Depth:** Gunakan efek translusen (kaca), *blur*, bayangan (*shadows*) yang lembut untuk memisahkan lapisan konten (*layering*).
3. **Fluid Motion:** Segala bentuk interaksi (hover tombol, buka modal, pindah halaman) harus memiliki transisi animasi (*micro-interactions*).
4. **Data-Driven Clarity:** Untuk bagian Dashboard & CMS, utamakan keterbacaan (*readability*). Tabel dan statistik tidak boleh terlihat menumpuk. Gunakan *whitespace* dengan berani.

---

## 2. Tech Stack untuk UI/UX
- **Styling:** Tailwind CSS (v4)
- **Komponen Dasar:** Shadcn UI (Radix Primitives) -> **Modifikasi komponen ini** agar terlihat lebih premium (tambahkan *border radius* atau *shadow* halus).
- **Animasi Lanjutan:** GSAP (untuk animasi elemen saat masuk viewport, *staggered lists*).
- **Smooth Scrolling:** Lenis (efek *scrolling* sehalus mentega untuk impresi website berkelas).
- **Icons:** Lucide React (Gunakan ketebalan (*stroke*) `1.5px` untuk kesan elegan).

---

## 3. Skema Warna (Color Palette)
*(Catatan: Kode hex di bawah adalah referensi untuk desain profesional korporat/organisasi. Harap disesuaikan jika PIKI memiliki Brand Guideline spesifik).*

- **Primary:** Warna identitas PIKI (*Deep Royal Blue*).
  - `bg-primary` -> `bg-[#0b59a1]`
- **Background (Light Mode):** 
  - `bg-background` -> `bg-[#f3f3f3]` (Abu-abu sangat muda untuk *body* keseluruhan)
  - `bg-card` -> `bg-[#ffffff]` (Putih solid untuk kartu/konten utama agar terlihat menonjol)
- **Background (Dark Mode):** 
  - `bg-background` -> `bg-[#131414]` (Gelap pekat untuk *body*)
  - `bg-card` -> `bg-[#171818]` (Lebih terang sedikit untuk komponen seperti kartu)

### Konvensi Status (Penting untuk Sistem Approval CMS):
- **Pending/Review:** Kuning/Amber (`text-amber-600 bg-amber-500/10`)
- **Approved/Verified:** Hijau/Emerald (`text-emerald-600 bg-emerald-500/10`)
- **Rejected/Revoked:** Merah/Rose (`text-rose-600 bg-rose-500/10`)

---

## 4. Tipografi
- **Font Utama (Sans-serif):** `Geist` atau `Inter` (bersih, sangat terbaca untuk data dan *dashboard*).
- **Font Aksen/Heading (Optional):** Jika membutuhkan kesan elegan pada halaman *Landing Page*, gunakan font *serif* modern seperti `Playfair Display` khusus untuk judul besar.
- **Hierarki:** Gunakan ukuran yang kontras. *Heading* sangat besar dipadukan dengan *body text* berukuran normal (16px) berwarna *muted-foreground* untuk kesan elegan.

---

## 5. Panduan Komponen (Shadcn Adaptations)

### Card & Panel (Glassmorphism)
```tsx
// Hindari card dengan border hitam pekat
// Gunakan gaya ini untuk Dashboard Stats & Member Area
<div className="rounded-2xl border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
```

### Tombol (Buttons)
- **Primary Button:** Selalu gunakan transisi skala & warna saat *hover*.
  `transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-primary/30`
- **Secondary Button:** Bentuk *Outline* atau *Ghost* dengan *background opacity*.

### Tabel (CMS & Satu Data PIKI)
- Tabel harus memiliki efek hover pada setiap baris (`hover:bg-muted/50`).
- Pastikan ada fitur paginasi dan pencarian yang menempel (*sticky header*) jika tabel panjang.
- *Action buttons* (Edit, View, Approve) letakkan di sisi kanan dengan icon.

---

## 6. Animasi dengan GSAP & Lenis
1. **Page Load:** Saat halaman dimuat, jangan langsung menampilkan konten. Buat efek *fade-in* lembut dan elemen bergeser naik (`y: 30`, `opacity: 0` ke `y: 0`, `opacity: 1`).
2. **Scroll Reveal:** Saat men-*scroll* ke bawah menggunakan Lenis, picu (*trigger*) GSAP `ScrollTrigger` agar statistik angka, atau foto galeri muncul berurutan secara elegan.
