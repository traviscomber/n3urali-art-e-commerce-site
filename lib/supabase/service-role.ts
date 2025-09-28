import { createClient } from "@supabase/supabase-js"

/**
 * Service role client for admin operations that bypass RLS
 * Use only for server-side admin operations like file uploads
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL is not set for service role client")
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!supabaseServiceRoleKey) {
    console.error("[v0] SUPABASE_SERVICE_ROLE_KEY is not set for service role client")
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
  }

  console.log("[v0] Creating service role client with URL:", supabaseUrl.substring(0, 30) + "...")

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
