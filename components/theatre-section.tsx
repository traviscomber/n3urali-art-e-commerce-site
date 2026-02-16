'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface TheatreCategory {
  id: string
  title: string
  description: string
  thumbnail: string
  videos: Array<{
    id: string
    title: string
    url: string
  }>
}

// Sample theatre categories - in production these would come from database
const THEATRE_CATEGORIES: TheatreCategory[] = [
  {
    id: 'immersive-worlds',
    title: 'Immersive Worlds',
    description: 'Explore boundless digital realms',
    thumbnail: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4',
    videos: [
      { id: '1', title: 'CogVideo Experience', url: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4' },
    ]
  },
  {
    id: 'cultural-journeys',
    title: 'Cultural Journeys',
    description: 'Stories from around the world',
    thumbnail: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4',
    videos: [
      { id: '2', title: 'Journey Begins', url: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4' },
    ]
  },
  {
    id: 'digital-art',
    title: 'Digital Art',
    description: 'Contemporary artistic expressions',
    thumbnail: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4',
    videos: [
      { id: '3', title: 'Art in Motion', url: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/cogvideo_1770587069211.mp4' },
    ]
  },
]

export function TheatreSection() {
  const [selectedCategory, setSelectedCategory] = useState<TheatreCategory>(THEATRE_CATEGORIES[0])

  return (
    <section className="w-full bg-black py-32 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto">
        {/* Theatre Header */}
        <div className="text-center mb-20">
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-light text-gray-400 mb-8 tracking-tight">
            Theatre
          </h2>
          <div className="space-y-4 mb-12">
            <p className="text-gray-500 text-base md:text-lg font-light">
              Immerse yourself. No special requirements
            </p>
            <p className="text-gray-500 text-base md:text-lg font-light">
              Bigger screen brings better experience
            </p>
          </div>
          <div className="space-y-2 mb-12">
            <p className="text-gray-500 text-base md:text-lg font-light">
              A Living Immersive Catalog
            </p>
            <p className="text-gray-500 text-base md:text-lg font-light">
              New worlds are released regularly
            </p>
          </div>
        </div>

        {/* Featured Video Player Container */}
        <div className="relative w-full max-w-4xl mx-auto mb-16">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-transparent rounded-xl opacity-50" />
          
          {/* Video Container */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800/50">
            <video
              key={selectedCategory.id}
              src={selectedCategory.thumbnail}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              controls={false}
            />
            
            {/* GO Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Link href={`/theatre/${selectedCategory.id}`}>
                <button className="w-32 h-32 rounded-full bg-black/80 hover:bg-black/90 border-2 border-gray-700 hover:border-gray-500 transition-all duration-300 flex items-center justify-center group backdrop-blur-sm">
                  <span className="text-2xl font-light text-gray-300 group-hover:text-white transition-colors">
                    GO
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Category Info Below Video */}
          <div className="text-center mt-8">
            <h3 className="text-2xl md:text-3xl font-light text-white mb-2">
              {selectedCategory.title}
            </h3>
            <p className="text-gray-400 font-light">
              {selectedCategory.description}
            </p>
          </div>
        </div>

        {/* Category Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {THEATRE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={`group relative p-6 rounded-lg border transition-all duration-300 ${
                selectedCategory.id === category.id
                  ? 'border-cyan-400/60 bg-cyan-400/5'
                  : 'border-gray-700 bg-gray-900/20 hover:border-gray-500'
              }`}
            >
              <h4 className={`text-lg font-light mb-2 transition-colors ${
                selectedCategory.id === category.id
                  ? 'text-cyan-400'
                  : 'text-gray-300 group-hover:text-white'
              }`}>
                {category.title}
              </h4>
              <p className="text-sm text-gray-500 font-light mb-4">
                {category.description}
              </p>
              <div className={`flex items-center gap-2 text-sm transition-colors ${
                selectedCategory.id === category.id
                  ? 'text-cyan-400'
                  : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                <span>View</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
