import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
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
    const resetSteps = []

    // Step 1: Clear all data from tables (in correct order to avoid foreign key issues)
    const tablesToClear = [
      "download_logs",
      "downloads",
      "order_items",
      "orders",
      "images",
      "user_profiles",
      "licenses",
      "categories",
    ]

    for (const table of tablesToClear) {
      try {
        const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000")
        resetSteps.push({
          step: `Clear ${table}`,
          success: !error,
          error: error?.message,
        })
      } catch (error) {
        resetSteps.push({
          step: `Clear ${table}`,
          success: false,
          error: String(error),
        })
      }
    }

    // Step 2: Reinitialize with basic data
    try {
      // Create basic categories
      const { error: catError } = await supabase.from("categories").insert([
        { name: "360-panoramic", description: "Full 360-degree panoramic images" },
        { name: "fisheye", description: "Fisheye lens photography" },
        { name: "architectural", description: "Architectural and interior spaces" },
      ])

      resetSteps.push({
        step: "Recreate categories",
        success: !catError,
        error: catError?.message,
      })

      // Create basic licenses
      const { error: licError } = await supabase.from("licenses").insert([
        { name: "Standard", description: "Personal and commercial use with attribution", price: 29.99 },
        { name: "Extended", description: "Commercial use without attribution required", price: 79.99 },
        { name: "Commercial", description: "Full commercial rights and resale permissions", price: 199.99 },
      ])

      resetSteps.push({
        step: "Recreate licenses",
        success: !licError,
        error: licError?.message,
      })
    } catch (error) {
      resetSteps.push({
        step: "Reinitialize data",
        success: false,
        error: String(error),
      })
    }

    const allSuccess = resetSteps.every((step) => step.success)

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess ? "Database reset successfully" : "Database reset completed with some errors",
      steps: resetSteps,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to reset database",
      details: String(error),
    })
  }
}
