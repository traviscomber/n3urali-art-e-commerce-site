'use client'

import Link from 'next/link'

export function TheatreSection() {
  return (
    <section className="w-full bg-black py-32 border-t border-slate-700/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-light text-cyan-400 tracking-tight leading-none">
              Theatre
            </h2>
            <p className="text-base md:text-lg text-slate-400 font-light tracking-wide">
              Immerse yourself in curated video experiences
            </p>
          </div>

          <p className="text-sm md:text-base text-slate-500 font-light max-w-xl">
            Bigger screen brings better experience. Watch our curated collection of immersive dome content on a cinema-scale environment.
          </p>

          <div className="pt-4">
            <Link href="/theatre">
              <button className="py-2.5 px-8 rounded border-2 border-cyan-500/50 text-cyan-400 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all duration-300 font-light tracking-wide text-sm">
                Enter Theatre
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
