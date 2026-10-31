"use client";

import { Card } from "@/components/ui/card";
import { Layers, Camera, Film, Sparkles } from "lucide-react";
import { GaleriStats } from "@/features/galeri/types";

interface GaleriStatsCardsProps {
  stats: GaleriStats;
}

export function GaleriStatsCards({ stats }: GaleriStatsCardsProps) {
  const statCards = [
    {
      title: "Total Media",
      value: stats.total,
      description: `${stats.publishedCount} Tayang • ${stats.draftCount} Draf`,
      icon: Layers,
      iconClass: "text-blue-600 bg-blue-500/10",
    },
    {
      title: "Foto Dokumentasi",
      value: stats.photoCount,
      description: "Arsip foto resolusi tinggi",
      icon: Camera,
      iconClass: "text-emerald-600 bg-emerald-500/10",
    },
    {
      title: "Video Liputan",
      value: stats.videoCount,
      description: "Kanal YouTube PIKI TV",
      icon: Film,
      iconClass: "text-red-600 bg-red-500/10",
    },
    {
      title: "Spotlight Utama",
      value: stats.spotlightCount,
      description: "Hero banner di landing galeri",
      icon: Sparkles,
      iconClass: "text-amber-600 bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="p-5 border border-border/80 bg-card hover:border-primary/40 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {card.value}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {card.description}
                </p>
              </div>
              <div
                className={`size-11 rounded-xl flex items-center justify-center ${card.iconClass}`}
              >
                <Icon className="size-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

