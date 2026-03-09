'use client'

import { useState, useEffect } from 'react'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
}

interface TheatrePhotoUploadResponse {
  success: boolean
  message: string
  image: {
    id: string
    title: string
    content_category: string
  }
  downloadUrl: string
  backblazePath: string
}

export function AdminTheatrePhotoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<TheatrePhotoUploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [grouped, setGrouped] = useState<any>(null)

  // Fetch theatre categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/categories/theatre/all')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.categories)
          setGrouped(data.grouped)
          // Set first category as default
          if (data.categories.length > 0) {
            setCategory(data.categories[0].name)
          }
        }
      } catch (err) {
        console.error('[v0] Failed to fetch theatre categories:', err)
        setError('Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, TIFF, etc.)')
      return
    }

    // Validate file size (max 200MB for panoramic images)
    if (selectedFile.size > 200 * 1024 * 1024) {
      setError('Image file must be smaller than 200MB')
      return
    }

    setFile(selectedFile)
    setError(null)
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!file || !category) {
      setError('Please select both a file and category')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      formData.append('title', title)
      formData.append('description', description)

      const response = await fetch('/api/theatre-photos/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data: TheatrePhotoUploadResponse = await response.json()

      console.log('[v0] Theatre photo uploaded successfully')
      setUploadResult(data)

      // Reset form
      setFile(null)
      setTitle('')
      setDescription('')
      ;(document.querySelector('input[type="file"]') as HTMLInputElement).value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      console.error('[v0] Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-slate-200 font-light mb-2">Theatre Photo (Equirectangular)</label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-400/50 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="theatre-photo-input"
                disabled={isUploading}
              />
              <label htmlFor="theatre-photo-input" className="cursor-pointer block">
                <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="font-light text-sm text-slate-300 mb-1">
                  {file ? file.name : 'Click to select equirectangular image'}
                </p>
                <p className="text-xs text-slate-500">
                  Max 200MB • Supported: PNG, JPG, TIFF, WebP
                </p>
              </label>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-slate-200 font-light mb-2">Theatre Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isUploading || isLoading}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm"
            >
              <option value="">Select a category...</option>
              {grouped && (
                <>
                  <optgroup label="Nature">
                    {grouped.nature?.map((cat: Category) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name.replace('Theatre-', '')}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Culture">
                    {grouped.culture?.map((cat: Category) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name.replace('Theatre-', '')}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Mythic">
                    {grouped.mythic?.map((cat: Category) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name.replace('Theatre-', '')}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Art">
                    {grouped.art?.map((cat: Category) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name.replace('Theatre-', '')}
                      </option>
                    ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-200 font-light mb-2">Title (Optional)</label>
            <input
              type="text"
              placeholder="Theatre photo title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-200 font-light mb-2">Description (Optional)</label>
            <textarea
              placeholder="Theatre photo description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={3}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm resize-none"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || !category || isUploading || isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-light py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading Theatre Photo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Theatre Photo
              </>
            )}
          </button>
        </div>

        {/* Success Display */}
        {uploadResult && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-green-300 font-light">Upload Successful</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-400">Title</p>
                <p className="text-green-300">{uploadResult.image.title}</p>
              </div>

              <div>
                <p className="text-slate-400">Category</p>
                <p className="text-green-300">{uploadResult.image.content_category}</p>
              </div>

              <div>
                <p className="text-slate-400">Backblaze Path</p>
                <p className="text-green-300 font-mono text-xs break-all">{uploadResult.backblazePath}</p>
              </div>

              <div>
                <p className="text-slate-400">Download URL</p>
                <p className="text-green-300 font-mono text-xs break-all">{uploadResult.downloadUrl}</p>
              </div>
            </div>

            <button
              onClick={() => window.open(uploadResult.downloadUrl, '_blank')}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-light py-2 px-4 rounded transition-colors text-sm"
            >
              Preview in Theatre Mode
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
