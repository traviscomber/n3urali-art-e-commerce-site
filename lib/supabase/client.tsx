import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

declare global {
  interface Window {
    __supabaseClient?: SupabaseClient
    __supabaseClientInitializing?: boolean
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

  // If another call is initializing, wait and return existing client
  if (window.__supabaseClientInitializing) {
    // Busy wait for initialization to complete (happens very quickly)
    let attempts = 0
    while (!window.__supabaseClient && attempts < 100) {
      attempts++
      // Synchronous wait to prevent race condition
      const start = Date.now()
      while (Date.now() - start < 10) {
        // 10ms wait
      }
    }
    
    if (window.__supabaseClient) {
      return window.__supabaseClient
    }
  }

  // Set lock to prevent concurrent initialization
  window.__supabaseClientInitializing = true

  // Create new client and store on window as singleton
  window.__supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Release lock
  window.__supabaseClientInitializing = false

  return window.__supabaseClient
}

export function createClientSafe() {
  return createClient()
}
