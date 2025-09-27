import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const supabase = await createClient()

    const { data: sessionResult, error } = await supabase
      .from("user_sessions")
      .select(`
        user_id,
        user_profiles!inner(full_name, is_admin),
        users!inner(email)
      `)
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .single()

    if (error || !sessionResult) {
      cookieStore.delete("session_token")
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const session = sessionResult
    const profile = session.user_profiles as any
    const user = session.users as any

    return NextResponse.json({
      user: {
        id: session.user_id,
        email: user.email,
        user_metadata: {
          full_name: profile.full_name,
          is_admin: profile.is_admin,
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
    const cookieStore = await cookies()
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
