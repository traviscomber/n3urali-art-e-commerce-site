'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Trash2, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AdminPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/featured-images?all=true')
      if (!res.ok) throw new Error('Failed to load images')
      const data = await res.json()
      setImages(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load images',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Upload to B2
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'PICS/Theatre')
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''))
      formData.append('description', 'Panoramic image')
      formData.append('imageFormat', 'equirectangular')
      formData.append('contentCategory', 'theatre')

      const uploadRes = await fetch('/api/admin/upload-to-b2', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Upload to B2 failed')
      const uploadedData = await uploadRes.json()

      // Save to database
      const dbRes = await fetch('/api/admin/featured-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadedData.imageData,
          active: true,
        }),
      })

      if (!dbRes.ok) throw new Error('Failed to save to database')

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      })

      await loadImages()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return

    try {
      const res = await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Delete failed')

      toast({
        title: 'Success',
        description: 'Image deleted',
      })

      await loadImages()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-slate-300">Click to upload image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploading && <p className="text-cyan-400 mt-4">Uploading...</p>}
          </CardContent>
        </Card>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="relative w-full h-48 bg-slate-700">
                {image.thumbnail_medium_url || image.original_url ? (
                  <Image
                    src={image.thumbnail_medium_url || image.original_url}
                    alt={image.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    No image
                  </div>
                )}
              </div>
              <CardContent className="pt-4">
                <h3 className="text-white font-semibold mb-2">{image.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{image.description}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDelete(image.id)}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center text-slate-400 mt-12">
            <p>No images yet. Upload your first image above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
