import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"
import { cookies } from "next/headers"

async function getCurrentUser(sessionToken: string) {
  const sql = createNeonClient()

  const sessionResult = await sql`
    SELECT us.user_id, up.full_name, up.is_admin, u.email, up.avatar_url
    FROM user_sessions us
    JOIN user_profiles up ON us.user_id = up.id
    JOIN auth.users u ON up.id = u.id
    WHERE us.session_token = ${sessionToken}
    AND us.expires_at > NOW()
    LIMIT 1
  `

  return sessionResult.length > 0 ? sessionResult[0] : null
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

    const sql = createNeonClient()

    const result = await sql`
      UPDATE user_profiles 
      SET full_name = ${full_name}, 
          avatar_url = ${avatar_url || null},
          updated_at = NOW()
      WHERE id = ${user.user_id}
      RETURNING *
    `

    if (result.length === 0) {
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
