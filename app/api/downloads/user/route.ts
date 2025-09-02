import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ error: "User downloads functionality is being updated" }, { status: 503 })
  } catch (error) {
    console.error("User downloads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
