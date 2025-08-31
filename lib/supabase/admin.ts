import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  console.log("[v0] Admin client - Supabase URL:", supabaseUrl ? "✓ Available" : "✗ Missing")
  console.log("[v0] Admin client - Service Role Key:", supabaseServiceKey ? "✓ Available" : "✗ Missing")
  console.log("[v0] Admin client - Service Role Key length:", supabaseServiceKey?.length || 0)

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[v0] Admin client - Missing required environment variables")
    throw new Error("Missing required Supabase environment variables")
  }

  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log("[v0] Admin client created successfully")
  return client
}
