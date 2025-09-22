"use client"

import React, { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Simple360ViewerProps {
  imageUrl: string
  title: string
  onClose: () => void
  inline?: boolean // Added inline prop
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
}: Simple360ViewerProps) {
  const [pannellumLoaded, setPannellumLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)

  const loadPannellum = async () => {
    if (pannellumLoaded || window.pannellum) {
      return true
    }

    return new Promise<boolean>((resolve) => {
      // Load CSS
      const cssLink = document.createElement("link")
      cssLink.rel = "stylesheet"
      cssLink.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
      document.head.appendChild(cssLink)

      // Load JS
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
      script.onload = () => {
        setPannellumLoaded(true)
        resolve(true)
      }
      script.onerror = () => {
        console.error("Failed to load Pannellum")
        resolve(false)
      }
      document.head.appendChild(script)
    })
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
          showControls: true,
          showFullscreenCtrl: false, // Disabled fullscreen
          showZoomCtrl: false, // Disabled zoom controls
          mouseZoom: false, // Disabled mouse zoom
          doubleClickZoom: false, // Disabled double-click zoom
          draggable: true, // Movement enabled from beginning
          keyboardZoom: false, // Disabled keyboard zoom
          compass: false, // Simplified interface
          title: title,
          author: "n3uralia.art",
          hfov: 90, // Fixed field of view, no zoom
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
      // Cleanup viewer on unmount
      if (viewerRef.current && window.pannellum) {
        try {
          viewerRef.current.destroy()
        } catch (error) {
          console.log("Error destroying viewer:", error)
        }
      }
    }
  }, [imageUrl, title])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  if (!imageUrl || !title) {
    return null
  }

  if (inline) {
    return (
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-white/70">Drag to look around</p>
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-xl font-bold rotate-12 select-none">
            n3uralia.art
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-4 z-50 bg-black rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-white/70">Drag to look around</p>
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-2xl font-bold rotate-12 select-none">
          n3uralia.art
        </div>
      </div>
    </div>
  )
})
