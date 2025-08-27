"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Clock, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface UserDownload {
  order_id: number
  image_title: string
  license_type: string
  download_count: number
  download_limit: number
  order_date: string
  can_download: boolean
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<UserDownload[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    fetchDownloads()
  }, [])

  const fetchDownloads = async () => {
    try {
      const response = await fetch("/api/downloads/user")
      if (!response.ok) throw new Error("Failed to fetch downloads")

      const data = await response.json()
      setDownloads(data.downloads)
    } catch (error) {
      console.error("Error fetching downloads:", error)
      toast.error("Failed to load downloads")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (orderItemId: number, imageTitle: string) => {
    setDownloadingIds((prev) => new Set(prev).add(orderItemId))

    try {
      // Generate download token
      const response = await fetch("/api/download/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId }),
      })

      if (!response.ok) throw new Error("Failed to generate download link")

      const data = await response.json()

      // Open download in new tab
      window.open(data.downloadUrl, "_blank")
      toast.success(`Download started for ${imageTitle}`)

      // Refresh downloads to update counts
      setTimeout(fetchDownloads, 1000)
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to start download")
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(orderItemId)
        return newSet
      })
    }
  }

  const getLicenseBadgeColor = (license: string) => {
    switch (license) {
      case "standard":
        return "bg-blue-100 text-blue-800"
      case "extended":
        return "bg-purple-100 text-purple-800"
      case "commercial":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Downloads</h1>
        <p className="text-muted-foreground">Access and re-download your purchased images</p>
      </div>

      {downloads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No downloads yet</h3>
            <p className="text-muted-foreground mb-4">Purchase some images to see them here</p>
            <Button asChild>
              <a href="/gallery">Browse Gallery</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {downloads.map((download) => (
            <Card key={`${download.order_id}-${download.image_title}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{download.image_title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      Purchased {new Date(download.order_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getLicenseBadgeColor(download.license_type)}>
                    {download.license_type.charAt(0).toUpperCase() + download.license_type.slice(1)} License
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {download.download_count}/{download.download_limit} downloads used
                    </span>
                    {download.can_download && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Available
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => handleDownload(download.order_id, download.image_title)}
                      disabled={!download.can_download || downloadingIds.has(download.order_id)}
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {downloadingIds.has(download.order_id) ? "Generating..." : "Download"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
