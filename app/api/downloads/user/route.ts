import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's download history using database function
    const { data, error } = await supabase.rpc("get_user_downloads", {
      user_email_param: user.email,
    })

    if (error) {
      console.error("Error fetching user downloads:", error)
      return NextResponse.json({ error: "Failed to fetch downloads" }, { status: 500 })
    }

    return NextResponse.json({ downloads: data || [] })
  } catch (error) {
    console.error("User downloads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
