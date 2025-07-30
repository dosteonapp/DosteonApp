import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  //   const cookieAvailable = request.cookies.get("sid");

  //   const authRoutes = ["/auth/signin", "/auth/signup"];

  //   if (authRoutes.includes(request.nextUrl.pathname) && cookieAvailable) {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }

  //   if (!cookieAvailable && !authRoutes.includes(request.nextUrl.pathname)) {
  //     const redirectUrl = encodeURIComponent(
  //       request.nextUrl.pathname + request.nextUrl.search
  //     );
  //     return NextResponse.redirect(
  //       new URL(`/auth/signin?redirect=${redirectUrl}`, request.url)
  //     );
  //   }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/auth/forgot-password",
    "/auth/reset-password/:selector/:token",
  ],
};

// D4227225;
