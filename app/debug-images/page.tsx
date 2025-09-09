"use client"

import { useState, useEffect } from "react"

export default function DebugImagesPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadImages() {
      try {
        const { getImagesPaginated } = await import("../actions/admin-actions")
        const result = await getImagesPaginated(1, 50) // Get first 50 images

        if (result.success) {
          setImages(result.data.images || [])
        } else {
          setError(result.error)
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Image Status Diagnostics</h1>
        <div className="text-center py-8">Loading images...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Image Status Diagnostics</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading images: {error}
        </div>
      )}

      <div className="grid gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start gap-4">
              <div className="text-sm font-mono text-gray-600">#{index + 1}</div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{image.title || "Untitled"}</h3>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Thumbnail URL:</span>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                      {image.thumbnail_url || "None"}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Image URL:</span>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                      {image.image_url || "None"}
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs">
                    <span>Category: {image.category_name || "Unknown"}</span>
                    <span>Price: ${image.price || "0"}</span>
                    <span>Active: {image.active ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {image.thumbnail_url && (
                  <div className="w-20 h-20 border rounded overflow-hidden bg-gray-100">
                    <img
                      src={image.thumbnail_url || "/placeholder.svg"}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none"
                        e.target.nextSibling.style.display = "flex"
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-xs text-red-600 hidden">
                      Failed
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">Summary</h2>
        <p>Total images checked: {images.length}</p>
        <p>Look for images showing "Failed" in the thumbnail preview - these are the problematic ones.</p>
      </div>
    </div>
  )
}
