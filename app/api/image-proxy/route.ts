import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return new NextResponse("Missing image URL", { status: 400 })
  }

  try {
    // Fetch the image from Backblaze
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Return the image with proper CORS headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[v0] Image proxy error:", error)
    return new NextResponse("Failed to proxy image", { status: 500 })
  }
}
