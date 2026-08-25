"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserCheck,
  CreditCard,
  FileText,
  Image as ImageIcon,
  ShieldAlert,
  Command,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Cookies from "js-cookie";

// --- Types ---
export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  url?: string; // If empty, it means placeholder/not developed
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

// --- Mock Data ---
const mockNavGroups: NavGroupData[] = [
  {
    items: [
      { id: "search", title: "Search", icon: Search, shortcut: "⌘K" },
      {
        id: "/dashboard",
        title: "Home",
        icon: LayoutDashboard,
        url: "/dashboard",
      },
    ],
  },
  {
    heading: "Keanggotaan",
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
      { id: "kta-digital", title: "Cetak KTA Digital", icon: CreditCard }, // Placeholder
    ],
  },
  {
    heading: "Keuangan",
    items: [
      { id: "pembayaran", title: "Pembayaran & Iuran", icon: CreditCard }, // Placeholder
    ],
  },
  {
    heading: "Konten & Publikasi",
    items: [
      {
        id: "/dashboard/artikel",
        title: "Artikel & Berita",
        icon: FileText,
        url: "/dashboard/artikel",
      },
      { id: "galeri", title: "Galeri & Media", icon: ImageIcon }, // Placeholder
    ],
  },
];

const mockBottomItems: NavItemData[] = [
  {
    id: "/dashboard/pengaturan",
    title: "Pengaturan",
    icon: Settings,
    url: "/dashboard/pengaturan",
  },
  { id: "hak-akses", title: "Hak Akses", icon: ShieldAlert }, // Placeholder
  { id: "/login", title: "Log out", icon: LogOut, url: "/login" },
];

// --- Subcomponents ---

function WorkspaceSwitcher({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect?: (ws: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState("PIKI Pusat (DPP)");

  const current = selected || internalSelected;
  const handleSelect = onSelect || setInternalSelected;

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-2 mb-4 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-primary text-primary-foreground flex items-center justify-center font-bold text-[14px] shadow-sm">
            PK
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-medium leading-none mb-1 text-foreground truncate max-w-[140px]">
              {current}
            </span>
            <span className="text-[11px] text-muted-foreground leading-none">
              Superadmin
            </span>
          </div>
        </div>
        <ChevronDown
          className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground/70 transition-colors shrink-0"
          strokeWidth={1.5}
        />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-[52px] left-0 w-full bg-card border border-border/50 rounded-lg shadow-xl z-50 py-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            {["PIKI Pusat (DPP)", "PIKI DPD DKI Jakarta"].map((ws) => (
              <div
                key={ws}
                onClick={() => {
                  handleSelect(ws);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 mx-1 text-[13px] rounded-md cursor-pointer transition-colors ${
                  current === ws
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {ws}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NavItem({
  item,
  activeId,
  onSelect,
  level = 0,
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (id: string, url?: string) => void;
  level?: number;
}) {
  const isActive = activeId === item.id;
  const hasChildren = !!item.children;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.id, item.url);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={`group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-200 select-none
          ${
            isActive
              ? "bg-black/5 dark:bg-white/10 text-foreground font-medium"
              : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground/90"
          }
        `}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon
            className={`w-[16px] h-[16px] transition-colors
              ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground/70 group-hover:text-foreground/70"
              }
            `}
            strokeWidth={1.5}
          />
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.shortcut && (
            <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-muted-foreground/60 bg-background/50 border border-border/50 rounded-[4px] shadow-xs">
              {item.shortcut}
            </kbd>
          )}
          {item.badge && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={`w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div
              className="absolute top-0 bottom-0 border-l border-black/5 dark:border-white/5"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                activeId={activeId}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Sidebar Component ---

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeId = pathname || "/dashboard";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Handle Cmd+K for search
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

  const handleSelect = (id: string, url?: string) => {
    if (id === "search") {
      setIsSearchOpen(true);
      return;
    }

    if (url) {
      if (url === "/login") {
        setShowLogoutDialog(true);
        return;
      }
      router.push(url);
    } else {
      // Placeholder item clicked
      toast.info("Halaman sedang dalam pengembangan (Fase Berikutnya)");
    }
  };

  return (
    <Sidebar className="w-65 border-r border-border/50 bg-">
      <SidebarHeader className="p-3 border-b border-border/50">
        <WorkspaceSwitcher />
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full bg-card/50 font-sans p-3">
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-2">
          {mockNavGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              {group.heading && (
                <span className="px-2.5 mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/50 uppercase">
                  {group.heading}
                </span>
              )}
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  activeId={activeId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-0.5">
          {mockBottomItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              activeId={activeId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </SidebarContent>

      {/* Search Command Palette Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/40 backdrop-blur-sm px-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 border-b border-border/50">
              <Search
                className="w-[18px] h-[18px] text-muted-foreground/70 mr-3 shrink-0"
                strokeWidth={1.5}
              />
              <input
                autoFocus
                className="flex-1 bg-transparent py-4 outline-none text-[14px] text-foreground placeholder:text-muted-foreground/50"
                placeholder="Cari menu, anggota, atau fitur..."
              />
              <kbd
                onClick={() => setIsSearchOpen(false)}
                className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 ml-2 text-[10px] font-medium font-mono text-muted-foreground/70 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-[4px] cursor-pointer hover:text-foreground hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              >
                ESC
              </kbd>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="ml-3 p-1 rounded-md text-muted-foreground/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-2 py-8 flex flex-col items-center justify-center">
              <Command
                className="w-6 h-6 text-muted-foreground/30 mb-2"
                strokeWidth={1.5}
              />
              <p className="text-[13px] text-muted-foreground font-medium">
                Ketikkan kata kunci untuk mencari...
              </p>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari sesi saat ini?"
        confirmText="Keluar"
        variant="destructive"
        onConfirm={() => {
          Cookies.remove("token");
          toast.success("Berhasil Log Out");
          router.push("/login");
        }}
      />
    </Sidebar>
  );
}
