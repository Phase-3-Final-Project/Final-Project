import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("Authorization");
  const pathname = request.nextUrl.pathname;

  // Halaman yang memerlukan authentication
  const protectedPaths = ["/admin", "/wishlist"];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Jika mencoba akses halaman protected tanpa login, redirect ke login
  if (isProtectedPath && !authCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/wishlist"],
};
