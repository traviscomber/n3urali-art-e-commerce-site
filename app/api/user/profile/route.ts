import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

interface UserProfile {
  user_id: string
  email: string
  full_name: string
  avatar_url: string | null
  is_admin: boolean
}

async function getCurrentUser(sessionToken: string): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken)
    
    if (authError || !user) {
      return null
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    return {
      user_id: user.id,
      email: user.email || "",
      full_name: profile.full_name || "",
      avatar_url: profile.avatar_url || null,
      is_admin: profile.role === "admin",
    }
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getCurrentUser(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const userProfile: UserProfile = user

    return NextResponse.json({
      user: {
        id: userProfile.user_id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        avatar_url: userProfile.avatar_url,
        is_admin: userProfile.is_admin,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
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
      .from("profiles")
      .update({
        full_name: full_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.user_id)
      .select("*")
      .single()

    if (error || !result) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: result.id,
        email: result.email,
        full_name: result.full_name,
        is_admin: result.role === "admin",
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
