import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredEnvVars = [
      "SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_JWT_SECRET",
    ]

    const missing = []
    const present = []

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      if (!value) {
        missing.push(envVar)
      } else {
        present.push(`${envVar}: ${value.substring(0, 20)}...`)
      }
    }

    const success = missing.length === 0

    return NextResponse.json({
      success,
      message: success
        ? "All required environment variables are present"
        : `Missing environment variables: ${missing.join(", ")}`,
      details: {
        present: present.length,
        missing: missing.length,
        missingVars: missing,
        presentVars: present,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to check environment variables",
      details: String(error),
    })
  }
}
