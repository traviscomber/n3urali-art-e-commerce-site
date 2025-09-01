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
        details: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found",
      })
    }

    // Test with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Simple connection test
    const { data, error } = await supabase.from("information_schema.tables").select("table_name").limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        details: error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      details: `Connected to ${supabaseUrl}`,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Connection test failed",
      details: String(error),
    })
  }
}
