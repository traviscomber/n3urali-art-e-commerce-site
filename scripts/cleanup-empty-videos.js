import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("[v0] Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupEmptyVideos() {
  try {
    console.log("[v0] Starting collections video URL cleanup...")

    // Get all collections with empty video URLs
    const { data: collections, error: selectError } = await supabase
      .from("collections")
      .select("id, code, video_url, title")
      .or("video_url.is.null,video_url.eq.")

    if (selectError) {
      throw new Error(`Failed to fetch collections: ${selectError.message}`)
    }

    if (!collections || collections.length === 0) {
      console.log("[v0] No collections with empty video_url found")
      return
    }

    console.log(`[v0] Found ${collections.length} collections with empty video URLs`)
    console.log(collections)

    // Update these collections to set video_url to null properly
    const collectionsToClean = collections.filter((c) => !c.video_url || c.video_url.trim() === "")

    if (collectionsToClean.length === 0) {
      console.log("[v0] No collections need cleaning")
      return
    }

    console.log(`[v0] Cleaning ${collectionsToClean.length} collections with empty video URLs`)

    // Set empty video_urls to null to stop rendering
    for (const collection of collectionsToClean) {
      const { error: updateError } = await supabase
        .from("collections")
        .update({ video_url: null })
        .eq("id", collection.id)

      if (updateError) {
        console.error(`[v0] Error updating collection ${collection.code}:`, updateError.message)
      } else {
        console.log(`[v0] Updated collection ${collection.code} - set video_url to null`)
      }
    }

    console.log(
      `[v0] ✅ Cleanup complete! Set ${collectionsToClean.length} collections' video_url to null`,
    )
  } catch (error) {
    console.error("[v0] Cleanup failed:", error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

cleanupEmptyVideos()
