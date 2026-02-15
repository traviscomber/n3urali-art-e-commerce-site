'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CategoryCard {
  id: string
  title: string
  label: string
  link: string
  imageUrl: string
  accentColor: 'gold' | 'purple' | 'green' | 'orange'
}

interface CategoryCardsGridProps {
  cards: CategoryCard[]
}

const accentColorMap = {
  gold: 'from-yellow-500/30 to-yellow-600/20',
  purple: 'from-purple-500/30 to-purple-600/20',
  green: 'from-cyan-500/30 to-green-600/20',
  orange: 'from-orange-500/30 to-orange-600/20',
}

const accentTextMap = {
  gold: 'text-yellow-400',
  purple: 'text-purple-400',
  green: 'text-cyan-400',
  orange: 'text-orange-400',
}

export function CategoryCardsGrid({ cards }: CategoryCardsGridProps) {
  return (
    <section className="w-full bg-black py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.link}
              className="group relative h-80 rounded-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105"
            >
              {/* Background Image */}
              <Image
                src={card.imageUrl}
                alt={card.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                priority={card.id === 'studio' || card.id === 'realities'}
              />

              {/* Overlay Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-t ${accentColorMap[card.accentColor]} transition-all duration-300 group-hover:opacity-80`} />

              {/* Dark overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className={`text-3xl md:text-4xl font-bold ${accentTextMap[card.accentColor]} mb-1 transition-colors duration-300`}>
                  {card.title}
                </h3>
                <p className="text-gray-300 text-sm font-light">
                  {card.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
