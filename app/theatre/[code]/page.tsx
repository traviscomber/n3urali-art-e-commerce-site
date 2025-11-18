import { getCollectionByCode } from "@/app/actions/collection-actions"
import { TheatreMode } from "@/components/theatre-mode"
import { notFound } from 'next/navigation'
import { MusicPlayerProvider } from "@/lib/contexts/music-player-context"

interface TheatreCollectionPageProps {
  params: {
    code: string
  }
}

export default async function TheatreCollectionPage({ params }: TheatreCollectionPageProps) {
  const { code } = await params
  
  const result = await getCollectionByCode(code.toUpperCase())

  if (!result.success || !result.data) {
    notFound()
  }

  const collection = result.data
  
  const images = (collection.images || []).map((collectionImage) => ({
    id: collectionImage.image.id,
    title: collectionImage.image.title,
    description: collectionImage.image.description,
    original_url: collectionImage.image.original_url,
    file_path: collectionImage.image.file_path,
    thumbnail_large_url: collectionImage.image.thumbnail_medium_url, // Use medium as large
    thumbnail_medium_url: collectionImage.image.thumbnail_medium_url,
    thumbnail_small_url: collectionImage.image.thumbnail_small_url,
  }))

  console.log('[v0] Theatre Collection Page:', {
    code,
    collectionTitle: collection.title,
    imageCount: images.length,
    musicPlaylist: collection.music_playlist,
    firstImage: images[0],
  })

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
