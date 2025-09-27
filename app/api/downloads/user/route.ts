import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching user downloads...")

    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("email") || "developer@local.dev" // Updated default email

    if (!userEmail) {
      console.log("[v0] Missing user email")
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    console.log("[v0] Fetching downloads for user:", userEmail)
    const supabase = await createClient()

    const { data: downloads, error } = await supabase
      .from("downloads")
      .select(`
        *,
        images!inner(title, thumbnail_url, category_id),
        orders!inner(id, created_at)
      `)
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Downloads query error:", error)
      return NextResponse.json({ error: "Failed to fetch downloads" }, { status: 500 })
    }

    console.log("[v0] Found", downloads?.length || 0, "downloads for user")

    return NextResponse.json({
      downloads: downloads || [],
      total: downloads?.length || 0,
    })
  } catch (error) {
    console.error("[v0] User downloads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
