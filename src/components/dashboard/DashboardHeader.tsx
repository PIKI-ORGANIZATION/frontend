"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserPayload } from "@/lib/utils";

export function DashboardHeader({ user }: { user?: UserPayload | null }) {
  const getRoleInitial = () => {
    if (!user || !user.roles || user.roles.length === 0) return "U";
    return user.roles[0].charAt(0).toUpperCase();
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="mr-2 h-4 w-px bg-border" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle variant="dropdown" />
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[13px] text-muted-foreground leading-none">
                {user.roles?.[0]?.replace(/_/g, " ") || "User"}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[14px] shadow-sm uppercase">
              {getRoleInitial()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
