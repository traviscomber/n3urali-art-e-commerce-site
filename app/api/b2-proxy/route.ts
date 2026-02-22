import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const b2Url = searchParams.get("url")

    if (!b2Url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
    }

    console.log("[v0] B2 proxy fetching:", b2Url)

    // Fetch the image from Backblaze
    const response = await fetch(b2Url)

    if (!response.ok) {
      console.error("[v0] B2 fetch failed:", response.status)
      return NextResponse.json(
        { error: `B2 fetch failed: ${response.status}` },
        { status: response.status }
      )
    }

    // Get the content type and body
    const contentType = response.headers.get("content-type") || "application/octet-stream"
    const buffer = await response.arrayBuffer()

    // Return with CORS headers
    const headers = new Headers()
    headers.set("Content-Type", contentType)
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type")
    headers.set("Cache-Control", "public, max-age=31536000, immutable")

    return new NextResponse(buffer, { headers })
  } catch (error) {
    console.error("[v0] B2 proxy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy error" },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
