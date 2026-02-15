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
    if (!video || !src) return

    console.log('[v0] Video player initializing')
    console.log('[v0] Video source URL:', src)
    console.log('[v0] Video source length:', src.length, 'bytes')
    setError(null)

    // Check if it's an HLS URL
    const isHls = src.includes('.m3u8')

    // Add CORS headers for Supabase URLs and other external sources
    if (src.includes('supabase') || src.includes('.co') || src.includes('http')) {
      console.log('[v0] Setting crossOrigin to anonymous for external URL')
      video.setAttribute('crossOrigin', 'anonymous')
    }

    // Validate URL format
    try {
      new URL(src)
      console.log('[v0] URL is valid')
    } catch (e) {
      console.warn('[v0] URL might be invalid:', e)
    }

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

      const handlePlaying = () => setIsPlaying(true)
      const handlePaused = () => setIsPlaying(false)

      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('error', handleError)
      video.addEventListener('playing', handlePlaying)
      video.addEventListener('pause', handlePaused)

      return () => {
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('error', handleError)
        video.removeEventListener('playing', handlePlaying)
        video.removeEventListener('pause', handlePaused)
      }
    }

    // Chrome/Firefox/Edge with hls.js for HLS
    if (isHls && Hls.isSupported()) {
      console.log('[v0] Using hls.js for adaptive streaming')
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
        console.log('[v0] HLS manifest parsed, ready to play')
        setIsLoaded(true)
        if (autoPlay) {
          video.play().catch(() => {
            console.log('[v0] Autoplay blocked by browser policy')
          })
        }
      })

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) {
          console.warn('[v0] Non-fatal HLS error:', data.type)
          return
        }

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

      const handlePlaying = () => setIsPlaying(true)
      const handlePaused = () => setIsPlaying(false)

      video.addEventListener('playing', handlePlaying)
      video.addEventListener('pause', handlePaused)

      return () => {
        video.removeEventListener('playing', handlePlaying)
        video.removeEventListener('pause', handlePaused)
        hls.destroy()
      }
    }

    // Fallback: direct MP4 or other formats (Supabase URLs, local files, etc.)
    console.log('[v0] Using direct video playback')
    video.src = src

    const handleCanPlay = () => {
      console.log('[v0] Video ready to play')
      setIsLoaded(true)
      if (autoPlay) {
        video.play().catch(() => {
          console.log('[v0] Autoplay blocked by browser policy')
        })
      }
    }

    const handleError = () => {
      const videoError = video.error
      let errorMsg = 'Video failed to load'
      
      if (videoError) {
        console.error('[v0] Video error code:', videoError.code, 'message:', videoError.message)
        
        // Detailed error codes from HTML5 video
        switch (videoError.code) {
          case 1:
            errorMsg = 'Video loading aborted'
            break
          case 2:
            errorMsg = 'Network error - check video URL and CORS settings'
            break
          case 3:
            errorMsg = 'Video loading was interrupted'
            break
          case 4:
            errorMsg = 'Unsupported video format or file size too large'
            break
        }
      }
      
      console.error('[v0] Final error message:', errorMsg)
      setError(errorMsg)
    }

    const handlePlaying = () => setIsPlaying(true)
    const handlePaused = () => setIsPlaying(false)
    const handleLoadStart = () => console.log('[v0] Video loading started')

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('pause', handlePaused)
    video.addEventListener('loadstart', handleLoadStart)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('pause', handlePaused)
      video.removeEventListener('loadstart', handleLoadStart)
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
          <div className="text-center text-red-400 p-4">
            <p className="text-sm font-semibold mb-2">{error}</p>
            <p className="text-xs text-gray-400 break-all">URL: {src.substring(0, 100)}...</p>
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
