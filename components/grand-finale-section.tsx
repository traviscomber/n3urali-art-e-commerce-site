'use client'

import Link from 'next/link'
import Image from 'next/image'

const FINALE_IMAGE = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GrandFinale-DramaticRealmShowcase-Z9Y8X7W6V5U4T3S2R1Q0P9O8.png'

export function GrandFinaleSection() {
  return (
    <section className="w-full bg-black py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
              Ready to Experience<br className="hidden sm:block" />the Impossible?
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-200 font-light max-w-2xl mx-auto px-2">
              Step into worlds beyond imagination. Dome experiences designed to transcend boundaries and captivate audiences.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 w-full sm:w-auto px-4 sm:px-0">
            <Link href="/environments" className="w-full sm:w-auto">
              <button className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded border-2 border-cyan-400/50 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 font-light tracking-wide text-sm sm:text-base overflow-hidden">
                <span className="relative z-10">Explore All Experiences</span>
                <div className="absolute inset-0 bg-cyan-400/5 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </button>
            </Link>

            <Link href="/studio" className="w-full sm:w-auto">
              <button className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded border-2 border-slate-500/50 text-slate-300 hover:border-slate-400 hover:text-slate-100 transition-all duration-300 font-light tracking-wide text-sm sm:text-base overflow-hidden">
                <span className="relative z-10">Learn About Studio</span>
                <div className="absolute inset-0 bg-slate-400/5 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
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
