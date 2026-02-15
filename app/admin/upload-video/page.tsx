'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle, AlertCircle, Settings, ArrowRight, Trash2 } from 'lucide-react'
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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isCleaningDB, setIsCleaningDB] = useState(false)
  const [uploadedVideo, setUploadedVideo] = useState<VideoUploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cleanupResult, setCleanupResult] = useState<{ deleted: number; kept: number } | null>(null)
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

    // Warn if file is larger than 4.5MB (Vercel limit)
    if (file.size > 4.5 * 1024 * 1024) {
      setError('File exceeds Vercel platform limit of 4.5MB. Try compressing the video or uploading a smaller file.')
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('collectionCode', collectionCode || 'featured')

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(percentComplete)
          console.log('[v0] Upload progress:', percentComplete.toFixed(2) + '%')
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        console.log('[v0] Upload complete, status:', xhr.status)
        
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText) as VideoUploadResponse
            console.log('[v0] Upload response:', data)
            
            setUploadProgress(100)
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

            // Reset progress after 2 seconds
            setTimeout(() => setUploadProgress(0), 2000)
          } catch (parseErr) {
            console.error('[v0] Response parse error:', parseErr)
            setError('Server response invalid - check console logs')
          }
        } else if (xhr.status === 413) {
          setError('File too large for upload (Vercel 4.5MB limit). Try a smaller video file.')
          console.error('[v0] 413 Payload Too Large - file exceeds platform limit')
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            const errorMsg = errorData.error || `Upload failed (${xhr.status})`
            setError(errorMsg)
            console.error('[v0] Upload error response:', errorData)
          } catch (e) {
            setError(`Upload failed (${xhr.status}): ${xhr.statusText}`)
            console.error('[v0] Response text:', xhr.responseText)
          }
        }
        
        setUploadProgress(0)
        setIsUploading(false)
        resolve()
      })

      // Handle error
      xhr.addEventListener('error', () => {
        setError('Network error - unable to reach upload server. Check browser console for details.')
        console.error('[v0] XHR error:', xhr.statusText, 'status:', xhr.status)
        setUploadProgress(0)
        setIsUploading(false)
        resolve()
      })

      // Handle abort
      xhr.addEventListener('abort', () => {
        setError('Upload cancelled')
        setUploadProgress(0)
        setIsUploading(false)
        resolve()
      })

      // Start upload
      console.log('[v0] Starting upload to /api/admin/videos/upload', { fileSize: file.size, fileName: file.name })
      xhr.open('POST', '/api/admin/videos/upload', true)
      xhr.send(formData)
    })
  }

  const handleCleanupDatabase = async () => {
    if (!confirm('This will delete all unused images from the database, keeping only images displayed on the page. Continue?')) {
      return
    }

    setIsCleaningDB(true)
    setCleanupResult(null)

    try {
      const response = await fetch('/api/admin/cleanup-database', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Cleanup failed')
      }

      const data = await response.json()
      setCleanupResult(data)

      toast({
        title: 'Cleanup Complete',
        description: `Deleted ${data.deleted} unused images. Kept ${data.kept} images in use.`,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Cleanup failed'
      toast({
        title: 'Cleanup Error',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setIsCleaningDB(false)
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
            Manage your immersive content and database
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <Button
            className="bg-cyan-600 hover:bg-cyan-700 text-white whitespace-nowrap"
            onClick={() => {
              document.getElementById('upload-video-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800/50 whitespace-nowrap"
            onClick={() => {
              document.getElementById('cleanup-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clean Database
          </Button>
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800/50 whitespace-nowrap ml-auto"
            asChild
          >
            <Link href="/admin/videos">Videos Manager</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Video Card */}
            <Card id="upload-video-section" className="bg-gray-900/50 border border-gray-800 scroll-mt-8">
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

                {/* Progress Bar */}
                {isUploading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Uploading</span>
                      <span className="text-cyan-400 font-semibold">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

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

            {/* Database Cleanup Card */}
            <Card id="cleanup-section" className="bg-gray-900/50 border border-gray-800 scroll-mt-8">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Trash2 className="h-6 w-6 text-orange-400" />
                  <CardTitle className="text-white">Clean Database</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Remove unused images and optimize storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">
                  This will delete all images from the database that are not currently displayed on any page. Only images actively in use will be kept.
                </p>

                {cleanupResult && (
                  <div className="flex items-start gap-3 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-300 text-sm mb-1">Cleanup Complete</p>
                      <p className="text-xs text-green-200">
                        Deleted {cleanupResult.deleted} unused images • Kept {cleanupResult.kept} images in use
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCleanupDatabase}
                  disabled={isCleaningDB}
                  variant="outline"
                  className="w-full border-orange-800 text-orange-400 hover:bg-orange-900/20"
                >
                  {isCleaningDB ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clean Up Unused Images
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Start Guide */}
            <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-800/30">
              <CardHeader>
                <CardTitle className="text-white">Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">1.</span>
                    <span>Upload video or clean database using buttons above</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">2.</span>
                    <span>Videos appear immediately on your site</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-400 font-semibold flex-shrink-0 w-6">3.</span>
                    <span>Database cleanup removes orphaned images</span>
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

            {/* Collections Manager Link */}
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
