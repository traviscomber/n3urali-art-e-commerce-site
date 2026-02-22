'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { parseFilenameMetadata } from '@/lib/parse-filename'

export default function AdminPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    console.log('[v0] Page loaded')
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      console.log('[v0] Loading images...')
      const res = await fetch('/api/admin/featured-images?all=true')
      const data = await res.json()
      console.log('[v0] Images loaded:', data)
      setImages(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      console.error('[v0] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: any) => {
    if (!e.target.files?.[0]) return

    const file = e.target.files[0]
    console.log('[v0] File selected:', file.name)
    
    // Parse filename to auto-fill title and description
    const { title: autoTitle, description: autoDescription } = parseFilenameMetadata(file.name)
    console.log('[v0] Parsed metadata - title:', autoTitle, 'description:', autoDescription)
    
    uploadFile(file, autoTitle, autoDescription)
  }

  const uploadFile = async (file: File, autoTitle: string, autoDescription: string) => {
    try {
      setSubmitting(true)
      console.log('[v0] Upload started for:', file.name)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'PICS/Theatre')
      formData.append('title', autoTitle)
      formData.append('description', autoDescription)
      formData.append('imageFormat', 'equirectangular')
      formData.append('contentCategory', 'theatre')

      console.log('[v0] Uploading to Backblaze...')
      const uploadRes = await fetch('/api/admin/upload-to-b2', {
        method: 'POST',
        body: formData,
      })

      console.log('[v0] B2 status:', uploadRes.status)
      console.log('[v0] B2 content-type:', uploadRes.headers.get('content-type'))
      
      const responseText = await uploadRes.text()
      console.log('[v0] B2 raw response (first 500 chars):', responseText.substring(0, 500))
      
      let uploadData
      try {
        uploadData = JSON.parse(responseText)
      } catch (parseErr) {
        console.error('[v0] Failed to parse B2 response as JSON:', parseErr)
        throw new Error(`B2 returned invalid JSON: ${responseText.substring(0, 200)}`)
      }
      
      console.log('[v0] B2 response:', uploadData)

      if (!uploadRes.ok) throw new Error(uploadData.error || 'B2 upload failed')

      console.log('[v0] Saving to database...')
      const saveRes = await fetch('/api/admin/featured-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...uploadData.imageData, active: true }),
      })

      console.log('[v0] Database status:', saveRes.status)
      if (!saveRes.ok) throw new Error('Database save failed')

      console.log('[v0] Upload complete!')
      alert('Upload successful!')
      loadImages()
    } catch (err) {
      console.error('[v0] Error:', err)
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  const deleteImage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/images/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      alert('Deleted!')
      loadImages()
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Delete failed'))
    }
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

        {/* Upload */}
        <div className="bg-slate-900 p-6 rounded-lg mb-8 border border-slate-700">
          <h2 className="text-xl text-white mb-4">Upload Image to Backblaze</h2>
          <p className="text-slate-300 text-sm mb-4">Title and description are auto-filled from filename</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={submitting}
            className="block w-full text-white p-2 border border-slate-600 rounded bg-slate-800"
          />
          {submitting && <p className="text-blue-400 mt-2">Uploading...</p>}
        </div>

        {/* Images */}
        <h2 className="text-2xl text-white mb-4">Images ({images.length})</h2>
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : images.length === 0 ? (
          <p className="text-white">No images</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <div key={img.id} className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                <img
                  src={img.thumbnail_medium_url || img.thumbnail_url}
                  alt={img.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-white font-bold">{img.title}</h3>
                  <p className="text-slate-400 text-sm">{img.description}</p>
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
