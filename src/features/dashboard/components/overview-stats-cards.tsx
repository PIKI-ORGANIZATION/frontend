"use client";

import React from "react";
import { Users, CreditCard, Clock, Building2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewStatsCardsProps {
  totalAnggota?: number;
  totalKtaAktif?: number;
  pendingVerifikasi?: number;
  totalCabang?: number;
  isLoading?: boolean;
}

export function OverviewStatsCards({
  totalAnggota = 0,
  totalKtaAktif = 0,
  pendingVerifikasi = 0,
  totalCabang = 34,
  isLoading = false,
}: OverviewStatsCardsProps) {
  const stats = [
    {
      title: "Total Anggota Terdaftar",
      value: totalAnggota.toLocaleString("id-ID"),
      description: "+12% dari kuartal lalu",
      icon: Users,
      trend: "+12%",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "KTA Digital Aktif",
      value: totalKtaAktif.toLocaleString("id-ID"),
      description: "Keanggotaan resmi nasional",
      icon: CreditCard,
      trend: "Terverifikasi",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Antrean Verifikasi DPP",
      value: pendingVerifikasi.toLocaleString("id-ID"),
      description:
        pendingVerifikasi > 0 ? "Memerlukan peninjauan" : "Semua berkas tuntas",
      icon: Clock,
      trend: pendingVerifikasi > 0 ? "Perlu Aksi" : "Selesai",
      color: pendingVerifikasi > 0 ? "text-amber-500" : "text-emerald-500",
      bgColor: pendingVerifikasi > 0 ? "bg-amber-500/10" : "bg-emerald-500/10",
      borderColor:
        pendingVerifikasi > 0 ? "border-amber-500/20" : "border-emerald-500/20",
    },
    {
      title: "Jaringan DPD & DPC",
      value: totalCabang.toLocaleString("id-ID"),
      description: "Tersebar di seluruh Indonesia",
      icon: Building2,
      trend: "Nasional",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-36" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="relative overflow-hidden rounded-lg bg-card text-card-foreground transition-all duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${stat.borderColor} ${stat.bgColor} ${stat.color}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5 font-medium text-foreground/80">
                  <TrendingUp className="h-3 w-3 text-primary inline" />
                  {stat.trend}
                </span>
                <span>•</span>
                <span className="truncate">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
