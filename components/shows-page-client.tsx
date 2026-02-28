'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface Collection {
  id: string
  title: string
  work_title?: string
  description?: string
  synopsis?: string
  code?: string
}

interface TeaserImage {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
  tags?: string[]
  content_category?: string
}

interface ShowsPageClientProps {
  collections: Collection[]
  teaserImages: TeaserImage[]
}

export function ShowsPageClient({ collections, teaserImages }: ShowsPageClientProps) {
  const [teaserIndex, setTeaserIndex] = useState(0)

  const teasers = [
    {
      video: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscaled_4k_1769186425665-tIDvx4aisEE2OnZKa01br1AsjGa0U9.mp4',
      title: 'Teaser Video 1',
    },
  ]

  const handlePrevTeaser = () => {
    setTeaserIndex((prev) => (prev - 1 + teasers.length) % teasers.length)
  }

  const handleNextTeaser = () => {
    setTeaserIndex((prev) => (prev + 1) % teasers.length)
  }

  const handleTeaserClick = (idx: number) => {
    setTeaserIndex(idx)
    // Auto-play video when clicked
    setTimeout(() => {
      const videoElement = document.querySelector('video[data-main-player]') as HTMLVideoElement
      if (videoElement) {
        videoElement.play()
      }
    }, 0)
  }

  // Sample shows data (fallback if no collections)
  const shows = collections.length > 0 ? collections : [
    {
      id: '1',
      title: 'Meet Mosey — Guide of the Nile, Multiverse',
      description: 'From mythical realms to sacred atmospheres, immerse in tales of wonder.',
      code: 'mosey',
    },
  ]

  const currentShow = shows[0]

  return (
    <div className="w-full bg-black">
      {/* Hero Section */}
      <section className="w-full h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Title and Content - 30% width with disconnected dividing line */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-6 max-w-md">
              <div>
                <h1 className="text-7xl lg:text-8xl font-light text-slate-300 leading-tight">
                  Shows
                </h1>
                <p className="text-slate-500 text-base font-light mt-2">
                  Cinematic Dome Stories
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-slate-400 text-base leading-relaxed">
                  {currentShow.description || currentShow.synopsis || 'From mythical realms to sacred atmospheres, immerse in tales of wonder.'}
                </p>

                <div className="space-y-3 pt-2">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest opacity-60">Perfect for:</p>
                  <ul className="space-y-1.5">
                    {[
                      'Family dome nights',
                      'Cultural programming',
                      'Art and experience-focused events',
                      'Themed event openings',
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-3 items-start text-slate-300 text-sm">
                        <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Main Show Image - 70% with flex grow to fill remaining space */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-8">
            <div className="relative w-4/5 h-4/5 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000ee7071f59683d205a8420d01-MAJ7wyOFcrHAp7zpe0O3CCtNiN39jv.png"
                alt={currentShow.title || 'Show preview'}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Teasers Section */}
      <section className="w-full h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Teaser Info and Buttons - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-6 max-w-md">
              <h2 className="text-6xl lg:text-7xl font-light text-slate-300 leading-tight">
                Teasers:
              </h2>

              <p className="text-slate-400 text-base leading-relaxed">
                Full-length shows and dome editions are available. If you are interested in a specific episode or would like to commission a custom production, please contact our team.
              </p>

              <p className="text-slate-400 text-sm">
                We develop immersive content from concept to final delivery.
              </p>

              <div className="space-y-2 text-slate-500 text-xs leading-relaxed">
                <p>Original and consistent character design</p>
                <p>Cohesive narrative and visual building</p>
                <p>Dynamic scene editing with special effects</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button className="px-6 py-2 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  Send Email
                </button>
                <button className="px-6 py-2 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right: Scrollable Video Teasers and Preview - 70% width */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-12 gap-8">
            {/* Left Scrollable Teasers Column */}
            <div className="flex flex-col h-full justify-center">
              <div className="flex flex-col gap-4 overflow-y-auto pr-4 max-h-96">
                {teasers.map((teaser, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTeaserClick(idx)}
                    className={`relative w-32 h-32 rounded-lg overflow-hidden border transition-all flex-shrink-0 ${
                      idx === teaserIndex ? 'border-cyan-400 shadow-lg shadow-cyan-400/30' : 'border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    <video
                      src={teaser.video}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium text-center px-2">{teaser.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Main Video Preview */}
            <div className="relative flex-1 flex flex-col items-center">
              <style>{`
                video::-webkit-media-controls-fullscreen-button {
                  display: none;
                }
                video::-moz-media-controls-fullscreen-button {
                  display: none;
                }
              `}</style>
              <div className="relative w-full max-w-xl aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                <video
                  data-main-player
                  src={teasers[teaserIndex]?.video}
                  className="w-full h-full object-cover"
                  controls
                  controlsList="nodownload nofullscreen"
                  preload="metadata"
                />
              </div>

              {/* Navigation Arrows */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-24">
                <button
                  onClick={handlePrevTeaser}
                  className="text-slate-400 hover:text-cyan-400 transition-colors p-2"
                  aria-label="Previous teaser"
                >
                  <ChevronLeft size={40} />
                </button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-24">
                <button
                  onClick={handleNextTeaser}
                  className="text-slate-400 hover:text-cyan-400 transition-colors p-2"
                  aria-label="Next teaser"
                >
                  <ChevronRight size={40} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="w-full h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Deliverables Info - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-6 max-w-md">
              <h2 className="text-6xl lg:text-7xl font-light text-slate-300 leading-tight">
                Deliverables
              </h2>

              <p className="text-slate-400 text-base leading-relaxed">
                All content is delivered in professional 4K resolution and optimized for full dome, Fulldome and 360-degree environments.
              </p>

              <div className="space-y-3">
                <p className="text-slate-500 text-sm font-medium">Our productions include:</p>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Dome-ready masters</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Character creation (natural)</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Full dome environment and special effects</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                    <span>Structured storytelling and educational frameworks</span>
                  </li>
                </ul>
              </div>

              <p className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-semibold">N3uralia360</span> develops scalable immersive content for planetariums, rental domes, and exhibitions everywhere.
              </p>
            </div>
          </div>

          {/* Right: Contact Form - 70% width */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-12">
            <div className="max-w-md w-full">
              <h3 className="text-3xl font-light text-slate-300 mb-8">
                Submit Your Inquiry
              </h3>

              <form className="space-y-6">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Your email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-transparent border border-slate-600 text-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-3 block">Choose one:</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-sm">I would like to see a demo in my dome</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-sm">I am interested in watching a full episode</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-sm">I want to commission a custom show</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 text-cyan-400 focus:ring-0"
                      />
                      <span className="text-slate-400 text-sm">Other</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
