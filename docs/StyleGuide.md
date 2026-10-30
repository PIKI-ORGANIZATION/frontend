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

## 2. Tech Stack & Referensi UI/UX

- **Styling:** Tailwind CSS (v4)
- **Komponen Dasar:** Shadcn UI (Radix / Base UI Primitives) -> **Modifikasi komponen ini** agar terlihat lebih premium (tambahkan _border radius_ `rounded-md` atau _shadow_ halus).
- **Referensi Arsitektur & Desain Dashboard:** [shadcn-admin (Sat Naing)](https://github.com/satnaing/shadcn-admin.git) sebagai benchmark standar desain dashboard admin modern, clean, minimalis, responsif, dan terstruktur.
- **Animasi Lanjutan:** GSAP (untuk animasi elemen saat masuk viewport, _staggered lists_).
- **Smooth Scrolling:** Lenis (efek _scrolling_ sehalus mentega untuk impresi website berkelas).
- **Icons:** Lucide React (Gunakan ketebalan (_stroke_) `1.5px` untuk kesan elegan).

---

## 3. Skema Warna (Color Palette)

_(Catatan: Kode hex di bawah adalah referensi untuk desain profesional korporat/organisasi. Harap disesuaikan jika PIKI memiliki Brand Guideline spesifik)._

- **Primary:** Warna identitas PIKI (_Deep Royal Blue_).
  - `bg-primary` -> `bg-[#0b59a1]`
- **Background & Sidebar (Light Mode):**
  - `bg-background` -> `bg-[#fbfbfb]` (Abu-abu sangat muda untuk _body_ keseluruhan)
  - `bg-card` -> `bg-[#ffffff]` (Putih solid untuk kartu/konten utama agar terlihat menonjol)
  - `bg-sidebar` -> `bg-[#ffffff]` (Putih solid untuk sidebar navigasi dashboard modern & clean)
- **Background & Sidebar (Dark Mode):**
  - `bg-background` -> `bg-[#131414]` (Gelap pekat untuk _body_)
  - `bg-card` -> `bg-[#171818]` (Lebih terang sedikit untuk komponen seperti kartu)
  - `bg-sidebar` -> `bg-[#131414]` (Gelap pekat senada)

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

### Aturan Wajib: Clean Children pada Reusable Component Shadcn

> [!IMPORTANT]
> **DILARANG menambahkan `className` styling redundan pada children/pemanggil komponen reusable Shadcn UI (`Button`, `Input`, `Popover`, `Dialog`, dll.).**
>
> 1. Komponen primitif sudah mengenkapsulasi token desain kanonikal: sudut membulat `rounded-md`, padding nyaman `px-4 py-2`, font, border, shadow, dan state focus ring.
> 2. Hindari menulis kelas ad-hoc penimpa seperti `className="rounded-lg text-xs h-8 shadow-none"` pada saat mengonsumsi komponen.
> 3. Gunakan prop resmi yang disediakan (misalnya `variant="default" | "outline" | "ghost"`, `size="sm" | "default" | "lg"`).
> 4. `className` pada children pemanggil **hanya boleh digunakan untuk tata letak / layout container** (seperti `col-span-2`, `w-full`, atau flexbox positioning), bukan untuk styling visual internal.

### Standar Penggunaan Dropdown Select Menggunakan Komponen `<Popover>` (`src/components/ui/popover.tsx`)

Semua komponen dropdown select, filter status, dan combobox di seluruh modul Dashboard, CMS, dan Formulir **wajib menggunakan komponen `<Popover>` (`src/components/ui/popover.tsx`) secara langsung, BUKAN menggunakan komponen `<Select>`.**

#### Alasan & Keunggulan Standarisasi:

1. **Portal Floating & Anti-Clipping:** Komponen `<Popover>` merender popup melalui Portal (`z-50`), sehingga menu dropdown mengambang bebas dan tidak akan terpotong oleh kontainer dengan `overflow-hidden` (seperti di dalam modal `<Dialog>`, drawer, atau kartu tabel).
2. **Collision-Aware Positioning:** Posisi dropdown otomatis mendeteksi batas layar (_auto top/bottom/align_) sehingga tidak pernah meluap keluar dari viewport.
3. **Standar Referensi [shadcn-admin](https://github.com/satnaing/shadcn-admin.git):** Menyediakan pola interaksi yang fleksibel, mulai dari pemilihan status sederhana hingga filter faceted tabel dan combobox pencarian data dinamis (`Command`).
4. **Desain Konsisten:** Selalu menerapkan sudut membulat `rounded-md`, border halus, shadow lembut, dan indikator centang (`Check`) untuk opsi yang sedang aktif.

#### 1. Pola Standar Dropdown Select (Filter Status / Pilihan Sederhana):

```tsx
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "PUBLISHED", label: "Tayang (Published)" },
  { value: "DRAFT", label: "Draf (Draft)" },
];

export function StatusFilterDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("ALL");

  const currentLabel = STATUS_OPTIONS.find(
    (opt) => opt.value === selected,
  )?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            <span>{currentLabel || "Pilih status..."}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-56 p-1" align="start">
        <div className="flex flex-col gap-0.5">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelected(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs rounded-sm transition-colors text-left cursor-pointer",
                  isSelected
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-foreground",
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

#### 2. Pola Dropdown Combobox dengan Pencarian (`Popover` + `Command`):

Digunakan pada formulir atau filter tabel saat daftar opsi cukup banyak atau memerlukan fitur pencarian (seperti provinsi, bidang keahlian, atau faceted filter):

```tsx
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih data...",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className={cn(!value && "text-muted-foreground")}>
              {currentLabel || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Ketik kata kunci pencarian..." />
          <CommandList>
            <CommandEmpty>Data tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

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
