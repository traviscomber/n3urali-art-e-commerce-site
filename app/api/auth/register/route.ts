import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/database"
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

    const supabase = createSupabaseServerClient()

    const { data: existingUser } = await supabase.from("auth_users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const hashedPassword = await PasswordManager.hashPassword(password)

    // Insert into auth_users table
    const { error: authError } = await supabase.from("auth_users").insert({
      id: userId,
      email: email,
      encrypted_password: hashedPassword,
    })

    if (authError) {
      console.error("Auth user creation error:", authError)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Insert into user_profiles table
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: userId,
      full_name: fullName,
      is_admin: false,
    })

    if (profileError) {
      console.error("User profile creation error:", profileError)
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

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
