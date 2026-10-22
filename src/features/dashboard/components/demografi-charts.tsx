"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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
import { GraduationCap, Briefcase, Users2, Award } from "lucide-react";

// Data Distribusi Pendidikan Anggota PIKI
const dataPendidikan = [
  { name: "S1 (Sarjana)", value: 520, percent: "48%", fill: "var(--chart-1)" },
  { name: "S2 (Magister)", value: 310, percent: "29%", fill: "var(--chart-2)" },
  { name: "S3 (Doktor)", value: 110, percent: "10%", fill: "var(--chart-3)" },
  { name: "Diploma (D3/D4)", value: 85, percent: "8%", fill: "var(--chart-4)" },
  { name: "SMA / Sederajat", value: 55, percent: "5%", fill: "var(--chart-5)" },
];

const pendidikanConfig = {
  value: {
    label: "Anggota",
  },
  "S1 (Sarjana)": {
    label: "S1 (Sarjana)",
    color: "var(--chart-1)",
  },
  "S2 (Magister)": {
    label: "S2 (Magister)",
    color: "var(--chart-2)",
  },
  "S3 (Doktor)": {
    label: "S3 (Doktor)",
    color: "var(--chart-3)",
  },
  "Diploma (D3/D4)": {
    label: "Diploma",
    color: "var(--chart-4)",
  },
  "SMA / Sederajat": {
    label: "SMA",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

// Data Distribusi Profesi & Bidang Minat PIKI
const dataProfesi = [
  { profesi: "Akademisi / Dosen", jumlah: 285 },
  { profesi: "Praktisi Hukum / Advokat", jumlah: 240 },
  { profesi: "ASN & Birokrasi", jumlah: 195 },
  { profesi: "Medis & Tenaga Kesehatan", jumlah: 145 },
  { profesi: "Bisnis / Pengusaha", jumlah: 120 },
  { profesi: "Teknologi & Digital", jumlah: 95 },
];

const profesiConfig = {
  jumlah: {
    label: "Jumlah Anggota",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DemografiCharts() {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 1. Chart Komposisi Pendidikan */}
      <Card className="rounded-lg border border-border/80 bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  Tingkat Pendidikan Anggota
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Latar belakang jenjang akademis cendekiawan PIKI
                </CardDescription>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Award className="h-3 w-3" />
              <span>87% Sarjana+</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
            <div className="sm:col-span-6 h-[220px] w-full flex items-center justify-center">
              <ChartContainer config={pendidikanConfig} className="h-full w-full aspect-square">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={dataPendidikan}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="var(--card)"
                    strokeWidth={2}
                    onMouseEnter={(_, index) => setActiveSegment(dataPendidikan[index].name)}
                    onMouseLeave={() => setActiveSegment(null)}
                  >
                    {dataPendidikan.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.fill}
                        opacity={activeSegment && activeSegment !== entry.name ? 0.35 : 1}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            <div className="sm:col-span-6 space-y-2">
              {dataPendidikan.map((item) => (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveSegment(item.name)}
                  onMouseLeave={() => setActiveSegment(null)}
                  className={`flex items-center justify-between text-xs p-1.5 rounded-md transition-colors cursor-pointer ${
                    activeSegment === item.name ? "bg-muted font-medium" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="truncate text-foreground/90">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-muted-foreground">{item.value}</span>
                    <span className="font-semibold text-foreground/80 w-8 text-right">
                      {item.percent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Chart Bidang Profesi & Minat */}
      <Card className="rounded-lg border border-border/80 bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  Bidang Profesi & Kepakaran
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Distribusi sektor keahlian anggota di ranah publik & privat
                </CardDescription>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Users2 className="h-3 w-3" />
              <span>Multi-disiplin</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <ChartContainer config={profesiConfig} className="h-[220px] w-full">
            <BarChart
              data={dataProfesi}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="var(--border)"
                opacity={0.6}
              />
              <XAxis
                type="number"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="profesi"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={130}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="jumlah"
                fill="var(--color-jumlah)"
                radius={[0, 4, 4, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
