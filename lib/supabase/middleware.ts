import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware - SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("[v0] Middleware - SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[v0] Middleware - Missing Supabase environment variables")
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const cookies = request.cookies.getAll()
    console.log("[v0] Middleware - Request cookies count:", cookies.length)
    console.log(
      "[v0] Middleware - Auth cookies:",
      cookies.filter((c) => c.name.includes("supabase")).map((c) => c.name),
    )

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    try {
      await supabase.auth.refreshSession()
    } catch (refreshError) {
      console.log("[v0] Middleware - Session refresh failed:", refreshError)
    }

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.log("[v0] Middleware - Error getting user:", userError)
    }

    console.log("[v0] Middleware - User authenticated:", !!user)
    console.log("[v0] Middleware - User ID:", user?.id)
    console.log("[v0] Middleware - Current path:", request.nextUrl.pathname)

    const publicPaths = [
      "/",
      "/browse",
      "/categories",
      "/photo",
      "/api/images", // Allow public API access for image data
    ]

    const protectedPaths = ["/admin", "/account", "/protected", "/simple-admin", "/admin-simple"]

    const isPublicPath = publicPaths.some(
      (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + "/"),
    )

    const isAuthPath = request.nextUrl.pathname.startsWith("/auth") || request.nextUrl.pathname.startsWith("/login")

    const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    console.log("[v0] Middleware - Is public path:", isPublicPath)
    console.log("[v0] Middleware - Is auth path:", isAuthPath)
    console.log("[v0] Middleware - Is protected path:", isProtectedPath)

    // Only redirect to login if:
    // 1. User is not authenticated AND
    // 2. Path is protected (admin/account) AND
    // 3. Path is not already auth-related
    if (!user && isProtectedPath && !isAuthPath) {
      console.log("[v0] Middleware - Redirecting to login")
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    console.log("[v0] Middleware - Allowing access to:", request.nextUrl.pathname)
  } catch (error) {
    console.error("[v0] Middleware - Supabase error:", error)
    // Continue with the request even if Supabase fails
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
