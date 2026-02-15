'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface HomepageHeroProps {
  featuredImage?: {
    url: string
    alt: string
  }
}

export function HomepageHero({ featuredImage }: HomepageHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [autoplayFailed, setAutoplayFailed] = useState(false)

  const features = [
    'Full-dome immersive content',
    'Dome & VR environments',
    'Seamless performance loops',
    'Educational and cultural series',
    'Custom immersive productions',
  ]

  // Handle when video metadata is loaded and ready to play
  const handleCanPlay = () => {
    console.log('[v0] Video can play - attempting autoplay')
    setVideoLoaded(true)
    
    const video = videoRef.current
    if (video) {
      video.muted = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[v0] Video autoplay successful')
            setAutoplayFailed(false)
          })
          .catch((error) => {
            console.log('[v0] Video autoplay failed:', error.message)
            setAutoplayFailed(true)
          })
      }
    }
  }

  // Handle video load error
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.log('[v0] Video load error:', e.currentTarget.error?.message)
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Set muted immediately
      video.muted = true
      video.loop = true
      video.playsInline = true
      
      // Try to load the video
      video.load()
      console.log('[v0] Video element initialized and load() called')
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
                preload="metadata"
                muted
                loop
                playsInline
                controls={autoplayFailed}
                onCanPlay={handleCanPlay}
                onError={handleError}
                className="w-full h-full object-cover"
              >
                <source src="/videos/mossy-hero.mp4" type="video/mp4; codecs='avc1.42E01E'" />
                Your browser does not support the video tag.
              </video>
              
              {/* Loading state indicator */}
              {!videoLoaded && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-gray-500 text-sm">Loading video...</div>
                </div>
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
