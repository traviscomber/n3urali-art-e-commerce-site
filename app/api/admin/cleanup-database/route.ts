import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// List of image IDs/URLs that are currently in use on pages
const USED_IMAGE_IDENTIFIERS = [
  "/images/R3alities.png",
  "/images/MH1.png",
  "/images/MH2.png",
  "/images/MH3.png",
  "/images/AH1.png",
  "/images/AH2.png",
  "/images/AH3.png",
]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    console.log("[v0] Starting database cleanup...")

    // Get all images from database
    const { data: allImages, error: fetchError } = await supabase
      .from("images")
      .select("id, original_url, upscaled_url, file_path")

    if (fetchError) {
      console.error("[v0] Error fetching images:", fetchError)
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
    }

    // Determine which images are in use
    const usedImageIds = new Set<string>()
    const imagesToDelete: string[] = []

    allImages?.forEach((image) => {
      const urls = [image.original_url, image.upscaled_url, image.file_path].filter(Boolean)
      
      // Check if any URL matches our used identifiers or if it's a valid external URL
      const isInUse = urls.some((url) => {
        if (!url) return false
        
        // Check if it matches our local images
        if (USED_IMAGE_IDENTIFIERS.some((identifier) => url?.includes(identifier))) {
          return true
        }
        
        // Keep images with valid Supabase Storage or Blob URLs
        if (url.includes("supabase") || url.includes("blob.vercel-storage.com")) {
          return true
        }
        
        return false
      })

      if (isInUse) {
        usedImageIds.add(image.id)
      } else {
        imagesToDelete.push(image.id)
      }
    })

    console.log("[v0] Images to delete:", imagesToDelete.length, "Images to keep:", usedImageIds.size)

    // Delete unused images
    let deletedCount = 0
    if (imagesToDelete.length > 0) {
      const { error: deleteError, count } = await supabase
        .from("images")
        .delete()
        .in("id", imagesToDelete)

      if (deleteError) {
        console.error("[v0] Error deleting images:", deleteError)
        return NextResponse.json({ error: "Failed to delete images" }, { status: 500 })
      }

      deletedCount = count || imagesToDelete.length
    }

    console.log("[v0] Database cleanup complete. Deleted:", deletedCount, "Kept:", usedImageIds.size)

    return NextResponse.json({
      deleted: deletedCount,
      kept: usedImageIds.size,
      message: `Cleanup complete. Deleted ${deletedCount} unused images, kept ${usedImageIds.size} images in use.`,
    })
  } catch (error) {
    console.error("[v0] Cleanup error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed" },
      { status: 500 },
    )
  }
}
