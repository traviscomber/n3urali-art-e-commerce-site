import { getCollectionByCode } from "@/app/actions/collection-actions"
import { TheatreMode } from "@/components/theatre-mode"
import { notFound } from "next/navigation"
import { MusicPlayerProvider } from "@/lib/contexts/music-player-context"
import { createClient } from "@/lib/supabase/server"

interface TheatreCollectionPageProps {
  params: Promise<{
    code: string
  }>
}

export default async function TheatreCollectionPage({ params }: TheatreCollectionPageProps) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  if (upperCode === "ALL") {
    const supabase = await createClient()

    // Get all active images from the gallery
    const { data: allImages, error } = await supabase
      .from("images")
      .select(`
        id,
        title,
        description,
        original_url,
        file_path,
        thumbnail_large_url,
        thumbnail_medium_url,
        thumbnail_small_url
      `)
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching all images:", error)
      notFound()
    }

    if (!allImages || allImages.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Images Available</h1>
            <p className="text-muted-foreground">The gallery doesn't have any images yet.</p>
          </div>
        </div>
      )
    }

    const images = allImages.map((img) => ({
      id: img.id,
      title: img.title,
      description: img.description,
      original_url: img.original_url,
      file_path: img.file_path,
      thumbnail_large_url: img.thumbnail_medium_url,
      thumbnail_medium_url: img.thumbnail_medium_url,
      thumbnail_small_url: img.thumbnail_small_url,
    }))

    return (
      <MusicPlayerProvider initialPlaylist={[]}>
        <div className="h-screen w-full">
          <TheatreMode images={images} collectionTitle="All Gallery Images" musicPlaylist={[]} autoStart={true} />
        </div>
      </MusicPlayerProvider>
    )
  }

  const result = await getCollectionByCode(upperCode)

  if (!result.success || !result.data) {
    notFound()
  }

  const collection = result.data

  const images = (collection.images || []).map((collectionImage: any) => ({
    id: collectionImage.image.id,
    title: collectionImage.image.title,
    description: collectionImage.image.description,
    original_url: collectionImage.image.original_url,
    file_path: collectionImage.image.file_path,
    thumbnail_large_url: collectionImage.image.thumbnail_medium_url,
    thumbnail_medium_url: collectionImage.image.thumbnail_medium_url,
    thumbnail_small_url: collectionImage.image.thumbnail_small_url,
  }))

  if (images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Images Available</h1>
          <p className="text-muted-foreground">This collection doesn't have any images yet.</p>
        </div>
      </div>
    )
  }

  return (
    <MusicPlayerProvider initialPlaylist={collection.music_playlist || []}>
      <div className="h-screen w-full">
        <TheatreMode
          images={images}
          collectionTitle={collection.title}
          musicPlaylist={collection.music_playlist || []}
          autoStart={true}
        />
      </div>
    </MusicPlayerProvider>
  )
}
