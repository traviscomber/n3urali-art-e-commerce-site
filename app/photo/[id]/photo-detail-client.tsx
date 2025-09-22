"use client"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"

interface Image {
  id: string
  title: string
  description: string
  category_name: string
  price: number
  image_url: string
  thumbnail_url: string
  license_name?: string
  metadata?: any
}

interface Props {
  initialImage: Image
}

export default function PhotoDetailClient({ initialImage }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [image] = useState<Image>(initialImage)
  const [purchasing, setPurchasing] = useState(false)
  const [showQualityPreview, setShowQualityPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState({ x: 50, y: 50 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(6)
  const [show360Viewer, setShow360Viewer] = useState(false)
  const [viewerLoaded, setViewerLoaded] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)
  const pannellumViewerRef = useRef<any>(null)
  const watermarkRefreshInterval = useRef<NodeJS.Timeout | null>(null)

  return <div className="min-h-screen bg-background">{/* ... existing JSX remains exactly the same ... */}</div>
}
