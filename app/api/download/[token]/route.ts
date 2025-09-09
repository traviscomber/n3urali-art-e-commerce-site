import { type NextRequest, NextResponse } from "next/server"
import { createNeonClient } from "@/lib/neon/client"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json({ error: "Download token is required" }, { status: 400 })
    }

    const sql = createNeonClient()

    const result = await sql`
      SELECT * FROM verify_and_download(${token})
    `

    const downloadData = result[0]

    if (!downloadData?.valid) {
      return NextResponse.json(
        {
          error: "Invalid or expired download token",
        },
        { status: 403 },
      )
    }

    const imageResult = await sql`
      SELECT image_url, title FROM images WHERE id = ${downloadData.image_id}
    `

    if (!imageResult[0]) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename="${imageResult[0].title}.jpg"`)
    headers.set("Content-Type", "application/octet-stream")

    // For now, redirect to the image URL
    return NextResponse.redirect(imageResult[0].image_url)
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
