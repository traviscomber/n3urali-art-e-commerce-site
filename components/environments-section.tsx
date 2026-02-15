'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function EnvironmentsSection() {
  return (
    <section className="w-full bg-black py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Title and Description */}
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl md:text-6xl font-light text-cyan-400 mb-4">
                Environments
              </h2>
              <p className="text-gray-500 text-sm">Endless Immersive Backdrops</p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-sm font-light leading-relaxed max-w-md">
                Environments are continuous immersive loops crafted using professional motion tuned specifically for dome perception.
              </p>
              <p className="text-gray-500 text-sm font-light">
                When you need atmosphere and flexibility
              </p>
            </div>
          </div>

          {/* Right: Choose button */}
          <div className="flex justify-end">
            <Link
              href="/environments"
              className="flex flex-col items-center gap-2 group"
            >
              <div className="text-center">
                <p className="text-gray-400 mb-2">Choose</p>
                <p className="text-gray-600 text-sm">environment</p>
              </div>
              <div className="w-16 h-16 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-400/10 transition-all duration-300">
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
