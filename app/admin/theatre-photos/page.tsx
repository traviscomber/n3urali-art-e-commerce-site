'use client'

import { AdminTheatrePhotoUpload } from '@/components/admin-theatre-photo-upload'
import { CreateTheatreFoldersButton } from '@/components/create-theatre-folders-button'

export default function AdminTheatrePhotos() {
  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Backblaze Setup Section */}
        <div>
          <h2 className="text-3xl font-light text-slate-100 mb-4">Backblaze Setup</h2>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
            <p className="text-slate-300">
              Create all 32 theatre photo (equirectangular) category folders in Backblaze B2. Each folder corresponds to one of the video categories and uses the same 4 parent categories.
            </p>
            <CreateTheatreFoldersButton />
          </div>
        </div>

        {/* Theatre Photo Management Section */}
        <div>
          <h1 className="text-3xl font-light text-slate-100 mb-2">Theatre Photo Management</h1>
          <p className="text-slate-400 mb-4">Upload and manage equirectangular photos across the 32 theatre categories</p>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 mb-6">
            <p className="mb-2"><strong>How it works:</strong></p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Select a category from Nature, Culture, Mythic, or Art (same as video categories)</li>
              <li>Upload your equirectangular/panoramic image file (PNG, JPG, TIFF, WebP)</li>
              <li>Image is recorded in database with Backblaze path</li>
              <li>Images automatically appear in Theatre Mode</li>
              <li>Auto-rotates related images every 30 seconds in Theatre player</li>
            </ul>
          </div>
        </div>

        {/* Upload Component */}
        <AdminTheatrePhotoUpload />
      </div>
    </div>
  )
}
