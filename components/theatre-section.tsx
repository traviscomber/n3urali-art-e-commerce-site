'use client'

import Link from 'next/link'

export function TheatreSection() {
  return (
    <section className="w-full bg-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-slate-700/60">
      <div className="max-w-7xl mx-auto px-0">
        <div className="flex flex-col items-center text-center gap-6 sm:gap-8">
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-light text-cyan-400 tracking-tight leading-none">
              Theatre
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-400 font-light tracking-wide px-2">
              Immerse yourself in curated video experiences
            </p>
          </div>

          <p className="text-xs sm:text-sm md:text-base text-slate-500 font-light max-w-xl px-2">
            Bigger screen brings better experience. Watch our curated collection of immersive dome content on a cinema-scale environment.
          </p>

          <div className="pt-2 sm:pt-4">
            <Link href="/theatre">
              <button className="py-2 sm:py-2.5 px-6 sm:px-8 rounded border-2 border-cyan-500/50 text-cyan-400 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all duration-300 font-light tracking-wide text-xs sm:text-sm">
                Enter Theatre
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
