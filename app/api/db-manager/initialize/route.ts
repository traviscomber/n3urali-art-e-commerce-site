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

    // Initialize database with comprehensive setup
    const initSteps = []

    // Step 1: Create categories
    try {
      const { error } = await supabase.from("categories").upsert([
        { name: "360-panoramic", description: "Full 360-degree panoramic images" },
        { name: "fisheye", description: "Fisheye lens photography" },
        { name: "architectural", description: "Architectural and interior spaces" },
      ])

      initSteps.push({
        step: "Create categories",
        success: !error,
        error: error?.message,
      })
    } catch (error) {
      initSteps.push({
        step: "Create categories",
        success: false,
        error: String(error),
      })
    }

    // Step 2: Create licenses
    try {
      const { error } = await supabase.from("licenses").upsert([
        {
          name: "Standard",
          description: "Personal and commercial use with attribution",
          price: 29.99,
        },
        {
          name: "Extended",
          description: "Commercial use without attribution required",
          price: 79.99,
        },
        {
          name: "Commercial",
          description: "Full commercial rights and resale permissions",
          price: 199.99,
        },
      ])

      initSteps.push({
        step: "Create licenses",
        success: !error,
        error: error?.message,
      })
    } catch (error) {
      initSteps.push({
        step: "Create licenses",
        success: false,
        error: String(error),
      })
    }

    const allSuccess = initSteps.every((step) => step.success)

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess ? "Database initialized successfully" : "Database initialization completed with some errors",
      steps: initSteps,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to initialize database",
      details: String(error),
    })
  }
}
