import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[v0] Fetching licenses...")
    const supabase = await createClient()

    const { data: licenses, error } = await supabase
      .from("licenses")
      .select("id, name, description, active")
      .eq("active", true)
      .order("id")

    if (error) {
      console.error("[v0] Error fetching licenses:", error)
      throw error
    }

    console.log("[v0] Found", licenses?.length || 0, "active licenses")

    return NextResponse.json({
      success: true,
      licenses: licenses || [],
    })
  } catch (error) {
    console.error("[v0] Error fetching licenses:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch licenses",
        licenses: [],
      },
      { status: 500 },
    )
  }
}
