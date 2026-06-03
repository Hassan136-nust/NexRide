import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🚀 1. Skip Next.js internals + static files FIRST (MOST IMPORTANT FIX)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/.well-known") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // 🚀 2. Public routes
  const PUBLIC_ROUTES = ["/"]
  const PUBLIC_APIS = ["/api/auth"]

  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_APIS.some((api) => pathname.startsWith(api))
  ) {
    return NextResponse.next()
  }

  // 🚀 3. Auth check
  const session = await auth()

  if (!session?.user) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  const role = session.user.role

  // 🚀 4. ADMIN ONLY
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // 🚀 5. PARTNER ONLY (allow onboarding)
  if (
    pathname.startsWith("/partner") &&
    !pathname.startsWith("/partner/onboarding") &&
    role !== "partner"
  ) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // 🚀 6. API protection
  if (pathname.startsWith("/api") && !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.next()
}

// ✅ IMPORTANT: matcher must NOT include static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}