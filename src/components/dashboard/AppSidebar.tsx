"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldCheck,
  CreditCard,
  Globe,
  FileText,
  Calendar,
  BookOpen,
  Image as ImageIcon,
  Network,
  UserCog,
  Search,
  X,
  ChevronRight,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn, UserPayload } from "@/lib/utils";
import { hasRole, ROLE_GROUPS } from "@/lib/rbac";

export type NavSubItem = {
  title: string;
  url?: string;
  icon?: React.ElementType;
  badge?: string | number;
  isUnderDevelopment?: boolean;
};

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  url?: string;
  badge?: string | number;
  items?: NavSubItem[];
  isUnderDevelopment?: boolean;
};

export type NavGroupData = {
  heading: string;
  items: NavItemData[];
};

// Route matching helpers
function isRouteActive(url: string, pathname: string) {
  if (url === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (url.includes("#")) {
    return pathname === url.split("#")[0];
  }
  return pathname === url || pathname.startsWith(url + "/");
}

function isSubItemActive(
  subUrl: string,
  pathname: string,
  allSubUrls: string[],
) {
  if (subUrl === pathname) return true;

  // If a more specific child route in this group matches exactly, don't claim it
  const hasMoreSpecificMatch = allSubUrls.some(
    (otherUrl) =>
      otherUrl !== subUrl &&
      otherUrl.length > subUrl.length &&
      (pathname === otherUrl || pathname.startsWith(otherUrl + "/")),
  );
  if (hasMoreSpecificMatch) return false;

  return pathname.startsWith(subUrl + "/");
}

// Admin Navigation Groups (Standar CMS Nasional PIKI: Manajemen Keanggotaan & CMS Manajemen Konten)
const adminNavGroups: NavGroupData[] = [
  {
    heading: "Overview",
    items: [
      {
        id: "dashboard",
        title: "Dashboard Satu Data",
        icon: LayoutDashboard,
        url: "/dashboard",
      },
    ],
  },
  {
    heading: "Manajemen",
    items: [
      {
        id: "manajemen-keanggotaan",
        title: "Manajemen Keanggotaan",
        icon: Users,
        items: [
          {
            title: "CMS Data Anggota",
            url: "/dashboard/anggota",
            icon: Users,
          },
          {
            title: "Verifikasi Pendaftar",
            url: "/dashboard/verifikasi",
            icon: UserCheck,
          },
        ],
      },
      {
        id: "manajemen-konten",
        title: "CMS Manajemen Konten",
        icon: FileText,
        items: [
          {
            title: "CMS Landing Page",
            url: "/dashboard/konten/landing",
            icon: Globe,
          },
          {
            title: "CMS Berita",
            url: "/dashboard/berita",
            icon: FileText,
          },
          {
            title: "CMS Program Kerja",
            icon: Calendar,
            isUnderDevelopment: true,
          },
          {
            title: "CMS Jurnal",
            icon: BookOpen,
            isUnderDevelopment: true,
          },
          {
            title: "CMS Galeri",
            icon: ImageIcon,
            isUnderDevelopment: true,
          },
          {
            title: "CMS Struktur Organisasi",
            icon: Network,
            isUnderDevelopment: true,
          },
          {
            title: "CMS Data Pengurus",
            icon: UserCog,
            isUnderDevelopment: true,
          },
        ],
      },
    ],
  },
];

// Member Navigation Groups (Portal Anggota)
const memberNavGroups: NavGroupData[] = [
  {
    heading: "Portal Anggota",
    items: [
      {
        id: "portal-dashboard",
        title: "Dashboard Pribadi",
        icon: LayoutDashboard,
        url: "/portal",
      },
      {
        id: "portal-kta",
        title: "KTA Digital Resmi",
        icon: CreditCard,
        url: "/portal#kta",
      },
      {
        id: "portal-pengaturan",
        title: "Pengaturan Profil",
        icon: Settings,
        url: "/portal/pengaturan",
      },
    ],
  },
];

// Component: Collapsible Menu Item with Nested Submenus
interface NavCollapsibleItemProps {
  item: NavItemData;
  pathname: string;
}

function NavCollapsibleItem({ item, pathname }: NavCollapsibleItemProps) {
  const allSubUrls = useMemo(
    () =>
      item.items
        ?.map((sub) => sub.url)
        .filter((url): url is string => Boolean(url)) || [],
    [item.items],
  );

  const isChildActive = useMemo(
    () =>
      item.items?.some(
        (sub) => sub.url && isSubItemActive(sub.url, pathname, allSubUrls),
      ) || false,
    [item.items, pathname, allSubUrls],
  );

  // Track manual user toggle. When child route changes, reset manual override to auto-expand.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const [prevChildActive, setPrevChildActive] = useState(isChildActive);

  if (prevChildActive !== isChildActive) {
    setPrevChildActive(isChildActive);
    setManualOpen(null);
  }

  const isOpen = manualOpen !== null ? manualOpen : isChildActive;
  const Icon = item.icon;

  const handleUnderDevClick = (title: string) => {
    toast.info(`Modul ${title} sedang dalam tahap pengembangan`, {
      description:
        "Fitur ini akan segera tersedia pada pembaruan sistem berikutnya.",
    });
  };

  return (
    <SidebarMenuItem>
      {/* Parent Menu Trigger */}
      <SidebarMenuButton
        type="button"
        tooltip={item.title}
        onClick={() => setManualOpen(!isOpen)}
        isActive={isChildActive && !isOpen}
        className={cn(
          "h-9 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all group/collapsible cursor-pointer select-none",
          isChildActive
            ? "text-primary font-semibold bg-primary/5"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              isChildActive ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {item.title}
          </span>
        </div>

        {item.badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground mr-1 group-data-[collapsible=icon]:hidden">
            {item.badge}
          </span>
        )}

        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
            isOpen && "rotate-90 text-foreground",
          )}
        />
      </SidebarMenuButton>

      {/* Submenu with CSS Grid Accordion Transition */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out group-data-[collapsible=icon]:hidden",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <SidebarMenuSub className="my-1 border-l border-border/70 ml-3.5 pl-2 space-y-0.5">
            {item.items?.map((subItem) => {
              const isSubActive = subItem.url
                ? isSubItemActive(subItem.url, pathname, allSubUrls)
                : false;
              const SubIcon = subItem.icon;
              const isUnderDev = subItem.isUnderDevelopment || !subItem.url;

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    render={
                      isUnderDev ? (
                        <button
                          type="button"
                          onClick={() => handleUnderDevClick(subItem.title)}
                        />
                      ) : (
                        <Link href={subItem.url!} />
                      )
                    }
                    isActive={isSubActive}
                    className={cn(
                      "min-h-8 h-auto py-1.5 px-2.5 text-xs rounded-md font-medium transition-all group/sub cursor-pointer",
                      "[&>span:last-child]:overflow-visible [&>span:last-child]:truncate-none [&>span:last-child]:whitespace-normal",
                      isSubActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {SubIcon && (
                      <SubIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors mt-0.5",
                          isSubActive
                            ? "text-primary"
                            : "text-muted-foreground/70 group-hover/sub:text-foreground",
                        )}
                      />
                    )}
                    <span className="whitespace-normal leading-snug break-words flex-1 text-left">
                      {subItem.title}
                    </span>
                    {subItem.badge && (
                      <span
                        className={cn(
                          "ml-auto shrink-0 text-[10px] font-semibold px-1.5 py-0.2 rounded-full",
                          isSubActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {subItem.badge}
                      </span>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </div>
      </div>
    </SidebarMenuItem>
  );
}

// Component: Standalone Single Item (No Submenus)
function NavSingleItem({
  item,
  pathname,
}: {
  item: NavItemData;
  pathname: string;
}) {
  const isUnderDev = item.isUnderDevelopment || !item.url;
  const isActive = item.url ? isRouteActive(item.url, pathname) : false;
  const Icon = item.icon;

  const handleUnderDevClick = () => {
    toast.info(`Modul ${item.title} sedang dalam tahap pengembangan`, {
      description:
        "Fitur ini akan segera tersedia pada pembaruan sistem berikutnya.",
    });
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          isUnderDev ? (
            <button type="button" onClick={handleUnderDevClick} />
          ) : (
            <Link href={item.url!} />
          )
        }
        tooltip={item.title}
        isActive={isActive}
        className={cn(
          "h-9 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer",
          isActive
            ? "bg-primary/10 text-primary font-semibold shadow-2xs"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Icon
            className={cn(
              "h-4 w-4 shrink-0",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {item.title}
          </span>
        </div>

        {item.badge && (
          <span
            className={cn(
              "ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full group-data-[collapsible=icon]:hidden",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {item.badge}
          </span>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ user }: { user?: UserPayload | null }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = hasRole(user, ROLE_GROUPS.ADMINS);
  const navGroups = isAdmin ? adminNavGroups : memberNavGroups;

  // Flattened searchable navigation list for Command Palette
  const allSearchableItems = useMemo(() => {
    const result: {
      id: string;
      title: string;
      url?: string;
      isUnderDevelopment?: boolean;
      icon: React.ElementType;
      group: string;
    }[] = [];

    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.items && item.items.length > 0) {
          item.items.forEach((sub) => {
            result.push({
              id: `${item.id}-${sub.title}`,
              title: `${item.title} › ${sub.title}`,
              url: sub.url,
              isUnderDevelopment: sub.isUnderDevelopment || !sub.url,
              icon: sub.icon || item.icon,
              group: group.heading,
            });
          });
        } else {
          result.push({
            id: item.id,
            title: item.title,
            url: item.url,
            isUnderDevelopment: item.isUnderDevelopment || !item.url,
            icon: item.icon,
            group: group.heading,
          });
        }
      });
    });

    return result;
  }, [navGroups]);

  // Filtered search results
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery.trim()) return allSearchableItems;
    const q = searchQuery.toLowerCase();
    return allSearchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q),
    );
  }, [allSearchableItems, searchQuery]);

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchQuery("");
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/80 bg-sidebar font-sans"
    >
      {/* 1. Header: Clean PIKI Branding */}
      <SidebarHeader className="h-14 flex items-center justify-between px-4 border-b border-border/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              PIKI NASIONAL
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              CMS & Satu Data PIKI
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* 2. Content: Quick Search Trigger + Grouped Collapsible Navigation */}
      <SidebarContent className="p-2 space-y-3">
        {/* Quick Search Trigger (⌘K) */}
        <div className="px-2 pt-2 group-data-[collapsible=icon]:hidden">
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 hover:text-foreground border border-border/60 rounded-lg transition-colors shadow-2xs cursor-pointer"
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
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 px-3 py-1 group-data-[collapsible=icon]:hidden">
              {group.heading}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (item.items && item.items.length > 0) {
                    return (
                      <NavCollapsibleItem
                        key={item.id}
                        item={item}
                        pathname={pathname}
                      />
                    );
                  }

                  return (
                    <NavSingleItem
                      key={item.id}
                      item={item}
                      pathname={pathname}
                    />
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* 3. Footer: Minimal System Info */}
      <SidebarFooter className="p-3 border-t border-border/60">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 group-data-[collapsible=icon]:hidden">
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
          <div
            className="absolute inset-0"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center px-3.5 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent py-3.5 outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="Ketikkan nama modul, menu, atau fitur..."
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsSearchOpen(false);
                }}
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 space-y-1 max-h-72 overflow-y-auto text-xs">
              <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {searchQuery.trim() ? "Hasil Pencarian" : "Menu Pintas"}
              </p>
              {filteredSearchItems.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Tidak ada menu yang sesuai dengan &ldquo;{searchQuery}&rdquo;.
                </p>
              ) : (
                filteredSearchItems.map((item) => {
                  const ItemIcon = item.icon;
                  const isUnderDev = item.isUnderDevelopment || !item.url;

                  if (isUnderDev) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          toast.info(
                            `Modul ${item.title} sedang dalam tahap pengembangan`,
                            {
                              description:
                                "Fitur ini akan segera tersedia pada pembaruan sistem berikutnya.",
                            },
                          );
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground font-medium group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ItemIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/70 font-normal ml-2 shrink-0">
                          {item.group}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.url!}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground font-medium group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ItemIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 font-normal ml-2 shrink-0">
                        {item.group}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
