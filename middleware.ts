import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public paths that don't require authentication
  const isPublicPath =
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/";

  // Protected paths
  const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/api/");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect non-logged-in users from protected paths
  if (!isLoggedIn && isProtectedPath && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
