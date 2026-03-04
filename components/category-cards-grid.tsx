'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CategoryCard {
  id: string
  title: string
  label: string
  link: string
  imageUrl: string | null
  accentColor: 'gold' | 'purple' | 'green' | 'orange'
}

interface CategoryCardsGridProps {
  cards: CategoryCard[]
}

export function CategoryCardsGrid({ cards }: CategoryCardsGridProps) {
  return (
    <section className="w-full bg-black py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.link}
              className="group relative h-80 rounded-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105 shadow-lg bg-gray-900"
            >
              {/* Background Image */}
              {card.imageUrl && (
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  priority={card.id === 'studio' || card.id === 'shows'}
                />
              )}

              {/* Subtle Dark Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
