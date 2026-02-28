'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export function StudioPageClient() {
  const [galleryIndex, setGalleryIndex] = useState(0)

  const galleryItems = [
    {
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000ee7071f59683d205a8420d01-MAJ7wyOFcrHAp7zpe0O3CCtNiN39jv.png',
      title: 'Dragon Immersion',
    },
    {
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_0000000084b4720eab101516c1d517ef-isrhjXPFYMJ2NRAjYnKXaqq7UFm5QK.png',
      title: 'Cosmic Dreams',
    },
  ]

  // Auto-advance gallery every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % galleryItems.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [galleryItems.length])

  const handlePrevGallery = () => {
    setGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
  }

  const handleNextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryItems.length)
  }

  return (
    <div className="w-full bg-black">
      {/* Video Player Section - Full Width (Position #1) */}
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

      {/* Hero Section - Studio Title + Content + Image */}
      <section className="w-full h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Title and Content - 30% width with disconnected dividing line */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
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

          {/* Right: Studio Image - 70% with flex grow to fill remaining space */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-8">
            <div className="relative w-4/5 h-4/5">
              <Image
                src="/images/studio-hero.jpg"
                alt="N3uralia360 studio dome projection setup with immersive content"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Title and Content - 30% width with disconnected dividing line */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-8 max-w-md">
              <h2 className="text-7xl lg:text-8xl font-light text-slate-300 leading-tight">
                Team
              </h2>
              
              <p className="text-slate-400 text-base leading-relaxed">
                N3uralia360 is an AI + human studio. We build immersive content through code, curation, and cinematic motion design.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button className="px-6 py-2 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  Our Tools
                </button>
                <button className="px-6 py-2 border border-cyan-400 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right: Team Members - 70% width */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-12">
            <div className="flex gap-12 justify-center items-end w-full">
              {/* Team Member 1 */}
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border border-slate-700">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TravisProfile-cosmic-swirl.png"
                    alt="Juan Vial - AI Development"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-slate-400 text-lg font-light">Juan Vial</p>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                    Leads AI development, generative systems, and immersive production architecture.
                  </p>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border border-slate-700">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IrinaProfile-moon-elephant.png"
                    alt="Irina Lebedeva - Visual Identity"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-slate-400 text-lg font-light">Irina Lebedeva</p>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                    Shapes visual identity, and curates each world into a cohesive immersive experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Life/Production Section */}
      <section className="w-full h-screen border-b border-slate-700">
        <div className="w-full h-full flex items-stretch overflow-hidden relative">
          {/* Left: Title - 30% width with disconnected dividing line */}
          <div className="w-full lg:w-[30%] flex flex-col justify-center py-12 px-8 lg:px-12 flex-shrink-0 section-divider">
            <div className="flex flex-col gap-6 max-w-md">
              <h2 className="text-7xl lg:text-8xl font-light text-slate-300 leading-tight">
                Life Gallery
              </h2>
              <p className="text-slate-400 text-base">
                Behind the scenes and our content living among physical reality.
              </p>
            </div>
          </div>

          {/* Right: Gallery Carousel - 70% width */}
          <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center px-12">
            <div className="relative w-full max-w-2xl flex flex-col gap-6">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                <Image
                  src={galleryItems[galleryIndex].image}
                  alt={galleryItems[galleryIndex].title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Title below image */}
              <p className="text-4xl md:text-5xl font-light text-white text-center">
                {galleryItems[galleryIndex].title}
              </p>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevGallery}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label="Previous gallery item"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={handleNextGallery}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 text-slate-400 hover:text-cyan-400 transition-colors"
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
