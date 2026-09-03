import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke portal anggota Persatuan Intelegensia Kristen Indonesia (PIKI).",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
