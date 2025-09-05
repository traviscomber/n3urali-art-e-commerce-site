import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"
import { hashPassword, validatePassword } from "@/lib/auth/password"
import { createEmailVerificationToken } from "@/lib/auth/email-verification"
import { sendVerificationEmail } from "@/lib/email/verification-email"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Password does not meet requirements",
          details: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    const sql = createNeonClient()

    const existingUser = await sql`
      SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await sql`
      INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
      VALUES (${userId}, ${email}, ${hashedPassword}, NOW(), NOW())
    `

    await sql`
      INSERT INTO user_profiles (id, full_name, is_admin, email_verified, created_at, updated_at)
      VALUES (${userId}, ${fullName}, false, false, NOW(), NOW())
    `

    try {
      const verificationToken = await createEmailVerificationToken(userId, email)
      const emailSent = await sendVerificationEmail(email, verificationToken, fullName)

      if (!emailSent) {
        console.error("Failed to send verification email for user:", userId)
      }
    } catch (emailError) {
      console.error("Email verification setup failed:", emailError)
      // Don't fail registration if email sending fails
    }

    return NextResponse.json({
      message: "User created successfully. Please check your email to verify your account.",
      user: {
        id: userId,
        email: email,
        user_metadata: {
          full_name: fullName,
          is_admin: false,
          email_verified: false,
        },
      },
      requiresEmailVerification: true,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
