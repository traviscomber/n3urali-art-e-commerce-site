'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

interface MusicPlayerContextType {
  audioRef: React.RefObject<HTMLAudioElement>
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  volume: number
  setVolume: (volume: number) => void
  currentTrackIndex: number
  setCurrentTrackIndex: (index: number) => void
  playlist: string[]
  setPlaylist: (playlist: string[]) => void
  collectionTitle: string
  setCollectionTitle: (title: string) => void
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [playlist, setPlaylist] = useState<string[]>([])
  const [collectionTitle, setCollectionTitle] = useState('')

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
      <audio ref={audioRef} loop={playlist.length === 1} className="hidden" />
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
