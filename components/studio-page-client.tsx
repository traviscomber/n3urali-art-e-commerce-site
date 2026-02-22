'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export function StudioPageClient() {
  const [galleryIndex, setGalleryIndex] = useState(0)

  const teamMembers = [
    {
      name: 'Travis',
      role: 'AI-developing',
      image: '/placeholder.svg?height=300&width=300',
    },
    {
      name: 'Irina',
      role: 'Art-curation',
      image: '/placeholder.svg?height=300&width=300',
    },
  ]

  const galleryItems = [
    {
      image: '/placeholder.svg?height=500&width=600',
      title: 'photo gallery',
    },
  ]

  const handlePrevGallery = () => {
    setGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
  }

  const handleNextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryItems.length)
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="flex items-stretch px-0 py-0">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Title and Content */}
          <div className="flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-16 lg:py-0 h-screen lg:h-auto">
            <div className="flex flex-col gap-8">
              <h1 className="text-6xl md:text-7xl font-light text-slate-400 leading-tight">
                Studio
              </h1>
              
              <div className="space-y-6">
                <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                  N3uralia360 is a content creation studio combining advanced proprietary <a href="#" className="text-cyan-400 hover:text-cyan-300 underline">AI tools</a> with human art direction and real production.
                </p>

                {/* We create section */}
                <div className="space-y-4 pt-4">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">We create:</p>
                  <ul className="space-y-2">
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0">•</span>
                      <span>Full-dome cinematic stories</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0">•</span>
                      <span>Seamless dome environments & loops</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0">•</span>
                      <span>VR-ready immersive worlds</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0">•</span>
                      <span>Educational & cultural series</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0">•</span>
                      <span>Custom immersive productions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Studio Image - Full Height */}
          <div className="relative h-screen w-full overflow-hidden">
            <Image
              src="/images/studio-ph1.png"
              alt="Studio immersive projection setup"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Video Player Section */}
      <section className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-black to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/placeholder.svg?height=900&width=1600"
            alt="Video background"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-light text-white">
            video player
          </h2>
        </div>
      </section>

      {/* Team Section */}
      <section className="min-h-screen flex items-center px-6 sm:px-8 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Team Title */}
            <div className="flex flex-col justify-center gap-6 border-r border-slate-700 pr-12">
              <h2 className="text-5xl md:text-6xl font-light text-slate-400">
                Team
              </h2>
              <p className="text-slate-400 text-sm">Introducing our crew</p>
            </div>

            {/* Right: Team Members */}
            <div className="flex flex-col gap-12">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex gap-8 items-start">
                  <div className="flex flex-col gap-2">
                    <p className="text-slate-400 text-sm">{member.name}</p>
                    <p className="text-slate-500 text-xs">{member.role}</p>
                  </div>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Life/Production Section */}
      <section className="min-h-screen flex items-center px-6 sm:px-8 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            {/* Left: Title */}
            <div className="flex flex-col gap-6 lg:w-1/3">
              <h2 className="text-5xl md:text-6xl font-light text-slate-400">
                Life
              </h2>
              <p className="text-slate-400 text-sm">Production process</p>
            </div>

            {/* Right: Gallery Carousel */}
            <div className="relative lg:w-2/3 w-full">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                <Image
                  src={galleryItems[galleryIndex].image}
                  alt={galleryItems[galleryIndex].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-3xl md:text-5xl font-light text-white text-center">
                    {galleryItems[galleryIndex].title}
                  </p>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevGallery}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label="Previous gallery item"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={handleNextGallery}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label="Next gallery item"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
