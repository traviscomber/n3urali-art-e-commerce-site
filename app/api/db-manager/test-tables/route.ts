import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase credentials",
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const requiredTables = [
      "categories",
      "licenses",
      "images",
      "user_profiles",
      "orders",
      "order_items",
      "downloads",
      "download_logs",
    ]

    const existingTables = []
    const missingTables = []

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1)

        if (error) {
          missingTables.push(table)
        } else {
          existingTables.push(table)
        }
      } catch {
        missingTables.push(table)
      }
    }

    const success = missingTables.length === 0

    return NextResponse.json({
      success,
      message: success ? "All required tables exist" : `Missing tables: ${missingTables.join(", ")}`,
      details: {
        existing: existingTables,
        missing: missingTables,
        total: requiredTables.length,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to check tables",
      details: String(error),
    })
  }
}
