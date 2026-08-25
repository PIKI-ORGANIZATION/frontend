"use client";

import Image from "next/image";
import { QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DigitalKTA() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* KTA Card - Premium Design */}
      <div className="relative w-full max-w-[480px] aspect-[1.58/1] rounded-xl overflow-hidden shadow-2xl group border border-border/10">
        {/* Background / Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black">
          {/* Subtle patterns or glowing orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3" />
        </div>

        {/* Card Content Layer */}
        <div className="absolute inset-0 p-5 flex flex-col z-10 text-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-md p-1 flex items-center justify-center shrink-0">
                <Image
                  src="/logo1.png"
                  alt="PIKI Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-white/90">
                  KARTU TANDA ANGGOTA
                </h2>
                <p className="text-[10px] text-white/60 font-medium tracking-wide uppercase">
                  Persatuan Inteligensia Kristen Indonesia
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 mt-4 flex gap-5">
            {/* Photo Section */}
            <div className="w-24 h-[120px] shrink-0 bg-white/10 rounded-lg border border-white/20 overflow-hidden relative shadow-inner">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10 mb-2"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            {/* Data Section */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="space-y-2.5">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">Nama Lengkap</p>
                  <p className="text-sm font-bold tracking-wide uppercase">Christian Doe</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">Nomor Anggota (NIA)</p>
                  <p className="text-sm font-mono tracking-wider font-semibold">1029 3847 5612</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">DPC / Cabang</p>
                  <p className="text-xs font-semibold uppercase">DKI Jakarta - Jakarta Selatan</p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="w-16 flex flex-col items-end justify-between shrink-0">
              <div className="bg-white p-1.5 rounded-md shadow-sm w-full aspect-square flex items-center justify-center">
                <QrCode className="w-full h-full text-black" strokeWidth={1.5} />
              </div>
              <div className="text-right w-full mt-2">
                <p className="text-[8px] uppercase tracking-widest text-white/50">Berlaku S.d</p>
                <p className="text-[10px] font-bold text-white tracking-widest">12 / 2028</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </div>

      <Button className="w-full max-w-[200px] gap-2 shadow-lg hover:shadow-xl transition-all h-11" size="lg">
        <Download className="w-4 h-4" />
        Unduh KTA (PDF)
      </Button>
    </div>
  );
}
