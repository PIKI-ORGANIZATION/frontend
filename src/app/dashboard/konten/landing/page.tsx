"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  initialHistoryEvents,
  initialHeroContent,
  initialAboutVisionContent,
} from "./data/dummyLandingData";
import { HistoryEvent, HeroContent, AboutVisionContent } from "./types";
import { HistoryTab } from "./components/HistoryTab";
import { HeroSectionTab } from "./components/HeroSectionTab";
import { AboutVisionTab } from "./components/AboutVisionTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Globe,
  ExternalLink,
  History,
  Sparkles,
  Compass,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEYS = {
  HISTORY: "piki_cms_landing_history_v1",
  HERO: "piki_cms_landing_hero_v1",
  ABOUT_VISION: "piki_cms_landing_about_vision_v1",
};

export default function CmsLandingPage() {
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>(() => {
    if (typeof window === "undefined") return initialHistoryEvents;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : initialHistoryEvents;
    } catch {
      return initialHistoryEvents;
    }
  });

  const [heroContent, setHeroContent] = useState<HeroContent>(() => {
    if (typeof window === "undefined") return initialHeroContent;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HERO);
      return saved ? JSON.parse(saved) : initialHeroContent;
    } catch {
      return initialHeroContent;
    }
  });

  const [aboutVisionContent, setAboutVisionContent] =
    useState<AboutVisionContent>(() => {
      if (typeof window === "undefined") return initialAboutVisionContent;
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.ABOUT_VISION);
        return saved ? JSON.parse(saved) : initialAboutVisionContent;
      } catch {
        return initialAboutVisionContent;
      }
    });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyEvents));
    } catch {}
  }, [historyEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HERO, JSON.stringify(heroContent));
    } catch {}
  }, [heroContent]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.ABOUT_VISION,
        JSON.stringify(aboutVisionContent),
      );
    } catch {}
  }, [aboutVisionContent]);

  const handleResetAll = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin mengembalikan seluruh data Landing Page ke pengaturan bawaan default?",
      )
    ) {
      setHistoryEvents(initialHistoryEvents);
      setHeroContent(initialHeroContent);
      setAboutVisionContent(initialAboutVisionContent);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.HERO);
      localStorage.removeItem(STORAGE_KEYS.ABOUT_VISION);
      toast.success("Seluruh data CMS Landing Page dikembalikan ke default.");
    }
  };

  return (
    <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              CMS Landing Page
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Kelola teks hero banner, profil pengantar, visi misi, dan linimasa
            sejarah yang tampil pada beranda publik PIKI.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            title="Kembalikan semua form & linimasa ke data awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </Button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }), "font-semibold")}
          >
            <span>Buka Halaman Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-lg border border-border/70 h-auto flex flex-wrap gap-1">
          <TabsTrigger
            value="history"
            className="rounded-md text-xs font-medium px-3.5 py-1.5 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            <History className="w-3.5 h-3.5" />
            <span>Linimasa Sejarah</span>
            <Badge
              variant="secondary"
              className="text-[10px] rounded-full px-1.5 py-0 font-mono font-semibold ml-1 bg-muted"
            >
              {historyEvents.length}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="hero"
            className="rounded-md text-xs font-medium px-3.5 py-1.5 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hero Section & CTA</span>
          </TabsTrigger>

          <TabsTrigger
            value="about"
            className="rounded-md text-xs font-medium px-3.5 py-1.5 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tentang & Visi-Misi</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Linimasa Sejarah */}
        <TabsContent
          value="history"
          className="focus-visible:outline-none space-y-4"
        >
          <HistoryTab events={historyEvents} setEvents={setHistoryEvents} />
        </TabsContent>

        {/* Tab 2: Hero Section */}
        <TabsContent
          value="hero"
          className="focus-visible:outline-none space-y-4"
        >
          <HeroSectionTab hero={heroContent} setHero={setHeroContent} />
        </TabsContent>

        {/* Tab 3: Tentang & Visi-Misi */}
        <TabsContent
          value="about"
          className="focus-visible:outline-none space-y-4"
        >
          <AboutVisionTab
            data={aboutVisionContent}
            setData={setAboutVisionContent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
