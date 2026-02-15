'use client'

import { useEffect, useState } from 'react'
import { VideoPlayer } from './video-player'

interface HomepageHeroProps {
  featuredImage?: {
    url: string
    alt: string
  }
}

export function HomepageHero({ featuredImage }: HomepageHeroProps) {
  const [videoUrl, setVideoUrl] = useState<string>('/videos/hero.mp4')
  const [isLoading, setIsLoading] = useState(false)

  const features = [
    'Full-dome immersive content',
    'Dome & VR environments',
    'Seamless performance loops',
    'Educational and cultural series',
    'Custom immersive productions',
  ]

  useEffect(() => {
    // Fetch studio video from database (optional - fallback to local)
    const fetchStudioVideo = async () => {
      try {
        console.log('[v0] Fetching studio video from database')
        const response = await fetch('/api/collections/studio')
        if (response.ok) {
          const data = await response.json()
          if (data.video_url) {
            console.log('[v0] Using database video URL:', data.video_url)
            setVideoUrl(data.video_url)
          }
        }
      } catch (error) {
        console.log('[v0] Database fetch failed, using local video:', error)
      }
    }

    fetchStudioVideo()
  }, [])

  return (
    <section className="w-full bg-black py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-center">
          {/* Left Column: Title, Subtitle, Description */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-blue-300 mb-2 tracking-tight">
                Studio
              </h1>
              <p className="text-lg md:text-xl text-gray-500 font-light">
                Built to Perform
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-sm font-light">
                Cinematic dome stories, seamless immersive loops, and VR-ready environments — crafted for dome operators, immersive events, and live performance.
              </p>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-sm font-light">
                Projection-ready. Dome-correct. Instantly deployable.
              </p>
            </div>
          </div>

          {/* Center Column: Featured Video */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl">
              <VideoPlayer
                src={videoUrl}
                loop={true}
                muted={true}
                autoPlay={true}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Features List */}
          <div className="flex flex-col gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-3 items-start">
                <span className="text-gray-600 text-sm flex-shrink-0 mt-1">•</span>
                <p className="text-sm md:text-base text-gray-400 font-light">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
