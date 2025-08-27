"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, ImageIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface UploadFile {
  file: File
  id: string
  preview: string
  progress: number
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  error?: string
  metadata?: {
    title: string
    description: string
    category: "equirectangular" | "fisheye"
    price: number
    tags: string[]
  }
}

export default function AdminUploadsPage() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserClient()

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles)
  }, [])

  const processFiles = (fileList: File[]) => {
    const imageFiles = fileList.filter((file) => file.type.startsWith("image/"))

    const newFiles: UploadFile[] = imageFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "pending",
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: "",
        category: "equirectangular",
        price: 49.99,
        tags: [],
      },
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const updateFileMetadata = (id: string, metadata: Partial<UploadFile["metadata"]>) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, metadata: { ...file.metadata!, ...metadata } } : file)),
    )
  }

  const uploadFiles = async () => {
    if (!supabase) return

    setIsUploading(true)

    for (const uploadFile of files) {
      if (uploadFile.status !== "pending") continue

      try {
        // Update status to uploading
        setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f)))

        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${uploadFile.file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, uploadFile.file)

        if (uploadError) throw uploadError

        // Update status to processing
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "processing", progress: 100 } : f)),
        )

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(fileName)

        // Create preview and watermarked versions (simplified for demo)
        const previewUrl = publicUrl
        const watermarkedUrl = publicUrl

        // Insert into database
        const { error: dbError } = await supabase.from("images").insert({
          title: uploadFile.metadata!.title,
          description: uploadFile.metadata!.description,
          category: uploadFile.metadata!.category,
          price: uploadFile.metadata!.price,
          file_url: publicUrl,
          preview_url: previewUrl,
          thumbnail_url: previewUrl,
          file_size: uploadFile.file.size,
          tags: uploadFile.metadata!.tags,
          active: true,
          featured: false,
          metadata: {
            originalName: uploadFile.file.name,
            mimeType: uploadFile.file.type,
            uploadedAt: new Date().toISOString(),
          },
        })

        if (dbError) throw dbError

        // Update status to completed
        setFiles((prev) => prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "completed" } : f)))
      } catch (error) {
        console.error("Upload error:", error)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
              : f,
          ),
        )
      }
    }

    setIsUploading(false)
  }

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "pending":
        return <ImageIcon className="h-4 w-4 text-muted-foreground" />
      case "uploading":
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
    }
  }

  const getStatusColor = (status: UploadFile["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "uploading":
      case "processing":
        return "default"
      case "completed":
        return "default"
      case "error":
        return "destructive"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Images</h1>
          <p className="text-muted-foreground">Upload and manage your panoramic image collection</p>
        </div>
        {files.length > 0 && (
          <Button
            onClick={uploadFiles}
            disabled={isUploading || files.every((f) => f.status !== "pending")}
            className="gap-2"
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload All ({files.filter((f) => f.status === "pending").length})
          </Button>
        )}
      </div>

      {/* Upload Area */}
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {isDragActive ? "Drop files here" : "Upload Panoramic Images"}
                </h3>
                <p className="text-muted-foreground">
                  Drag and drop your equirectangular or fisheye images, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-2">Supports JPG, PNG, WebP • Max 50MB per file</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Files to Upload</h2>

          {files.map((uploadFile) => (
            <Card key={uploadFile.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Preview */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={uploadFile.preview || "/placeholder.svg"}
                      alt={uploadFile.metadata?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* File Info & Metadata */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(uploadFile.status)}
                        <Badge variant={getStatusColor(uploadFile.status)} className="capitalize">
                          {uploadFile.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        disabled={uploadFile.status === "uploading" || uploadFile.status === "processing"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    {(uploadFile.status === "uploading" || uploadFile.status === "processing") && (
                      <Progress value={uploadFile.progress} className="w-full" />
                    )}

                    {/* Error Message */}
                    {uploadFile.status === "error" && uploadFile.error && (
                      <Alert className="border-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-destructive">{uploadFile.error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Metadata Form */}
                    {uploadFile.status === "pending" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`title-${uploadFile.id}`}>Title</Label>
                          <Input
                            id={`title-${uploadFile.id}`}
                            value={uploadFile.metadata?.title || ""}
                            onChange={(e) => updateFileMetadata(uploadFile.id, { title: e.target.value })}
                            placeholder="Enter image title"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`category-${uploadFile.id}`}>Category</Label>
                          <Select
                            value={uploadFile.metadata?.category}
                            onValueChange={(value: "equirectangular" | "fisheye") =>
                              updateFileMetadata(uploadFile.id, { category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equirectangular">Equirectangular</SelectItem>
                              <SelectItem value="fisheye">Fisheye</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`price-${uploadFile.id}`}>Price ($)</Label>
                          <Input
                            id={`price-${uploadFile.id}`}
                            type="number"
                            step="0.01"
                            value={uploadFile.metadata?.price || 0}
                            onChange={(e) =>
                              updateFileMetadata(uploadFile.id, { price: Number.parseFloat(e.target.value) || 0 })
                            }
                            placeholder="49.99"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`tags-${uploadFile.id}`}>Tags</Label>
                          <Input
                            id={`tags-${uploadFile.id}`}
                            value={uploadFile.metadata?.tags?.join(", ") || ""}
                            onChange={(e) =>
                              updateFileMetadata(uploadFile.id, {
                                tags: e.target.value
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="architecture, urban, 360"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor={`description-${uploadFile.id}`}>Description</Label>
                          <Textarea
                            id={`description-${uploadFile.id}`}
                            value={uploadFile.metadata?.description || ""}
                            onChange={(e) => updateFileMetadata(uploadFile.id, { description: e.target.value })}
                            placeholder="Describe this panoramic image..."
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
