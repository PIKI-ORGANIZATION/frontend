"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  User,
  LogOut,
  Users,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserPayload } from "@/lib/utils";

interface DashboardHeaderProps {
  user?: UserPayload | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const getRoleDisplay = () => {
    if (!user || !user.roles || user.roles.length === 0) return "Administrator";
    return user.roles[0].replace(/_/g, " ");
  };

  const getInitials = () => {
    if (!user) return "AD";
    if (user.roles?.[0]) return user.roles[0].slice(0, 2).toUpperCase();
    return "PK";
  };

  const handleLogout = () => {
    Cookies.remove("token");
    toast.success("Anda berhasil keluar dari sistem");
    router.push("/login");
  };

  // Dynamic breadcrumb generation matching satnaing/shadcn-admin
  const getBreadcrumbs = () => {
    if (pathname === "/dashboard") {
      return (
        <>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">
              Satu Data PIKI
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    if (pathname.startsWith("/dashboard/anggota")) {
      return (
        <>
          <BreadcrumbItem className="hidden sm:block">
            <span className="text-muted-foreground">Manajemen</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">
              Daftar Anggota
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    if (pathname.startsWith("/dashboard/verifikasi")) {
      return (
        <>
          <BreadcrumbItem className="hidden sm:block">
            <span className="text-muted-foreground">Manajemen</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">
              Verifikasi Pendaftar
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    if (pathname.startsWith("/dashboard/konten/landing")) {
      return (
        <>
          <BreadcrumbItem className="hidden sm:block">
            <span className="text-muted-foreground">Konten</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">
              CMS Landing Page
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    if (pathname.startsWith("/dashboard/berita")) {
      const isNew = pathname.includes("/baru");
      return (
        <>
          <BreadcrumbItem className="hidden sm:block">
            <span className="text-muted-foreground">Publikasi</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">
              {isNew ? "Tulis Berita Baru" : "Kelola Berita"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    if (pathname.includes("pengaturan")) {
      return (
        <>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">
              Pengaturan Profil
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    return (
      <BreadcrumbItem>
        <BreadcrumbPage className="font-semibold text-foreground capitalize">
          {pathname.split("/").filter(Boolean).pop() || "Overview"}
        </BreadcrumbPage>
      </BreadcrumbItem>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur-md px-4 transition-all">
        {/* Left: Sidebar trigger & Dynamic Breadcrumb */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground hover:text-foreground" />
          <div className="h-4 w-px bg-border/80 hidden sm:block" />
          <Breadcrumb className="text-xs sm:text-sm">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              {getBreadcrumbs()}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right: Theme Toggle & User Profile Nav */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle variant="dropdown" />

          {/* User Nav Dropdown (shadcn-admin pattern) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ring-1 ring-border/80 hover:ring-primary/50 transition-all p-0"
                />
              }
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg">
              <DropdownMenuLabel className="p-2 font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-bold leading-none text-foreground capitalize">
                    {getRoleDisplay().toLowerCase()}
                  </p>
                  <p className="text-[11px] leading-none text-muted-foreground font-mono truncate">
                    {user?.email || user?.username || "admin@piki.or.id"}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer text-xs font-medium py-1.5"
              >
                <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                <span>Dashboard Satu Data</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/dashboard/anggota")}
                className="cursor-pointer text-xs font-medium py-1.5"
              >
                <Users className="mr-2 h-4 w-4 text-blue-500" />
                <span>Daftar Anggota</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/dashboard/verifikasi")}
                className="cursor-pointer text-xs font-medium py-1.5"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                <span>Verifikasi Pendaftar</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/portal/pengaturan")}
                className="cursor-pointer text-xs font-medium py-1.5"
              >
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Pengaturan Akun</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setShowLogoutDialog(true)}
                variant="destructive"
                className="cursor-pointer text-xs font-medium py-1.5 text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar (Log out)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari sistem CMS PIKI? Sesi login Anda akan diakhiri."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </>
  );
}
