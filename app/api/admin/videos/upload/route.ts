import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const collectionCode = formData.get("collectionCode") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: "No title provided" }, { status: 400 })
    }

    // Validate file is video
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video" }, { status: 400 })
    }

    // Validate file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be smaller than 500MB" }, { status: 400 })
    }

    console.log("[v0] Uploading video:", { title, collectionCode, fileSize: file.size })

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log("[v0] No authenticated user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.email)

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${collectionCode || "featured"}/${fileName}`

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage (videos bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error("[v0] Storage upload error:", uploadError)
      // Try falling back to assets bucket
      console.log("[v0] Attempting fallback to assets bucket...")
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from("assets")
        .upload(filePath, buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        })
      
      if (fallbackError) {
        console.error("[v0] Fallback storage upload error:", fallbackError)
        return NextResponse.json(
          { error: `Storage error: ${fallbackError.message}` },
          { status: 500 }
        )
      }
      
      console.log("[v0] File uploaded to assets bucket (fallback):", filePath)
      // Get public URL from assets bucket
      const { data: { publicUrl: assetUrl } } = supabase.storage.from("assets").getPublicUrl(filePath)
      
      // Save to database with assets URL
      const { error: dbError } = await supabase.from("videos").insert({
        title,
        video_url: assetUrl,
        collection_code: collectionCode || "featured",
        uploaded_by: user.id,
        file_size: file.size,
        file_name: fileName,
        created_at: new Date().toISOString(),
      })

      return NextResponse.json(
        {
          success: true,
          url: assetUrl,
          message: `Video "${title}" uploaded successfully`,
        },
        { status: 200 }
      )
    }

    console.log("[v0] File uploaded to storage:", filePath)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(filePath)

    if (!publicUrl) {
      return NextResponse.json(
        { error: "Failed to generate public URL" },
        { status: 500 }
      )
    }

    // Save video metadata to database
    const { error: dbError } = await supabase.from("videos").insert({
      title,
      video_url: publicUrl,
      collection_code: collectionCode || "featured",
      uploaded_by: user.id,
      file_size: file.size,
      file_name: fileName,
      created_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("[v0] Database insert error:", dbError)
      // Video is uploaded but metadata failed - still return success with URL
      return NextResponse.json(
        {
          success: true,
          url: publicUrl,
          message: "Video uploaded successfully (metadata save incomplete)",
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        message: `Video "${title}" uploaded successfully`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Video upload error:", error)
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Upload failed: ${errorMsg}` },
      { status: 500 }
    )
  }
}
