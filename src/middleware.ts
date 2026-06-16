import { auth } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import { getDashboardForRole, PROTECTED_ROUTES } from "@/src/lib/roles";
import type { Role } from "@/src/types/prisma";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/forgot-password");
  const isPublic = pathname === "/" || isAuthPage;

  // Not authenticated or session has no user
  if (!session?.user?.role) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user.role as Role;

  // Authenticated user hitting auth pages → redirect to their dashboard
  if (isAuthPage) {
    return NextResponse.redirect(new URL(getDashboardForRole(role), req.url));
  }

  // Root → redirect to role dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL(getDashboardForRole(role), req.url));
  }

  // Check route access
  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(role)) {
        // Wrong role — redirect to own dashboard
        return NextResponse.redirect(new URL(getDashboardForRole(role), req.url));
      }
      break;
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};