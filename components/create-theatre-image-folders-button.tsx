'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface FolderResult {
  path: string
  status: 'created' | 'failed' | 'error'
  error?: string
}

export function CreateTheatreImageFoldersButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateFolders = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/admin/setup/create-theatre-folders', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create folders')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  if (results) {
    return (
      <div className="space-y-4">
        <div className={`border rounded-lg p-4 ${results.success ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
          <div className="flex items-center gap-2 mb-3">
            {results.success ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <h3 className="font-semibold text-slate-100">
              {results.success ? 'All Folders Created Successfully' : 'Some Folders Failed'}
            </h3>
          </div>

          <div className="text-sm text-slate-300 space-y-1 mb-3">
            <p>Total: {results.total}</p>
            <p className="text-green-400">Created: {results.created}</p>
            {results.failed > 0 && <p className="text-red-400">Failed: {results.failed}</p>}
          </div>

          <div className="max-h-96 overflow-y-auto bg-black/30 rounded p-3 text-xs font-mono text-slate-400 space-y-1 mb-3">
            {results.folders.map((folder: FolderResult, idx: number) => (
              <div key={idx} className={folder.status === 'created' ? 'text-green-400' : 'text-red-400'}>
                {folder.status === 'created' ? '✓' : '✗'} {folder.path}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => setResults(null)} variant="outline" className="w-full">
          Create More Folders
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-slate-100">Error Creating Folders</h3>
          </div>
          <p className="text-sm text-red-300 mb-3">{error}</p>
        </div>
        <Button onClick={() => setError(null)} variant="outline" className="w-full">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleCreateFolders}
      disabled={isLoading}
      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Creating 32 Theatre Image Folders...
        </>
      ) : (
        'Create All 32 Theatre Image Folders'
      )}
    </Button>
  )
}
