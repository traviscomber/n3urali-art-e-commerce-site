import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    const images = await sql`
      SELECT 
        i.id, 
        i.title, 
        i.image_url, 
        i.thumbnail_url,
        c.name as category_name
      FROM images i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.active = true
      ORDER BY i.created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      success: true,
      images: images,
    })
  } catch (error) {
    console.error("Error fetching image URLs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch image URLs" }, { status: 500 })
  }
}
