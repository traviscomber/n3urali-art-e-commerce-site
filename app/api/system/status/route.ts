import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    const checks = {
      database: false,
      licenses: false,
      orders: false,
      downloads: false,
      schema: false,
    }

    const errors: string[] = []

    // Test database connection
    try {
      const { data, error } = await supabase.from("licenses").select("count").limit(1)
      if (error) throw error
      checks.database = true
    } catch (error) {
      errors.push(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Test licenses table
    try {
      const { data: licenses, error } = await supabase.from("licenses").select("*")
      if (error) throw error

      const hasNonExclusive = licenses?.some((l) => l.name === "NON_EXCLUSIVE")
      const hasExclusive = licenses?.some((l) => l.name === "EXCLUSIVE")

      if (!hasNonExclusive || !hasExclusive) {
        errors.push("Missing required license types (NON_EXCLUSIVE or EXCLUSIVE)")
      } else {
        checks.licenses = true
      }
    } catch (error) {
      errors.push(`Licenses check failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Test orders table structure
    try {
      const { data, error } = await supabase.from("orders").select("id, user_email, status, total_amount").limit(1)
      if (error) throw error
      checks.orders = true
    } catch (error) {
      errors.push(`Orders table check failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Test downloads table structure
    try {
      const { data, error } = await supabase
        .from("downloads")
        .select("id, order_item_id, download_token, expires_at, download_count")
        .limit(1)
      if (error) throw error
      checks.downloads = true
    } catch (error) {
      errors.push(`Downloads table check failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Test order_items table structure
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, order_id, image_id, license_id, download_count, download_limit")
        .limit(1)
      if (error) throw error
      checks.schema = true
    } catch (error) {
      errors.push(`Order items schema check failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    const allChecksPass = Object.values(checks).every((check) => check === true)

    return NextResponse.json({
      success: allChecksPass,
      status: allChecksPass ? "healthy" : "unhealthy",
      checks,
      errors,
      timestamp: new Date().toISOString(),
      message: allChecksPass ? "All system checks passed successfully" : `${errors.length} system check(s) failed`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        error: error instanceof Error ? error.message : "System status check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
