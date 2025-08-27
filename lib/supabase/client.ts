import { createBrowserClient } from "@supabase/ssr"

export { createBrowserClient }

export function createClient() {
  if (typeof window === "undefined") {
    console.log("[v0] Skipping Supabase client creation during build time")
    return null
  }

  // Additional check for build environment
  if (process.env.NODE_ENV === undefined) {
    console.log("[v0] Skipping Supabase client creation - no NODE_ENV")
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Supabase URL available:", !!supabaseUrl)
  console.log("[v0] Supabase Anon Key available:", !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase environment variables not found. Authentication features will be disabled.")
    console.warn("[v0] Expected NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return null
  }

  try {
    if (!supabaseUrl.startsWith("http")) {
      console.error("[v0] Invalid Supabase URL format")
      return null
    }

    const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("[v0] Supabase client created successfully")
    return client
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return null
  }
}
