"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const dataWilayah = [
  { wilayah: "Sumatera Utara", total: 420, ktaAktif: 380 },
  { wilayah: "DKI Jakarta", total: 340, ktaAktif: 310 },
  { wilayah: "Nusa Tenggara Timur", total: 290, ktaAktif: 250 },
  { wilayah: "Jawa Barat", total: 240, ktaAktif: 210 },
  { wilayah: "Papua", total: 210, ktaAktif: 180 },
  { wilayah: "Sulawesi Utara", total: 195, ktaAktif: 175 },
  { wilayah: "Jawa Timur", total: 160, ktaAktif: 140 },
  { wilayah: "Kalimantan Barat", total: 130, ktaAktif: 110 },
  { wilayah: "Maluku", total: 115, ktaAktif: 95 },
  { wilayah: "DI Yogyakarta", total: 90, ktaAktif: 85 },
];

const chartConfig = {
  total: {
    label: "Total Anggota",
    color: "var(--chart-1)",
  },
  ktaAktif: {
    label: "KTA Aktif",
    color: "#10b981",
  },
} satisfies ChartConfig;

export function WilayahBarChart() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
              Sebaran Anggota per DPD (Provinsi)
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              10 Wilayah dengan konsentrasi anggota dan penerbitan KTA
              terbanyak.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-[var(--chart-1)]" />
              Total Pendaftar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
              KTA Aktif
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <BarChart
            data={dataWilayah}
            margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.6}
            />
            <XAxis
              dataKey="wilayah"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-25}
              textAnchor="end"
              interval={0}
              height={45}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="total"
              fill="var(--color-total)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="ktaAktif"
              fill="var(--color-ktaAktif)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
