"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, ZoomIn, Eye } from "lucide-react"
import { PanoramaViewer } from "@/components/panorama-viewer"

interface ImagePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title: string
  isEquirectangular?: boolean
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  isEquirectangular = false,
}: ImagePreviewModalProps) {
  const [viewMode, setViewMode] = useState<"image" | "zoom" | "panorama">("image")

  console.log("[v0] ImagePreviewModal render - isOpen:", isOpen, "viewMode:", viewMode)
  console.log("[v0] ImagePreviewModal imageUrl:", imageUrl)

  if (isOpen) {
    console.log("[v0] ImagePreviewModal is OPEN - title:", title)
  }

  if (!isOpen) return null

  const displayImageUrl = imageUrl || "/placeholder.svg?height=600&width=800"

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-4 bg-background rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-lg font-semibold truncate">{title}</h2>
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={viewMode === "zoom" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log("[v0] ImagePreviewModal: Switching to zoom mode")
                setViewMode("zoom")
              }}
            >
              <ZoomIn className="h-4 w-4 mr-2" />
              Zoom
            </Button>

            {isEquirectangular && (
              <Button
                variant={viewMode === "panorama" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  console.log("[v0] ImagePreviewModal: Switching to panorama mode")
                  setViewMode("panorama")
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                360 Panellum
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {viewMode === "panorama" && isEquirectangular ? (
            <>
              {console.log("[v0] ImagePreviewModal: Rendering PanoramaViewer with isInline: true")}
              <PanoramaViewer
                imageUrl={displayImageUrl}
                title={title}
                onClose={() => setViewMode("image")}
                isInline={true}
                className="absolute inset-0"
              />
            </>
          ) : viewMode === "zoom" ? (
            <div className="absolute inset-0 overflow-auto">
              <div className="min-h-full flex items-center justify-center p-4">
                <Image
                  src={displayImageUrl || "/placeholder.svg"}
                  alt={title}
                  width={2000}
                  height={1500}
                  className="max-w-none cursor-zoom-in"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "200%",
                    maxHeight: "200%",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative w-full h-full">
                <Image src={displayImageUrl || "/placeholder.svg"} alt={title} fill className="object-contain" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
