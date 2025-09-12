import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    console.log("[v0] Download verification started")
    const token = params.token
    console.log("[v0] Received token:", token)

    if (!token) {
      console.log("[v0] Missing download token")
      return NextResponse.json({ error: "Download token is required" }, { status: 400 })
    }

    console.log("[v0] Creating Neon client...")
    const sql = createNeonClient()
    console.log("[v0] Neon client created successfully")

    console.log("[v0] Calling verify_and_download function...")
    const result = await sql`
      SELECT * FROM verify_and_download(${token})
    `
    console.log("[v0] Verification result:", result)

    const downloadData = result[0]

    if (!downloadData?.valid) {
      console.log("[v0] Invalid or expired token")
      return NextResponse.json(
        {
          error: "Invalid or expired download token",
        },
        { status: 403 },
      )
    }

    console.log("[v0] Fetching image data for ID:", downloadData.image_id)
    const imageResult = await sql`
      SELECT image_url, title FROM images WHERE id = ${downloadData.image_id}
    `
    console.log("[v0] Image result:", imageResult)

    if (!imageResult[0]) {
      console.log("[v0] Image not found")
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename="${imageResult[0].title}.jpg"`)
    headers.set("Content-Type", "application/octet-stream")

    console.log("[v0] Redirecting to image URL:", imageResult[0].image_url)
    // For now, redirect to the image URL
    return NextResponse.redirect(imageResult[0].image_url)
  } catch (error) {
    console.error("[v0] Download error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
