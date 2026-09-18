import { NextRequest, NextResponse } from "next/server";
import { isSessionTokenValid, SESSION_COOKIE } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await isSessionTokenValid(token)) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("error", "session");
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*"] };
