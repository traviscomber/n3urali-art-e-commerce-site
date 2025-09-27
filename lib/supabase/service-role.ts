import { createClient } from "@supabase/supabase-js"

/**
 * Service role client for admin operations that bypass RLS
 * Use only for server-side admin operations like file uploads
 */
export function createServiceRoleClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
