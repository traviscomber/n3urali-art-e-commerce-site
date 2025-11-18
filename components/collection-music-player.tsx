'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useMusicPlayer } from '@/lib/contexts/music-player-context'

interface CollectionMusicPlayerProps {
  musicUrl?: string
  musicPlaylist?: string[] | null
  collectionTitle: string
  variant?: 'default' | 'minimal'
}

export function CollectionMusicPlayer({ 
  musicUrl,
  musicPlaylist, 
  collectionTitle,
  variant = 'default' 
}: CollectionMusicPlayerProps) {
  const {
    audioRef,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    currentTrackIndex,
    setCurrentTrackIndex,
    playlist,
    setPlaylist,
    collectionTitle: contextCollectionTitle,
    setCollectionTitle,
  } = useMusicPlayer()

  useEffect(() => {
    const newPlaylist = musicPlaylist && musicPlaylist.length > 0 
      ? musicPlaylist 
      : musicUrl 
      ? [musicUrl] 
      : []
    
    if (newPlaylist.length > 0 && JSON.stringify(newPlaylist) !== JSON.stringify(playlist)) {
      console.log('[v0] Setting up music playlist:', newPlaylist)
      setPlaylist(newPlaylist)
      setCollectionTitle(collectionTitle)
      setCurrentTrackIndex(0)
    }
  }, [musicPlaylist, musicUrl, collectionTitle])

  useEffect(() => {
    if (!audioRef.current || playlist.length === 0) return

    const currentTrack = playlist[currentTrackIndex]
    if (!currentTrack) return

    // Only update src if it's different
    if (audioRef.current.src !== currentTrack) {
      console.log('[v0] Loading track:', currentTrack)
      audioRef.current.src = currentTrack
      audioRef.current.volume = volume
      audioRef.current.loop = playlist.length === 1

      // Auto-play the new track
      audioRef.current.play().then(() => {
        console.log('[v0] Audio auto-playing')
        setIsPlaying(true)
      }).catch(err => {
        console.log('[v0] Auto-play blocked:', err)
      })
    }
  }, [currentTrackIndex, playlist])

  useEffect(() => {
    if (!audioRef.current) return

    const handleEnded = () => {
      console.log('[v0] Track ended')
      if (playlist.length > 1) {
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length)
      }
    }

    audioRef.current.addEventListener('ended', handleEnded)
    return () => {
      audioRef.current?.removeEventListener('ended', handleEnded)
    }
  }, [playlist.length])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      console.log('[v0] Pause clicked')
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      console.log('[v0] Play clicked')
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      })
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const playNext = () => {
    if (playlist.length > 1) {
      console.log('[v0] Next track clicked')
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length)
    }
  }

  const playPrevious = () => {
    if (playlist.length > 1) {
      console.log('[v0] Previous track clicked')
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length)
    }
  }

  if (playlist.length === 0) return null

  return variant === 'minimal' ? (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-lg border-2 border-primary/20 rounded-full px-4 py-3 shadow-2xl">
        {playlist.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={playPrevious}
            className="h-8 w-8 rounded-full hover:bg-primary/10"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
        )}

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

        {playlist.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={playNext}
            className="h-8 w-8 rounded-full hover:bg-primary/10"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="w-20"
          />
        </div>

        {playlist.length > 1 && (
          <div className="text-xs text-muted-foreground pl-2 border-l">
            {currentTrackIndex + 1}/{playlist.length}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
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
              {contextCollectionTitle || collectionTitle}
            </div>
            <div className="text-xs text-muted-foreground">
              Ambient Soundtrack
            </div>
          </div>

          <div className="flex items-center gap-3">
            {playlist.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={playPrevious}
                className="h-9 w-9 rounded-full"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            )}

            <Volume2 className="h-4 w-4 text-muted-foreground" />

            {playlist.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={playNext}
                className="h-9 w-9 rounded-full"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}

            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.01}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
