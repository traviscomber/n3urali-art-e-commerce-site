import { createBrowserClient } from "@supabase/ssr"

export { createBrowserClient }

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
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
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("[v0] Supabase client created successfully")
    return supabaseClient
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return null
  }
}
