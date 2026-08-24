"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Users, Settings, FileText } from "lucide-react";
import Image from "next/image";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Daftar Anggota", url: "/dashboard/anggota", icon: Users },
  { title: "Artikel & Berita", url: "/dashboard/artikel", icon: FileText },
  { title: "Pengaturan", url: "/dashboard/pengaturan", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="py-4 border-b">
        <div className="flex items-center gap-2 px-2">
          <Image src="/logo1.png" width={32} height={32} alt="Logo" />
          <span className="font-bold">PIKI CMS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<a href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
