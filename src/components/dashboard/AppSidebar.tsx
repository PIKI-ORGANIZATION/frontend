"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  Globe,
  FileText,
  Calendar,
  BookOpen,
  Image as ImageIcon,
  Network,
  UserCog,
  Search,
  ChevronRight,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
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
import { LottiePlayer } from "@/components/ui/lottie-player";
import ModalSearchMenu from "./ModalSearcMenu";

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
            title: "Daftar Anggota",
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
        title: "Manajemen Konten",
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
            title: "CMS Data Pengurus",
            url: "/dashboard/pengurus",
            icon: UserCog,
          },
          {
            title: "CMS Galeri",
            url: "/dashboard/galeri",
            icon: ImageIcon,
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
            title: "CMS Struktur Organisasi",
            icon: Network,
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
          "h-9 px-3 rounded-lg text-xs sm:text-sm font-normal transition-all group/collapsible cursor-pointer select-none",
          isChildActive
            ? "text-primary font-medium bg-primary/5"
            : "text-zinc-800 dark:text-zinc-200 hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              isChildActive
                ? "text-primary"
                : "text-zinc-600 dark:text-zinc-400",
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
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
            isOpen
              ? "rotate-90 text-foreground"
              : "text-zinc-500 dark:text-zinc-400",
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
                      "min-h-8 h-auto py-1.5 px-2.5 text-xs rounded-md font-normal transition-all group/sub cursor-pointer",
                      "[&>span:last-child]:overflow-visible [&>span:last-child]:truncate-none [&>span:last-child]:whitespace-normal",
                      isSubActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-zinc-800 dark:text-zinc-200 hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {SubIcon && (
                      <SubIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors mt-0.5",
                          isSubActive
                            ? "text-primary"
                            : "text-zinc-600 dark:text-zinc-400 group-hover/sub:text-foreground",
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
          "h-9 px-3 rounded-lg text-xs sm:text-sm font-normal transition-all cursor-pointer",
          isActive
            ? "bg-primary/10 text-primary font-medium shadow-2xs"
            : "text-zinc-800 dark:text-zinc-200 hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Icon
            className={cn(
              "h-4 w-4 shrink-0",
              isActive ? "text-primary" : "text-zinc-600 dark:text-zinc-400",
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
    <Sidebar collapsible="icon" className="font-sans">
      {/* 1. Header: Clean PIKI Branding with Lottie Welcome Animation */}
      <SidebarHeader className="h-16 py-4">
        <Link
          href="/dashboard"
          className="flex  justify-center w-full overflow-hidden"
          title="Beranda Dashboard PIKI"
        >
          <div className="h-9 w-35  ">
            <LottiePlayer
              animationPath="/footage/lottie/welcome.json"
              loop={true}
              autoplay={true}
              className="w-full h-full object-contain"
            />
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
            className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 hover:text-foreground border border-border/60 rounded-sm transition-colors shadow-2xs cursor-pointer"
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
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-3 py-1 group-data-[collapsible=icon]:hidden">
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

      <SidebarRail />

      {/* Search Command Palette Overlay */}
      {isSearchOpen && (
        <ModalSearchMenu
          setIsSearchOpen={setIsSearchOpen}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
          filteredSearchItems={filteredSearchItems}
        />
      )}
    </Sidebar>
  );
}
