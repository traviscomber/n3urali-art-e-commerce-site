'use client'

import { useEffect, useRef, useState } from 'react'

interface HomepageHeroProps {
  featuredImage?: {
    url: string
    alt: string
  }
}

export function HomepageHero({ featuredImage }: HomepageHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const features = [
    'Full-dome immersive content',
    'Dome & VR environments',
    'Seamless performance loops',
    'Educational and cultural series',
    'Custom immersive productions',
  ]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Configure video element
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.src = '/videos/mossy-hero.mp4'

    // When metadata loads, try to autoplay
    const handleLoadedMetadata = () => {
      console.log('[v0] Video metadata loaded')
      video.play().catch(() => {
        console.log('[v0] Autoplay blocked - will show play button')
      })
    }

    // Track when video is actually playing
    const handlePlay = () => {
      console.log('[v0] Video playing')
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
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

          {/* Center Column: Featured Video */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-lg overflow-hidden bg-gray-900">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
              />

              {/* Play button overlay if not playing */}
              {!isPlaying && (
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(() => {
                        console.log('[v0] Manual play triggered')
                      })
                    }
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer group"
                  aria-label="Play video"
                >
                  <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 ml-1 text-black"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </button>
              )}
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
