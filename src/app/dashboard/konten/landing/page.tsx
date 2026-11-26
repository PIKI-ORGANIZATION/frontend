"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { HistoryTab } from "./components/HistoryTab";
import { HeroSectionTab } from "./components/HeroSectionTab";
import { AboutVisionTab } from "./components/AboutVisionTab";
import { buttonVariants } from "@/components/ui/button";
import { AccessDeniedState } from "@/components/dashboard/AccessDeniedState";
import {
  SkeletonFormSections,
  SkeletonFormWithPreview,
  SkeletonPageHeader,
  SkeletonTimelineList,
} from "@/components/ui/skeleton-presets";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { resolveLandingCmsAccess } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  History,
  Sparkles,
  Compass,
} from "lucide-react";
import { useSejarah } from "@/features/sejarah/hooks/useSejarah";
import { useAdminLandingSettings } from "@/features/page-setting/hooks/usePageSettings";
import { LANDING_SETTING_KEYS } from "@/features/page-setting/types";

type LandingTabKey = "history" | "hero" | "about";

export default function CmsLandingPage() {
  const { user, isReady } = useCurrentUser();
  const access = useMemo(() => resolveLandingCmsAccess(user), [user]);
  const [activeTab, setActiveTab] = useState<LandingTabKey>("history");

  const { events: historyEvents } = useSejarah({
    fixed: "all",
    enabled: isReady && access.canView,
  });

  const {
    hero: heroContent,
    aboutVision: aboutVisionContent,
    isLoading: isLoadingSettings,
    upsertSetting,
  } = useAdminLandingSettings(isReady && access.canManagePageSettings);

  const tabs = useMemo(() => {
    const list: Array<{
      id: LandingTabKey;
      label: string;
      icon: React.ElementType;
      count?: number;
    }> = [
      {
        id: "history",
        label: "Linimasa Sejarah",
        icon: History,
        count: historyEvents.length,
      },
    ];

    if (access.canManagePageSettings) {
      list.push(
        {
          id: "hero",
          label: "Hero Section & CTA",
          icon: Sparkles,
        },
        {
          id: "about",
          label: "Tentang & Visi-Misi",
          icon: Compass,
        },
      );
    }

    return list;
  }, [access.canManagePageSettings, historyEvents.length]);

  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : "history";

  if (!isReady) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 py-4 sm:py-6 lg:py-8">
        <SkeletonPageHeader showTabs tabCount={3} />
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <SkeletonTimelineList rows={4} label="Memuat CMS Landing Page…" />
        </div>
      </div>
    );
  }

  if (!access.canView) {
    return (
      <AccessDeniedState
        title="Akses CMS Landing Page Ditolak"
        description="Akun Anda tidak memiliki izin SEJARAH_MANAGE atau MANAGE_PAGE_SETTINGS untuk mengakses halaman manajemen konten beranda."
      />
    );
  }

  return (
    <div className="space-y-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            CMS Landing Page
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Kelola teks hero banner, profil pengantar, visi misi, dan linimasa
            sejarah yang tampil pada beranda publik PIKI.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
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

      {/* 2. Navigation Tabs (Segmented Control Track selaras dengan CMS Galeri & Wilayah) */}
      <div className="flex items-center overflow-x-auto pb-1 max-w-full">
        <div
          role="tablist"
          aria-label="Bagian CMS Landing Page"
          className="inline-flex items-center gap-1 p-1 rounded-md bg-muted/60 dark:bg-muted/40 border border-border"
        >
          {tabs.map((tab) => {
            const isSelected = currentTab === tab.id;
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
                {typeof tab.count === "number" && (
                  <span
                    className={cn(
                      "ml-0.5 px-1.5 py-0.5 shrink-0 rounded-full text-[10px] font-mono transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Tab Content */}
      {currentTab === "history" && (
        <div role="tabpanel" className="space-y-4">
          <HistoryTab
            canManage={access.canManageSejarah}
            enabled={isReady && access.canView}
          />
        </div>
      )}

      {currentTab === "hero" && access.canManagePageSettings && (
        <div role="tabpanel" className="space-y-4">
          {isLoadingSettings ? (
            <SkeletonFormWithPreview label="Memuat pengaturan Hero Section…" />
          ) : (
            <HeroSectionTab
              hero={heroContent}
              isSaving={upsertSetting.isPending}
              onSave={async (updated) => {
                await upsertSetting.mutateAsync({
                  key: LANDING_SETTING_KEYS.HERO,
                  valueObj: updated,
                });
              }}
            />
          )}
        </div>
      )}

      {currentTab === "about" && access.canManagePageSettings && (
        <div role="tabpanel" className="space-y-4">
          {isLoadingSettings ? (
            <SkeletonFormSections label="Memuat pengaturan Tentang & Visi-Misi…" />
          ) : (
            <AboutVisionTab
              data={aboutVisionContent}
              isSaving={upsertSetting.isPending}
              onSave={async (updated) => {
                await upsertSetting.mutateAsync({
                  key: LANDING_SETTING_KEYS.ABOUT_VISION,
                  valueObj: updated,
                });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
