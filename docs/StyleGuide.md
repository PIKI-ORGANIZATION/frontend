# Frontend Style Guide & Design Principles

**Proyek:** PIKI Web App & CMS Nasional

Panduan ini berfungsi sebagai rujukan utama (_Single Source of Truth_) untuk pengembangan _user interface_ (UI) dan _user experience_ (UX) guna memastikan hasil yang sangat premium, elegan, modern, dan profesional.

---

# FOLDER STRUCTURE

```text
frontend/
├── .next/ # Next.js build output (auto-generated)
├── node_modules/ # Project dependencies
├── public/ # Static files (images, icons, robots.txt, etc.)
├── src/
│ ├── app/ # App Router (pages, layouts, routes)
│ │ ├── (auth)/ # Route group for auth-related pages
│ │ │ ├── login/
│ │ │ │ └── page.tsx
│ │ │ └── register/
│ │ │ └── page.tsx
│ │ ├── (dashboard)/ # Route group for dashboard
│ │ │ ├── dashboard/
│ │ │ │ └── page.tsx
│ │ │ └── settings/
│ │ │ └── page.tsx
│ │ ├── api/ # API Routes
│ │ │ ├── auth/
│ │ │ │ └── route.ts
│ │ │ └── users/
│ │ │ └── route.ts
│ │ ├── layout.tsx # Root layout
│ │ ├── template.tsx # Optional template
│ │ ├── loading.tsx # Global loading UI
│ │ ├── error.tsx # Global error UI
│ │ └── not-found.tsx # 404 page
│ │
│ ├── components/ # Reusable UI components
│ │ ├── ui/ # Base UI (Button, Input, Card...)
│ │ ├── layout/ # Header, Footer, Sidebar...
│ │ └── shared/ # Shared components
│ │
│ ├── features/ # Feature-based modules
│ │ ├── auth/ # Login, Register, Auth logic
│ │ ├── user/ # User-related logic
│ │ └── dashboard/ # Dashboard related logic
│ │
│ ├── lib/ # Utilities & configurations
│ │ ├── db.ts # Database connection
│ │ ├── auth.ts # Auth configuration
│ │ ├── utils.ts # Helper functions
│ │ └── constants.ts # App constants
│ │
│ ├── hooks/ # Custom React hooks
│ ├── store/ # State management (Zustand/Redux)
│ │ ├── index.ts
│ │ └── slices/
│ │
│ └── types/ # TypeScript types & interfaces
│
├── .env.local # Environment variables (local)
├── .env.example # Example env variables
├── .eslintrc.json # ESLint configuration
├── .gitignore # Git ignore file
├── next.config.js # Next.js configuration
├── package.json # Project metadata & scripts
├── tsconfig.json # TypeScript configuration
└── README.md # Project documentation
```

## 1. Core Principles

1. **Premium & Profesional:** Hindari desain "murahan" (seperti warna mencolok yang tidak harmonis, _spacing_ yang terlalu sempit, atau komponen yang terlihat kotak kaku tanpa efek kedalaman).
2. **Glassmorphism & Depth:** Gunakan efek translusen (kaca), _blur_, bayangan (_shadows_) yang lembut untuk memisahkan lapisan konten (_layering_).
3. **Fluid Motion:** Segala bentuk interaksi (hover tombol, buka modal, pindah halaman) harus memiliki transisi animasi (_micro-interactions_).
4. **Data-Driven Clarity:** Untuk bagian Dashboard & CMS, utamakan keterbacaan (_readability_). Tabel dan statistik tidak boleh terlihat menumpuk. Gunakan _whitespace_ dengan berani.
5. **Desain Responsif:** Pastikan desain responsif dan dapat diakses di berbagai perangkat (mobile, tablet, desktop).
6. **Penulisan Code:** Hindari penggunaan monolithic code,pecah komponen menjadi komponen-komponen kecil dan reusable

---

