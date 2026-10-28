import { BeritaCategory, BeritaStatus } from "./types";
import {
  Building2,
  FileText,
  Scale,
  GraduationCap,
  MapPin,
  CheckCircle2,
  FileClock,
  Archive,
} from "lucide-react";

export const BERITA_CATEGORIES: {
  value: BeritaCategory;
  label: string;
  icon: typeof Building2;
  badgeClass: string;
}[] = [
  {
    value: "ORGANISASI",
    label: "Organisasi",
    icon: Building2,
    badgeClass:
      "bg-sky-500/[0.06] text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  {
    value: "OPINI",
    label: "Opini",
    icon: FileText,
    badgeClass:
      "bg-purple-500/[0.06] text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  {
    value: "KEBIJAKAN_PUBLIK",
    label: "Kebijakan Publik",
    icon: Scale,
    badgeClass:
      "bg-amber-500/[0.06] text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  {
    value: "SEMINAR_KAJIAN",
    label: "Seminar & Kajian",
    icon: GraduationCap,
    badgeClass:
      "bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  {
    value: "WILAYAH",
    label: "Wilayah (DPD/DPC)",
    icon: MapPin,
    badgeClass:
      "bg-blue-500/[0.06] text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
];

export const BERITA_STATUSES: {
  value: BeritaStatus;
  label: string;
  icon: typeof CheckCircle2;
  badgeClass: string;
}[] = [
  {
    value: "PUBLISHED",
    label: "Tayang",
    icon: CheckCircle2,
    badgeClass:
      "bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  {
    value: "DRAFT",
    label: "Draft",
    icon: FileClock,
    badgeClass:
      "bg-amber-500/[0.06] text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  {
    value: "ARCHIVED",
    label: "Arsip",
    icon: Archive,
    badgeClass: "bg-muted/50 text-muted-foreground border-border/60",
  },
];

export const PRESET_BANNERS = [
  {
    label: "Konferensi / Simposium",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Kebijakan & Hukum",
    url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Rapat & Pelantikan",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Intelektual & Diskusi",
    url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Riset & Dokumen",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Kebangsaan & Alam",
    url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80",
  },
];
