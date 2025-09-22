import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient
  }

  console.log("[v0] Checking Supabase environment variables...")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  console.log("[v0] Supabase URL exists:", !!supabaseUrl)
  console.log("[v0] Supabase Anon Key exists:", !!supabaseAnonKey)

  if (!supabaseUrl) {
    console.error("[v0] Missing Supabase URL")
    throw new Error("Missing Supabase URL. Please check your environment variables.")
  }

  if (!supabaseAnonKey) {
    console.error("[v0] Missing Supabase Anon Key")
    throw new Error("Missing Supabase Anon Key. Please check your environment variables.")
  }

  console.log("[v0] Creating Supabase client...")
  supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)

  return supabaseClient
}
