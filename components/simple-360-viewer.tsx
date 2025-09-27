"use client"

import React, { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Simple360ViewerProps {
  imageUrl: string
  title: string
  onClose: () => void
  inline?: boolean
  isPaid?: boolean
}

declare global {
  interface Window {
    pannellum: any
  }
}

export const Simple360Viewer = React.memo(function Simple360Viewer({
  imageUrl,
  title,
  onClose,
  inline = false,
  isPaid = false,
}: Simple360ViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [isContainerReady, setIsContainerReady] = useState(false)

  const protectionClasses = !isPaid ? "select-none pointer-events-auto" : ""

  useEffect(() => {
    const checkContainer = () => {
      if (containerRef.current && containerRef.current.offsetParent !== null) {
        console.log("[v0] Container is ready and visible")
        setIsContainerReady(true)
      } else {
        console.log("[v0] Container not ready yet, retrying...")
        setTimeout(checkContainer, 50)
      }
    }

    // Start checking after a small delay to ensure DOM is rendered
    const timer = setTimeout(checkContainer, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isContainerReady) {
      console.log("[v0] Waiting for container to be ready...")
      return
    }

    const initViewer = () => {
      console.log("[v0] Starting Pannellum 360° viewer initialization...")
      console.log("[v0] Image URL:", imageUrl)

      // Load Pannellum CSS
      if (!document.querySelector('link[href*="pannellum.css"]')) {
        const cssLink = document.createElement("link")
        cssLink.rel = "stylesheet"
        cssLink.href = "https://cdn.jsdelivr.net/npm/pannellum@2.3.2/build/pannellum.css"
        document.head.appendChild(cssLink)
      }

      // Load Pannellum JS
      if (!window.pannellum && !document.querySelector('script[src*="pannellum.js"]')) {
        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.3.2/build/pannellum.js"
        script.onload = () => {
          console.log("[v0] Pannellum script loaded successfully")
          createViewer()
        }
        script.onerror = () => {
          console.error("[v0] Failed to load Pannellum library.")
          setError("Failed to load 360° viewer library")
          setIsLoading(false)
        }
        document.body.appendChild(script)
      } else if (window.pannellum) {
        createViewer()
      }
    }

    const createViewer = () => {
      if (!containerRef.current) {
        console.error("[v0] Container ref not available")
        setError("Container not ready")
        setIsLoading(false)
        return
      }

      if (!containerRef.current.isConnected) {
        console.error("[v0] Container not connected to DOM")
        setError("Container not connected")
        setIsLoading(false)
        return
      }

      try {
        console.log("[v0] Creating Pannellum viewer instance...")
        console.log("[v0] Container dimensions:", {
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })

        // Clear any existing content
        containerRef.current.innerHTML = ""

        viewerRef.current = window.pannellum.viewer(containerRef.current, {
          type: "equirectangular",
          panorama: imageUrl,
          autoLoad: true,
          showControls: isPaid,
          showFullscreenCtrl: false,
          showZoomCtrl: isPaid,
          mouseZoom: isPaid,
          doubleClickZoom: false,
          draggable: true,
          keyboardZoom: false,
          compass: false,
          title: title,
          author: "n3uralia.art",
          hfov: 90,
          pitch: 0,
          yaw: 0,
          minHfov: isPaid ? 50 : 90,
          maxHfov: isPaid ? 120 : 90,
        })

        setIsLoading(false)
        console.log("[v0] Pannellum 360° viewer initialized successfully")
      } catch (viewerError) {
        console.error("[v0] Error creating Pannellum viewer:", viewerError)
        setError("Failed to create 360° viewer")
        setIsLoading(false)
      }
    }

    initViewer()

    return () => {
      if (viewerRef.current && window.pannellum) {
        try {
          viewerRef.current.destroy()
        } catch (error) {
          console.log("Error destroying viewer:", error)
        }
      }
    }
  }, [imageUrl, title, isPaid, isContainerReady]) // Added isContainerReady dependency

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPaid && (e.ctrlKey || e.metaKey || e.key === "F12")) {
        e.preventDefault()
        return false
      }
      if (e.key === "Escape") {
        onClose()
      }
    }

    const handleContextMenu = (e: Event) => {
      if (!isPaid) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [isPaid, onClose])

  if (!imageUrl || !title) {
    return null
  }

  if (isLoading) {
    return (
      <div
        className={`relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center ${protectionClasses}`}
      >
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading 360° viewer...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center ${protectionClasses}`}
      >
        <div className="text-white text-center">
          <p className="text-lg font-semibold mb-2">Error loading 360° viewer</p>
          <p className="text-sm text-white/70 mb-4">{error}</p>
          <Button onClick={onClose} variant="secondary" size="sm">
            Close
          </Button>
        </div>
      </div>
    )
  }

  if (inline) {
    return (
      <div className={`relative w-full h-full bg-black rounded-lg overflow-hidden ${protectionClasses}`}>
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-white/70">
              {!isPaid ? "Preview Mode - Purchase for full access" : "Drag to look around"}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div ref={containerRef} className="w-full h-full" style={{ minHeight: "400px" }} />

        <div className="absolute inset-0 pointer-events-none z-20">
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/30 text-xl font-bold rotate-12 select-none ${!isPaid ? "text-white/50" : "text-white/20"}`}
          >
            {!isPaid ? "PREVIEW - n3uralia.art" : "n3uralia.art"}
          </div>
          {!isPaid && (
            <>
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-sm font-bold -rotate-12 select-none">
                PREVIEW
              </div>
              <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-white/20 text-sm font-bold rotate-45 select-none">
                PREVIEW
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-4 z-50 bg-black rounded-lg overflow-hidden ${protectionClasses}`}>
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-white/70">
            {!isPaid ? "Preview Mode - Purchase for full access" : "Drag to look around"}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div ref={containerRef} className="w-full h-full" style={{ minHeight: "400px" }} />

      <div className="absolute inset-0 pointer-events-none z-20">
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/30 text-2xl font-bold rotate-12 select-none ${!isPaid ? "text-white/50" : "text-white/20"}`}
        >
          {!isPaid ? "PREVIEW - n3uralia.art" : "n3uralia.art"}
        </div>
        {!isPaid && (
          <>
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-lg font-bold -rotate-12 select-none">
              PREVIEW
            </div>
            <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-white/20 text-lg font-bold rotate-45 select-none">
              PREVIEW
            </div>
          </>
        )}
      </div>
    </div>
  )
})
