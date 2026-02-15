'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface HomepageHeroProps {
  featuredImage?: {
    url: string
    alt: string
  }
}

export function HomepageHero({ featuredImage }: HomepageHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const features = [
    'Full-dome immersive content',
    'Dome & VR environments',
    'Seamless performance loops',
    'Educational and cultural series',
    'Custom immersive productions',
  ]

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Ensure video is muted before attempting to play
      video.muted = true
      // Try to play the video
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('[v0] Video autoplay failed:', error)
        })
      }
    }
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

          {/* Center Column: Featured Video/Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-lg overflow-hidden bg-gray-900">
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/videos/mossy-hero.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
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
