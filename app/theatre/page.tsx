'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface TheatreCategory {
  id: string
  title: string
  description: string
  videoUrl: string
}

const THEATRE_CATEGORIES: TheatreCategory[] = [
  {
    id: 'immersive-worlds',
    title: 'Immersive Worlds',
    description: 'Explore boundless digital realms',
    videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-4.mov',
  },
  {
    id: 'cultural-journeys',
    title: 'Cultural Journeys',
    description: 'Stories from around the world',
    videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop360-Indo+(1).mov',
  },
  {
    id: 'digital-art',
    title: 'Digital Art',
    description: 'Contemporary artistic expressions',
    videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/WebBackdrop5.mov',
  },
]

export default function TheatrePage() {
  const [selectedCategory, setSelectedCategory] = useState<TheatreCategory>(THEATRE_CATEGORIES[0])

  const handleCategoryClick = (category: TheatreCategory) => {
    setSelectedCategory(category)
  }

  return (
    <main className="min-h-screen w-full bg-black">
      {/* Header Section */}
      <div className="pt-20 pb-12 text-center border-b border-gray-800">
        <h1 className="text-5xl md:text-6xl font-light text-gray-400 mb-6 tracking-wide">
          Theatre
        </h1>
        <div className="space-y-2 text-gray-500 text-sm md:text-base">
          <p>Immerse yourself. No special requirements</p>
          <p>Bigger screen brings better experience</p>
          <p className="mt-4">A Living Immersive Catalog</p>
          <p>New worlds are released regularly</p>
        </div>
      </div>

      {/* Featured Video Section */}
      <div className="w-full px-6 py-16 max-w-7xl mx-auto">
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-12 group">
          <video
            key={selectedCategory.id}
            src={selectedCategory.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />

          {/* GO Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full border-2 border-gray-600 group-hover:border-cyan-500 transition-colors duration-300 flex items-center justify-center">
              <span className="text-cyan-400 text-lg font-light tracking-wider">GO</span>
            </div>
          </div>
        </div>

        {/* Category Title and Description */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-300 mb-2">
            {selectedCategory.title}
          </h2>
          <p className="text-gray-500">
            {selectedCategory.description}
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {THEATRE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                selectedCategory.id === category.id
                  ? 'border-cyan-500 bg-gray-900/30'
                  : 'border-gray-700 hover:border-cyan-500/50'
              }`}
            >
              <h3 className="text-lg font-light text-cyan-400 mb-2">
                {category.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {category.description}
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-light">
                <span>View</span>
                <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
