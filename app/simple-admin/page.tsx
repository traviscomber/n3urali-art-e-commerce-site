'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VideoUploadResponse {
  success: boolean
  url: string
  message: string
}

export default function SimpleAdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [collectionCode, setCollectionCode] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedVideo, setUploadedVideo] = useState<VideoUploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WebM, MOV, etc.)')
      return
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('Video must be smaller than 500MB')
      return
    }

    setFile(selectedFile)
    setError(null)
    setUploadedVideo(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file')
      return
    }

    if (!title.trim()) {
      setError('Please enter a video title')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('collectionCode', collectionCode || 'featured')

      const response = await fetch('/api/admin/videos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = (await response.json()) as VideoUploadResponse

      setUploadedVideo(data)
      toast({
        title: 'Success',
        description: 'Video uploaded successfully!',
      })

      setFile(null)
      setTitle('')
      setCollectionCode('')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMsg)
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-black py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Upload Video</h1>
          <p className="text-lg text-gray-400 font-light">Upload videos for your collections and homepage</p>
        </div>

        <Card className="bg-gray-900/50 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-xl">Video Upload</CardTitle>
            <CardDescription className="text-gray-400">Select and upload your video file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Input */}
            <div className="space-y-2">
              <Label htmlFor="video-file" className="text-gray-300 font-medium">
                Select Video File *
              </Label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition-colors cursor-pointer bg-gray-900/30">
                <input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <label htmlFor="video-file" className="cursor-pointer block">
                  <div className="flex justify-center mb-2">
                    <Upload className="h-8 w-8 text-cyan-400" />
                  </div>
                  <p className="font-semibold text-sm text-white mb-1">
                    {file ? file.name : 'Click to select or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400">Max 500MB • MP4, WebM, MOV formats supported</p>
                </label>
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300 font-medium">
                Video Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Studio Showcase 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
              />
            </div>

            {/* Collection Code */}
            <div className="space-y-2">
              <Label htmlFor="collection" className="text-gray-300 font-medium">
                Collection Code (Optional)
              </Label>
              <Input
                id="collection"
                placeholder="e.g., studio, environments, theatre"
                value={collectionCode}
                onChange={(e) => setCollectionCode(e.target.value)}
                disabled={isUploading}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
              />
              <p className="text-xs text-gray-500">Leave empty to use as featured collection</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading || !title.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white"
              size="lg"
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

        {/* Success Card */}
        {uploadedVideo && (
          <Card className="bg-green-900/20 border border-green-800 mt-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <CardTitle className="text-white">Upload Successful</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-green-300 mb-1">TITLE</p>
                <p className="text-sm text-gray-300">{title}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-green-300 mb-1">COLLECTION</p>
                <p className="text-sm text-gray-300">{collectionCode || 'featured'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-green-300 mb-1">PUBLIC URL</p>
                <code className="text-xs break-all block bg-black/50 p-3 rounded text-cyan-300 font-mono">
                  {uploadedVideo.url}
                </code>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(uploadedVideo.url)
                  toast({
                    title: 'Copied',
                    description: 'URL copied to clipboard',
                  })
                }}
              >
                Copy URL
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer Links */}
        <div className="flex gap-4 justify-center mt-12">
          <Button asChild variant="outline" className="border-gray-700">
            <Link href="/">Back to Site</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
