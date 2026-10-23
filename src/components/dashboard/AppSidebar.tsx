"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  FileText,
  Settings,
  Search,
  X,
  BookOpen,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserPayload } from "@/lib/utils";
import { hasRole, ROLE_GROUPS } from "@/lib/rbac";

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  url: string;
  badge?: string | number;
};

export type NavGroupData = {
  heading: string;
  items: NavItemData[];
};

// Admin Menu Groups (satnaing/shadcn-admin architecture)
const adminNavGroups: NavGroupData[] = [
  {
    heading: "Overview",
    items: [
      {
        id: "/dashboard",
        title: "Dashboard Satu Data",
        icon: LayoutDashboard,
        url: "/dashboard",
        badge: "Live",
      },
    ],
  },
  {
    heading: "Manajemen",
    items: [
      {
        id: "/dashboard/verifikasi",
        title: "Verifikasi Pendaftar",
        icon: UserCheck,
        url: "/dashboard/verifikasi",
        badge: "New",
      },
      {
        id: "/dashboard/anggota",
        title: "Daftar Anggota",
        icon: Users,
        url: "/dashboard/anggota",
      },
      {
        id: "/dashboard/berita",
        title: "Berita",
        icon: FileText,
        url: "/dashboard/berita",
      },
    ],
  },
  {
    heading: "Publikasi (E-Office)",
    items: [
      {
        id: "/dashboard/jurnal",
        title: "Jurnal & Riset",
        icon: BookOpen,
        url: "/dashboard/jurnal",
      },
    ],
  },
  {
    heading: "Pengaturan",
    items: [
      {
        id: "/portal/pengaturan",
        title: "Pengaturan Akun",
        icon: Settings,
        url: "/portal/pengaturan",
      },
    ],
  },
];

// Member Nav Groups
const memberNavGroups: NavGroupData[] = [
  {
    heading: "Portal Anggota",
    items: [
      {
        id: "/portal",
        title: "Dashboard Pribadi",
        icon: LayoutDashboard,
        url: "/portal",
      },
      {
        id: "/portal#kta",
        title: "KTA Digital Resmi",
        icon: CreditCard,
        url: "/portal#kta",
      },
      {
        id: "/portal/pengaturan",
        title: "Pengaturan Profil",
        icon: Settings,
        url: "/portal/pengaturan",
      },
    ],
  },
];

export function AppSidebar({ user }: { user?: UserPayload | null }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isAdmin = hasRole(user, ROLE_GROUPS.ADMINS);
  const navGroups = isAdmin ? adminNavGroups : memberNavGroups;

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Sidebar className="border-r border-border/80 bg-sidebar font-sans">
      {/* 1. Header: Clean PIKI Branding (No WorkspaceSwitcher dropdown) */}
      <SidebarHeader className="h-14 flex items-center justify-between px-4 border-b border-border/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              PIKI NASIONAL
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              CMS & Satu Data PIKI
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* 2. Content: Quick Search Trigger + Grouped Navigation */}
      <SidebarContent className="p-2 space-y-3">
        {/* Quick Search Trigger (⌘K) */}
        <div className="px-2 pt-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 hover:text-foreground border border-border/60 rounded-md transition-colors shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span>Cari fitur / menu...</span>
            </span>
            <kbd className="text-[10px] font-mono bg-background border border-border/70 px-1 py-0.2 rounded text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Groups */}
        {navGroups.map((group) => (
          <SidebarGroup key={group.heading} className="p-0">
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 px-3 py-1">
              {group.heading}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.url === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.url);
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={isActive}
                        className={`h-9 px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <span className="truncate">{item.title}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* 3. Footer: Minimal System Info */}
      <SidebarFooter className="p-3 border-t border-border/60">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span className="font-medium">PIKI CMS v2.4</span>
          <span className="flex items-center gap-1 text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />

      {/* Search Command Palette Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/50 backdrop-blur-xs px-4">
          <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
          <div className="relative w-full max-w-lg bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center px-3.5 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
              <input
                autoFocus
                className="flex-1 bg-transparent py-3.5 outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="Ketikkan nama menu atau halaman..."
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsSearchOpen(false);
                }}
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 space-y-1 max-h-72 overflow-y-auto text-xs">
              <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Menu Cepat
              </p>
              {adminNavGroups
                .flatMap((g) => g.items)
                .map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-3.5 w-3.5 text-primary" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
