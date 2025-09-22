"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface DownloadItem {
  id: string
  token: string
  imageTitle: string
  licenseName: string
  downloadsRemaining: number
  maxDownloads: number
  expiresAt: string
  status: "available" | "downloading" | "completed" | "expired"
}

interface DownloadManagerProps {
  downloads: DownloadItem[]
  onDownload: (token: string) => Promise<void>
}

export function DownloadManager({ downloads, onDownload }: DownloadManagerProps) {
  const [downloadingTokens, setDownloadingTokens] = useState<Set<string>>(new Set())

  const handleDownload = async (token: string) => {
    setDownloadingTokens((prev) => new Set(prev).add(token))
    try {
      await onDownload(token)
    } finally {
      setDownloadingTokens((prev) => {
        const newSet = new Set(prev)
        newSet.delete(token)
        return newSet
      })
    }
  }

  const getStatusBadge = (item: DownloadItem) => {
    const isExpired = new Date(item.expiresAt) < new Date()
    const isExhausted = item.downloadsRemaining <= 0

    if (isExpired) {
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      )
    }

    if (isExhausted) {
      return (
        <Badge variant="secondary">
          <CheckCircle className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      )
    }

    return (
      <Badge variant="default">
        <Download className="h-3 w-3 mr-1" />
        Available
      </Badge>
    )
  }

  const isDownloadDisabled = (item: DownloadItem) => {
    const isExpired = new Date(item.expiresAt) < new Date()
    const isExhausted = item.downloadsRemaining <= 0
    const isDownloading = downloadingTokens.has(item.token)

    return isExpired || isExhausted || isDownloading
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Downloads</h3>
        <Badge variant="secondary">{downloads.length} items</Badge>
      </div>

      {downloads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Downloads Available</h3>
            <p className="text-muted-foreground">Purchase some images to see your download links here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {downloads.map((item) => {
            const isDownloading = downloadingTokens.has(item.token)
            const progressValue = ((item.maxDownloads - item.downloadsRemaining) / item.maxDownloads) * 100

            return (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.imageTitle}</CardTitle>
                    {getStatusBadge(item)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">License:</span>
                    <Badge variant="outline">{item.licenseName}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Downloads:</span>
                      <span>
                        {item.downloadsRemaining} of {item.maxDownloads} remaining
                      </span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <span>{new Date(item.expiresAt).toLocaleDateString()}</span>
                  </div>

                  <Button
                    onClick={() => handleDownload(item.token)}
                    disabled={isDownloadDisabled(item)}
                    className="w-full"
                    variant={isDownloadDisabled(item) ? "secondary" : "default"}
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </>
                    )}
                  </Button>

                  {new Date(item.expiresAt) < new Date() && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      This download link has expired
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
