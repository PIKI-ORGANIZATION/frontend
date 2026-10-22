import { Metadata } from "next";
import { DashboardFeature } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Dashboard Satu Data | Persatuan Inteligensia Kristen Indonesia",
  description: "Pusat visualisasi analitik nasional, statistik keanggotaan, dan pelaporan KTA digital DPP PIKI.",
};

export default function DashboardPage() {
  return <DashboardFeature />;
}
