import { createBrowserClient, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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
    name: "Non-Exclusive License",
    description: "Standard commercial license - image can be sold to multiple buyers",
    multiplier: 1,
  },
  EXCLUSIVE: {
    name: "Exclusive License",
    description: "Exclusive rights - you will be the only buyer of this image",
    multiplier: 6.67, // 199.99/29.99 ratio
  },
} as const

export type LicenseType = keyof typeof LICENSE_TYPES

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
