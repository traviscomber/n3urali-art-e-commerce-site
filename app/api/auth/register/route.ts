import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // For now, create a profile record directly since we're migrating from custom auth
    // In a proper Supabase setup, you'd use supabase.auth.signUp()
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        email: email,
        full_name: fullName,
        role: "user",
        is_active: true,
      })
      .select("*")
      .single()

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError)
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newProfile.id,
        email: newProfile.email,
        user_metadata: {
          full_name: newProfile.full_name,
          is_admin: newProfile.role === "admin",
        },
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