## 2. Tech Stack untuk UI/UX

- **Styling:** Tailwind CSS (v4)
- **Komponen Dasar:** Shadcn UI (Radix Primitives) -> **Modifikasi komponen ini** agar terlihat lebih premium (tambahkan _border radius_ atau _shadow_ halus).
- **Animasi Lanjutan:** GSAP (untuk animasi elemen saat masuk viewport, _staggered lists_).
- **Smooth Scrolling:** Lenis (efek _scrolling_ sehalus mentega untuk impresi website berkelas).
- **Icons:** Lucide React (Gunakan ketebalan (_stroke_) `1.5px` untuk kesan elegan).

---

## 3. Skema Warna (Color Palette)

_(Catatan: Kode hex di bawah adalah referensi untuk desain profesional korporat/organisasi. Harap disesuaikan jika PIKI memiliki Brand Guideline spesifik)._

- **Primary:** Warna identitas PIKI (_Deep Royal Blue_).
  - `bg-primary` -> `bg-[#0b59a1]`
- **Background (Light Mode):**
  - `bg-background` -> `bg-[#f3f3f3]` (Abu-abu sangat muda untuk _body_ keseluruhan)
  - `bg-card` -> `bg-[#ffffff]` (Putih solid untuk kartu/konten utama agar terlihat menonjol)
- **Background (Dark Mode):**
  - `bg-background` -> `bg-[#131414]` (Gelap pekat untuk _body_)
  - `bg-card` -> `bg-[#171818]` (Lebih terang sedikit untuk komponen seperti kartu)

### Konvensi Status (Penting untuk Sistem Approval CMS):

- **Pending/Review:** Kuning/Amber (`text-amber-600 bg-amber-500/10`)
- **Approved/Verified:** Hijau/Emerald (`text-emerald-600 bg-emerald-500/10`)
- **Rejected/Revoked:** Merah/Rose (`text-rose-600 bg-rose-500/10`)

---

## 4. Tipografi

- **Font Utama (Sans-serif):** `Geist` atau `Inter` (bersih, sangat terbaca untuk data dan _dashboard_).
- **Font Aksen/Heading (Optional):** Jika membutuhkan kesan elegan pada halaman _Landing Page_, gunakan font _serif_ modern seperti `Playfair Display` khusus untuk judul besar.
- **Hierarki:** Gunakan ukuran yang kontras. _Heading_ sangat besar dipadukan dengan _body text_ berukuran normal (16px) berwarna _muted-foreground_ untuk kesan elegan.

---

## 5. Panduan Komponen (Shadcn Adaptations)

### Card & Panel (Glassmorphism)

```tsx
// Hindari card dengan border hitam pekat
// Gunakan gaya ini untuk Dashboard Stats & Member Area
<div className="rounded-2xl border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
```

### Tombol (Buttons)

- **Primary Button:** Selalu gunakan transisi skala & warna saat _hover_.
  `transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-primary/30`
- **Secondary Button:** Bentuk _Outline_ atau _Ghost_ dengan _background opacity_.

### Tabel (CMS & Satu Data PIKI)

- Tabel harus memiliki efek hover pada setiap baris (`hover:bg-muted/50`).
- Pastikan ada fitur paginasi dan pencarian yang menempel (_sticky header_) jika tabel panjang.
- _Action buttons_ (Edit, View, Approve) letakkan di sisi kanan dengan icon.

---

## 6. Animasi dengan GSAP & Lenis

1. **Page Load:** Saat halaman dimuat, jangan langsung menampilkan konten. Buat efek _fade-in_ lembut dan elemen bergeser naik (`y: 30`, `opacity: 0` ke `y: 0`, `opacity: 1`).
2. **Scroll Reveal:** Saat men-_scroll_ ke bawah menggunakan Lenis, picu (_trigger_) GSAP `ScrollTrigger` agar statistik angka, atau foto galeri muncul berurutan secara elegan.
