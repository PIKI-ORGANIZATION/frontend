import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeToken } from "@/lib/utils";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isLogin = request.nextUrl.pathname === "/login";
  const isRoot = request.nextUrl.pathname === "/";

  if (isDashboard && !token) {
    // Redirect ke login jika mencoba masuk dashboard tanpa token
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let user = null;
  if (token) {
    user = decodeToken(token);
  }

  // Cek apakah user adalah admin (mendukung role lama & baru)
  const userRoles = user?.roles?.map((r: string) => r.toUpperCase()) || [];
  const isAdmin = ["SUPER_ADMIN", "ADMIN_DPP", "ADMIN_CABANG", "ADMIN_DPC", "KETUA_CABANG"].some(r => userRoles.includes(r));

  if ((isLogin || isRoot) && token && user) {
    // Redirect otomatis saat membuka /login atau / jika sudah punya token
    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/verifikasi", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/anggota", request.url));
    }
  }

  // --- Route Protection ---
  if (isDashboard && user) {
    const path = request.nextUrl.pathname;

    // Rute yang khusus Admin (bisa ditambah sesuai kebutuhan)
    const adminOnlyRoutes = ["/dashboard/verifikasi"]; 
    
    // Jika User/Member biasa mencoba akses halaman Admin
    const tryingToAccessAdminRoute = adminOnlyRoutes.some(route => path.startsWith(route));
    if (!isAdmin && tryingToAccessAdminRoute) {
      return NextResponse.redirect(new URL("/dashboard/anggota", request.url));
    }

    // Jika Admin mencoba buka /dashboard secara langsung (tanpa subpath)
    if (isAdmin && path === "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard/verifikasi", request.url));
    }
    
    // Jika User biasa mencoba buka /dashboard secara langsung
    if (!isAdmin && path === "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard/anggota", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
};
