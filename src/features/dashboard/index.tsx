"use client";

import React from "react";
import { OverviewStatsCards } from "./components/overview-stats-cards";
import { WilayahBarChart } from "./components/wilayah-bar-chart";
import { DemografiCharts } from "./components/demografi-charts";
import { RecentRegistrations } from "./components/recent-registrations";
import { DataExportDialog } from "./components/data-export-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/api/useDashboardStats";
import { useGetDaftarAnggota } from "@/hooks/api/useAnggota";
import {
  RotateCcw,
  Sparkles,
  BarChart3,
  Users2,
  ShieldCheck,
  CheckCircle,
  Timer,
  Zap,
} from "lucide-react";

export function DashboardFeature() {
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
    isRefetching,
  } = useDashboardStats();

  const { data: activeKtaData } = useGetDaftarAnggota({
    statusKta: "ACTIVE",
    pageSize: 1,
  });

  const totalAnggota = stats?.totalAnggota || 0;
  const pendingVerifikasi = stats?.pendingApprovalCount || 0;
  const totalKtaAktif =
    activeKtaData?.pagination?.total ||
    Math.max(0, totalAnggota - pendingVerifikasi);

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Satu Data PIKI
            </h1>
            <Badge
              variant="outline"
              className="gap-1 border-primary/30 bg-primary/10 text-primary font-medium text-[11px] py-0.5"
            >
              <Sparkles className="h-3 w-3" />
              Nasional v2.4
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Pusat analitik eksekutif, sebaran keanggotaan wilayah, dan manajemen
            KTA digital DPP PIKI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchStats()}
            disabled={isRefetching}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Segarkan</span>
          </Button>
          <DataExportDialog />
        </div>
      </div>

      {/* 2. Overview Stats Cards */}
      <OverviewStatsCards
        totalAnggota={totalAnggota}
        totalKtaAktif={totalKtaAktif}
        pendingVerifikasi={pendingVerifikasi}
        totalCabang={34}
        isLoading={isStatsLoading}
      />

      {/* 3. Tabbed Analytics Sections */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="bg-muted/70 p-1">
            <TabsTrigger
              value="overview"
              className="gap-1.5 text-xs font-semibold"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Ringkasan & Wilayah</span>
            </TabsTrigger>
            <TabsTrigger
              value="demografi"
              className="gap-1.5 text-xs font-semibold"
            >
              <Users2 className="h-3.5 w-3.5" />
              <span>Demografi & Profesi</span>
            </TabsTrigger>
            <TabsTrigger
              value="insight"
              className="gap-1.5 text-xs font-semibold"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Kepatuhan & KTA</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sinkronisasi database live</span>
          </div>
        </div>

        {/* Tab 1: Ringkasan & Wilayah */}
        <TabsContent
          value="overview"
          className="space-y-4 focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full gap-4">
            <div className="lg:col-span-2">
              <WilayahBarChart />
            </div>
            <div className="lg:col-span-1">
              <RecentRegistrations />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Demografi & Profesi */}
        <TabsContent
          value="demografi"
          className="space-y-4 focus-visible:outline-none"
        >
          <DemografiCharts />
        </TabsContent>

        {/* Tab 3: Kepatuhan & KTA Insights */}
        <TabsContent
          value="insight"
          className="space-y-4 focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-lg border border-border/80 bg-card text-card-foreground p-5">
              <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tingkat Verifikasi
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-2">
                <div className="text-2xl font-bold text-foreground">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  Persentase berkas anggota yang berhasil diverifikasi dan
                  disetujui oleh DPP & DPC.
                </p>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94.2%]" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border border-border/80 bg-card text-card-foreground p-5">
              <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rata-Rata SLA Penerbitan
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Timer className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  1.8 Hari
                </div>
                <p className="text-xs text-muted-foreground">
                  Kecepatan rata-rata proses approval DPP sejak berkas
                  pendaftaran dinyatakan lengkap.
                </p>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[70%]" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border border-border/80 bg-card text-card-foreground p-5">
              <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Penyimpanan QR Code
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  100% Otomatis
                </div>
                <p className="text-xs text-muted-foreground">
                  Setiap KTA aktif langsung terintegrasi dengan URL publik
                  verifikasi identitas resmi.
                </p>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
