import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupDatabase() {
  console.log("[v0] Starting database cleanup...")

  try {
    // Get all images with empty/null URLs
    const { data: emptyImages, error: fetchError } = await supabase
      .from("images")
      .select("id")
      .or(
        `upscaled_url.is.null,upscaled_url.eq.,original_url.is.null,original_url.eq.,file_path.is.null,file_path.eq.`
      )

    if (fetchError) {
      console.error("[v0] Error fetching images:", fetchError)
      return
    }

    console.log(`[v0] Found ${emptyImages?.length || 0} images with empty URLs`)

    if (emptyImages && emptyImages.length > 0) {
      const imageIds = emptyImages.map((img) => img.id)

      // Delete image_tags first (foreign key constraint)
      const { error: deleteTagsError } = await supabase
        .from("image_tags")
        .delete()
        .in("image_id", imageIds)

      if (deleteTagsError) {
        console.error("[v0] Error deleting image_tags:", deleteTagsError)
      } else {
        console.log(`[v0] Deleted ${imageIds.length} image_tags`)
      }

      // Delete collection_images (foreign key constraint)
      const { error: deleteCollectionsError } = await supabase
        .from("collection_images")
        .delete()
        .in("image_id", imageIds)

      if (deleteCollectionsError) {
        console.error("[v0] Error deleting collection_images:", deleteCollectionsError)
      } else {
        console.log(`[v0] Deleted collection_images with these images`)
      }

      // Delete analytics related to these images
      const { error: deleteAnalyticsError } = await supabase
        .from("analytics")
        .delete()
        .in("image_id", imageIds)

      if (deleteAnalyticsError) {
        console.error("[v0] Error deleting analytics:", deleteAnalyticsError)
      } else {
        console.log(`[v0] Deleted analytics records`)
      }

      // Finally delete the images
      const { error: deleteImagesError } = await supabase
        .from("images")
        .delete()
        .in("id", imageIds)

      if (deleteImagesError) {
        console.error("[v0] Error deleting images:", deleteImagesError)
      } else {
        console.log(`[v0] Successfully deleted ${imageIds.length} empty images`)
      }
    }

    // Get remaining image count
    const { count, error: countError } = await supabase
      .from("images")
      .select("id", { count: "exact", head: true })

    if (!countError) {
      console.log(`[v0] Remaining images in database: ${count}`)
    }

    console.log("[v0] Database cleanup complete!")
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
  }
}

cleanupDatabase()
