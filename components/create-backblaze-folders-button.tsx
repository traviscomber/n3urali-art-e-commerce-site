'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FolderResult {
  path: string
  status: 'success' | 'failed'
  error?: string
}

export function CreateBackblazeFoldersButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<FolderResult[]>([])
  const [summary, setSummary] = useState<any>(null)
  const { toast } = useToast()

  const handleCreateFolders = async () => {
    setIsLoading(true)
    setResults([])
    setSummary(null)

    try {
      const response = await fetch('/api/admin/backblaze/create-folders', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create folders')
      }

      const data = await response.json()
      setSummary(data)
      setResults(data.results || [])

      if (data.failed === 0) {
        toast({
          title: 'Success!',
          description: `Created all ${data.created} video category folders in Backblaze`,
        })
      } else {
        toast({
          title: 'Partial Success',
          description: `Created ${data.created} folders, ${data.failed} failed`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[v0] Error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create folders',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleCreateFolders}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Folders...
          </>
        ) : (
          'Create All 32 Backblaze Folders'
        )}
      </Button>

      {summary && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-100">{summary.total}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-1">Created</p>
              <p className="text-2xl font-bold text-green-400">{summary.created}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">{summary.failed}</p>
            </div>
          </div>

          {results.length > 0 && (
            <div className="max-h-64 overflow-y-auto space-y-1 text-xs">
              {results.map((result, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  {result.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="flex-1 break-all">
                    {result.path}
                    {result.error && <span className="text-red-300"> - {result.error}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
