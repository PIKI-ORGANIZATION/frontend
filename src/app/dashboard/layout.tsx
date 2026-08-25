import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { decodeToken } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? decodeToken(token) : null;

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <div className="flex flex-col w-full min-h-screen">
        <DashboardHeader user={user} />
        <main className="flex-1 p-6 overflow-auto bg-muted/20">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
