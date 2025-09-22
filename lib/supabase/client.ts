import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error("Missing Supabase URL. Please check your environment variables.")
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing Supabase Anon Key. Please check your environment variables.")
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
