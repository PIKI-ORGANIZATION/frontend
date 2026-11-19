"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Building,
  Network,
  Share2,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { resolveWilayahAccess, WilayahScope } from "@/lib/rbac";
import {
  useMasterProvinsi,
  useCabangList,
  useDpdList,
  useAllDpcList,
} from "@/features/wilayah/hooks/useWilayah";
import { DpdTab } from "./components/DpdTab";
import { DpcTab } from "./components/DpcTab";
import { CabangTab } from "./components/CabangTab";

type WilayahTabType = "dpd" | "dpc" | "cabang";

const SCOPE_META: Record<
  Exclude<WilayahScope, "UNLINKED">,
  { badge: string; badgeClass: string; description: string }
> = {
  DPP: {
    badge: "Cakupan Nasional (DPP)",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    description:
      "Kelola struktur kepengurusan DPD (Provinsi), DPC (Kabupaten/Kota), dan tautan profil cabang resmi PIKI secara nasional.",
  },
  DPD: {
    badge: "Cakupan Provinsi (DPD)",
    badgeClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    description:
      "Kelola informasi kepengurusan DPD provinsi Anda serta pantau daftar DPC yang berada di bawah wilayah provinsi Anda.",
  },
  DPC: {
    badge: "Cakupan Kabupaten/Kota (DPC)",
    badgeClass:
      "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    description:
      "Lihat dan perbarui informasi kepengurusan, kontak, serta nomor SK untuk DPC di wilayah kabupaten/kota Anda.",
  },
};

export default function WilayahDanCabangPage() {
  const { user, isReady } = useCurrentUser();
  const access = useMemo(() => resolveWilayahAccess(user), [user]);

  const [selectedTab, setSelectedTab] = useState<WilayahTabType | null>(null);

  // Hanya jalankan query sesuai hak akses peran agar tidak memicu 403 Forbidden
  const shouldFetchMasterProvinsi =
    isReady &&
    (access.canCreateDpd || access.canCreateDpc || access.canFilterProvinsi);

  const { data: masterProvinsi = [] } = useMasterProvinsi(
    shouldFetchMasterProvinsi,
  );
  const { data: rawCabangList = [], isLoading: isLoadingCabang } =
    useCabangList({
      enabled: isReady && access.canManageCabangLink,
    });
  const { data: dpdResponse } = useDpdList({
    pageSize: 100,
    enabled: isReady && access.canViewDpd,
  });
  const { data: dpcResponse } = useAllDpcList(isReady && access.canViewDpc);

  const cabangList = useMemo(
    () => (Array.isArray(rawCabangList) ? rawCabangList : []),
    [rawCabangList],
  );
  const dpdList = useMemo(
    () => (Array.isArray(dpdResponse?.data) ? dpdResponse.data : []),
    [dpdResponse],
  );
  const dpcList = useMemo(
    () => (Array.isArray(dpcResponse?.data) ? dpcResponse.data : []),
    [dpcResponse],
  );

  const dpdTotal = dpdResponse?.meta?.total ?? dpdList.length;
  const dpcTotal = dpcResponse?.meta?.total ?? dpcList.length;

  const availableTabs = useMemo(() => {
    const tabs: Array<{
      id: WilayahTabType;
      label: string;
      count: number;
      icon: React.ElementType;
    }> = [];

    if (access.canViewDpd) {
      tabs.push({
        id: "dpd",
        label: "Tingkat Daerah (DPD)",
        count: dpdTotal,
        icon: Building2,
      });
    }

    if (access.canViewDpc) {
      tabs.push({
        id: "dpc",
        label: "Tingkat Cabang (DPC)",
        count: dpcTotal,
        icon: Building,
      });
    }

    if (access.canManageCabangLink) {
      tabs.push({
        id: "cabang",
        label: "Profil Cabang & Penautan",
        count: cabangList.length,
        icon: Share2,
      });
    }

    return tabs;
  }, [access, dpdTotal, dpcTotal, cabangList.length]);

  const activeTab: WilayahTabType | null = useMemo(() => {
    if (selectedTab && availableTabs.some((t) => t.id === selectedTab)) {
      return selectedTab;
    }
    return availableTabs[0]?.id ?? null;
  }, [selectedTab, availableTabs]);

  // 0. Hydration Loading State
  if (!isReady) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-sm">Memuat cakupan wilayah akun...</span>
      </div>
    );
  }

  // 0b. Unlinked Admin State (Belum ditautkan ke Cabang / DPD / DPC)
  if (access.scope === "UNLINKED") {
    return (
      <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Network className="h-4 w-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Manajemen Wilayah &amp; Cabang
              </h1>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 max-w-full">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">
                Akun Belum Ditautkan ke Wilayah DPD / DPC
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Akun admin Anda saat ini belum memiliki tautan ke profil Cabang
                yang terhubung dengan DPD atau DPC. Silakan hubungi{" "}
                <span className="font-medium text-foreground">
                  Super Admin (DPP)
                </span>{" "}
                untuk menautkan akun Anda ke wilayah terkait, kemudian lakukan{" "}
                <span className="font-medium text-foreground">login ulang</span>{" "}
                agar hak akses wilayah aktif.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const scopeMeta = SCOPE_META[access.scope];

  return (
    <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Network className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Manajemen Wilayah &amp; Cabang
            </h1>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium px-2.5 py-0.5 rounded-md",
                scopeMeta.badgeClass,
              )}
            >
              {scopeMeta.badge}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {scopeMeta.description}
          </p>
        </div>
      </div>

      {/* 2. Navigation Tabs (Tampil bila akun memiliki > 1 tab sesuai cakupan wilayah) */}
      {availableTabs.length > 1 && (
        <div className="flex items-center overflow-x-auto pb-1 max-w-full">
          <div
            role="tablist"
            aria-label="Filter Wilayah dan Cabang"
            className="inline-flex items-center gap-1 p-1 rounded-md bg-muted/60 dark:bg-muted/40 border border-border"
          >
            {availableTabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-all whitespace-nowrap cursor-pointer select-none",
                    "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                    isSelected
                      ? "bg-background text-foreground font-medium shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40 font-normal border border-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "ml-1 px-2 py-0.5 shrink-0 rounded-full text-xs font-mono transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Tab Contents */}
      <div className="space-y-4">
        {activeTab === "dpd" && access.canViewDpd && (
          <DpdTab
            masterProvinsi={masterProvinsi}
            cabangList={cabangList}
            access={access}
          />
        )}

        {activeTab === "dpc" && access.canViewDpc && (
          <DpcTab
            masterProvinsi={masterProvinsi}
            cabangList={cabangList}
            allDpcList={dpcList}
            access={access}
          />
        )}

        {activeTab === "cabang" && access.canManageCabangLink && (
          <CabangTab
            cabangList={cabangList}
            dpdList={dpdList}
            dpcList={dpcList}
            masterProvinsi={masterProvinsi}
            isLoading={isLoadingCabang}
          />
        )}
      </div>
    </div>
  );
}
