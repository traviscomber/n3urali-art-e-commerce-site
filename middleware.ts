import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Run middleware in Node.js runtime to support Supabase libraries
export const runtime = "nodejs"

// Development-only paths that should be hidden in production
const DEV_ONLY_PATHS = [
  "/debug-images",
  "/setup-cors",
  "/setup-backblaze-cors",
  "/admin-simple",
  "/simple-admin",
  "/test-image-access",
  "/test-payment-flow",
  "/fix-cors",
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Hide development paths in production
  if (process.env.NODE_ENV === "production") {
    if (DEV_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/", request.url), { status: 307 })
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
