'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle, AlertCircle, Settings, ArrowRight, Video as VideoIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VideoUploadResponse {
  success: boolean
  publicUrl: string
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
      setError('Please select a valid video file (MP4, WebM, etc.)')
      return
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('Video file must be smaller than 500MB')
      return
    }

    setFile(selectedFile)
    setError(null)
    setUploadedVideo(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file to upload')
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
      formData.append('collectionCode', collectionCode)

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setUploadedVideo(data)
      toast({
        title: 'Success',
        description: 'Video uploaded successfully!',
      })

      // Reset form
      setFile(null)
      setTitle('')
      setCollectionCode('')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMsg)
      toast({
        title: 'Upload failed',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-black py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-light text-white mb-2 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-400 font-light">
            Manage your immersive content and collections
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Video Upload */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Hero Video Section */}
            <Card className="bg-gray-900/50 border border-gray-800">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <VideoIcon className="h-6 w-6 text-cyan-400" />
                  <CardTitle className="text-white">Upload Video</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Upload videos for your homepage hero or collections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Input */}
                <div className="space-y-2">
                  <Label htmlFor="video-file" className="text-gray-300">
                    Select Video File
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
                      <Upload className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
                      <p className="font-semibold text-sm text-white mb-1">
                        {file ? file.name : 'Click to select video or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Max 500MB • MP4, WebM, and other formats supported
                      </p>
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">
                    Video Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Studio Showcase"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                  />
                </div>

                {/* Collection Code */}
                <div className="space-y-2">
                  <Label htmlFor="collection" className="text-gray-300">
                    Collection (Optional)
                  </Label>
                  <Input
                    id="collection"
                    placeholder="e.g., studio, environments, realities"
                    value={collectionCode}
                    onChange={(e) => setCollectionCode(e.target.value)}
                    disabled={isUploading}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty for homepage hero video
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
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

            {/* Quick Start Guide */}
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-800/30">
              <CardHeader>
                <CardTitle className="text-white">Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">1.</span>
                    <span>Select your video file (MP4 or WebM format)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">2.</span>
                    <span>Add a title for your video</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">3.</span>
                    <span>Optionally specify a collection code</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">4.</span>
                    <span>Click Upload - video will be available immediately</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Success Message & Links */}
          <div className="space-y-6">
            {/* Success Message */}
            {uploadedVideo && (
              <Card className="bg-green-900/20 border border-green-800 sticky top-12">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <CardTitle className="text-white">Success!</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-green-300 mb-1">TITLE</p>
                    <p className="text-sm text-gray-300">{title}</p>
                  </div>

                  {collectionCode && (
                    <div>
                      <p className="text-xs font-semibold text-green-300 mb-1">COLLECTION</p>
                      <p className="text-sm text-gray-300">{collectionCode}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-green-300 mb-1">PUBLIC URL</p>
                    <code className="text-xs break-all block bg-black/50 p-2 rounded text-cyan-300 font-mono">
                      {uploadedVideo.publicUrl}
                    </code>
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-xs"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(uploadedVideo.publicUrl)
                      toast({
                        title: 'Copied',
                        description: 'URL copied to clipboard',
                      })
                    }}
                  >
                    Copy URL
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => window.open(uploadedVideo.publicUrl, '_blank')}
                  >
                    Preview Video
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Collections Settings Card */}
            <Card className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-white">Collections</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Manage featured collections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-400">
                  Configure which collections are featured on your site.
                </p>
                <Button asChild variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800/50">
                  <Link href="/admin" className="flex items-center justify-between">
                    Go to Full Admin
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
