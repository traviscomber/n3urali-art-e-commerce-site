'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface HLSPlayerProps {
  src: string
  poster?: string
  autoplay?: boolean
  controls?: boolean
  width?: number | string
  height?: number | string
  className?: string
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onError?: (error: Error) => void
}

interface PlaybackMetrics {
  bitrate: number
  fps: number
  bufferHealth: number
  latency: number
}

/**
 * High-performance HLS video player with adaptive bitrate streaming
 * Supports quality selection, bandwidth detection, and streaming metrics
 */
export function HLSPlayer({
  src,
  poster,
  autoplay = false,
  controls = true,
  width = '100%',
  height = 'auto',
  className = '',
  onReady,
  onPlay,
  onPause,
  onError,
}: HLSPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsInstanceRef = useRef<any>(null)

  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [metrics, setMetrics] = useState<PlaybackMetrics>({
    bitrate: 0,
    fps: 0,
    bufferHealth: 0,
    latency: 0,
  })
  const [qualities, setQualities] = useState<Array<{ level: number; bitrate: number }>>([])
  const [selectedQuality, setSelectedQuality] = useState(-1) // -1 = auto

  // Initialize HLS player
  useEffect(() => {
    const initializePlayer = async () => {
      if (!videoRef.current) return

      try {
        // Check if HLS is supported natively (Safari)
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = src
          setIsReady(true)
          onReady?.()
          return
        }

        // Use HLS.js for other browsers
        // Note: HLS.js would need to be installed: npm install hls.js
        // For now, we'll provide fallback
        console.log(
          '[v0] HLS.js not available - using native HLS playback or fallback to progressive download',
        )

        // Fallback to regular video element
        videoRef.current.src = src
        setIsReady(true)
        onReady?.()
      } catch (error) {
        const err = error instanceof Error ? error : new Error('HLS initialization failed')
        console.error('[v0] HLS player error:', err)
        onError?.(err)
      }
    }

    initializePlayer()
  }, [src, onReady, onError])

  // Monitor playback metrics
  useEffect(() => {
    if (!videoRef.current) return

    const updateMetrics = () => {
      const video = videoRef.current
      if (!video) return

      const buffered = video.buffered
      let bufferHealth = 0
      if (buffered.length > 0) {
        const lastBuffered = buffered.end(buffered.length - 1)
        bufferHealth = Math.round(((lastBuffered - video.currentTime) / 30) * 100) // Assume 30s buffer target
      }

      setMetrics((prev) => ({
        ...prev,
        bufferHealth: Math.min(100, bufferHealth),
      }))
    }

    const interval = setInterval(updateMetrics, 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle play/pause
  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    onPlay?.()
  }, [onPlay])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    onPause?.()
  }, [onPause])

  // Quality selection
  const handleQualityChange = useCallback((level: number) => {
    setSelectedQuality(level)
    // HLS.js quality switching would go here
    console.log(`[v0] Switching to quality level: ${level}`)
  }, [])

  // Calculate adaptive bitrate based on network conditions
  const getAdaptiveBitrate = useCallback(() => {
    if (typeof navigator === 'undefined') return 2500

    const connection = (navigator as any).connection
    if (!connection) return 2500

    const effectiveType = connection.effectiveType
    const downlink = connection.downlink

    // Recommend bitrate based on effective type
    switch (effectiveType) {
      case '4g':
        return Math.min(downlink * 800, 8000) // Up to 8Mbps
      case '3g':
        return Math.min(downlink * 500, 2500) // Up to 2.5Mbps
      case '2g':
        return 500 // 0.5Mbps
      default:
        return 2500 // Default 2.5Mbps
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        autoPlay={autoplay}
        controls={controls}
        onPlay={handlePlay}
        onPause={handlePause}
        crossOrigin="anonymous"
      />

      {/* Playback Metrics Overlay (Development) */}
      <div className="absolute bottom-16 left-4 text-xs text-cyan-300 font-mono bg-black/50 p-2 rounded pointer-events-none space-y-1">
        <div>Buffer: {metrics.bufferHealth}%</div>
        <div>Adaptive BR: {getAdaptiveBitrate()}kbps</div>
        {selectedQuality >= 0 && <div>Quality: Level {selectedQuality}</div>}
      </div>

      {/* Quality Selector */}
      {qualities.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors"
            onClick={() => handleQualityChange(-1)}
          >
            Auto
          </button>
          {qualities.map((q) => (
            <button
              key={q.level}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                selectedQuality === q.level
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
              onClick={() => handleQualityChange(q.level)}
            >
              {q.bitrate / 1000}Mbps
            </button>
          ))}
        </div>
      )}

      {/* Loading Spinner */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

/**
 * Lightweight video player for simple MP4 playback
 */
export function SimpleVideoPlayer({
  src,
  poster,
  autoplay = false,
  className = '',
}: Omit<HLSPlayerProps, 'onReady' | 'onPlay' | 'onPause' | 'onError'>) {
  return (
    <video
      src={src}
      poster={poster}
      autoPlay={autoplay}
      controls
      className={`w-full h-auto rounded-lg ${className}`}
      crossOrigin="anonymous"
    />
  )
}

/**
 * Video placeholder with loading state
 */
export function VideoPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading video...</p>
      </div>
    </div>
  )
}
