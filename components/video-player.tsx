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
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    console.log('[v0] Video player initialized, src:', src)

    const handleLoadStart = () => {
      console.log('[v0] Video load started')
    }

    const handleLoadedMetadata = () => {
      console.log('[v0] Video metadata loaded, duration:', video.duration)
    }

    const handleLoadedData = () => {
      console.log('[v0] Video data loaded, ready to play')
      setIsLoaded(true)
      if (autoPlay) {
        video.play().catch(() => {
          console.log('[v0] Autoplay blocked, user interaction required')
        })
      }
    }

    const handleCanPlay = () => {
      console.log('[v0] Video can play')
      if (!isLoaded) {
        setIsLoaded(true)
      }
    }

    const handlePlay = () => {
      console.log('[v0] Video playing')
      setIsPlaying(true)
    }

    const handlePause = () => {
      console.log('[v0] Video paused')
      setIsPlaying(false)
    }

    const handleError = () => {
      console.error('[v0] Video error:', video.error?.code, video.error?.message)
      setHasError(true)
    }

    const handleDurationChange = () => {
      console.log('[v0] Video duration:', video.duration)
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('error', handleError)
    video.addEventListener('durationchange', handleDurationChange)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('error', handleError)
      video.removeEventListener('durationchange', handleDurationChange)
    }
  }, [autoPlay])

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(() => {
          console.log('[v0] Play failed')
        })
      }
    }
  }

  if (hasError) {
    return (
      <div className={`${className} bg-gray-900 flex items-center justify-center`}>
        <div className="text-center text-gray-400">
          <p className="text-sm">Video unavailable</p>
        </div>
      </div>
    )
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
          className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center"
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
