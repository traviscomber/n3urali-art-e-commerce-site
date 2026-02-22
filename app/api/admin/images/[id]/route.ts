import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id } = params

    // Update image in database
    const { data, error } = await supabase
      .from("images")
      .update({
        title: body.title,
        description: body.description,
        active: body.active,
        is_featured: body.is_featured,
        featured_collection: body.featured_collection,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Image update error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    // Get image details before deletion
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("file_path, id")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    // Delete from database
    const { error: deleteError } = await supabase
      .from("images")
      .delete()
      .eq("id", id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: `Image deleted. Note: File at ${image.file_path} may need to be deleted from Backblaze B2 manually.`,
    })
  } catch (error) {
    console.error("[v0] Image delete error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    )
  }
}
