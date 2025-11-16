import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

declare global {
  interface Window {
    __supabaseClient?: SupabaseClient
  }
}

export function createClient() {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("createClient can only be called in browser environment")
  }

  // Return existing singleton from window if already created
  if (window.__supabaseClient) {
    return window.__supabaseClient
  }

  // Create new client and store on window as singleton
  window.__supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return window.__supabaseClient
}

export function createClientSafe() {
  return createClient()
}
