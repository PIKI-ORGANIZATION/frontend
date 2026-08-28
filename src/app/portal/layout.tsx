"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { LogOut, Home } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { ThemeToggle } from "@/components/theme-toggle";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "KTA Digital", link: "/portal" },
    { name: "Profil Saya", link: "/portal/pengaturan" },
  ];

  const handleLogout = () => {
    Cookies.remove("token");
    toast.success("Berhasil Log Out");
    router.push("/login");
  };

  const handleNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <div className="flex items-center gap-2 relative z-50">
            <Image
              src="/logo1.png"
              width={25}
              height={25}
              alt="Logo PIKI"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <NavItems
            items={navItems}
            onItemClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="flex items-center gap-4 relative z-50">
            <ThemeToggle variant="dropdown" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors py-4"
            >
              <Home className="w-4 h-4 mr-2" />
              Beranda
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogoutDialog(true)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors py-4"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <div className="flex items-center gap-2">
              <Image
                src="/logo1.png"
                width={25}
                height={25}
                alt="Logo PIKI"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle variant="dropdown" />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex flex-col gap-2 w-full">
              {navItems.map((item, idx) => {
                const isActive = pathname === item.link;
                return (
                  <a
                    key={`mobile-link-${idx}`}
                    href={item.link}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.link);
                    }}
                    className={`relative text-neutral-600 dark:text-neutral-300 w-full text-left py-2 px-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="block text-lg font-medium">
                      {item.name}
                    </span>
                  </a>
                );
              })}
            </div>
            <div className="w-full h-px bg-border my-2" />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/");
                }}
                className="flex flex-1 items-center justify-center gap-2 text-muted-foreground py-2 px-3 rounded-md transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Home className="w-5 h-5" />
                <span className="text-lg font-medium">Beranda</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLogoutDialog(true);
                }}
                className="flex flex-1 items-center justify-center gap-2 text-muted-foreground py-2 px-3 rounded-md transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-lg font-medium">Keluar</span>
              </button>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 pt-32 pb-6 md:pb-20">
        {children}
      </main>

      <MinimalFooter />

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari portal anggota?"
        confirmText="Keluar"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </div>
  );
}
