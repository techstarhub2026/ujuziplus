/**
 * Route protection middleware.
 * Unauthenticated users are redirected to /auth/login.
 * Authenticated users with wrong role are redirected to /dashboard.
 */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "ADMIN" && role !== "MODERATOR") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (path.startsWith("/moderator") && role !== "MODERATOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (path.startsWith("/instructor") && role !== "INSTRUCTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Org portal: any authenticated user — pages verify OrganizationMember

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token && token.isActive !== false,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/instructor/:path*",
    "/admin/:path*",
    "/moderator/:path*",
    "/org/:path*",
  ],
};
