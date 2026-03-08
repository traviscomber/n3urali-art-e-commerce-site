'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/lib/contexts/language-context'

export function StudioPageClient() {
  const { t } = useLanguage()
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
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_00000000ee7071f59683d205a8420d01-MAJ7wyOFcrHAp7zpe0O3CCtNiN39jv.png',
      title: 'Dragon Immersion',
    },
    {
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file_0000000084b4720eab101516c1d517ef-isrhjXPFYMJ2NRAjYnKXaqq7UFm5QK.png',
      title: 'Cosmic Dreams',
    },
  ]

  const handlePrevGallery = () => {
    setGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
  }

  const handleNextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryItems.length)
  }

  return (
    <div className="w-full max-w-full overflow-hidden bg-black">
      {/* Video Player Section - Full Width (Position #1) */}
      <section className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <video
          src="https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z98ffc2d7197217df97910c16_f1103aff7f35b2839_d20260222_m230525_c005_v0501012_t0023_u01771801525343"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </section>

      {/* Hero Section - Studio Title + Content + Image */}
      <section className="w-full min-h-screen sm:h-screen">
        <div className="w-full h-full flex flex-col sm:flex-row items-stretch overflow-hidden relative">
          {/* Left: Title and Content - Full width mobile, 30% on desktop */}
          <div className="w-full sm:w-[30%] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-12 md:px-16 lg:px-20 flex-shrink-0">
            <div className="flex flex-col gap-4 sm:gap-6 max-w-md">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-slate-300 leading-tight">
                {t('studio.title')}
              </h1>
              
              <div className="space-y-3 sm:space-y-5">
                <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                  N3uralia360 is a content creation studio combining advanced proprietary <a href="#" className="text-cyan-400 hover:text-cyan-300 underline">{t('studio.aiToolsLink')}</a> with human art direction and real production.
                </p>

                {/* We create section */}
                <div className="space-y-2 sm:space-y-3 pt-2">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest opacity-60">{t('studio.weCreate')}</p>
                  <ul className="space-y-1 sm:space-y-1.5">
                    <li className="flex gap-2 sm:gap-3 items-start text-slate-300 text-xs sm:text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>{t('studio.fullDome')}</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 items-start text-slate-300 text-xs sm:text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>{t('studio.seamlessDome')}</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 items-start text-slate-300 text-xs sm:text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>{t('studio.vrReady')}</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 items-start text-slate-300 text-xs sm:text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>{t('studio.educational')}</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 items-start text-slate-300 text-xs sm:text-sm">
                      <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                      <span>{t('studio.custom')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Studio Image - Hidden on mobile, 70% on desktop */}
          <div className="hidden sm:flex sm:flex-1 relative overflow-hidden items-center justify-center px-4 sm:px-8">
            <div className="relative w-4/5 h-4/5 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StudioPH1%20%282%29.png-MUbwmGnNIo5DpzwPuuFBiVuFBL7zqb.jpeg"
                alt="N3uralia360 studio dome projection setup with immersive content displayed on dome"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full min-h-screen sm:h-screen">
        <div className="w-full h-full flex flex-col sm:flex-row items-stretch overflow-hidden relative">
          {/* Left: Title and Content - Full width mobile, 30% on desktop */}
          <div className="w-full sm:w-[30%] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-12 md:px-16 lg:px-20 flex-shrink-0">
            <div className="flex flex-col gap-4 sm:gap-8 max-w-md">
              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-slate-300 leading-tight">
                {t('studio.teamTitle')}
              </h2>
              
              <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                {t('studio.teamDescription')}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-4 pt-4">
                <button className="px-3 sm:px-6 py-2 border border-cyan-400 text-cyan-400 text-xs sm:text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  {t('studio.ourTools')}
                </button>
                <button className="px-3 sm:px-6 py-2 border border-cyan-400 text-cyan-400 text-xs sm:text-sm font-medium hover:bg-cyan-400/10 transition-colors">
                  {t('studio.whatsapp')}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Team Members - Hidden on mobile, 70% on desktop */}
          <div className="hidden sm:flex sm:flex-1 relative overflow-hidden items-center justify-center px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-6 lg:gap-12 justify-center items-end w-full">
              {/* Team Member 1 */}
              <div className="flex flex-col gap-3 sm:gap-4 items-center text-center">
                <div className="relative w-40 h-40 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-full overflow-hidden border border-slate-700 flex-shrink-0">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/T31-icn8zhQpqszgBmYVNR57HNzAmikXcO.png"
                    alt="Juan Vial - AI Development"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <p className="text-slate-400 text-base sm:text-lg font-light">Juan Vial</p>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs">
                    {t('studio.juanBio')}
                  </p>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="flex flex-col gap-3 sm:gap-4 items-center text-center">
                <div className="relative w-40 h-40 sm:w-36 sm:h-36 lg:w-48 lg:h-48 rounded-full overflow-hidden border border-slate-700 flex-shrink-0">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/I-wc9y6bsZ9YaB24VxUIKbDCbvpJnlJe.png"
                    alt="Irina Lebedeva - Visual Identity"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <p className="text-slate-400 text-base sm:text-lg font-light">Irina Lebedeva</p>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs">
                    {t('studio.irinaBio')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Life/Production Section */}
      <section className="w-full min-h-screen sm:h-screen">
        <div className="w-full h-full flex flex-col sm:flex-row items-stretch overflow-hidden relative">
          {/* Left: Title - Full width mobile, 30% on desktop */}
          <div className="w-full sm:w-[30%] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-12 md:px-16 lg:px-20 flex-shrink-0">
            <div className="flex flex-col gap-4 sm:gap-6 max-w-md">
              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-slate-300 leading-tight">
                {t('studio.lifeGalleryTitle')}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm md:text-base">
                {t('studio.lifeGalleryDescription')}
              </p>
            </div>
          </div>

          {/* Right: Gallery Carousel - Hidden on mobile, 70% on desktop */}
          <div className="hidden sm:flex sm:flex-1 relative overflow-hidden items-center justify-center px-4 sm:px-8">
            <div className="relative w-full max-w-2xl flex flex-col gap-4 sm:gap-6">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                <Image
                  src={galleryItems[galleryIndex].image}
                  alt={galleryItems[galleryIndex].title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Title below image */}
              <p className="text-3xl sm:text-4xl lg:text-5xl font-light text-white text-center">
                {galleryItems[galleryIndex].title}
              </p>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevGallery}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 sm:-translate-x-20 text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label={t('studio.galleryPrevious')}
              >
                <ChevronLeft size={32} className="sm:w-10 sm:h-10" />
              </button>
              <button
                onClick={handleNextGallery}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 sm:translate-x-20 text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label={t('studio.galleryNext')}
              >
                <ChevronRight size={32} className="sm:w-10 sm:h-10" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
