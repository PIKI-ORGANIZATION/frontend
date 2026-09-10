"use client";

import { useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicAnggotaProfile } from "@/hooks/api/usePublicAnggota";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dpp-piki.org";

// Template 2 — Horizontal
const TEMPLATE = {
  id: 2,
  front: "/template-kta/KTA-2 DEPAN.png",
  back: "/template-kta/KTA-2 BELAKANG.png",
  ratio: "aspect-[1.58/1]",
  layout: "horizontal",
};

interface Props {
  anggota: PublicAnggotaProfile;
}

export function PublicKtaCard({ anggota }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  const qrUrl = `${APP_URL}/anggota/${anggota.uuid}`;
  const wilayah =
    anggota.cabang?.namaCabang ??
    anggota.registrasi?.dpc ??
    anggota.kotaDomisili ??
    "DPD PIKI";

  return (
    <div className="flex flex-col items-center w-full gap-5">
      {/* KTA Card */}
      <div className={cn("relative w-full max-w-[520px]", TEMPLATE.ratio)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isFlipped ? "back" : "front"}
            initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90, scale: 0.95 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90, scale: 0.95 }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            className={cn(
              "absolute inset-0 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border border-border/10",
            )}
            onClick={() => setIsFlipped((f) => !f)}
          >
            {/* Background */}
            <Image
              src={isFlipped ? TEMPLATE.back : TEMPLATE.front}
              alt="KTA PIKI"
              fill
              className="object-cover z-0 select-none pointer-events-none"
              priority
              crossOrigin="anonymous"
            />

            {/* Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />

            {/* Flip indicator */}
            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white/80 p-1.5 rounded-full z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>

            {/* ── FRONT DATA OVERLAY (Horizontal template 2) ── */}
            {!isFlipped && (
              <div className="absolute inset-0 flex items-center justify-between px-5 sm:px-8 md:px-10 pt-5 sm:pt-6 md:pt-8 z-10">
                {/* Photo */}
                <div className="w-[75px] h-[100px] sm:w-[90px] sm:h-[115px] md:w-[100px] md:h-[130px] ml-1 sm:ml-2 md:ml-4 shrink-0 rounded-md sm:rounded-lg relative overflow-hidden">
                  {anggota.profileImg ? (
                    <Image
                      src={anggota.profileImg}
                      alt={anggota.namaLengkap}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                      {anggota.namaLengkap.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Data & QR */}
                <div className="flex-1 ml-4 sm:ml-6 md:ml-8 flex flex-col justify-center h-full pb-2">
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-white text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wide mb-2 sm:mb-3 md:mb-4 line-clamp-2 leading-tight">
                      {anggota.namaLengkap}
                    </h3>
                    <p className="text-[#f6efb0] text-[5px] sm:text-[6px] md:text-[7px] uppercase tracking-widest mb-0.5">
                      Nomor Anggota
                    </p>
                    <p className="text-white text-[7px] sm:text-[8px] md:text-[9px] font-mono tracking-widest font-bold mb-1.5 sm:mb-2 md:mb-3">
                      {anggota.noKta ?? "BELUM ADA NIA"}
                    </p>
                    <p className="text-[#f6efb0] text-[5px] sm:text-[6px] md:text-[7px] uppercase tracking-widest mb-0.5">
                      Wilayah
                    </p>
                    <p className="text-white text-[7px] sm:text-[8px] md:text-[9px] uppercase font-bold line-clamp-1 mb-1.5 sm:mb-2 md:mb-3">
                      {wilayah}
                    </p>
                    <p className="text-[#f6efb0] text-[5px] sm:text-[6px] md:text-[7px] uppercase tracking-widest mb-0.5">
                      Berlaku Hingga
                    </p>
                    <p className="text-white text-[7px] sm:text-[8px] md:text-[9px] uppercase font-bold tracking-widest">
                      31 DESEMBER 2031
                    </p>
                  </div>
                </div>

                {/* QR */}
                <div className="absolute bottom-3 sm:bottom-4 md:bottom-4 right-4 sm:right-5 md:right-6 shrink-0">
                  <div className="bg-white p-0.5 sm:p-1 rounded-sm md:rounded-md shadow-sm">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-[60px] md:h-[60px]">
                      <QRCodeSVG value={qrUrl} width="100%" height="100%" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── BACK QR overlay ── */}
            {isFlipped && (
              <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 right-4 sm:right-5 md:right-6 bg-white p-1 sm:p-1.5 rounded-md sm:rounded-lg shadow-xl z-10">
                <div className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] md:w-[70px] md:h-[70px]">
                  <QRCodeSVG value={qrUrl} width="100%" height="100%" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full justify-center"></div>
    </div>
  );
}
