import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null
let initPromise: Promise<SupabaseClient> | null = null

export function createClient() {
  // Return existing singleton if already created
  if (client) {
    return client
  }

  if (initPromise) {
    throw new Error("Supabase client is initializing. Please wait.")
  }

  initPromise = Promise.resolve().then(() => {
    // Create new client and store as singleton
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    initPromise = null
    return client
  })

  // Return the client immediately (it's synchronous)
  return client!
}

export function createClientSafe() {
  return createClient()
}
