import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Type definitions for database tables
export interface Image {
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

export interface Order {
  id: string
  user_email: string
  total_amount: number
  payment_status: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  image_id: string
  license_type: string
  price: number
  created_at: string
}

export interface DownloadLog {
  id: string
  order_item_id: string
  user_email: string
  ip_address: string
  user_agent: string
  created_at: string
}

// License type definitions
export const LICENSE_TYPES = {
  standard: {
    name: "Standard License",
    description: "Personal and commercial use, single project",
    multiplier: 1,
  },
  extended: {
    name: "Extended License",
    description: "Multiple projects, resale rights",
    multiplier: 2,
  },
  commercial: {
    name: "Commercial License",
    description: "Unlimited commercial use",
    multiplier: 3,
  },
} as const

export type LicenseType = keyof typeof LICENSE_TYPES

// Helper function to get Neon SQL client
export function getNeonClient() {
  return sql
}
