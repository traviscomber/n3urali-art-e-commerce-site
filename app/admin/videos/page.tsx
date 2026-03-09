'use client'

import { AdminVideoUpload } from '@/components/admin-video-upload'

export default function VideoUploadAdmin() {
  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-slate-100 mb-2">Video Management</h1>
          <p className="text-slate-400 mb-4">Upload and manage videos across the 32 video categories</p>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-300">
            <p className="mb-2"><strong>How it works:</strong></p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Select a category from Nature, Culture, Mythic, or Art</li>
              <li>Upload your video file (MP4, WebM, MOV, etc.)</li>
              <li>Video is recorded in database with Backblaze path</li>
              <li>Upload file to Backblaze at the provided path</li>
              <li>Video appears automatically in environments gallery</li>
            </ul>
          </div>
        </div>
        <AdminVideoUpload />
      </div>
    </div>
  )
}
