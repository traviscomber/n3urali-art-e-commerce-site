import { createClient } from "@supabase/supabase-js"

// Type definitions for database tables
export type Image = {
  id: string
  title: string
  description: string
  category_id: string
  price: number
  original_url: string
  thumbnail_small_url: string
  thumbnail_medium_url: string
  thumbnail_large_url: string
  active: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_email: string
  total_amount: number
  payment_status: string
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  image_id: string
  license_type: string
  price: number
}

export type DownloadLog = {
  id: string
  order_item_id: string
  user_email: string
  ip_address: string
  user_agent: string
  created_at: string
}

// License type definitions
export const LICENSE_TYPES = {
  NON_EXCLUSIVE: {
    name: "Non-Exclusive",
    description: "Standard commercial license - image can be sold to multiple buyers",
    multiplier: 1,
    price: 29.99,
  },
  EXCLUSIVE: {
    name: "Exclusive",
    description: "Exclusive rights - you will be the only buyer of this image",
    multiplier: 2, // Exactly 100% more expensive (2x)
    price: 59.98,
  },
} as const

export type LicenseType = keyof typeof LICENSE_TYPES

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("[v0] Missing Supabase environment variables for server client")
    console.error("[v0] URL:", !!url, "Key:", !!key)
    throw new Error("Missing Supabase environment variables for server client")
  }

  return createClient(url, key)
}

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("[v0] Missing Supabase environment variables for admin client")
    console.error("[v0] URL:", !!url, "Key:", !!key)
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createClient(url, key)
}

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("[v0] Missing Supabase environment variables for browser client")
    console.error("[v0] URL:", !!url, "Key:", !!key)
    throw new Error("Missing Supabase environment variables for browser client")
  }

  return createClient(url, key)
}
