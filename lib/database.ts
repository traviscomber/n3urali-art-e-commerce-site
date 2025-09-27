import { createClient } from "@/lib/supabase/server"

// Type definitions for database tables
export type Image = {
  id: string
  title: string
  description: string
  category_id: string
  price: number
  image_url: string
  thumbnail_url: string
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
    description: "Standard commercial license for personal and commercial use. Non-exclusive rights.",
    multiplier: 1,
  },
  EXCLUSIVE: {
    name: "Exclusive License",
    description: "Exclusive license with full rights including resale and NFT minting. Complete buyout.",
    multiplier: 7.5, // 750/99 ratio
  },
} as const

export type LicenseType = keyof typeof LICENSE_TYPES

export function getSupabaseClient() {
  return createClient()
}
