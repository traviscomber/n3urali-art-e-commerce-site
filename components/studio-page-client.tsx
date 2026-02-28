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
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TravisProfile-cosmic-swirl.png',
    },
    {
      name: 'Irina',
      role: 'Art-curation',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IrinaProfile-moon-elephant.png',
    },
  ]

  const galleryItems = [
    {
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StudioWorkspace-keyboard.png',
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
    <div className="w-full bg-black">
      {/* Hero Section - Studio Title + Content + Image */}
      <section className="w-full h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden">
          {/* Left: Title and Content - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0">
            <div className="flex flex-col gap-6 max-w-md">
              <h1 className="text-7xl lg:text-8xl font-light text-slate-300 leading-tight">
                Studio
              </h1>
              
              <div className="space-y-5">
                <p className="text-slate-400 text-base leading-relaxed">
                  N3uralia360 is a content creation studio combining advanced proprietary <a href="#" className="text-cyan-400 hover:text-cyan-300 underline">AI tools</a> with human art direction and real production.
                </p>

                {/* We create section */}
                <div className="space-y-3 pt-2">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest opacity-60">We create:</p>
                  <ul className="space-y-1.5">
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>Full-dome cinematic stories</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>Seamless dome environments & loops</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>VR-ready immersive worlds</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>Educational & cultural series</span>
                    </li>
                    <li className="flex gap-3 items-start text-slate-300 text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>Custom immersive productions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Studio Image - 70% width, takes remaining space */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
            <Image
              src="/images/studio-hero.jpg"
              alt="N3uralia360 studio dome projection setup with immersive content"
              fill
              className="object-cover object-left"
              priority
            />
          </div>
        </div>
      </section>

      {/* Video Player Section - Full Width (Position #2) */}
      <section className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden border-b border-slate-700">
        <video
          src="https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z98ffc2d7197217df97910c16_f1103aff7f35b2839_d20260222_m230525_c005_v0501012_t0023_u01771801525343"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-5xl md:text-7xl font-light text-white text-center">
          Video player
        </div>
      </section>

      {/* Team Section */}
      <section className="min-h-screen flex items-center px-8 lg:px-12 py-16 border-b border-slate-700">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl">
            {/* Left: Team Title */}
            <div className="flex flex-col justify-center gap-6 border-r border-slate-700 pr-12">
              <h2 className="text-5xl md:text-6xl font-light text-slate-400">
                Team
              </h2>
              <p className="text-slate-400 text-sm">Introducing our crew</p>
            </div>

            {/* Right: Team Members */}
            <div className="flex flex-col gap-12 justify-center">
              {teamMembers.map((member, index) => (
                <div key={member.name} className="flex gap-8 items-center">
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-slate-400 text-sm">{member.name}</p>
                    <p className="text-slate-500 text-xs">{member.role}</p>
                  </div>
                  <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border border-slate-700">
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
      <section className="min-h-screen flex items-center px-8 lg:px-12 py-16 border-b border-slate-700">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center max-w-6xl">
            {/* Left: Title */}
            <div className="flex flex-col gap-6 lg:w-1/3">
              <h2 className="text-5xl md:text-6xl font-light text-slate-400">
                Life
              </h2>
              <p className="text-slate-400 text-sm">Production process</p>
            </div>

            {/* Right: Gallery Carousel */}
            <div className="relative lg:w-2/3 w-full">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                <Image
                  src={galleryItems[galleryIndex].image}
                  alt={galleryItems[galleryIndex].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <p className="text-4xl md:text-5xl font-light text-white text-center">
                    {galleryItems[galleryIndex].title}
                  </p>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevGallery}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label="Previous gallery item"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={handleNextGallery}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label="Next gallery item"
              >
                <ChevronRight size={40} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
