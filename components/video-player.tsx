'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string
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
  const [isLoaded, setIsLoaded] = useState(autoPlay) // Start as loaded if autoplaying

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    console.log('[v0] Video player mounted, src:', src)

    // Set events for state tracking
    const handlePlay = () => {
      console.log('[v0] Video play event')
      setIsPlaying(true)
    }

    const handlePause = () => {
      console.log('[v0] Video pause event')
      setIsPlaying(false)
    }

    // Use progress event which fires when video is being fetched
    const handleProgress = () => {
      if (video.buffered.length > 0 && !isLoaded) {
        console.log('[v0] Video data available')
        setIsLoaded(true)
      }
    }

    const handleCanPlay = () => {
      console.log('[v0] Video can play')
      setIsLoaded(true)
    }

    const handleLoadedData = () => {
      console.log('[v0] Video loaded data')
      setIsLoaded(true)
    }

    const handleError = () => {
      console.error('[v0] Video error:', video.error)
    }

    video.addEventListener('play', handlePlay, { once: false })
    video.addEventListener('pause', handlePause, { once: false })
    video.addEventListener('progress', handleProgress, { once: false })
    video.addEventListener('canplay', handleCanPlay, { once: false })
    video.addEventListener('loadeddata', handleLoadedData, { once: false })
    video.addEventListener('error', handleError, { once: false })

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
    }
  }, [])

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
    <div className="relative w-full h-full group">
      <video
        ref={videoRef}
        muted={muted}
        loop={loop}
        playsInline
        preload="auto"
        poster={poster}
        controls={controls}
        className={className}
        crossOrigin="anonymous"
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-300 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-400">Loading...</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay - Only show if not controls and video is not playing */}
      {!controls && !isPlaying && isLoaded && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center cursor-pointer"
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
