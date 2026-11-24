"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type FaqItem = {
  id?: string;
  question: string;
  answer: string;
};

const DEFAULT_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Bagaimana cara mendaftar menjadi anggota resmi PIKI?",
    answer:
      "Klik tombol Daftar / Registrasi KTA di halaman utama, lengkapi data diri, pilih wilayah DPD dan DPC domisili Anda, serta unggah berkas persyaratan. Setelah diverifikasi pengurus, KTA Digital akan diterbitkan otomatis.",
  },
  {
    id: "faq-2",
    question: "Berapa lama proses verifikasi pendaftaran anggota baru?",
    answer:
      "Berkas pendaftaran akan ditinjau oleh pengurus DPC/DPD atau DPP. Setelah disetujui, akun portal anggota dan nomor KTA Digital langsung aktif dan dikirimkan melalui email terdaftar.",
  },
  {
    id: "faq-3",
    question: "Bagaimana cara mengunduh Kartu Tanda Anggota (KTA) Digital?",
    answer:
      "Masuk ke Portal Anggota menggunakan akun yang telah aktif, lalu buka menu KTA Digital Resmi untuk melihat kartu keanggotaan Anda beserta QR Code verifikasi keaslian dan tombol unduh.",
  },
  {
    id: "faq-4",
    question: "Apakah anggota dapat berpindah wilayah DPC atau DPD?",
    answer:
      "Anda dapat memperbarui data domisili melalui menu Pengaturan Profil di Portal Anggota atau menghubungi admin cabang DPD/DPC setempat untuk penyesuaian penempatan wilayah.",
  },
];

type Props = {
  eyebrow?: string;
  items?: FaqItem[];
  defaultOpen?: number | null;
  className?: string;
};

export default function FaqAccordion({
  eyebrow = "FAQ",
  items = DEFAULT_ITEMS,
  defaultOpen = 0,
  className,
}: Props) {
  const [active, setActive] = useState<number | null>(defaultOpen);

  const onClick = (i: number) => {
    setActive((prev) => (prev === i ? null : i));
  };

  return (
    <div className={cn("fa-stage w-full", className)}>
      <style>{CSS}</style>

      <div className="fa-panel">
        {eyebrow && <span className="fa-eyebrow">{eyebrow}</span>}

        <div className="fa-faq">
          {items.map((it, i) => {
            const isOpen = active === i;
            return (
              <div
                key={it.id || `${it.question}-${i}`}
                className={cn("fa-item", isOpen && "open")}
              >
                <h3 className="m-0 font-normal">
                  <button
                    className="fa-row"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => onClick(i)}
                  >
                    <span className="fa-q">{it.question}</span>
                    <span className="fa-icon" aria-hidden="true">
                      <span className="fa-v" />
                      <span className="fa-h" />
                    </span>
                  </button>
                </h3>
                <div className="fa-body">
                  <div className="fa-content-wrap">
                    <div className="fa-content">
                      <p>{it.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const CSS = `
.fa-stage .fa-panel {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.fa-stage .fa-eyebrow {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 16px;
}
.fa-stage .fa-faq {
  margin-top: 0;
  border-top: 1px solid var(--border);
}
.fa-stage .fa-item {
  border-bottom: 1px solid var(--border);
}
.fa-stage .fa-row {
  appearance: none;
  border: none;
  background: transparent;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 22px;
  column-gap: 24px;
  align-items: center;
  padding: 22px 0;
  cursor: pointer;
  color: var(--foreground);
  text-align: left;
  opacity: 0.72;
  transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  font-family: inherit;
}
.fa-stage .fa-item.open .fa-row {
  opacity: 1;
}
.fa-stage .fa-item:not(.open):hover .fa-row {
  opacity: 0.92;
}
.fa-stage .fa-q {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.4;
}
.fa-stage .fa-icon {
  position: relative;
  width: 14px;
  height: 14px;
  justify-self: end;
  display: inline-block;
}
.fa-stage .fa-icon .fa-v,
.fa-stage .fa-icon .fa-h {
  position: absolute;
  background: currentColor;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.fa-stage .fa-icon .fa-v {
  left: 50%;
  top: 0;
  width: 1.5px;
  height: 100%;
  transform: translateX(-50%);
}
.fa-stage .fa-icon .fa-h {
  left: 0;
  top: 50%;
  width: 100%;
  height: 1.5px;
  transform: translateY(-50%);
}
.fa-stage .fa-item.open .fa-icon .fa-v {
  transform: translateX(-50%) rotate(90deg);
}
.fa-stage .fa-item.open .fa-icon .fa-h {
  transform: translateY(-50%) rotate(180deg);
}
.fa-stage .fa-body {
  display: grid;
  grid-template-columns: 1fr;
}
.fa-stage .fa-content-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.fa-stage .fa-item.open .fa-content-wrap {
  grid-template-rows: 1fr;
}
.fa-stage .fa-content {
  overflow: hidden;
  min-height: 0;
}
.fa-stage .fa-body p {
  padding: 0 0 24px 0;
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--muted-foreground);
  white-space: pre-line;
}
@media (max-width: 900px) {
  .fa-stage .fa-q {
    font-size: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .fa-stage .fa-content-wrap,
  .fa-stage .fa-row,
  .fa-stage .fa-icon .fa-v,
  .fa-stage .fa-icon .fa-h {
    transition-duration: 0.15s !important;
  }
}
`;
