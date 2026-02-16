'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  title: string
  description: string
  videoUrl: string
}

const THEATRE_CATEGORIES: Category[] = [
  {
    id: 'immersive-worlds',
    title: 'Immersive Worlds',
    description: 'Explore boundless digital realms',
    videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4',
  },
  {
    id: 'cultural-journeys',
    title: 'Cultural Journeys',
    description: 'Stories from around the world',
    videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4',
  },
  {
    id: 'digital-art',
    title: 'Digital Art',
    description: 'Contemporary artistic expressions',
    videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4',
  },
]

export function TheatrePlayer() {
  const [selectedCategory, setSelectedCategory] = useState<Category>(THEATRE_CATEGORIES[0])
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <div className="w-full bg-black">
      {/* Header Section */}
      <div className="px-6 md:px-12 py-16 text-center border-b border-gray-800">
        <h1 className="text-5xl md:text-6xl font-light text-gray-400 mb-8 tracking-wide">
          Theatre
        </h1>
        <div className="space-y-2 text-gray-500">
          <p className="text-sm md:text-base">Immerse yourself. No special requirements</p>
          <p className="text-sm md:text-base">Bigger screen brings better experience</p>
          <p className="text-sm md:text-base mt-6">A Living Immersive Catalog</p>
          <p className="text-sm md:text-base">New worlds are released regularly</p>
        </div>
      </div>

      {/* Featured Video Section */}
      <div className="relative w-full aspect-video bg-black overflow-hidden group">
        <video
          key={selectedCategory.id}
          src={selectedCategory.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* GO Button Overlay */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 m-auto w-24 h-24 rounded-full border-2 border-gray-600 hover:border-cyan-500 transition-colors duration-300 flex items-center justify-center group/button"
        >
          {!isPlaying ? (
            <div className="text-cyan-400 text-sm font-light tracking-wider">PLAY</div>
          ) : (
            <div className="text-gray-500 text-xs font-light tracking-wider group-hover/button:text-cyan-400 transition-colors">
              GO
            </div>
          )}
        </button>
      </div>

      {/* Category Cards Section */}
      <div className="px-6 md:px-12 py-16 border-t border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {THEATRE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                selectedCategory.id === category.id
                  ? 'border-cyan-500 bg-gray-900/30'
                  : 'border-gray-700 hover:border-cyan-500/50 hover:bg-gray-900/20'
              }`}
            >
              <h3 className="text-xl font-light text-cyan-400 mb-2 tracking-wide">
                {category.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 min-h-[2.5rem]">
                {category.description}
              </p>
              <div className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-light">
                <span>View</span>
                <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
