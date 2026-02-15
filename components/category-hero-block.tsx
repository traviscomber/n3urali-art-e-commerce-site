'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CategoryHeroBlockProps {
  category: 'studio' | 'environments' | 'realities' | 'theatre'
  title: string
  description: string
  imageCount: number
}

const categoryConfig = {
  studio: {
    color: 'from-blue-600 to-blue-900',
    icon: '🎬',
    accent: 'border-blue-500',
  },
  environments: {
    color: 'from-green-600 to-green-900',
    icon: '🌍',
    accent: 'border-green-500',
  },
  realities: {
    color: 'from-purple-600 to-purple-900',
    icon: '✨',
    accent: 'border-purple-500',
  },
  theatre: {
    color: 'from-orange-600 to-orange-900',
    icon: '🎭',
    accent: 'border-orange-500',
  },
}

export function CategoryHeroBlock({
  category,
  title,
  description,
  imageCount,
}: CategoryHeroBlockProps) {
  const config = categoryConfig[category]

  return (
    <section className={`relative w-full min-h-80 md:min-h-96 bg-gradient-to-br ${config.color} overflow-hidden`}>
      {/* Decorative background element */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full blur-3xl bg-white" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col gap-6">
          {/* Icon and title */}
          <div className="flex items-center gap-4">
            <span className="text-5xl">{config.icon}</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-balance">
              {title}
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl leading-relaxed">
            {description}
          </p>

          {/* Stats and CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-4">
            <div className="text-sm md:text-base text-gray-200">
              <span className="font-semibold text-white">{imageCount}</span> works in this collection
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href={`/gallery?category=${category}`}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors`}
              >
                Explore Gallery
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/commission"
                className={`inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors`}
              >
                Commission
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
