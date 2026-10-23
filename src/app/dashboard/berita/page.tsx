import type { Metadata } from "next";
import { NewsAdminList } from "./components/NewsAdminList";

export const metadata: Metadata = {
  title: "Manajemen Berita | PIKI",
  description: "Kelola berita DPP, DPD, dan DPC Persatuan Intelegensia Kristen Indonesia.",
};

export default function DashboardBeritaPage() {
  return <NewsAdminList />;
}
