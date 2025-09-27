import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const supabase = await createClient()

    const { data: sessionResult, error: sessionError } = await supabase
      .from("user_sessions")
      .select(`
        user_id,
        user_profiles!inner(full_name, is_admin),
        users!inner(email)
      `)
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .limit(1)

    if (sessionError || !sessionResult || sessionResult.length === 0) {
      cookieStore.delete("session_token")
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const session = sessionResult[0]

    return NextResponse.json({
      user: {
        id: session.user_id,
        email: session.users.email,
        user_metadata: {
          full_name: session.user_profiles.full_name,
          is_admin: session.user_profiles.is_admin,
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
      const supabase = await createClient()

      await supabase.from("user_sessions").delete().eq("session_token", sessionToken)
    }

    cookieStore.delete("session_token")

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
