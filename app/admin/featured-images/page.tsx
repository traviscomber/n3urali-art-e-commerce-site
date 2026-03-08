"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Search, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageType {
  id: string
  title: string
  description: string | null
  file_path: string
  original_url: string | null
  upscaled_url: string | null
  thumbnail_medium_url: string | null
  featured_collection: boolean
  price: number
  image_format: string
}

export default function FeaturedImagesAdmin() {
  const [images, setImages] = useState<ImageType[]>([])
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/admin/featured-images")
      const data = await response.json()
      setImages(data)

      // Pre-select currently featured images
      const featured = new Set<string>(data.filter((img: ImageType) => img.featured_collection).map((img: ImageType) => img.id))
      setSelectedImages(featured)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleImage = (imageId: string) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImages(newSelected)
  }

  const saveFeaturedImages = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/featured-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: Array.from(selectedImages) }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Featured images updated successfully",
        })
        fetchImages()
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update featured images",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredImages = images.filter(
    (img) =>
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Featured Images</CardTitle>
          <CardDescription>
            Select images to display in the homepage Featured Images carousel. Changes are reflected immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{selectedImages.size} Selected</Badge>
              <Button onClick={saveFeaturedImages} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImages.map((image) => {
              const isSelected = selectedImages.has(image.id)
              const imageUrl =
                image.thumbnail_medium_url ||
                image.upscaled_url ||
                image.original_url ||
                image.file_path ||
                "/placeholder.svg"

              return (
                <Card
                  key={image.id}
                  className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
                  onClick={() => toggleImage(image.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={image.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 right-2">
                        <Checkbox checked={isSelected} className="bg-background" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm line-clamp-1">{image.title}</h3>
                      {image.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{image.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">{image.image_format}</span>
                        <span className="text-sm font-bold">${image.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No images found matching your search.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
