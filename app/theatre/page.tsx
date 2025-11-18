import { getAllCollections } from "@/app/actions/collection-actions"
import Link from "next/link"
import { Film } from 'lucide-react'
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Theatre Mode - Immersive Collection Viewing",
  description: "Experience our collections in fullscreen theatre mode with ambient music and automatic slideshow transitions",
}

export default async function TheatrePage() {
  const collections = await getAllCollections()
  const activeCollections = collections.filter((c) => c.is_active && c.collection_images && c.collection_images[0]?.count > 0)

  const totalImages = activeCollections.reduce((sum, c) => sum + (c.collection_images?.[0]?.count || 0), 0)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Film className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Theatre Mode
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Immerse yourself in our curated collections with fullscreen viewing, ambient music, and automatic slideshow transitions
            </p>
          </div>

          {activeCollections.length > 1 && (
            <div className="mb-8">
              <Link
                href="/theatre/all"
                className="group relative overflow-hidden rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 block"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                        All Collections
                        <span className="text-sm font-normal text-muted-foreground">✨ Premium Experience</span>
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {totalImages} images from {activeCollections.length} collections
                      </p>
                    </div>
                    <Film className="w-8 h-8 text-primary group-hover:scale-110 transition-transform flex-shrink-0 ml-2" />
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    Experience all our collections in one continuous immersive journey. Each collection's music will play as you explore its images.
                  </p>

                  <Button className="w-full md:w-auto group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow">
                    Start Complete Journey
                  </Button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Link>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeCollections.map((collection) => {
              const imageCount = collection.collection_images?.[0]?.count || 0
              const hasMusic = collection.music_playlist && collection.music_playlist.length > 0

              return (
                <Link
                  key={collection.id}
                  href={`/theatre/${collection.code}`}
                  className="group relative overflow-hidden rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {collection.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {imageCount} {imageCount === 1 ? 'image' : 'images'}
                        </p>
                      </div>
                      <Film className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {collection.description}
                    </p>

                    {hasMusic && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>With ambient music</span>
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Enter Theatre Mode
                    </Button>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>
              )
            })}
          </div>

          {activeCollections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No collections available for theatre mode yet.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
