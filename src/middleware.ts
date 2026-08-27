import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeToken } from "@/lib/utils";
import { hasRole, ROLE_GROUPS } from "@/lib/rbac";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isPortal = request.nextUrl.pathname.startsWith("/portal");
  const isLogin = request.nextUrl.pathname === "/login";
  const isRoot = request.nextUrl.pathname === "/";

  // Jika mencoba masuk ke area terproteksi tanpa token
  if ((isDashboard || isPortal) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let user = null;
  if (token) {
    user = decodeToken(token);
  }

  const isAdmin = hasRole(user, ROLE_GROUPS.ADMINS);

  // Jika sudah login dan membuka halaman auth/root
  if ((isLogin || isRoot) && token && user) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/verifikasi", request.url));
    } else {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // --- Route Protection & Isolation ---
  if (token && user) {
    // 1. Block Members from Dashboard (Admin Area)
    if (isDashboard && !isAdmin) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }

    // 2. Block Admins from Portal (Member Area) (Opsional, tapi praktik yang baik)
    if (isPortal && isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/verifikasi", request.url));
    }

    // 3. Admin Root Dashboard Redirect
    if (isAdmin && request.nextUrl.pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard/verifikasi", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/login", "/"],
};
