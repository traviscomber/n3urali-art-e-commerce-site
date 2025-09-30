import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL is not set")
    console.error(
      "[v0] Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
    )
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!supabaseAnonKey) {
    console.error("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  }

  console.log("[v0] Creating Supabase client with URL:", supabaseUrl.substring(0, 30) + "...")

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createClientSafe() {
  try {
    return createClient()
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return null
  }
}
