import type { Metadata } from "next"
import CollectionsPageClient from "./collections-page-client"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Curated Collections - Premium 360° Images | n3uralia360.art",
  description:
    "Discover our curated collections of premium 360° images. Each collection tells a unique visual story, perfect for VR experiences, architectural visualization, and immersive projects.",
}

export const dynamic = "force-dynamic"
export const revalidate = 300

export default async function CollectionsPage() {
  const supabase = await createClient()

  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .is("parent_collection_id", null) // Only get parent/top-level collections
    .order("created_at", { ascending: true })

  const collectionsData = collections || []

  const collectionsWithPreviews = await Promise.all(
    collectionsData.map(async (collection) => {
      const { data: childCollections, count: childCount } = await supabase
        .from("collections")
        .select("*", { count: "exact" })
        .eq("parent_collection_id", collection.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true })

      let images: any[] = []
      let allImagesWithPrices: any[] = []

      if (childCount && childCount > 0) {
        // Get preview images from each child collection
        const childPreviewPromises = childCollections.map(async (child: any) => {
          const { data: childImageLinks } = await supabase
            .from("collection_images")
            .select("image_id")
            .eq("collection_id", child.id)
            .order("position", { ascending: true })
            .limit(4) // Fetch 4 per child to have enough options

          if (childImageLinks && childImageLinks.length > 0) {
            const imageIds = childImageLinks.map((ci) => ci.image_id)
            const { data: imageData } = await supabase
              .from("images")
              .select("id, title, thumbnail_large_url, thumbnail_medium_url, original_url, file_path")
              .in("id", imageIds)
              .eq("active", true)

            return imageData || []
          }
          return []
        })

        const childPreviews = await Promise.all(childPreviewPromises)
        const allImages = childPreviews.flat()

        // Remove duplicates by keeping only unique image IDs
        const uniqueImages = Array.from(new Map(allImages.map((img) => [img.id, img])).values())

        images = uniqueImages.slice(0, 6) // Take max 6 unique images for grid
      } else {
        const { data: collectionImageLinks } = await supabase
          .from("collection_images")
          .select("image_id, position")
          .eq("collection_id", collection.id)
          .order("position", { ascending: true })
          .limit(6)

        if (collectionImageLinks && collectionImageLinks.length > 0) {
          const imageIds = collectionImageLinks.map((ci) => ci.image_id)
          const { data: imageData } = await supabase
            .from("images")
            .select("id, title, thumbnail_large_url, thumbnail_medium_url, original_url, file_path")
            .in("id", imageIds)
            .eq("active", true)

          images = imageData || []

          // Fetch ALL images with prices for calculation
          const { data: allCollectionImages } = await supabase
            .from("collection_images")
            .select("image_id")
            .eq("collection_id", collection.id)

          if (allCollectionImages && allCollectionImages.length > 0) {
            const allImageIds = allCollectionImages.map((ci) => ci.image_id)
            const { data: allImageData } = await supabase
              .from("images")
              .select("id, price")
              .in("id", allImageIds)
              .eq("active", true)

            allImagesWithPrices = allImageData || []
          }
        }
      }

      // Get total count
      const { count } = await supabase
        .from("collection_images")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", collection.id)

      const individualTotal = allImagesWithPrices.reduce((sum, img) => sum + Number.parseFloat(img.price || "0"), 0)
      const bundlePrice = Number.parseFloat(collection.bundle_price || "0")
      const savings = individualTotal - bundlePrice
      const savingsPercent = individualTotal > 0 ? Math.round((savings / individualTotal) * 100) : 0

      return {
        ...collection,
        previewImages: images,
        imageCount: count || 0,
        individualTotal,
        savings,
        savingsPercent,
        childCollections: childCollections || [],
        childCount: childCount || 0,
      }
    }),
  )

  return <CollectionsPageClient collectionsWithPreviews={collectionsWithPreviews} />
}
