'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface CollectionMusicPlayerProps {
  musicUrl: string
  collectionTitle: string
  variant?: 'default' | 'minimal'
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function CollectionMusicPlayer({ 
  musicUrl, 
  collectionTitle,
  variant = 'default' 
}: CollectionMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(60) // YouTube uses 0-100
  const [isMuted, setIsMuted] = useState(false)
  const [playerReady, setPlayerReady] = useState(false) // Added playerReady state to track YouTube player initialization
  const audioRef = useRef<HTMLAudioElement>(null)
  const youtubePlayerRef = useRef<any>(null)
  const youtubeContainerRef = useRef<HTMLDivElement>(null)
  
  const youtubeId = extractYouTubeId(musicUrl)
  const isYouTube = youtubeId !== null

  useEffect(() => {
    if (!isYouTube) return

    // Load YouTube API script
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // Initialize player when API is ready
    const initializePlayer = () => {
      if (window.YT && window.YT.Player && youtubeContainerRef.current) {
        youtubePlayerRef.current = new window.YT.Player(youtubeContainerRef.current, {
          videoId: youtubeId,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: youtubeId, // Required for looping
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
          },
          events: {
            onReady: (event: any) => {
              setPlayerReady(true)
              if (typeof event.target.setVolume === 'function') {
                event.target.setVolume(volume)
              }
              if (typeof event.target.playVideo === 'function') {
                event.target.playVideo()
              }
              setIsPlaying(true)
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
              }
            }
          }
        })
      }
    }

    if (window.YT && window.YT.Player) {
      initializePlayer()
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer
    }

    return () => {
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.destroy === 'function') {
        youtubePlayerRef.current.destroy()
      }
      setPlayerReady(false)
    }
  }, [isYouTube, youtubeId, volume])

  useEffect(() => {
    if (isYouTube || !audioRef.current) return
    
    audioRef.current.volume = volume / 100
  }, [volume, isYouTube])

  useEffect(() => {
    if (isYouTube) return
    
    // Auto-play audio files on mount
    const timer = setTimeout(() => {
      handlePlay()
    }, 1000)

    return () => clearTimeout(timer)
  }, [isYouTube])

  const handlePlay = () => {
    if (isYouTube && youtubePlayerRef.current && playerReady) {
      if (typeof youtubePlayerRef.current.playVideo === 'function') {
        youtubePlayerRef.current.playVideo()
        setIsPlaying(true)
      }
    } else if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (isYouTube && youtubePlayerRef.current && playerReady) {
      if (typeof youtubePlayerRef.current.pauseVideo === 'function') {
        youtubePlayerRef.current.pauseVideo()
        setIsPlaying(false)
      }
    } else if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      handlePause()
    } else {
      handlePlay()
    }
  }

  const toggleMute = () => {
    if (isYouTube && youtubePlayerRef.current && playerReady) {
      if (isMuted) {
        if (typeof youtubePlayerRef.current.unMute === 'function') {
          youtubePlayerRef.current.unMute()
        }
      } else {
        if (typeof youtubePlayerRef.current.mute === 'function') {
          youtubePlayerRef.current.mute()
        }
      }
      setIsMuted(!isMuted)
    } else if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    
    if (isYouTube && youtubePlayerRef.current && playerReady) {
      if (typeof youtubePlayerRef.current.setVolume === 'function') {
        youtubePlayerRef.current.setVolume(newVolume)
      }
      if (newVolume === 0) {
        if (typeof youtubePlayerRef.current.mute === 'function') {
          youtubePlayerRef.current.mute()
        }
        setIsMuted(true)
      } else if (isMuted) {
        if (typeof youtubePlayerRef.current.unMute === 'function') {
          youtubePlayerRef.current.unMute()
        }
        setIsMuted(false)
      }
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
      if (newVolume === 0) {
        setIsMuted(true)
        audioRef.current.muted = true
      } else if (isMuted) {
        setIsMuted(false)
        audioRef.current.muted = false
      }
    }
  }

  if (variant === 'minimal') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {isYouTube && (
          <div ref={youtubeContainerRef} className="hidden" />
        )}
        
        {!isYouTube && (
          <audio
            ref={audioRef}
            src={musicUrl}
            loop
            preload="auto"
          />
        )}
        
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-full px-4 py-3 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            className="h-8 w-8 rounded-full hover:bg-primary/10"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 rounded-full hover:bg-primary/10"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-24"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      {isYouTube && (
        <div ref={youtubeContainerRef} className="hidden" />
      )}
      
      {!isYouTube && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
        />
      )}
      
      <div className="bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            size="icon"
            onClick={togglePlayPause}
            className="h-12 w-12 rounded-full flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {collectionTitle}
            </div>
            <div className="text-xs text-muted-foreground">
              Ambient Soundtrack
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-9 w-9 rounded-full"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
