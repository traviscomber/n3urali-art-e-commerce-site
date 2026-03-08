'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SECTION_BACKGROUND_IMAGES } from '@/lib/constants/image-urls'
import { useLanguage } from '@/lib/contexts/language-context'

export function EnvironmentsSectionClient() {
  const { t } = useLanguage()

  return (
    <section className="w-full max-w-full overflow-hidden bg-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 /60 relative">
      {/* Background Image - Full coverage */}
      <div className="absolute inset-0 opacity-30">
        <Image
          src={SECTION_BACKGROUND_IMAGES.environments}
          alt="Forest background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Content overlay */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Environments Header - Hero Section */}
        <div className="mb-16 sm:mb-24 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-light text-cyan-400 mb-2 sm:mb-3 tracking-tight leading-none">
                {t('environments.landingTitle')}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-400 font-light tracking-wide">
                {t('environments.landingSubtitle')}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-5">
              <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed font-light">
                {t('environments.landingDesc1')}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-relaxed font-light">
                {t('environments.landingDesc2')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
              <Link href="/environments" className="px-4 sm:px-6 py-2 sm:py-2.5 border border-cyan-500/50 text-cyan-400 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all text-xs sm:text-sm font-light text-center sm:text-left">
                {t('environments.freeDemo')}
              </Link>
              <Link href="/environments" className="px-4 sm:px-6 py-2 sm:py-2.5 border border-slate-600/50 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all text-xs sm:text-sm font-light text-center sm:text-left">
                {t('environments.viewCatalogue')}
              </Link>
            </div>
          </div>

          {/* Right Column - Visual space for background (handled by background image) */}
          <div className="hidden lg:block" />
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-700/40 mb-24" />
      </div>
    </section>
  )
}
