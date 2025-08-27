import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = createClient()

    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm admin user
    })

    if (authError) {
      console.error("Error creating admin user:", authError)
      return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
    }

    // Create admin profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: authData.user.id,
      email: authData.user.email,
      is_admin: true,
    })

    if (profileError) {
      console.error("Error creating admin profile:", profileError)
      // Try to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create admin profile" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error("Admin setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
