import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrasi Anggota",
  description: "Daftar sebagai anggota baru Persatuan Intelegensia Kristen Indonesia (PIKI).",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
