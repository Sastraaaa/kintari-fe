import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get("isAuthenticated");
  const { pathname } = request.nextUrl;

  // Redirect to login if not authenticated and trying to access protected routes
  if (!isAuthenticated && pathname !== "/login" && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to home if authenticated and trying to access login
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|Image).*)"],
};
