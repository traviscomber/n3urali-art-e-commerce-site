'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/contexts/language-context'

interface Category {
  id: string
  name: string
  description?: string
}

export function AdminVideoUpload() {
  const { t } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [title, setTitle] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories/all')
        const data = await response.json()
        if (data.categories) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error('[v0] Error loading categories:', error)
        setMessage({ type: 'error', text: 'Failed to load categories' })
      }
    }

    loadCategories()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        setMessage({ type: 'error', text: 'Please select a video file' })
        return
      }
      setVideoFile(file)
      setMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory || !title || !videoFile) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('categoryId', selectedCategory)
      formData.append('title', title)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(Math.round(percentComplete))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setMessage({
            type: 'success',
            text: `Video uploaded! Next step: Upload file to Backblaze at path: ${response.uploadPath}`,
          })
          setTitle('')
          setVideoFile(null)
          setSelectedCategory('')
          setUploadProgress(0)
        } else {
          const error = JSON.parse(xhr.responseText)
          setMessage({ type: 'error', text: error.error || 'Upload failed' })
        }
        setLoading(false)
      })

      xhr.addEventListener('error', () => {
        setMessage({ type: 'error', text: 'Network error during upload' })
        setLoading(false)
      })

      xhr.open('POST', '/api/videos/upload')
      xhr.send(formData)
    } catch (error) {
      console.error('[v0] Error uploading video:', error)
      setMessage({ type: 'error', text: 'Failed to upload video' })
      setLoading(false)
    }
  }

  // Group categories by parent
  const groupedCategories = {
    Nature: categories.filter((cat) =>
      ['Ocean-Surreal', 'Ocean-Underwater-Life', 'Insects', 'Beads'].includes(cat.name)
    ),
    Culture: categories.filter((cat) =>
      ['Turkey', 'Japan', 'Halloween', 'Indonesia-Tribes', 'Thailand', 'Australia',
        'Indonesian-Temples', 'Africa', 'Chile-Tribes', 'Argentina-Rio', 'Korea',
        'Galleries', 'Vietnam-Theatre', 'India-Taj-Mahal'].includes(cat.name)
    ),
    Mythic: categories.filter((cat) =>
      ['Mythic-Indonesia', 'Mythic-Chile'].includes(cat.name)
    ),
    Art: categories.filter((cat) =>
      ['Bosch-Graspher', 'Faces', 'Golden-Objects', 'Shapes', 'Children', 'Architecture',
        'Silver-Techno', 'Bifi-Geometry', 'Tunnels', 'Uncategorized'].includes(cat.name)
    ),
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Upload Video to Category</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Video Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100 placeholder-slate-500"
          />
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100"
          >
            <option value="">Select a category</option>
            {Object.entries(groupedCategories).map(([parent, cats]) => (
              <optgroup key={parent} label={parent}>
                {cats.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-slate-100"
          />
          {videoFile && (
            <p className="text-sm text-cyan-400 mt-2">
              Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-cyan-400 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded ${
              message.type === 'success'
                ? 'bg-green-900/30 border border-green-700 text-green-300'
                : 'bg-red-900/30 border border-red-700 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedCategory || !title || !videoFile}
          className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
        >
          {loading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-3">Next Steps:</h3>
        <ol className="text-sm text-slate-400 space-y-2">
          <li>1. Upload video to Backblaze using the path provided after upload</li>
          <li>2. Video will appear in the environments gallery in the selected category</li>
          <li>3. Users can click to view video in the detail player</li>
        </ol>
      </div>
    </div>
  )
}
