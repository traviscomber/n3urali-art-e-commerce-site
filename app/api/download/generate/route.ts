import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { orderItemId } = await request.json()

    if (!orderItemId) {
      return NextResponse.json({ error: "Order item ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Verify user owns this order item
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate download token using database function
    const { data, error } = await supabase.rpc("generate_download_token", {
      order_item_id_param: orderItemId,
    })

    if (error) {
      console.error("Error generating download token:", error)
      return NextResponse.json({ error: "Failed to generate download token" }, { status: 500 })
    }

    return NextResponse.json({
      token: data,
      downloadUrl: `/api/download/${data}`,
      expiresIn: "24 hours",
    })
  } catch (error) {
    console.error("Download generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
