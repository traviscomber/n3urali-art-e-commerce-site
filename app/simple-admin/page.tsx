'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

// Mark this page as dynamic since it uses client-side hooks and interacts with dynamic data
export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)

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

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url || !title) {
      alert('URL and Title are required')
      return
    }

    try {
      setSubmitting(true)
      
      // Extract fileId from B2 URL to reduce storage size
      let finalUrl = url.trim()
      let fileId = finalUrl
      
      // Check if it's a B2 API download URL
      const fileIdMatch = finalUrl.match(/fileId=([^&]+)/)
      if (fileIdMatch && fileIdMatch[1]) {
        fileId = fileIdMatch[1]
        console.log('[v0] Extracted fileId:', fileId)
      }
      
      // Reconstruct clean B2 URL
      const cleanUrl = `https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=${fileId}`
      
      const saveRes = await fetch('/api/admin/featured-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          original_url: cleanUrl,
          upscaled_url: cleanUrl,
          thumbnail_medium_url: cleanUrl,
          thumbnail_small_url: cleanUrl,
          file_path: fileId,
          image_format: 'equirectangular',
          content_category: 'theatre',
          active: true,
        }),
      })

      console.log('[v0] Database status:', saveRes.status)
      
      if (!saveRes.ok) {
        const errData = await saveRes.json()
        throw new Error(errData.error || 'Failed to save image')
      }

      console.log('[v0] Image saved successfully!')
      alert('Image added successfully!')
      
      // Reset form
      setUrl('')
      setTitle('')
      setDescription('')
      
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

  const syncTheatreFromBackblaze = async (clearExisting: boolean = false) => {
    try {
      setSyncing(true)
      setSyncResult(null)
      
      const res = await fetch('/api/admin/sync/theatre-from-backblaze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearExisting }),
      })
      
      const data = await res.json()
      setSyncResult(data)
      
      if (data.success) {
        alert(`Sync successful! Imported: ${data.summary.imported}, Skipped: ${data.summary.skipped}`)
        loadImages()
      } else {
        alert(`Sync failed: ${data.error}`)
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Sync failed'))
      setSyncResult({ error: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

        {/* Sync Theatre Images from Backblaze */}
        <div className="bg-blue-950 p-6 rounded-lg mb-8 border border-blue-700">
          <h2 className="text-xl text-white mb-4">Sync Theatre Images from Backblaze</h2>
          <p className="text-slate-300 text-sm mb-4">Scans THEATRE/Categories/ folder and imports all images to the database.</p>
          <div className="flex gap-4">
            <button
              onClick={() => syncTheatreFromBackblaze(false)}
              disabled={syncing}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 font-semibold"
            >
              {syncing ? 'Syncing...' : 'Sync Images'}
            </button>
            <button
              onClick={() => {
                if (confirm('This will DELETE all existing theatre images first, then re-import. Continue?')) {
                  syncTheatreFromBackblaze(true)
                }
              }}
              disabled={syncing}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 font-semibold"
            >
              {syncing ? 'Syncing...' : 'Clear & Sync All'}
            </button>
          </div>
          {syncResult && (
            <div className="mt-4 p-4 bg-slate-800 rounded border border-slate-600">
              {syncResult.success ? (
                <div className="text-green-400">
                  <p className="font-semibold">✓ Sync Successful</p>
                  <p>Total files in theatre: {syncResult.summary.totalFilesInTheatre}</p>
                  <p>Image files: {syncResult.summary.imageFiles}</p>
                  <p>Imported: {syncResult.summary.imported}</p>
                  <p>Skipped: {syncResult.summary.skipped}</p>
                </div>
              ) : (
                <p className="text-red-400">Error: {syncResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Add Image from Backblaze URL */}
        <div className="bg-slate-900 p-6 rounded-lg mb-8 border border-slate-700">
          <h2 className="text-xl text-white mb-4">Add Image from Backblaze</h2>
          <form onSubmit={handleAddImage} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Backblaze URL *</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://f005.backblazeb2.com/file/Neuraliart/PICS/Theatre/..."
                className="w-full p-3 border border-slate-600 rounded bg-slate-800 text-white placeholder-slate-500 font-mono text-sm"
                required
              />
              <p className="text-slate-400 text-xs mt-1">Paste the full Backblaze URL with spaces encoded as + or %20</p>
            </div>
            
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ocean - Elemental Collection"
                className="w-full p-3 border border-slate-600 rounded bg-slate-800 text-white placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="w-full p-3 border border-slate-600 rounded bg-slate-800 text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded font-semibold"
            >
              {submitting ? 'Adding...' : 'Add Image'}
            </button>
          </form>
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
                  src={img.thumbnail_medium_url || img.thumbnail_url || img.original_url}
                  alt={img.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23333" width="200" height="200"/%3E%3Ctext x="50%" y="50%" fill="%23999" font-size="14" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E'
                  }}
                />
                <div className="p-4">
                  <h3 className="text-white font-bold">{img.title}</h3>
                  <p className="text-slate-400 text-sm">{img.description}</p>
                  <p className="text-slate-500 text-xs mt-2 break-all">{img.original_url}</p>
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
