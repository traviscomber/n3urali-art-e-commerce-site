import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase credentials are not available, skip auth middleware
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Middleware - Supabase credentials not found")
    console.log("[v0] URL:", !!supabaseUrl, "Key:", !!supabaseAnonKey)
    return supabaseResponse
  }

  try {
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

    // Do not run code between createClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Middleware - User authenticated:", !!user)
  } catch (error) {
    console.error("[v0] Middleware - Error with Supabase client:", error)
    // Continue without auth if there's an error
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}
