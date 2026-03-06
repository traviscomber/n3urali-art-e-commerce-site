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
    gold: 'text-yellow-400',
    purple: 'text-purple-300',
    green: 'text-cyan-400',
    orange: 'text-orange-400',
  }

  return (
    <section className="w-full bg-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-6">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.link}
              className="group relative h-64 sm:h-72 md:h-80 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 shadow-xl border border-slate-700/40 hover:border-slate-600/60"
            >
              {/* Background Image */}
              {card.imageUrl && (
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  priority={card.id === 'studio' || card.id === 'shows'}
                />
              )}

              {/* Dark Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 group-hover:via-black/30 group-hover:to-black/10 transition-all duration-300" />

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3">
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-wider">
                  {card.title}
                </h3>
                <p className={`text-xs sm:text-xs md:text-sm lg:text-sm font-light tracking-widest uppercase ${accentColorMap[card.accentColor]}`}>
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
