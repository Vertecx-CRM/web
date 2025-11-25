import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["auth/login", "auth/register", "auth/forgot"];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/roles",
  "/users",
  "/requests",
  "/services",
  "/technicians",
  "/customers",
  "/products",
  "/purchases",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token");

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (needsAuth && !token) {
    const url = new URL("auth/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/dashboard/:path*",
    "/roles/:path*",
    "/users/:path*",
    "/requests/:path*",
    "/services/:path*",
    "/technicians/:path*",
    "/customers/:path*",
    "/products/:path*",
    "/purchases/:path*",
  ],
};
