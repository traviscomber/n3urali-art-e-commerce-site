import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  })

  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    return supabaseResponse
  }

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/account"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname.startsWith("/admin") && user) {
    try {
      let isAdmin = false

      if (user.email === "travis@nuanu.com") {
        isAdmin = true
      } else {
        try {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
          if (profile?.role === "admin") {
            isAdmin = true
          }
        } catch (error) {
          // Profiles table not found, try user_profiles
        }

        if (!isAdmin) {
          try {
            const { data: userProfile } = await supabase
              .from("user_profiles")
              .select("is_admin")
              .eq("email", user.email)
              .single()
            if (userProfile?.is_admin) {
              isAdmin = true
            }
          } catch (error) {
            // User profiles table not found
          }
        }
      }

      if (!isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    } catch (error) {
      if (user.email !== "travis@nuanu.com") {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
