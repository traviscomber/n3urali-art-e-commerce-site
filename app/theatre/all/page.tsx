import { getAllCollections } from "@/app/actions/collection-actions"
import { getGalleryImages } from "@/app/actions/gallery-actions"
import TheatreMode from "@/components/theatre-mode"

export const metadata = {
  title: "All Collections & Gallery - Theatre Mode",
  description: "Experience all collections and gallery images in one continuous immersive journey",
}

export const dynamic = "force-dynamic"

export default async function AllCollectionsTheatrePage() {
  const [collections, galleryImages] = await Promise.all([
    getAllCollections(),
    getGalleryImages(),
  ])

  const activeCollections = collections.filter(
    (c) => c.is_active && c.collection_images && c.collection_images[0]?.count > 0
  )

  // Fetch all images from all collections
  const allCollectionData = await Promise.all(
    activeCollections.map(async (collection) => {
      const { getCollectionWithImages } = await import("@/app/actions/collection-actions")
      const result = await getCollectionWithImages(collection.id)
      return result.success ? result.data : null
    })
  )

  // Combine all images from all collections
  const allCollectionImages = allCollectionData
    .filter(Boolean)
    .flatMap((collection) =>
      collection.images.map((img) => ({
        ...img.image,
        collectionTitle: collection.title,
        collectionCode: collection.code,
      }))
    )

  // Combine gallery images
  const formattedGalleryImages = galleryImages.map((img: any) => ({
    id: img.id,
    title: img.title,
    description: img.description,
    thumbnail_medium_url: img.thumbnail_medium_url,
    thumbnail_small_url: img.thumbnail_small_url,
    file_path: img.file_path,
    original_url: img.original_url,
    price: img.price,
    image_format: img.image_format,
    collectionTitle: "Gallery",
    collectionCode: "gallery",
  }))

  // Combine all images
  const allImages = [...allCollectionImages, ...formattedGalleryImages]

  // Combine all music playlists
  const allMusicTracks = allCollectionData
    .filter(Boolean)
    .flatMap((collection) => collection.music_playlist || [])
    .filter(Boolean)

  if (allImages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No images available for theatre mode.</p>
      </div>
    )
  }

  return (
    <TheatreMode
      images={allImages}
      collectionTitle="All Collections & Gallery"
      musicPlaylist={allMusicTracks}
    />
  )
}
