import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const sql = createNeonClient()

    const existingUser = await sql`
      SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await sql`
      INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
      VALUES (${userId}, ${email}, 'hashed_password_placeholder', NOW(), NOW())
    `

    await sql`
      INSERT INTO user_profiles (id, full_name, is_admin, created_at, updated_at)
      VALUES (${userId}, ${fullName}, false, NOW(), NOW())
    `

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: userId,
        email: email,
        user_metadata: {
          full_name: fullName,
          is_admin: false,
        },
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
