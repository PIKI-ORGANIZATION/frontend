"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

interface DigitalKTAProps {
  namaLengkap?: string;
  nomorAnggota?: string;
  cabang?: string;
  profileImg?: string;
  uuid?: string;
}

const TEMPLATES = [
  {
    id: 1,
    name: "KTA 1 (Vertical)",
    ratio: "aspect-[0.63/1]",
    front: "/template-kta/KTA-1 DEPAN.png",
    back: "/template-kta/KTA-1 BELAKANG.png",
    layout: "vertical",
  },
  {
    id: 2,
    name: "KTA 2 (Horizontal)",
    ratio: "aspect-[1.58/1]",
    front: "/template-kta/KTA-2 DEPAN.png",
    back: "/template-kta/KTA-2 BELAKANG.png",
    layout: "horizontal",
  },
  {
    id: 3,
    name: "KTA 3 (Horizontal)",
    ratio: "aspect-[1.58/1]",
    front: "/template-kta/KTA-3 DEPAN.png",
    back: "/template-kta/KTA-3 BELAKANG.png",
    layout: "horizontal",
  },
];

export default function DigitalKTA({
  namaLengkap = "Anggota PIKI",
  nomorAnggota = "Belum Ada",
  cabang = "Belum Terdaftar",
  profileImg,
  uuid = "preview",
}: DigitalKTAProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const activeTemplate = TEMPLATES[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % TEMPLATES.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + TEMPLATES.length) % TEMPLATES.length);
  };

  // const qrUrl = `https://portal.piki.id/verify/${uuid}`;
  const qrUrl = `https://dpp-piki.org`;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const token = Cookies.get("token");
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

      const res = await fetch(
        `${API_BASE}/kta/download?template=${activeTemplate.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Gagal mengunduh KTA");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `KTA_PIKI_${namaLengkap.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3000);
    } catch (error) {
      console.error("Failed to download KTA", error);
      alert("Gagal mengunduh KTA. Pastikan profil Anda sudah lengkap.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Render konten dinamis berdasarkan layout (Vertical vs Horizontal)
  const renderDynamicContent = () => {
    if (activeTemplate.layout === "vertical") {
      return (
        <div className="absolute inset-0 top-[20%] sm:top-[22%] md:top-[24%] flex flex-col items-center z-10 w-full px-5 sm:px-6 pb-4 sm:pb-6">
          {/* Photo */}
          <div className="w-[100px] h-[120px] sm:w-[120px] sm:h-[140px] md:w-[135px] md:h-[155px] rounded-lg overflow-hidden relative shrink-0 mx-auto">
            {profileImg ? (
              <Image
                src={profileImg}
                alt={namaLengkap}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute"></div>
            )}
          </div>

          {/* Data */}
          <div className="w-full flex flex-col justify-end text-left mt-4 sm:mt-6 md:mt-8">
            <h3 className="text-white text-lg sm:text-xl md:text-2xl font-semibold uppercase tracking-wide leading-tight text-center mb-3 sm:mb-4 line-clamp-2">
              {namaLengkap}
            </h3>

            <div className="flex justify-between w-full px-2 sm:px-4 mt-1 sm:mt-2">
              <div className="flex flex-col">
                <p className="text-[#f6efb0] text-[9px] sm:text-[10px] md:text-[12px] font-sans tracking-widest mb-0.5 sm:mb-1 uppercase">
                  Nomor Anggota
                </p>
                <p className="text-white text-[11px] sm:text-[12px] md:text-[14px] font-sans font-bold tracking-widest">
                  {nomorAnggota}
                </p>
              </div>
              <div className="flex flex-col text-right">
                <p className="text-[#f6efb0] text-[9px] sm:text-[10px] md:text-[12px] font-sans tracking-widest mb-0.5 sm:mb-1 uppercase">
                  Berlaku Hingga
                </p>
                <p className="text-white text-[11px] sm:text-[12px] md:text-[14px] font-sans uppercase font-bold tracking-widest mt-0.5 sm:mt-1">
                  31 DESEMBER 2031
                </p>
              </div>
            </div>

            <div className="flex flex-col mt-2 sm:mt-3 px-2 sm:px-4">
              <p className="text-[#f6efb0] text-[9px] sm:text-[10px] md:text-[12px] font-sans tracking-widest mb-0.5 sm:mb-1 uppercase">
                Wilayah
              </p>
              <p className="text-white text-[11px] sm:text-[12px] md:text-[14px] uppercase font-sans font-bold tracking-wide line-clamp-1">
                {cabang}
              </p>
            </div>
          </div>

          {/* QR */}
          <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 bg-white p-1 rounded-sm md:rounded-md shadow-md">
            <div className="w-[70px] h-[70px] sm:w-[85px] sm:h-[85px] md:w-[100px] md:h-[100px]">
              <QRCodeSVG value={qrUrl} width="100%" height="100%" />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="absolute inset-0 flex items-center justify-between px-5 sm:px-8 md:px-10 pt-5 sm:pt-6 md:pt-8 z-10">
          {/* Photo */}
          <div className="w-[75px] h-[100px] sm:w-[90px] sm:h-[115px] md:w-[100px] md:h-[130px] ml-1 sm:ml-2 md:ml-4 shrink-0 rounded-md sm:rounded-lg relative overflow-hidden">
            {profileImg ? (
              <Image
                src={profileImg}
                alt={namaLengkap}
                fill
                className="object-cover"
              />
            ) : (
              <div className=""></div>
            )}
          </div>

          {/* Data & QR */}
          <div className="flex-1 ml-4 sm:ml-6 md:ml-8 flex flex-col justify-center h-full pb-2">
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-white text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wide mb-2 sm:mb-3 md:mb-4 line-clamp-2 leading-tight">
                {namaLengkap}
              </h3>

              <p className="text-[#f6efb0] text-[5px] sm:text-[6px] md:text-[7px] uppercase tracking-widest mb-0.5">
                Nomor Anggota
              </p>
              <p className="text-white text-[7px] sm:text-[8px] md:text-[9px] font-mono tracking-widest font-bold mb-1.5 sm:mb-2 md:mb-3">
                {nomorAnggota}
              </p>

              <p className="text-[#f6efb0] text-[5px] sm:text-[6px] md:text-[7px] uppercase tracking-widest mb-0.5">
                Wilayah
              </p>
              <p className="text-white text-[7px] sm:text-[8px] md:text-[9px] uppercase font-bold line-clamp-1 mb-1.5 sm:mb-2 md:mb-3">
                {cabang}
              </p>

              <p className="text-[#f6efb0] text-[5px] sm:text-[6px] md:text-[7px] uppercase tracking-widest mb-0.5">
                Berlaku Hingga
              </p>
              <p className="text-white text-[7px] sm:text-[8px] md:text-[9px] uppercase font-bold tracking-widest">
                31 DESEMBER 2031
              </p>
            </div>

            <div className="absolute bottom-3 sm:bottom-4 md:bottom-4 right-4 sm:right-5 md:right-6 shrink-0 self-end">
              <div className="bg-white p-0.5 sm:p-1 rounded-sm md:rounded-md shadow-sm">
                <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-[60px] md:h-[60px]">
                  <QRCodeSVG value={qrUrl} width="100%" height="100%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-150 mx-auto gap-8">
      {/* Controls: Template Switcher */}
      <div className="flex items-center justify-between w-full px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="rounded-full bg-muted/50 hover:bg-muted"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col items-center text-center">
          <span className="text-sm font-semibold text-foreground/80">
            Desain Kartu
          </span>
          <span className="text-xs text-muted-foreground">
            {activeTemplate.name}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="rounded-full bg-muted/50 hover:bg-muted"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* KTA Card Display with Flip & Carousel Animation */}
      <div className="relative perspective-[1000px] w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTemplate.id}-${isFlipped ? "back" : "front"}`}
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
              "relative w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl group border border-border/10 cursor-pointer transform-style-3d",
              activeTemplate.ratio,
            )}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Background Image Layer */}
            <Image
              src={isFlipped ? activeTemplate.back : activeTemplate.front}
              alt="KTA Background"
              fill
              className="object-cover pointer-events-none select-none z-0"
              priority
            />

            {/* Dynamic Data Overlay (Hanya tampil di Depan) */}
            {!isFlipped && renderDynamicContent()}

            {/* QR Code Overlay (Khusus Belakang) */}
            {isFlipped && (
              <div
                className={cn(
                  "absolute bg-white p-1 sm:p-1.5 rounded-md sm:rounded-lg shadow-xl z-10 flex flex-col items-center justify-center",
                  activeTemplate.layout === "vertical"
                    ? "bottom-[100px] sm:bottom-[115px] md:bottom-[130px] left-1/2 -translate-x-1/2"
                    : activeTemplate.id === 3
                      ? "bottom-4 sm:bottom-5 md:bottom-6 left-4 sm:left-5 md:left-6"
                      : "bottom-4 sm:bottom-5 md:bottom-6 right-4 sm:right-5 md:right-6",
                )}
              >
                <div
                  className={cn(
                    activeTemplate.layout === "vertical"
                      ? "w-[80px] h-[80px] sm:w-[95px] sm:h-[95px] md:w-[110px] md:h-[110px]"
                      : "w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] md:w-[70px] md:h-[70px]"
                  )}
                >
                  <QRCodeSVG value={qrUrl} width="100%" height="100%" />
                </div>
              </div>
            )}

            {/* Shine Effect Hover */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />

            {/* Indicator Click to flip */}
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white/80 p-1.5 rounded-full z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <RefreshCw className="w-4 h-4" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 w-full justify-center mt-2">
        <Button
          variant="outline"
          onClick={() => setIsFlipped(!isFlipped)}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Putar Kartu
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading || isDownloaded}
          className={cn(
            "min-w-[180px] gap-2 shadow-lg transition-all",
            isDownloaded ? "bg-green-600 hover:bg-green-700 text-white" : "",
          )}
        >
          {isDownloading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : isDownloaded ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isDownloading
            ? "Menyiapkan PDF..."
            : isDownloaded
              ? "Berhasil Diunduh"
              : "Unduh KTA (PDF)"}
        </Button>
      </div>
    </div>
  );
}
