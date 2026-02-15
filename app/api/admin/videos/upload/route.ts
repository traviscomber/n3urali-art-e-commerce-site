import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
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

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `videos/${collectionCode || "featured"}/${fileName}`

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("assets")
      .upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error("[v0] Supabase storage error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    console.log("[v0] File uploaded to storage:", filePath)

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("assets").getPublicUrl(filePath)

    // Update or create collection with video URL
    const code = collectionCode || "featured"

    // First check if collection exists
    const { data: existingCollection, error: selectError } = await supabase
      .from("collections")
      .select("id")
      .eq("code", code)
      .single()

    if (selectError && selectError.code !== "PGRST116") {
      console.error("[v0] Database select error:", selectError)
    }

    if (existingCollection) {
      // Update existing collection
      const { error: updateError } = await supabase
        .from("collections")
        .update({
          video_url: publicUrl,
          title: title,
          description: description || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("code", code)

      if (updateError) {
        console.error("[v0] Database update error:", updateError)
        return NextResponse.json(
          { error: "Video uploaded but metadata save failed", url: publicUrl },
          { status: 500 },
        )
      }

      console.log("[v0] Collection updated with video URL")
    } else {
      // Create new collection
      const { error: insertError } = await supabase
        .from("collections")
        .insert({
          code: code,
          title: title,
          description: description || null,
          video_url: publicUrl,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error("[v0] Database insert error:", insertError)
        return NextResponse.json(
          { error: "Video uploaded but collection creation failed", url: publicUrl },
          { status: 500 },
        )
      }

      console.log("[v0] New collection created with video URL")
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: `Video "${title}" uploaded successfully`,
      filePath,
      collectionCode: code,
    })
  } catch (error) {
    console.error("[v0] Video upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video upload failed" },
      { status: 500 },
    )
  }
}
