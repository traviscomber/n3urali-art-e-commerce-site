import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedRoutes = ["/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const authToken = request.cookies.get("auth_token")?.value

    if (!authToken) {
      const redirectUrl = new URL("/", request.url)
      redirectUrl.searchParams.set("auth", "required")
      return NextResponse.redirect(redirectUrl)
    }

    try {
      const payload = verifyJWT(authToken)

      if (!payload) {
        const redirectUrl = new URL("/", request.url)
        redirectUrl.searchParams.set("auth", "required")
        return NextResponse.redirect(redirectUrl)
      }

      if (pathname.startsWith("/admin")) {
        if (!payload.isAdmin) {
          return NextResponse.redirect(new URL("/", request.url))
        }
      }
    } catch (error) {
      console.error("JWT validation error:", error)
      const redirectUrl = new URL("/", request.url)
      redirectUrl.searchParams.set("auth", "required")
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
