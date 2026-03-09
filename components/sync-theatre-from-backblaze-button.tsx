'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SyncResult {
  file: string
  category: string
  status: 'imported' | 'skipped' | 'failed'
  reason?: string
  error?: string
}

interface SyncResponse {
  success: boolean
  summary?: {
    totalFilesInTheatre: number
    imageFiles: number
    imported: number
    skipped: number
    failed: number
  }
  results?: SyncResult[]
  error?: string
}

export function SyncTheatreFromBackblazeButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SyncResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/admin/sync/theatre-from-backblaze', {
        method: 'POST',
      })

      const data: SyncResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }

      setResults(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Import Theatre Photos from Backblaze</h3>
        <p className="text-sm text-slate-400 mb-4">
          Scans the THEATRE/Categories/ folder in Backblaze and imports all images to Supabase with their correct category tags.
        </p>
        <Button
          onClick={handleSync}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Syncing...' : 'Sync Theatre Photos from Backblaze'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded p-4 text-red-200">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {results && (
        <div className="bg-slate-900 border border-slate-700 rounded p-4 space-y-3">
          <div className="bg-green-900/30 border border-green-700 rounded p-3">
            <p className="font-semibold text-green-200">Sync Complete!</p>
            <div className="text-sm text-green-100 mt-2 space-y-1">
              <p>Total files in THEATRE folder: {results.summary?.totalFilesInTheatre}</p>
              <p>Image files found: {results.summary?.imageFiles}</p>
              <p className="text-green-300 font-semibold">Imported: {results.summary?.imported}</p>
              {results.summary?.skipped ? (
                <p className="text-yellow-300">Skipped (already imported): {results.summary.skipped}</p>
              ) : null}
              {results.summary?.failed ? (
                <p className="text-red-300">Failed: {results.summary.failed}</p>
              ) : null}
            </div>
          </div>

          {results.results && results.results.length > 0 && (
            <details className="cursor-pointer">
              <summary className="font-semibold text-slate-300 hover:text-slate-100">
                View Details ({results.results.length} files)
              </summary>
              <div className="mt-3 space-y-1 text-xs text-slate-400 bg-slate-800 rounded p-3 max-h-64 overflow-y-auto">
                {results.results.map((result, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {result.file} ({result.category})
                    </span>
                    <span
                      className={
                        result.status === 'imported'
                          ? 'text-green-400'
                          : result.status === 'skipped'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }
                    >
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
