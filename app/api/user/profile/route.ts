import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

async function getCurrentUser(sessionToken: string) {
  const supabase = await createClient()

  const { data: sessionResult, error } = await supabase
    .from("user_sessions")
    .select(`
      user_id,
      user_profiles!inner(full_name, is_admin, avatar_url),
      users!inner(email)
    `)
    .eq("session_token", sessionToken)
    .gt("expires_at", new Date().toISOString())
    .limit(1)

  if (error || !sessionResult || sessionResult.length === 0) {
    return null
  }

  const session = sessionResult[0]
  return {
    user_id: session.user_id,
    email: session.users.email,
    full_name: session.user_profiles.full_name,
    is_admin: session.user_profiles.is_admin,
    avatar_url: session.user_profiles.avatar_url,
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getCurrentUser(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        is_admin: user.is_admin,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getCurrentUser(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { full_name, avatar_url } = await request.json()

    if (!full_name) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: result, error } = await supabase
      .from("user_profiles")
      .update({
        full_name: full_name,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.user_id)
      .select("*")

    if (error || !result || result.length === 0) {
      console.error("Profile update error:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: result[0].id,
        email: user.email,
        full_name: result[0].full_name,
        avatar_url: result[0].avatar_url,
        is_admin: result[0].is_admin,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
