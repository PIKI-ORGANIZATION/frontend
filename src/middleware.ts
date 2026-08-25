import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isLogin = request.nextUrl.pathname === "/login";

  if (isDashboard && !token) {
    // Redirect ke login jika mencoba masuk dashboard tanpa token
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLogin && token) {
    // Redirect ke dashboard jika sudah login tapi mencoba ke halaman login
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
