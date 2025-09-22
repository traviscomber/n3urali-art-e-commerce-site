"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Eye, Clock, CheckCircle, AlertTriangle, Ban, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface UserDownload {
  order_item_id: string
  image_title: string
  license_name: string
  download_count: number
  download_limit: number
  order_date: string
  can_download: boolean
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<UserDownload[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchDownloads()
  }, [])

  const fetchDownloads = async () => {
    try {
      console.log("[v0] Fetching user downloads...")
      const response = await fetch("/api/downloads/user")
      console.log("[v0] Downloads response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Downloads fetch failed:", errorText)
        throw new Error("Failed to fetch downloads")
      }

      const data = await response.json()
      console.log("[v0] Downloads data:", data)
      setDownloads(data.downloads)
    } catch (error) {
      console.error("[v0] Error fetching downloads:", error)
      toast.error("Failed to load downloads")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (
    orderItemId: string,
    imageTitle: string,
    canDownload: boolean,
    downloadCount: number,
    downloadLimit: number,
  ) => {
    if (!canDownload) {
      if (downloadCount >= downloadLimit) {
        toast.error(`Download limit reached for ${imageTitle}. You have used all ${downloadLimit} downloads.`)
      } else {
        toast.error("Download not available. Please check your order status.")
      }
      return
    }

    console.log("[v0] Starting download for order item:", orderItemId)
    setDownloadingIds((prev) => new Set(prev).add(orderItemId))

    try {
      console.log("[v0] Generating download token...")
      const response = await fetch("/api/download/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId }),
      })

      console.log("[v0] Generate token response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Token generation failed:", errorText)

        if (response.status === 403) {
          toast.error("Download limit exceeded or order not found")
        } else if (response.status === 404) {
          toast.error("Image not found")
        } else {
          toast.error("Failed to generate download link")
        }
        return
      }

      const data = await response.json()
      console.log("[v0] Token generation successful:", data)

      console.log("[v0] Starting direct download:", data.downloadUrl)

      // Create a temporary link element to trigger download
      const link = document.createElement("a")
      link.href = data.downloadUrl
      link.download = `${imageTitle.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      const remainingDownloads = downloadLimit - downloadCount - 1
      if (remainingDownloads > 0) {
        toast.success(`Download started for ${imageTitle}. ${remainingDownloads} downloads remaining.`)
      } else {
        toast.success(`Download started for ${imageTitle}. This was your final download.`)
      }

      // Refresh downloads to update counts
      setTimeout(fetchDownloads, 1000)
    } catch (error) {
      console.error("[v0] Download error:", error)
      console.error("[v0] Download error details:", error instanceof Error ? error.message : String(error))
      toast.error("Failed to start download")
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(orderItemId)
        return newSet
      })
    }
  }

  const getLicenseBadgeColor = (licenseName: string) => {
    const name = licenseName.toLowerCase()
    if (name.includes("standard")) return "bg-secondary text-secondary-foreground"
    if (name.includes("extended")) return "bg-primary text-primary-foreground"
    if (name.includes("commercial")) return "bg-accent text-accent-foreground"
    return "bg-muted text-muted-foreground"
  }

  const getDownloadStatus = (download: UserDownload) => {
    const usagePercent = (download.download_count / download.download_limit) * 100

    if (download.download_count >= download.download_limit) {
      return { status: "exhausted", color: "text-red-600", icon: Ban }
    } else if (usagePercent >= 80) {
      return { status: "warning", color: "text-yellow-600", icon: AlertTriangle }
    } else {
      return { status: "available", color: "text-green-600", icon: CheckCircle }
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
        <Link href="/account" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Account
        </Link>
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
          {downloads.map((download) => {
            const downloadStatus = getDownloadStatus(download)
            const StatusIcon = downloadStatus.icon
            const usagePercent = (download.download_count / download.download_limit) * 100

            return (
              <Card key={download.order_item_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{download.image_title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        Purchased {new Date(download.order_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getLicenseBadgeColor(download.license_name)}>{download.license_name}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Downloads Used: {download.download_count}/{download.download_limit}
                      </span>
                      <span className={`flex items-center gap-1 ${downloadStatus.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {downloadStatus.status === "exhausted" && "Limit Reached"}
                        {downloadStatus.status === "warning" && "Almost Full"}
                        {downloadStatus.status === "available" && "Available"}
                      </span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>

                  {downloadStatus.status === "warning" && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You have {download.download_limit - download.download_count} downloads remaining for this image.
                      </AlertDescription>
                    </Alert>
                  )}

                  {downloadStatus.status === "exhausted" && (
                    <Alert variant="destructive">
                      <Ban className="h-4 w-4" />
                      <AlertDescription>
                        Download limit reached. Contact support if you need additional downloads.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        onClick={() =>
                          handleDownload(
                            download.order_item_id,
                            download.image_title,
                            download.can_download,
                            download.download_count,
                            download.download_limit,
                          )
                        }
                        disabled={!download.can_download || downloadingIds.has(download.order_item_id)}
                        size="sm"
                        variant={download.can_download ? "default" : "secondary"}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadingIds.has(download.order_item_id)
                          ? "Downloading..."
                          : download.can_download
                            ? "Download"
                            : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
