import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const supabase = createSupabaseServerClient()

    const { data: sessionResult, error } = await supabase
      .from("user_sessions")
      .select(`
        user_id,
        user_profiles!inner(full_name, is_admin),
        auth_users!inner(email)
      `)
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !sessionResult) {
      cookieStore.delete("session_token")
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: sessionResult.user_id,
        email: sessionResult.auth_users.email,
        user_metadata: {
          full_name: sessionResult.user_profiles.full_name,
          is_admin: sessionResult.user_profiles.is_admin,
        },
      },
    })
  } catch (error) {
    console.error("Session validation error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (sessionToken) {
      const supabase = createSupabaseServerClient()

      await supabase.from("user_sessions").delete().eq("session_token", sessionToken)
    }

    cookieStore.delete("session_token")

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
