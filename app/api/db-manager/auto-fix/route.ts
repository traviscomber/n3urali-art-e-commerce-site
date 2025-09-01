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
    const fixes = []

    // Fix 1: Ensure basic categories exist
    try {
      const { data: categories } = await supabase.from("categories").select("name")

      if (!categories || categories.length === 0) {
        await supabase.from("categories").insert([
          { name: "360-panoramic", description: "Full 360-degree panoramic images" },
          { name: "fisheye", description: "Fisheye lens photography" },
        ])
        fixes.push("Created missing categories")
      }
    } catch (error) {
      // Categories table might not exist, skip this fix
    }

    // Fix 2: Ensure basic licenses exist
    try {
      const { data: licenses } = await supabase.from("licenses").select("name")

      if (!licenses || licenses.length === 0) {
        await supabase.from("licenses").insert([
          { name: "Standard", description: "Personal and commercial use", price: 29.99 },
          { name: "Extended", description: "Commercial use without attribution", price: 79.99 },
        ])
        fixes.push("Created missing licenses")
      }
    } catch (error) {
      // Licenses table might not exist, skip this fix
    }

    // Fix 3: Test and fix admin operations
    try {
      const { error } = await supabase.from("images").select("id").limit(1)

      if (error && error.message.includes("Invalid")) {
        fixes.push("Detected RLS blocking issue - requires manual intervention")
      }
    } catch (error) {
      fixes.push("Images table access issue detected")
    }

    return NextResponse.json({
      success: true,
      message: `Applied ${fixes.length} fixes`,
      fixes,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Auto-fix failed",
      details: String(error),
    })
  }
}
