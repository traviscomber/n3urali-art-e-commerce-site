'use client'

import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'

interface ImageEditorProps {
  image: any
  onUpdate: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function ImageEditor({
  image,
  onUpdate,
  onDelete,
  isLoading,
}: ImageEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: image.title,
    description: image.description,
    active: image.active,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    await onUpdate(image.id, editData)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete "${image.title}"? This cannot be undone.`)) {
      await onDelete(image.id)
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Image Preview */}
      <div className="aspect-video bg-gray-900 overflow-hidden">
        <img
          src={image.thumbnail_medium_url}
          alt={image.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-500"
            />
            <textarea
              value={editData.description || ''}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-500 h-16 resize-none text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editData.active}
                onChange={(e) =>
                  setEditData({ ...editData, active: e.target.checked })
                }
                className="rounded"
              />
              <span>Active</span>
            </label>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-1 rounded flex items-center justify-center gap-2"
              >
                <Check size={16} /> Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded flex items-center justify-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="font-semibold text-white">{image.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {image.description || 'No description'}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {image.image_format} • {image.active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="p-2 hover:bg-red-900/30 text-red-400 rounded transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
