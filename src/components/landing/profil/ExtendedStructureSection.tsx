"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { usePengurus } from "@/features/pengurus/hooks/usePengurus";
import { initialPengurusData } from "@/features/pengurus/data/dummyPengurusData";
import { cn } from "@/lib/utils";
import { Building2, GraduationCap } from "lucide-react";

export function ExtendedStructureSection() {
  const { items, isLoaded } = usePengurus();
  const [activeTab, setActiveTab] = useState<"BIDANG" | "PENASEHAT">("BIDANG");

  const dewanBidang = useMemo(() => {
    const source = !isLoaded || items.length === 0 ? initialPengurusData : items;
    return source
      .filter((i) => i.kategori === "BIDANG" && i.status === "PUBLISHED")
      .sort((a, b) => a.urutan - b.urutan);
  }, [items, isLoaded]);

  const dewanPenasehat = useMemo(() => {
    const source = !isLoaded || items.length === 0 ? initialPengurusData : items;
    return source
      .filter((i) => i.kategori === "PENASEHAT" && i.status === "PUBLISHED")
      .sort((a, b) => a.urutan - b.urutan);
  }, [items, isLoaded]);

  const activeList = activeTab === "BIDANG" ? dewanBidang : dewanPenasehat;

  return (
    <section className="relative w-full py-16 md:py-24 bg-muted/30 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-primary mb-3">
            Struktur Fungsional
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Jajaran Pengurus & Dewan Pakar
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Menghimpun potensi cendekiawan lintas disiplin ilmu untuk
            merealisasikan program kerja strategis dan pertimbangan kebangsaan.
          </p>

          {/* Tab Selector */}
          <div className="inline-flex items-center p-1 rounded-full bg-background border border-border mt-8 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("BIDANG")}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                activeTab === "BIDANG"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Building2 className="w-4 h-4" />
              <span>Dewan Pengurus & Bidang ({dewanBidang.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PENASEHAT")}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                activeTab === "PENASEHAT"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Dewan Penasehat & Pakar ({dewanPenasehat.length})</span>
            </button>
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeList.map((person) => {
            const isDataOrBlob =
              person.foto?.startsWith("data:") ||
              person.foto?.startsWith("blob:");

            return (
              <div
                key={person.id}
                className="flex flex-col rounded-2xl overflow-hidden bg-card border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 group"
              >
                {/* Photo */}
                <div className="relative w-full aspect-[3/4] bg-muted overflow-hidden">
                  {person.foto && (
                    <Image
                      src={person.foto}
                      alt={person.nama}
                      fill
                      unoptimized={isDataOrBlob}
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80" />

                  <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-xs text-foreground text-[10px] font-semibold uppercase tracking-wider py-1 px-2.5 rounded-full border border-border">
                    {person.jabatan}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 gap-1.5">
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {person.nama}
                  </h3>
                  <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide">
                    {person.jabatan}
                  </p>
                  {person.bidang && (
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {person.bidang}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                    {person.deskripsi}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

