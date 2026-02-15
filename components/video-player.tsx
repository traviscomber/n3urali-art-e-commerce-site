'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  src: string // Can be HLS .m3u8 URL or direct MP4 URL
  poster?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  className?: string
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = true,
  muted = true,
  controls = false,
  className = 'w-full h-full object-cover',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isLoaded, setIsLoaded] = useState(autoPlay)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    console.log('[v0] Video player mounted, src:', src)
    setError(null)

    // Check if it's an HLS URL
    const isHls = src.includes('.m3u8')

    // Safari/iOS native HLS support
    if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('[v0] Using native HLS support')
      video.src = src

      const handleCanPlay = () => {
        console.log('[v0] Native HLS can play')
        setIsLoaded(true)
        if (autoPlay) {
          video.play().catch(() => {
            console.log('[v0] Autoplay blocked by browser')
          })
        }
      }

      const handleError = () => {
        console.error('[v0] Video error:', video.error?.message)
        setError('Video failed to load')
      }

      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('error', handleError)
      video.addEventListener('play', () => setIsPlaying(true))
      video.addEventListener('pause', () => setIsPlaying(false))

      return () => {
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('error', handleError)
        video.removeEventListener('play', () => setIsPlaying(true))
        video.removeEventListener('pause', () => setIsPlaying(false))
      }
    }

    // Chrome/Firefox/Edge with hls.js for HLS
    if (isHls && Hls.isSupported()) {
      console.log('[v0] Using hls.js library')
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 120,
        maxMaxBufferLength: 300,
        capLevelToPlayerSize: true,
        startLevel: -1,
      })

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[v0] HLS manifest parsed')
        setIsLoaded(true)
        if (autoPlay) {
          video.play().catch(() => {
            console.log('[v0] Autoplay blocked by browser')
          })
        }
      })

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          console.log('[v0] Network error, attempting recovery')
          hls.startLoad()
          return
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          console.log('[v0] Media error, attempting recovery')
          hls.recoverMediaError()
          return
        }

        console.error('[v0] Fatal HLS error:', data)
        hls.destroy()
        setError('Video playback error')
      })

      video.addEventListener('play', () => setIsPlaying(true))
      video.addEventListener('pause', () => setIsPlaying(false))

      return () => {
        hls.destroy()
        video.removeEventListener('play', () => setIsPlaying(true))
        video.removeEventListener('pause', () => setIsPlaying(false))
      }
    }

    // Fallback: direct MP4 or other formats
    console.log('[v0] Using direct video source')
    video.src = src

    const handleCanPlay = () => {
      console.log('[v0] Video can play')
      setIsLoaded(true)
      if (autoPlay) {
        video.play().catch(() => {
          console.log('[v0] Autoplay blocked by browser')
        })
      }
    }

    const handleError = () => {
      console.error('[v0] Video error:', video.error?.message)
      setError('Video failed to load')
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('play', () => setIsPlaying(true))
    video.addEventListener('pause', () => setIsPlaying(false))

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', () => setIsPlaying(true))
      video.removeEventListener('pause', () => setIsPlaying(false))
    }
  }, [src, autoPlay])

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch((err) => {
          console.error('[v0] Play error:', err)
        })
      } else {
        videoRef.current.pause()
      }
    }
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
          <div className="text-center text-red-400">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        muted={muted}
        loop={loop}
        playsInline
        preload="auto"
        poster={poster}
        controls={controls}
        crossOrigin="anonymous"
        className={className}
      />

      {/* Loading State */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-300 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Loading...</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!controls && !isPlaying && isLoaded && !error && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center cursor-pointer z-5"
          aria-label="Play video"
        >
          <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              className="w-8 h-8 ml-1 text-black fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  )
}
