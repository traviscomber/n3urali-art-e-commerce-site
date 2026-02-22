'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { parseFilenameMetadata } from '@/lib/parse-filename'

interface FileUploadProps {
  onUpload: (file: File, metadata: any) => Promise<void>
  isLoading?: boolean
}

export function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    imageFormat: 'equirectangular',
    contentCategory: 'theatre',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      
      // Auto-parse filename to populate metadata
      const { title, description } = parseFilenameMetadata(file.name)
      setMetadata(prev => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
      }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      
      // Auto-parse filename to populate metadata
      const { title, description } = parseFilenameMetadata(file.name)
      setMetadata(prev => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] handleSubmit called")
    console.log("[v0] selectedFile:", selectedFile?.name)
    console.log("[v0] metadata:", metadata)
    
    if (!selectedFile || !metadata.title) {
      console.log("[v0] Missing file or title, aborting")
      alert('Please select a file and enter a title')
      return
    }

    console.log("[v0] Calling onUpload callback")
    await onUpload(selectedFile, metadata)
    console.log("[v0] Upload callback completed")
    
    setSelectedFile(null)
    setMetadata({
      title: '',
      description: '',
      imageFormat: 'equirectangular',
      contentCategory: 'theatre',
    })
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Upload Panoramic Image</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleChange}
            accept="image/*"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2"
          >
            <Upload size={32} className="text-gray-400" />
            <p className="text-gray-300">
              {selectedFile ? selectedFile.name : 'Drag and drop or click to upload'}
            </p>
            <p className="text-sm text-gray-500">PNG, JPG, WEBP (equirectangular format)</p>
          </div>
        </div>

        {selectedFile && (
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="text-sm text-gray-400 hover:text-red-400 flex items-center gap-1"
          >
            <X size={16} /> Clear file
          </button>
        )}

        {/* Metadata Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g., Alpine Valley Panorama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={metadata.description}
              onChange={(e) =>
                setMetadata({ ...metadata, description: e.target.value })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500 h-20 resize-none"
              placeholder="Describe the panoramic experience..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Format</label>
              <select
                value={metadata.imageFormat}
                onChange={(e) =>
                  setMetadata({ ...metadata, imageFormat: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="equirectangular">360° Equirectangular</option>
                <option value="fisheye">180° Fisheye</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={metadata.contentCategory}
                onChange={(e) =>
                  setMetadata({ ...metadata, contentCategory: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="theatre">Theatre</option>
                <option value="environments">Environments</option>
                <option value="studio">Studio</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={(e) => {
            console.log("[v0] Submit button clicked")
          }}
          disabled={!selectedFile || isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 rounded transition-colors"
        >
          {isLoading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
    </div>
  )
}
