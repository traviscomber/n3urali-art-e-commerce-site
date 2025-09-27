import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PasswordManager } from "@/lib/auth/password"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const passwordValidation = PasswordManager.isStrongPassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Password does not meet requirements",
          details: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).limit(1).single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const hashedPassword = await PasswordManager.hashPassword(password)

    await supabase.from("users").insert({
      id: userId,
      email: email,
      encrypted_password: hashedPassword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    await supabase.from("user_profiles").insert({
      id: userId,
      full_name: fullName,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

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
