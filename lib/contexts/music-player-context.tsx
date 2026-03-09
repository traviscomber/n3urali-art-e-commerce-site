'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

interface MusicPlayerContextType {
  audioRef: React.RefObject<HTMLAudioElement | null>
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  volume: number
  setVolume: (volume: number) => void
  currentTrackIndex: number
  setCurrentTrackIndex: (index: number | ((prev: number) => number)) => void
  playlist: string[]
  setPlaylist: (playlist: string[]) => void
  collectionTitle: string
  setCollectionTitle: (title: string) => void
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

interface MusicPlayerProviderProps {
  children: React.ReactNode
  initialPlaylist?: string[]
}

export function MusicPlayerProvider({ children, initialPlaylist = [] }: MusicPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [playlist, setPlaylist] = useState<string[]>(initialPlaylist)
  const [collectionTitle, setCollectionTitle] = useState('')

  useEffect(() => {
    if (audioRef.current && playlist.length > 0 && currentTrackIndex < playlist.length) {
      const trackUrl = playlist[currentTrackIndex]
      console.log('[v0] Music Player - Loading track:', { currentTrackIndex, trackUrl, playlistLength: playlist.length })
      
      audioRef.current.src = trackUrl
      audioRef.current.volume = volume
      audioRef.current.load()
      
      // Auto-play the music
      audioRef.current.play().then(() => {
        setIsPlaying(true)
        console.log('[v0] Music Player - Started playing')
      }).catch((err) => {
        console.log('[v0] Music Player - Autoplay blocked:', err)
      })
    }
  }, [currentTrackIndex, playlist])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      if (playlist.length > 1) {
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length)
      } else {
        // Loop single track
        audio.currentTime = 0
        audio.play()
      }
    }

    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [playlist.length])

  return (
    <MusicPlayerContext.Provider
      value={{
        audioRef,
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        currentTrackIndex,
        setCurrentTrackIndex,
        playlist,
        setPlaylist,
        collectionTitle,
        setCollectionTitle,
      }}
    >
      {children}
      {/* Global audio element that persists across page navigations */}
      <audio ref={audioRef} className="hidden" />
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider')
  }
  return context
}
