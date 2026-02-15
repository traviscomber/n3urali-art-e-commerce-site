'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle, AlertCircle, Settings, ArrowRight } from 'lucide-react'
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

      // Reset form
      setFile(null)
      setTitle('')
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-light text-white mb-2 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-400 font-light">
            Manage your immersive content
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Video Upload */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Video Section */}
            <Card className="bg-gray-900/50 border border-gray-800">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Upload className="h-6 w-6 text-cyan-400" />
                  <CardTitle className="text-white">Upload Video</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Upload videos for your homepage or collections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Input */}
                <div className="space-y-2">
                  <Label htmlFor="video-file" className="text-gray-300 font-medium">
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
                      <div className="flex justify-center mb-2">
                        <Upload className="h-8 w-8 text-cyan-400" />
                      </div>
                      <p className="font-semibold text-sm text-white mb-1">
                        {file ? file.name : 'Click to select or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Max 500MB • MP4, WebM, MOV, and other formats
                      </p>
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

                {/* Collection Code Input */}
                <div className="space-y-2">
                  <Label htmlFor="collection" className="text-gray-300 font-medium">
                    Collection Code (Optional)
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
                    Defaults to featured collection if empty
                  </p>
                </div>

                {/* Error Display */}
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

            {/* Quick Start */}
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-800/30">
              <CardHeader>
                <CardTitle className="text-white">Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">1.</span>
                    <span>Select your video file</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">2.</span>
                    <span>Enter a video title</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">3.</span>
                    <span>Optionally add collection code</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">4.</span>
                    <span>Click Upload - video is ready immediately</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Success Card */}
            {uploadedVideo && (
              <Card className="bg-green-900/20 border border-green-800 sticky top-12">
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
                    <code className="text-xs break-all block bg-black/50 p-2 rounded text-cyan-300 font-mono">
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

            {/* Collections Link */}
            <Card className="bg-gray-900/50 border border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-6 w-6 text-purple-400" />
                  <CardTitle className="text-white text-sm">Collections</CardTitle>
                </div>
                <CardDescription className="text-gray-400 text-xs">
                  Manage featured collections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-400">
                  Configure which collections appear on your site.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800/50"
                >
                  <Link href="/admin/videos" className="flex items-center justify-between">
                    Videos Manager
                    <ArrowRight className="w-3 h-3" />
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
