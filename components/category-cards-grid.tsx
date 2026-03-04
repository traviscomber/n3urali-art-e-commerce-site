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
  const accentColorMap = {
    gold: 'text-yellow-500',
    purple: 'text-purple-400',
    green: 'text-cyan-400',
    orange: 'text-orange-400',
  }

  return (
    <section className="w-full bg-black py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.link}
              className="group relative h-80 rounded-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105 shadow-lg"
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

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300" />

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <h3 className="text-4xl lg:text-5xl font-light text-white tracking-wider">
                  {card.title}
                </h3>
                <p className={`text-sm lg:text-base font-light ${accentColorMap[card.accentColor]}`}>
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
