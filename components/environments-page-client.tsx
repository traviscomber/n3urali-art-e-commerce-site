'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface EnvironmentsPageClientProps {
  collections: Array<{ id: string; name: string }>
  images: Array<{ id: string; url: string; collectionId: string }>
}

export function EnvironmentsPageClient({ collections, images }: EnvironmentsPageClientProps) {
  return (
    <div className="w-full max-w-full overflow-hidden bg-black">
      {/* Nature Section */}
      <section id="nature" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 z-20">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-100 leading-tight">
              Nature
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mt-2">
              Immersive elemental forces and natural wonders
            </p>
          </div>
        </div>
        <div className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {images.filter(img => img.collectionId === 'nature').slice(0, 6).map((img, idx) => (
              <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={img.url}
                  alt="Nature environment"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section id="culture" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 z-20">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-100 leading-tight">
              Culture
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mt-2">
              Heritage environments and cultural narratives
            </p>
          </div>
        </div>
        <div className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {images.filter(img => img.collectionId === 'culture').slice(0, 6).map((img, idx) => (
              <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={img.url}
                  alt="Culture environment"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mythic Section */}
      <section id="mythic" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 z-20">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-100 leading-tight">
              Mythic
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mt-2">
              Legendary worlds and mythological realms
            </p>
          </div>
        </div>
        <div className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {images.filter(img => img.collectionId === 'mythic').slice(0, 6).map((img, idx) => (
              <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={img.url}
                  alt="Mythic environment"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Art Section */}
      <section id="art" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 z-20">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-100 leading-tight">
              Art
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mt-2">
              Creative expressions and artistic installations
            </p>
          </div>
        </div>
        <div className="w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {images.filter(img => img.collectionId === 'art').slice(0, 6).map((img, idx) => (
              <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={img.url}
                  alt="Art environment"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
