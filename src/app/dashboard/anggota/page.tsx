import { cookies } from "next/headers";
import { decodeToken } from "@/lib/utils";
import { hasRole, ROLE_GROUPS } from "@/lib/rbac";
import { AnggotaDashboardView } from "./components/AnggotaDashboardView";
import { DaftarAnggotaView } from "./components/DaftarAnggotaView";

export default async function AnggotaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? decodeToken(token) : null;
  const isAdmin = hasRole(user, ROLE_GROUPS.ADMINS);

  if (isAdmin) {
    return <DaftarAnggotaView />;
  }

  return <AnggotaDashboardView />;
}
