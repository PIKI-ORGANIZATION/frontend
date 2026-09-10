import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicAnggotaProfileView } from "./components/PublicAnggotaProfileView";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface Props {
  params: Promise<{ uuid: string }>;
}

async function getAnggota(uuid: string) {
  try {
    const res = await fetch(`${API_BASE}/anggotas/public/profile/${uuid}`, {
      next: { revalidate: 300 }, // revalidate setiap 5 menit
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uuid } = await params;
  const anggota = await getAnggota(uuid);

  if (!anggota) {
    return {
      title: "Anggota Tidak Ditemukan | PIKI",
    };
  }

  return {
    title: `${anggota.namaLengkap} | Anggota PIKI`,
    description: `Profil resmi ${anggota.namaLengkap}, anggota Persatuan Intelegensia Kristen Indonesia${anggota.cabang ? ` cabang ${anggota.cabang.namaCabang}` : ""}.`,
    openGraph: {
      title: `${anggota.namaLengkap} | Anggota PIKI`,
      description: `Profil resmi ${anggota.namaLengkap}, anggota Persatuan Intelegensia Kristen Indonesia.`,
      images: anggota.foto ? [anggota.foto] : [`${process.env.NEXT_PUBLIC_APP_URL}/logo1.png`],
    },
  };
}

export default async function PublicAnggotaPage({ params }: Props) {
  const { uuid } = await params;
  const anggota = await getAnggota(uuid);

  if (!anggota) {
    notFound();
  }

  return <PublicAnggotaProfileView anggota={anggota} />;
}
