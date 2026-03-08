'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/contexts/language-context'

const FINALE_IMAGE = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GrandFinale-DramaticRealmShowcase-Z9Y8X7W6V5U4T3S2R1Q0P9O8.png'

export function GrandFinaleSection() {
  const { t } = useLanguage()

  return (
    <section className="w-full max-w-full overflow-hidden bg-black py-16 sm:py-24 md:py-32 relative">
      {/* Background Image - Full coverage */}
      <div className="absolute inset-0">
        <Image
          src={FINALE_IMAGE}
          alt="Grand immersive experience showcase"
          fill
          className="object-cover opacity-60"
          priority
        />
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center min-h-64 sm:min-h-80 md:min-h-96 text-center gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-light text-white tracking-tight leading-tight sm:leading-none">
              {t('finale.heading').split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br className="hidden sm:block" />}
                </span>
              ))}
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-200 font-light max-w-2xl mx-auto px-2">
              {t('finale.description')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 pt-6 sm:pt-8 w-full px-4 sm:px-0 sm:max-w-sm">
            <Link href="/environments" className="w-full">
              <button className="w-full px-6 py-3 bg-slate-600 text-white font-medium hover:bg-slate-700 transition-colors rounded-lg">
                {t('finale.exploreAll')}
              </button>
            </Link>

            <Link href="/studio" className="w-full">
              <button className="w-full px-6 py-3 border border-slate-500 text-slate-300 font-medium hover:text-slate-100 hover:border-slate-400 transition-colors rounded-lg">
                {t('finale.learnStudio')}
              </button>
            </Link>
          </div>

          {/* Scroll Indicator - Hidden on mobile */}
          <div className="pt-8 sm:pt-12 hidden sm:block">
            <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex items-start justify-center p-2 animate-pulse">
              <div className="w-1 h-2 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
