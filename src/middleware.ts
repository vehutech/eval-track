import NextAuth from "next-auth";
import { authConfig } from "@/src/lib/auth.config";
import { NextResponse } from "next/server";
import { getDashboardForRole, PROTECTED_ROUTES } from "@/src/lib/roles";
import type { Role } from "@/src/types/prisma";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/forgot-password");
  const isPublic = pathname === "/" || isAuthPage;

  if (!session?.user?.role) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user.role as Role;

  if (isAuthPage) {
    return NextResponse.redirect(new URL(getDashboardForRole(role), req.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(getDashboardForRole(role), req.url));
  }

  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(role)) {
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
