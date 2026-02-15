'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function ToolsLifeSection() {
  return (
    <section className="w-full bg-black py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Tools Section */}
        <div>
          <h2 className="text-5xl md:text-6xl font-light text-gray-400 mb-8">
            Tools
          </h2>

          <p className="text-gray-500 text-sm max-w-xl mb-12">
            Our studio pipeline combines proprietary AI tools with professional motion design. Some of our AI is public and you can use it to empower own creativity
          </p>

          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors group"
          >
            <span className="text-sm font-light">Tools</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Life Gallery Section */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-900 order-2 lg:order-1">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sh2CoMn8nuYSZiOMAcJL1wBYX0Dnhn.png"
                alt="Life gallery keyboard"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <h3 className="text-5xl md:text-6xl font-light text-cyan-400 mb-6">
                Life
              </h3>

              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Gallery of real photos
                </p>
                <p className="text-gray-600 text-sm font-light">
                  block inside STUDIO page
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
