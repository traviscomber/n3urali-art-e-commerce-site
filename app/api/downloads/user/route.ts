import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching user downloads...")

    const supabase = createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] User not authenticated:", authError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userEmail = user.email
    console.log("[v0] Fetching downloads for authenticated user:", userEmail)

    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select(`
        id,
        download_count,
        download_limit,
        created_at,
        images!inner(
          id,
          title,
          preview_url
        ),
        licenses!inner(
          name,
          description
        ),
        orders!inner(
          user_email,
          status,
          created_at
        )
      `)
      .eq("orders.user_email", userEmail)
      .eq("orders.status", "completed")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching downloads:", error)
      return NextResponse.json({ error: "Failed to fetch downloads" }, { status: 500 })
    }

    const downloads =
      orderItems?.map((item) => ({
        order_item_id: item.id,
        image_title: item.images.title,
        license_name: item.licenses.name,
        download_count: item.download_count || 0,
        download_limit: item.download_limit || 5,
        order_date: item.orders.created_at,
        can_download: (item.download_count || 0) < (item.download_limit || 5),
      })) || []

    console.log("[v0] Found", downloads.length, "downloads for user")

    return NextResponse.json({
      downloads,
      total: downloads.length,
    })
  } catch (error) {
    console.error("[v0] User downloads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
