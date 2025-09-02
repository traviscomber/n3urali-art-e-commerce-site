import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json({ error: "Download token is required" }, { status: 400 })
    }

    return NextResponse.json({ error: "Download functionality is being updated" }, { status: 503 })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
