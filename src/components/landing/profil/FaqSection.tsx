"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FaqAccordion, {
  FaqItem,
} from "@/components/ui/cue-split-panel-image-synced-faq-features";
import { usePublicFaq } from "@/features/faq/hooks/useFaq";
import { FAQ_KATEGORI_OPTIONS, FaqKategori } from "@/features/faq/types";
import { cn } from "@/lib/utils";

const FALLBACK_FAQS: FaqItem[] = [
  {
    id: "fallback-1",
    question: "Bagaimana cara mendaftar menjadi anggota resmi PIKI?",
    answer:
      "Anda dapat menekan tombol Daftar KTA di halaman utama, mengisi formulir biodata, memilih wilayah DPD/DPC sesuai domisili, serta mengunggah berkas KTP dan bukti pembayaran iuran.",
  },
  {
    id: "fallback-2",
    question: "Berapa lama proses verifikasi hingga KTA Digital aktif?",
    answer:
      "Pengurus DPC/DPD atau DPP akan memverifikasi berkas Anda. Begitu disetujui, nomor KTA Digital dan akun Portal Anggota langsung aktif dan dikirimkan melalui email.",
  },
  {
    id: "fallback-3",
    question: "Bagaimana cara mengakses dan mengunduh KTA Digital?",
    answer:
      "Masuk melalui menu Login Portal Anggota dengan username/email serta kata sandi yang dikirim ke email Anda, lalu buka kartu KTA Digital yang dilengkapi QR Code verifikasi.",
  },
  {
    id: "fallback-4",
    question:
      "Apakah anggota dapat memperbarui profil atau pindah domisili cabang?",
    answer:
      "Ya, Anda dapat memperbarui biodata melalui Portal Anggota pada menu Pengaturan Profil atau berkoordinasi dengan pengurus cabang setempat.",
  },
];

export function FaqSection() {
  const [selectedKategori, setSelectedKategori] = useState<FaqKategori | "ALL">(
    "ALL",
  );
  const { items } = usePublicFaq({
    kategori: selectedKategori,
    pageSize: 12,
  });

  const accordionItems: FaqItem[] = useMemo(() => {
    if (items.length > 0) {
      return items.map((faq) => ({
        id: faq.uuid,
        question: faq.pertanyaan,
        answer: faq.jawaban,
      }));
    }
    return selectedKategori === "ALL" ? FALLBACK_FAQS : [];
  }, [items, selectedKategori]);

  return (
    <section
      id="faq"
      aria-labelledby="landing-faq-heading"
      className="relative w-full py-20 md:py-28 bg-background border-t border-border/60"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h2
              id="landing-faq-heading"
              className="text-2xl md:text-4xl font-bold tracking-tight text-foreground"
            >
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Temukan jawaban seputar keanggotaan PIKI, proses pendaftaran KTA
              Digital, dan program organisasi.
            </p>
          </div>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/faq" />}
            className="w-fit shrink-0"
          >
            <span>Lihat Semua FAQ</span>
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>

        {accordionItems.length > 0 ? (
          <FaqAccordion eyebrow="" items={accordionItems} defaultOpen={0} />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Belum ada pertanyaan pada kategori ini.
          </div>
        )}
      </div>
    </section>
  );
}
