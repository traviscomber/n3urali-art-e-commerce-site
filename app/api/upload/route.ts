import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (user.email !== "admin@n3urali.art") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const metadata = JSON.parse(formData.get("metadata") as string)

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${file.name}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("images").upload(fileName, file)

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName)

    // Insert into database
    const { data: imageData, error: dbError } = await supabase
      .from("images")
      .insert({
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        price: metadata.price,
        file_url: publicUrl,
        preview_url: publicUrl, // In production, you'd generate optimized previews
        thumbnail_url: publicUrl, // In production, you'd generate thumbnails
        file_size: file.size,
        tags: metadata.tags || [],
        active: true,
        featured: false,
        metadata: {
          originalName: file.name,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("images").remove([fileName])
      return NextResponse.json({ error: "Failed to save image data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      image: imageData,
      url: publicUrl,
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
