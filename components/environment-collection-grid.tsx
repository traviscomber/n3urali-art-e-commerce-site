'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CollectionGridProps {
  title: string
  subtitle: string
  cta: string
  images: string[]
  href: string
}

export function EnvironmentCollectionGrid({
  title,
  subtitle,
  cta,
  images,
  href,
}: CollectionGridProps) {
  return (
    <section className="w-full bg-black py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h3 className="text-4xl md:text-5xl font-light text-gray-300 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 text-sm font-light">
              {subtitle}
            </p>
          </div>

          {/* CTA Button */}
          <Link
            href={href}
            className="flex items-center gap-3 group hidden md:flex"
          >
            <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-gray-400 group-hover:bg-gray-900/50 transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </div>
          </Link>
        </div>

        {/* Separator */}
        <div className="mb-12 border-t border-gray-700/50" />

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {images.map((image, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gray-900">
                <Image
                  src={image}
                  alt={`${title} ${idx + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 flex md:hidden">
          <Link
            href={href}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-400 transition-colors"
          >
            <span className="text-sm font-light">{cta}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
