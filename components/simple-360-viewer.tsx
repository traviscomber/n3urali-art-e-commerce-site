"use client"

import React, { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Simple360ViewerProps {
  imageUrl: string
  title: string
  onClose: () => void
  inline?: boolean
  isPaid?: boolean // Added isPaid prop to control protection level
}

declare global {
  interface Window {
    pannellum: any
  }
}

const loadPannellum = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false)
      return
    }

    if (window.pannellum) {
      resolve(true)
      return
    }

    // Check if script is already loading or loaded
    const existingScript = document.querySelector('script[src*="pannellum"]')
    if (existingScript) {
      // Script exists, wait for it to load
      const checkPannellum = () => {
        if (window.pannellum) {
          resolve(true)
        } else {
          setTimeout(checkPannellum, 100)
        }
      }
      checkPannellum()
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.3.2/build/pannellum.js"
    script.onload = () => {
      resolve(!!window.pannellum)
    }
    script.onerror = () => {
      console.error("Failed to load Pannellum library.")
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

export const Simple360Viewer = React.memo(function Simple360Viewer({
  imageUrl,
  title,
  onClose,
  inline = false,
  isPaid = false, // Default to unpaid (protected)
}: Simple360ViewerProps) {
  const [pannellumLoaded, setPannellumLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)

  const handleContextMenu = (e: Event) => {
    if (!isPaid) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isPaid) {
      // Block common shortcuts for unpaid images
      if (
        e.ctrlKey ||
        e.metaKey || // Block Ctrl/Cmd combinations
        e.key === "F12" || // Block dev tools
        (e.ctrlKey && e.shiftKey && e.key === "I") || // Block inspect
        (e.ctrlKey && e.shiftKey && e.key === "C") || // Block console
        (e.ctrlKey && e.key === "u") || // Block view source
        (e.ctrlKey && e.key === "s") // Block save
      ) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    if (e.key === "Escape") {
      onClose()
    }
  }

  const handleDragStart = (e: Event) => {
    if (!isPaid) {
      e.preventDefault()
      return false
    }
  }

  const handleSelectStart = (e: Event) => {
    if (!isPaid) {
      e.preventDefault()
      return false
    }
  }

  useEffect(() => {
    const initViewer = async () => {
      console.log("[v0] Starting Pannellum 360° viewer initialization...")

      const loaded = await loadPannellum()
      if (!loaded || !window.pannellum || !containerRef.current) {
        console.error("[v0] Pannellum failed to load")
        return
      }

      try {
        console.log("[v0] Creating Pannellum viewer instance...")

        viewerRef.current = window.pannellum.viewer(containerRef.current, {
          type: "equirectangular",
          panorama: imageUrl,
          autoLoad: true,
          showControls: !isPaid ? false : true, // Hide controls for unpaid images
          showFullscreenCtrl: false, // Always disabled
          showZoomCtrl: false, // Always disabled for protection
          mouseZoom: isPaid ? false : false, // Always disabled for protection
          doubleClickZoom: false, // Always disabled
          draggable: true, // Movement always enabled
          keyboardZoom: false, // Always disabled
          compass: false,
          title: title,
          author: "n3uralia.art",
          hfov: 90,
          pitch: 0,
          yaw: 0,
          minHfov: 90, // Fixed FOV prevents zoom
          maxHfov: 90, // Fixed FOV prevents zoom
        })

        console.log("[v0] Pannellum 360° viewer initialized successfully")
      } catch (error) {
        console.error("[v0] Error initializing Pannellum viewer:", error)
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
  }, [imageUrl, title, isPaid]) // Added isPaid to dependencies

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("dragstart", handleDragStart)
    document.addEventListener("selectstart", handleSelectStart)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("dragstart", handleDragStart)
      document.removeEventListener("selectstart", handleSelectStart)
    }
  }, [isPaid]) // Added isPaid to dependencies

  if (!imageUrl || !title) {
    return null
  }

  const protectionClasses = !isPaid ? "select-none pointer-events-auto" : ""

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

        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ minHeight: "400px" }}
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
        />

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

      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
      />

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
