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
  Globe,
  CheckCircle2,
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

  const historyStats = useMemo(() => {
    let published = 0;
    let draft = 0;
    for (const item of historyEvents) {
      if (item.status === "PUBLISHED") published++;
      else if (item.status === "DRAFT") draft++;
    }
    return { total: historyEvents.length, published, draft };
  }, [historyEvents]);

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
        <div className="overflow-hidden rounded-xl border border-border bg-card">
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
    <div className="mx-auto max-w-7xl space-y-6 py-4 sm:py-6 lg:py-8">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Globe className="size-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                CMS Landing Page
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-3" aria-hidden="true" />
                Terhubung Server
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
              Kelola teks hero banner, profil pengantar, visi misi, dan linimasa
              sejarah yang tampil pada beranda publik PIKI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "cursor-pointer gap-1.5 font-medium",
            )}
          >
            <span>Buka Halaman Publik</span>
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* 2. Mini Stats & Tab Navigation Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-full items-center overflow-x-auto pb-1 lg:pb-0">
          <div
            role="tablist"
            aria-label="Bagian CMS Landing Page"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 p-1 dark:bg-muted/40"
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
                    "flex cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 text-sm transition-all",
                    "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                    isSelected
                      ? "bg-background font-medium text-foreground shadow-2xs"
                      : "border border-transparent font-normal text-muted-foreground hover:bg-background/40 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && (
                    <span
                      className={cn(
                        "ml-0.5 shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums transition-colors",
                        isSelected
                          ? "bg-primary/10 font-semibold text-primary"
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

        {/* Ringkasan Cepat Sejarah */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            <span>Total</span>
            <strong className="font-mono tabular-nums text-foreground">
              {historyStats.total}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>Tayang</span>
            <strong className="font-mono tabular-nums text-foreground">
              {historyStats.published}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            <span>Draf</span>
            <strong className="font-mono tabular-nums text-foreground">
              {historyStats.draft}
            </strong>
          </span>
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
