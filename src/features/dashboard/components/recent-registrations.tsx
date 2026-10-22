"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, UserCheck, Clock, ShieldCheck } from "lucide-react";
import { useGetDaftarAnggota } from "@/hooks/api/useAnggota";

export function RecentRegistrations() {
  const { data, isLoading } = useGetDaftarAnggota({
    pageSize: 5,
  });

  const anggotaList = data?.data || [];

  return (
    <Card className="rounded-lg border border-border/80 bg-card text-card-foreground flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Pendaftar & Anggota Terbaru
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              5 Pengajuan KTA dan pendaftar yang baru masuk
            </CardDescription>
          </div>
          <Link href="/dashboard/verifikasi">
            <Button variant="ghost" size="xs" className="text-xs gap-1">
              Verifikasi
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-1 flex-1 flex flex-col justify-between">
        {isLoading ? (
          <div className="space-y-3.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            ))}
          </div>
        ) : anggotaList.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Belum ada data pendaftar terbaru yang tercatat.
          </div>
        ) : (
          <div className="space-y-3">
            {anggotaList.map((item) => {
              const initials = item.namaLengkap
                ? item.namaLengkap
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "PI";

              const isActive = item.statusKta === "ACTIVE";

              return (
                <div
                  key={item.uuid}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                      <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.namaLengkap}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.cabang?.namaCabang || item.provinsi || "DPP Nasional"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isActive ? (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold gap-1 px-2 py-0.5"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        KTA Aktif
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-semibold gap-1 px-2 py-0.5"
                      >
                        <Clock className="h-3 w-3" />
                        Menunggu
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-border/60 mt-3">
          <Link href="/dashboard/anggota" className="block">
            <Button variant="outline" size="sm" className="w-full text-xs font-medium justify-between">
              <span>Buka Seluruh Database Anggota</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
