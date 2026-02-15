import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication and admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const collectionCode = formData.get("collectionCode") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file is video
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video" }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `videos/${collectionCode || "general"}/${fileName}`

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

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("assets").getPublicUrl(filePath)

    // Save metadata to collections table if collectionCode provided
    if (collectionCode) {
      const { error: dbError } = await supabase
        .from("collections")
        .update({
          video_url: publicUrl,
          title: title || undefined,
          description: description || undefined,
        })
        .eq("code", collectionCode)

      if (dbError) {
        console.error("[v0] Database error:", dbError)
        // Video uploaded but metadata save failed
        return NextResponse.json(
          { error: "Video uploaded but metadata failed to save", publicUrl },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      publicUrl,
      filePath,
      title,
      description,
      collectionCode,
    })
  } catch (error) {
    console.error("[v0] Video upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video upload failed" },
      { status: 500 },
    )
  }
}
