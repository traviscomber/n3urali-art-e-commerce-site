import { type NextRequest, NextResponse } from "next/server"
import { WorkingBackblazeStorage } from "@/lib/backblaze-working"

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    const imagePath = path.join("/")
    console.log("[v0] Image proxy request for:", imagePath)

    // Initialize Backblaze storage
    const storage = new WorkingBackblazeStorage(
      process.env.BACKBLAZE_API_KEY!,
      process.env.BACKBLAZE_APPLICATION_KEY!,
      "Neuraliart",
    )

    const authenticatedUrl = await storage.getAuthenticatedDownloadUrl(imagePath)

    // Fetch the image with authentication
    const imageResponse = await fetch(authenticatedUrl, {
      headers: {
        "User-Agent": "N3uraliart/1.0",
      },
    })

    if (!imageResponse.ok) {
      console.log("[v0] Image fetch failed:", imageResponse.status, imageResponse.statusText)
      return new NextResponse("Image not found", { status: 404 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[v0] Image proxy error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
