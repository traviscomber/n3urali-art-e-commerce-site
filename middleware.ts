import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedRoutes = ["/simple-admin", "/admin", "/account"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      const redirectUrl = new URL("/", request.url)
      redirectUrl.searchParams.set("auth", "required")
      return NextResponse.redirect(redirectUrl)
    }

    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
        headers: {
          Cookie: `session_token=${sessionToken}`,
        },
      })

      const data = await response.json()

      if (!data.user) {
        const redirectUrl = new URL("/", request.url)
        redirectUrl.searchParams.set("auth", "required")
        return NextResponse.redirect(redirectUrl)
      }

      if (pathname.startsWith("/simple-admin") || pathname.startsWith("/admin")) {
        if (!data.user.user_metadata?.is_admin) {
          return NextResponse.redirect(new URL("/", request.url))
        }
      }
    } catch (error) {
      console.error("Session validation error:", error)
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
