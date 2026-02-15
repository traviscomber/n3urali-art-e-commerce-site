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
  const [isPlaying, setIsPlaying] = useState(true)

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

    console.log('[v0] Video element found, initializing...')

    const handlePlay = () => {
      console.log('[v0] Video playing')
      setIsPlaying(true)
    }

    const handlePause = () => {
      console.log('[v0] Video paused')
      setIsPlaying(false)
    }

    const handleLoadedMetadata = () => {
      console.log('[v0] Video metadata loaded, duration:', video.duration)
    }

    const handleCanPlay = () => {
      console.log('[v0] Video can play')
      // Attempt autoplay
      video.play().catch((err) => {
        console.log('[v0] Autoplay failed:', err.message)
      })
    }

    const handleError = () => {
      console.log('[v0] Video error:', video.error?.code, video.error?.message)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    console.log('[v0] Video src:', video.src)
    console.log('[v0] Video readyState:', video.readyState)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
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
            <div className="relative w-full max-w-sm aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              >
                <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_y3EtHhRvrMrVloUmW5CqlaLbJnts/GYNIQtHrIQqvBJJr6x0oWq/public/videos/mossy-hero.mp4" type="video/mp4" />
              </video>

              {/* Play/Pause Button */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) {
                      videoRef.current.pause()
                    } else {
                      videoRef.current.play()
                    }
                  }
                }}
                className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-blue-300/80 hover:bg-blue-300'
                    : 'bg-blue-400/80 hover:bg-blue-400'
                }`}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? (
                  <svg
                    className="w-5 h-5 ml-0.5 text-black fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 ml-0.5 text-black fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
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
