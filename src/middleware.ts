import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeToken } from "@/lib/utils";
import { canAccessDashboardPath, hasRole, ROLE_GROUPS } from "@/lib/rbac";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.startsWith("/dashboard");
  const isPortal = pathname.startsWith("/portal");
  const isLogin = pathname === "/login";

  // Jika mencoba masuk ke area terproteksi tanpa token
  if ((isDashboard || isPortal) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let user = null;
  if (token) {
    user = decodeToken(token);

    // Deny-by-default: token rusak / gagal didekode dianggap tidak valid
    if (!user) {
      if (isDashboard || isPortal) {
        const response = NextResponse.redirect(
          new URL("/login?expired=true", request.url),
        );
        response.cookies.delete("token");
        return response;
      }
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }

    // Cek apakah token sudah expired berdasarkan claim exp JWT (exp dalam detik)
    if (user.exp && Date.now() >= user.exp * 1000) {
      if (isDashboard || isPortal) {
        const response = NextResponse.redirect(
          new URL("/login?expired=true", request.url),
        );
        response.cookies.delete("token");
        return response;
      }
      // Di halaman auth/publik, bersihkan cookie yang sudah basi
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }
  }

  const isAdmin = hasRole(user, ROLE_GROUPS.ADMINS);
  const isMember = hasRole(user, ROLE_GROUPS.USERS);

  // Jika sudah login dan membuka halaman auth
  if (isLogin && token && user) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // --- Route Protection, Isolation & Centralized Deny-by-Default RBAC ---
  if (token && user) {
    // 1. Block Members without Admin role from Dashboard (Admin Area)
    if (isDashboard && !isAdmin) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }

    // 2. Block pure Admins (tanpa role USER/MEMBER) dari Portal;
    //    Akun dual-role (USER + ADMIN_CABANG/KETUA_CABANG) tetap boleh mengakses /portal.
    if (isPortal && isAdmin && !isMember) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 3. Enforce Centralized Deny-by-Default Permission Policy on /dashboard/*
    if (isDashboard && isAdmin && pathname !== "/dashboard") {
      if (!canAccessDashboardPath(pathname, user)) {
        const deniedUrl = new URL("/dashboard", request.url);
        deniedUrl.searchParams.set("denied", "1");
        deniedUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(deniedUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/login", "/"],
};
