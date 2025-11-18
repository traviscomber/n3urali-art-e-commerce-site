'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, X, Volume2, VolumeX, SkipForward, SkipBack, Maximize } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useMusicPlayer } from '@/lib/contexts/music-player-context'
import Image from 'next/image'

interface TheatreModeProps {
  images: Array<{
    id: string
    title: string
    thumbnail_large_url?: string
    thumbnail_medium_url?: string
    file_path?: string
    original_url?: string
  }>
  collectionTitle: string
  musicPlaylist?: string[]
  autoStart?: boolean // Added autoStart prop to automatically enter fullscreen
}

export function TheatreMode({ images, collectionTitle, musicPlaylist, autoStart = false }: TheatreModeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    audioRef,
    isPlaying: isMusicPlaying,
    setIsPlaying: setIsMusicPlaying,
    volume,
    setVolume,
    currentTrackIndex,
    setCurrentTrackIndex,
    playlist,
  } = useMusicPlayer()

  const TRANSITION_DURATION = 30000 // 30 seconds

  useEffect(() => {
    if (!isOpen) return

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Print Screen, Win+Shift+S, Cmd+Shift+4, etc.
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) ||
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        (e.metaKey && e.shiftKey && e.key === 'S')
      ) {
        e.preventDefault()
        return false
      }
      
      // ESC to exit
      if (e.key === 'Escape') {
        exitTheatreMode()
      }
    }

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      return
    }

    // Reset progress
    setProgress(0)

    // Update progress every 100ms for smooth animation
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / TRANSITION_DURATION) * 100
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 100)

    // Transition to next image after 30 seconds
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
      setProgress(0)
    }, TRANSITION_DURATION)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [isOpen, isPaused, images.length, currentImageIndex])

  useEffect(() => {
    if (autoStart && images.length > 0) {
      enterTheatreMode()
    }
  }, [autoStart, images.length])

  const enterTheatreMode = async () => {
    setIsOpen(true)
    setCurrentImageIndex(0)
    setIsPaused(false)
    setProgress(0)

    // Request fullscreen
    if (containerRef.current) {
      try {
        await containerRef.current.requestFullscreen()
      } catch (err) {
        console.log('[v0] Fullscreen not supported:', err)
      }
    }
  }

  const exitTheatreMode = () => {
    setIsOpen(false)
    setIsPaused(false)
    setProgress(0)

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
    setProgress(0)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    setProgress(0)
  }

  const toggleMusicPlayPause = () => {
    if (!audioRef.current) return

    if (isMusicPlaying) {
      audioRef.current.pause()
      setIsMusicPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true)
      })
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const playNextTrack = () => {
    if (playlist.length > 1) {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length)
    }
  }

  const playPreviousTrack = () => {
    if (playlist.length > 1) {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length)
    }
  }

  const currentImage = images[currentImageIndex]
  
  console.log('[v0] Theatre Mode - Current Image:', {
    index: currentImageIndex,
    id: currentImage?.id,
    title: currentImage?.title,
    original_url: currentImage?.original_url,
    file_path: currentImage?.file_path,
    thumbnail_large_url: currentImage?.thumbnail_large_url,
    thumbnail_medium_url: currentImage?.thumbnail_medium_url,
  })
  
  console.log('[v0] Theatre Mode - Music Player:', {
    playlistLength: playlist.length,
    currentTrack: currentTrackIndex,
    isPlaying: isMusicPlaying,
    hasAudioRef: !!audioRef.current,
  })
  
  const imageUrl =
    currentImage?.original_url ||
    currentImage?.file_path ||
    currentImage?.thumbnail_large_url ||
    currentImage?.thumbnail_medium_url ||
    '/placeholder.svg'
  
  console.log('[v0] Theatre Mode - Image URL being used:', imageUrl)

  if (!isOpen) {
    return (
      <Button
        size="lg"
        onClick={enterTheatreMode}
        className="gap-2"
        disabled={images.length === 0}
      >
        <Maximize className="h-5 w-5" />
        Theatre Mode
      </Button>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Image with fade transition */}
      <div className="relative w-full h-full">
        <Image
          key={currentImageIndex}
          src={imageUrl || "/placeholder.svg"}
          alt={currentImage?.title || 'Collection image'}
          fill
          className="object-contain animate-in fade-in duration-1000"
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          draggable={false}
          priority
        />

        {/* Watermark overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top watermark */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/40 font-bold text-2xl tracking-wider">
            N3URALIA360.ART
          </div>

          {/* Center watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 font-bold text-6xl tracking-wider rotate-[-30deg]">
            N3URALIA360.ART
          </div>

          {/* Bottom watermark */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/40 font-bold text-xl tracking-wider">
            {collectionTitle}
          </div>
        </div>

        {/* Image title and counter */}
        <div className="absolute top-8 left-8 text-white space-y-2 bg-black/50 backdrop-blur-sm rounded-lg px-6 py-3">
          <div className="text-2xl font-bold">{currentImage?.title}</div>
          <div className="text-sm text-white/80">
            Image {currentImageIndex + 1} of {images.length}
          </div>
        </div>

        {/* Exit button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={exitTheatreMode}
          className="absolute top-8 right-8 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation and playback controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-lg rounded-full px-8 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousImage}
            className="h-10 w-10 rounded-full text-white hover:bg-white/20"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={togglePause}
            className="h-12 w-12 rounded-full text-white hover:bg-white/20"
          >
            {isPaused ? (
              <Play className="h-6 w-6 fill-current" />
            ) : (
              <Pause className="h-6 w-6 fill-current" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextImage}
            className="h-10 w-10 rounded-full text-white hover:bg-white/20"
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          {/* Progress bar */}
          <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden mx-4">
            <div
              className="h-full bg-white/90 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Music controls */}
        {playlist.length > 0 && (
          <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-black/70 backdrop-blur-lg rounded-full px-6 py-3">
            {playlist.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={playPreviousTrack}
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMusicPlayPause}
              className="h-9 w-9 rounded-full text-white hover:bg-white/20"
            >
              {isMusicPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </Button>

            {playlist.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={playNextTrack}
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}

            <div className="flex items-center gap-2 ml-2">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-white/80" />
              ) : (
                <Volume2 className="h-4 w-4 text-white/80" />
              )}
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.01}
                className="w-20"
              />
            </div>

            {playlist.length > 1 && (
              <div className="text-xs text-white/80 pl-3 border-l border-white/30">
                {currentTrackIndex + 1}/{playlist.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TheatreMode
