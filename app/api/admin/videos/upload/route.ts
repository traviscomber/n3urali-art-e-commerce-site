import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log("[v0] Starting video upload, content-length:", request.headers.get('content-length'))
    
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const collectionCode = formData.get("collectionCode") as string

    if (!file || !title) {
      return NextResponse.json({ error: "Missing file or title" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "mp4"
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${collectionCode || "featured"}/${fileName}`

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase - try videos bucket first, fallback to assets
    let uploadData, uploadError
    let bucketName = "videos"

    ({ data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, { cacheControl: "3600", upsert: false })
    )

    if (uploadError) {
      console.log("[v0] Videos bucket failed, trying assets bucket")
      bucketName = "assets"
      
      ({ data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, { cacheControl: "3600", upsert: false })
      )
    }

    if (uploadError) {
      console.error("[v0] Storage error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    console.log("[v0] Upload successful:", { url: publicUrl })

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: `Video "${title}" uploaded successfully`,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    const msg = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
