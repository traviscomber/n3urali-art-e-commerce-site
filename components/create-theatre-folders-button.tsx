'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle, Folder } from 'lucide-react'

interface CreateFoldersResult {
  folder: string
  status?: string
  reason?: string
}

export function CreateTheatreFoldersButton() {
  const [isCreating, setIsCreating] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateFolders = async () => {
    setIsCreating(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/admin/backblaze/create-theatre-folders', {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create theatre folders')
      }

      const data = await response.json()
      console.log('[v0] Theatre folders created:', data)
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folders')
      console.error('[v0] Theatre folder creation error:', err)
    } finally {
      setIsCreating(false)
    }
  }

  if (results) {
    return (
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-green-300 font-light text-lg">Theatre Folders Created Successfully</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Total Folders</p>
            <p className="text-green-300 text-2xl font-light">{results.summary.total}</p>
          </div>
          <div>
            <p className="text-slate-400">Created</p>
            <p className="text-green-300 text-2xl font-light">{results.summary.created}</p>
          </div>
          <div>
            <p className="text-slate-400">Failed</p>
            <p className={results.summary.failed > 0 ? 'text-red-300 text-2xl font-light' : 'text-green-300 text-2xl font-light'}>
              {results.summary.failed}
            </p>
          </div>
        </div>

        {results.results?.failed?.length > 0 && (
          <div className="bg-red-900/20 border border-red-700 rounded p-4">
            <p className="text-red-300 text-sm font-light mb-2">Failed Folders:</p>
            <ul className="text-red-300 text-xs space-y-1">
              {results.results.failed.map((item: CreateFoldersResult, idx: number) => (
                <li key={idx}>{item.folder}: {item.reason}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setResults(null)}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-light py-2 px-4 rounded transition-colors text-sm"
        >
          Create More Theatre Folders
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleCreateFolders}
        disabled={isCreating}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-light py-3 px-4 rounded transition-colors flex items-center justify-center gap-2"
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating 32 Theatre Photo Folders...
          </>
        ) : (
          <>
            <Folder className="h-4 w-4" />
            Create 32 Theatre Photo Folders in Backblaze
          </>
        )}
      </button>

      <p className="text-slate-400 text-sm">
        Creates folders for 4 parent categories (Nature, Culture, Mythic, Art) with 32 subcategories total.
      </p>
    </div>
  )
}
