"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, ImageIcon, X, Check } from "lucide-react"
import { toast } from "sonner"

interface ThumbnailSizes {
  small: string // 150x150
  medium: string // 300x300
  large: string // 600x400
}

interface PhotoUploadData {
  title: string
  description: string
  category: string
  rightsType: string
  price: string
  file: File | null
  preview: string
  thumbnails: ThumbnailSizes | null
}

interface EnhancedPhotoUploadProps {
  categories: Array<{ id: string; name: string }>
  onUploadComplete: (result: {
    url: string
    thumbnails: ThumbnailSizes
    fileName: string
    fileSize: number
  }) => void
  onUploadError: (error: string) => void
}

export function EnhancedPhotoUpload({ categories, onUploadComplete, onUploadError }: EnhancedPhotoUploadProps) {
  const [photoData, setPhotoData] = useState<PhotoUploadData>({
    title: "",
    description: "",
    category: "",
    rightsType: "both",
    price: "",
    file: null,
    preview: "",
    thumbnails: null,
  })

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStep, setProcessingStep] = useState("")

  const generateThumbnails = useCallback(async (file: File): Promise<ThumbnailSizes> => {
    const sizes = [
      { name: "small", width: 150, height: 150, quality: 0.7 },
      { name: "medium", width: 300, height: 300, quality: 0.8 },
      { name: "large", width: 600, height: 400, quality: 0.85 },
    ]

    const thumbnails: Partial<ThumbnailSizes> = {}

    for (const size of sizes) {
      setProcessingStep(`Generating ${size.name} thumbnail...`)

      const thumbnail = await new Promise<string>((resolve, reject) => {
        const img = new Image()
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        img.onload = () => {
          // Calculate dimensions maintaining aspect ratio
          let { width, height } = img
          const targetRatio = size.width / size.height
          const imageRatio = width / height

          if (imageRatio > targetRatio) {
            // Image is wider - fit to height
            height = size.height
            width = height * imageRatio
          } else {
            // Image is taller - fit to width
            width = size.width
            height = width / imageRatio
          }

          canvas.width = size.width
          canvas.height = size.height

          // Center the image
          const offsetX = (size.width - width) / 2
          const offsetY = (size.height - height) / 2

          // Fill background with white
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, size.width, size.height)

          // Draw image centered
          ctx.drawImage(img, offsetX, offsetY, width, height)

          resolve(canvas.toDataURL("image/jpeg", size.quality))
        }

        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })

      thumbnails[size.name as keyof ThumbnailSizes] = thumbnail
    }

    return thumbnails as ThumbnailSizes
  }, [])

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error("File size must be less than 100MB")
        return
      }

      setProcessingStep("Processing image...")

      try {
        // Generate preview
        const preview = URL.createObjectURL(file)

        // Generate thumbnails
        const thumbnails = await generateThumbnails(file)

        setPhotoData((prev) => ({
          ...prev,
          file,
          preview,
          thumbnails,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
        }))

        setProcessingStep("")
        toast.success("Image processed successfully!")
      } catch (error) {
        console.error("[v0] Error processing image:", error)
        toast.error("Failed to process image")
        setProcessingStep("")
      }
    },
    [generateThumbnails],
  )

  const handleDirectUpload = async () => {
    if (!photoData.file || !photoData.thumbnails) {
      toast.error("Please select and process an image first")
      return
    }

    if (!photoData.title.trim()) {
      toast.error("Please enter a title")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      setProcessingStep("Getting upload URL...")
      setUploadProgress(10)

      // Get presigned URL
      const response = await fetch("/api/backblaze/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: photoData.file.name,
          fileSize: photoData.file.size,
          contentType: photoData.file.type,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get upload URL")
      }

      const { uploadUrl, authToken, fileName } = await response.json()

      setProcessingStep("Uploading image...")
      setUploadProgress(30)

      // Upload directly to Backblaze
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: authToken,
          "X-Bz-File-Name": fileName,
          "Content-Type": photoData.file.type,
          "X-Bz-Content-Sha1": "unverified",
        },
        body: photoData.file,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      const uploadResult = await uploadResponse.json()
      setUploadProgress(80)

      setProcessingStep("Saving to database...")

      const bucketName = process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME || process.env.BACKBLAZE_BUCKET_NAME
      if (!bucketName) {
        console.error("[v0] Missing bucket name environment variable")
        throw new Error("Storage configuration error - please contact support")
      }

      const publicUrl = `https://f005.backblazeb2.com/file/${bucketName}/${fileName}`

      setUploadProgress(100)
      setProcessingStep("Complete!")

      // Call completion handler
      onUploadComplete({
        url: publicUrl,
        thumbnails: photoData.thumbnails,
        fileName: fileName,
        fileSize: photoData.file.size,
      })

      // Reset form
      setPhotoData({
        title: "",
        description: "",
        category: "",
        rightsType: "both",
        price: "",
        file: null,
        preview: "",
        thumbnails: null,
      })

      toast.success("Photo uploaded successfully!")
    } catch (error) {
      console.error("[v0] Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      onUploadError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setProcessingStep("")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Enhanced Photo Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="photo-upload">Select Photo</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to select or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WebP up to 100MB</p>
            </label>
          </div>
        </div>

        {/* Preview */}
        {photoData.preview && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={photoData.preview || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setPhotoData((prev) => ({ ...prev, file: null, preview: "", thumbnails: null }))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Thumbnail Preview */}
            {photoData.thumbnails && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <img src={photoData.thumbnails.small || "/placeholder.svg"} alt="Small" className="w-full rounded" />
                  <p className="text-xs text-gray-500 mt-1">Small (150x150)</p>
                </div>
                <div className="text-center">
                  <img
                    src={photoData.thumbnails.medium || "/placeholder.svg"}
                    alt="Medium"
                    className="w-full rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">Medium (300x300)</p>
                </div>
                <div className="text-center">
                  <img src={photoData.thumbnails.large || "/placeholder.svg"} alt="Large" className="w-full rounded" />
                  <p className="text-xs text-gray-500 mt-1">Large (600x400)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Status */}
        {processingStep && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{processingStep}</p>
            {uploading && <Progress value={uploadProgress} className="w-full" />}
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={photoData.title}
              onChange={(e) => setPhotoData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter photo title"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={photoData.category}
              onValueChange={(value) => setPhotoData((prev) => ({ ...prev, category: value }))}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={photoData.price}
              onChange={(e) => setPhotoData((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rights">Rights Type</Label>
            <Select
              value={photoData.rightsType}
              onValueChange={(value) => setPhotoData((prev) => ({ ...prev, rightsType: value }))}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal Use</SelectItem>
                <SelectItem value="commercial">Commercial Use</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={photoData.description}
            onChange={(e) => setPhotoData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your photo..."
            rows={3}
            disabled={uploading}
          />
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleDirectUpload}
          disabled={!photoData.file || !photoData.thumbnails || uploading || !photoData.title.trim()}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Upload Photo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
