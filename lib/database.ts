import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

// Type aliases for easier use
export type Image = Tables<"images">
export type Order = Tables<"orders">
export type OrderItem = Tables<"order_items">
export type DownloadLog = Tables<"download_logs">

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

// Helper function to get typed Supabase client
export async function getSupabaseClient() {
  return createClient()
}
