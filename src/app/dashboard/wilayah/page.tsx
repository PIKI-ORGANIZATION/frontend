"use client";

import React, { useState } from "react";
import {
  Building2,
  Building,
  Network,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMasterProvinsi,
  useCabangList,
  useDpdList,
  useDpcList,
} from "@/features/wilayah/hooks/useWilayah";
import { DpdTab } from "./components/DpdTab";
import { DpcTab } from "./components/DpcTab";
import { CabangTab } from "./components/CabangTab";

type WilayahTabType = "dpd" | "dpc" | "cabang";

export default function WilayahDanCabangPage() {
  const [activeTab, setActiveTab] = useState<WilayahTabType>("dpd");

  const { data: masterProvinsi = [] } = useMasterProvinsi();
  const { data: rawCabangList = [], isLoading: isLoadingCabang } = useCabangList();
  const { data: dpdResponse } = useDpdList({ pageSize: 100 });
  const { data: dpcResponse } = useDpcList({ pageSize: 100 });

  const cabangList = Array.isArray(rawCabangList) ? rawCabangList : [];
  const dpdList = Array.isArray(dpdResponse?.data) ? dpdResponse.data : [];
  const dpcList = Array.isArray(dpcResponse?.data) ? dpcResponse.data : [];

  const TABS = [
    {
      id: "dpd" as const,
      label: "Tingkat Daerah (DPD)",
      count: dpdList.length,
      icon: Building2,
    },
    {
      id: "dpc" as const,
      label: "Tingkat Cabang (DPC)",
      count: dpcList.length,
      icon: Building,
    },
    {
      id: "cabang" as const,
      label: "Profil Cabang & Penautan",
      count: cabangList.length,
      icon: Share2,
    },
  ];

  return (
    <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Network className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Manajemen Wilayah & Cabang
            </h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kelola struktur kepengurusan DPD (Provinsi), DPC (Kabupaten/Kota), dan tautan
            profil cabang resmi PIKI secara nasional.
          </p>
        </div>
      </div>

      {/* 2. Navigation Tabs (Identik dengan format Tab Menu CMS Galeri) */}
      <div className="flex items-center overflow-x-auto pb-1 max-w-full">
        <div
          role="tablist"
          aria-label="Filter Wilayah dan Cabang"
          className="inline-flex items-center gap-1 p-1 rounded-md bg-muted/60 dark:bg-muted/40 border border-border"
        >
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-all whitespace-nowrap cursor-pointer select-none",
                  "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                  isSelected
                    ? "bg-background text-foreground font-medium shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40 font-normal border border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "ml-1 px-2 py-0.5 shrink-0 rounded-full text-xs font-mono transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tab Contents */}
      <div className="space-y-4">
        {activeTab === "dpd" && (
          <DpdTab masterProvinsi={masterProvinsi} cabangList={cabangList} />
        )}

        {activeTab === "dpc" && (
          <DpcTab masterProvinsi={masterProvinsi} cabangList={cabangList} />
        )}

        {activeTab === "cabang" && (
          <CabangTab
            cabangList={cabangList}
            dpdList={dpdList}
            dpcList={dpcList}
            isLoading={isLoadingCabang}
          />
        )}
      </div>
    </div>
  );
}
