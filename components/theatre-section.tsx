'use client'

import Link from 'next/link'

export function TheatreSection() {
  return (
    <section className="w-full bg-black py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-light text-gray-400 mb-4 tracking-wide">
          Theatre
        </h2>
        <p className="text-gray-500 mb-2">Immerse yourself in curated video experiences</p>
        <p className="text-gray-500 text-sm mb-8">Bigger screen brings better experience</p>

        <Link href="/theatre">
          <button className="py-3 px-8 rounded-lg border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 font-light tracking-wide">
            Enter Theatre
          </button>
        </Link>
      </div>
    </section>
  )
}
