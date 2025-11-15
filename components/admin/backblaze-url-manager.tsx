"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { toast } from "sonner"

interface Image {
  id: string
  title: string
  original_file_url: string | null
  thumbnail_large_url: string | null
  price: number
}

export function BackblazeUrlManager() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editingUrls, setEditingUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/images-without-backblaze")
      const data = await response.json()

      if (data.success) {
        setImages(data.images)
        console.log("[v0] Loaded", data.images.length, "images without Backblaze URLs")
      } else {
        toast.error("Failed to load images")
      }
    } catch (error) {
      console.error("[v0] Error loading images:", error)
      toast.error("Failed to load images")
    } finally {
      setLoading(false)
    }
  }

  const handleUrlChange = (imageId: string, url: string) => {
    setEditingUrls((prev) => ({ ...prev, [imageId]: url }))
  }

  const handleSave = async (imageId: string) => {
    const url = editingUrls[imageId]
    if (!url || !url.trim()) {
      toast.error("Please enter a valid URL")
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch (e) {
      toast.error("Please enter a valid URL format")
      return
    }

    setSaving(imageId)
    try {
      const response = await fetch("/api/admin/update-backblaze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, originalFileUrl: url.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Backblaze URL saved successfully")
        // Update local state
        setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, original_file_url: url.trim() } : img)))
        // Clear editing state
        setEditingUrls((prev) => {
          const newState = { ...prev }
          delete newState[imageId]
          return newState
        })
      } else {
        toast.error("Failed to save URL: " + data.error)
      }
    } catch (error) {
      console.error("[v0] Error saving URL:", error)
      toast.error("Failed to save URL")
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading images...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const missingCount = images.filter((img) => !img.original_file_url).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Backblaze High-Resolution URLs
          </CardTitle>
          <CardDescription>
            Add Backblaze URLs for high-resolution image downloads. These links will be sent to customers after payment
            approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {missingCount > 0 ? (
            <Alert className="border-orange-200 bg-orange-50 mb-4">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                {missingCount} image{missingCount !== 1 ? "s" : ""} missing Backblaze URL
                {missingCount !== 1 ? "s" : ""}. Add them below to enable download link generation after payment
                approval.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                All images have Backblaze URLs configured! Download links will be generated automatically after payment
                approval.
              </AlertDescription>
            </Alert>
          )}

          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-medium">All images have Backblaze URLs!</p>
              <p className="text-sm">No action needed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    <img
                      src={image.thumbnail_large_url || "/placeholder.svg?height=80&width=80"}
                      alt={image.title}
                      className="w-20 h-20 object-cover rounded"
                      crossOrigin="anonymous"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-lg truncate">{image.title}</h4>
                      <p className="text-sm text-gray-600">${image.price.toFixed(2)}</p>
                      {image.original_file_url ? (
                        <div className="mt-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <a
                            href={image.original_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate"
                          >
                            {image.original_file_url}
                          </a>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <span className="text-sm text-orange-600">Missing Backblaze URL</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`url-${image.id}`} className="text-sm font-medium">
                      Backblaze High-Resolution URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`url-${image.id}`}
                        type="url"
                        placeholder="https://your-bucket.s3.region.backblazeb2.com/path/to/file.jpg"
                        value={editingUrls[image.id] || image.original_file_url || ""}
                        onChange={(e) => handleUrlChange(image.id, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleSave(image.id)}
                        disabled={
                          saving === image.id ||
                          !editingUrls[image.id] ||
                          editingUrls[image.id] === image.original_file_url
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving === image.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      This URL will be sent to customers after payment approval. Make sure it points to the full
                      high-resolution file in your Backblaze bucket.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
