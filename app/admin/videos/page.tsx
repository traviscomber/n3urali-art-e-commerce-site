"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VideoUploadResponse {
  success: boolean
  publicUrl: string
  filePath: string
  title?: string
  description?: string
  collectionCode?: string
}

export default function VideoUploadAdmin() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [collectionCode, setCollectionCode] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedVideo, setUploadedVideo] = useState<VideoUploadResponse | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please select a video file (MP4, WebM, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 500MB)
    if (selectedFile.size > 500 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video file must be smaller than 500MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setUploadedVideo(null)
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("collectionCode", collectionCode)

      const response = await fetch("/api/admin/videos/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setUploadedVideo(data)
      toast({
        title: "Success",
        description: "Video uploaded successfully",
      })

      // Reset form
      setFile(null)
      setTitle("")
      setDescription("")
      setCollectionCode("")
      ;(document.querySelector('input[type="file"]') as HTMLInputElement).value = ""
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Video</CardTitle>
            <CardDescription>Upload a video to Supabase Storage and link to a collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Input */}
            <div className="space-y-2">
              <Label htmlFor="video-file">Video File</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                <input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <label htmlFor="video-file" className="cursor-pointer block">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-semibold text-sm mb-1">
                    {file ? file.name : "Click to select video"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max 500MB • MP4, WebM, and other video formats supported
                  </p>
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Video description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                rows={3}
              />
            </div>

            {/* Collection Code */}
            <div className="space-y-2">
              <Label htmlFor="collection">Collection Code (Optional)</Label>
              <Input
                id="collection"
                placeholder="e.g., studio, environments, realities"
                value={collectionCode}
                onChange={(e) => setCollectionCode(e.target.value)}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Link this video to a specific collection
              </p>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Success Display */}
        {uploadedVideo && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle>Upload Successful</CardTitle>
              </div>
              <CardDescription>Your video is ready to use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadedVideo.title && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Title</p>
                  <p className="text-sm">{uploadedVideo.title}</p>
                </div>
              )}

              {uploadedVideo.description && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Description</p>
                  <p className="text-sm">{uploadedVideo.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-muted-foreground">Collection</p>
                <p className="text-sm">{uploadedVideo.collectionCode || "General"}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground">Storage Path</p>
                <p className="text-xs font-mono break-all text-muted-foreground">
                  {uploadedVideo.filePath}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Public URL</p>
                <div className="bg-background rounded p-2 space-y-2">
                  <code className="text-xs break-all block text-muted-foreground">
                    {uploadedVideo.publicUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(uploadedVideo.publicUrl)
                      toast({
                        title: "Copied",
                        description: "URL copied to clipboard",
                      })
                    }}
                  >
                    Copy URL
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(uploadedVideo.publicUrl, "_blank")}
              >
                Preview Video
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
