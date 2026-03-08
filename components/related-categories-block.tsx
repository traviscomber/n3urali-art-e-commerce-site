'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RelatedCategoriesBlockProps {
  currentCategory: 'studio' | 'environments' | 'shows' | 'theatre' | 'realities'
}

const categories = [
  {
    id: 'studio',
    name: 'Studio',
    description: 'Creative workspace and production',
    icon: '🎬',
  },
  {
    id: 'environments',
    name: 'Environments',
    description: '360-degree immersive worlds',
    icon: '🌍',
  },
  {
    id: 'shows',
    name: 'Shows',
    description: 'Cinematic dome stories',
    icon: '✨',
  },
  {
    id: 'theatre',
    name: 'Theatre',
    description: 'Performance and live experiences',
    icon: '🎭',
  },
  {
    id: 'realities',
    name: 'Realities',
    description: 'Immersive cinematic experiences',
    icon: '🌐',
  },
]

export function RelatedCategoriesBlock({
  currentCategory,
}: RelatedCategoriesBlockProps) {
  const related = categories.filter((cat) => cat.id !== currentCategory)

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-gray-800">
      <div className="space-y-8">
        {/* Section header */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Explore More
        </h2>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((category) => (
            <Link
              key={category.id}
              href={`/${category.id}`}
              className="group p-6 rounded-lg border border-gray-800 hover:border-gray-600 hover:bg-gray-900/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4 h-full flex-col justify-between">
                <div>
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {category.description}
                  </p>
                </div>
                <ArrowRight
                  size={20}
                  className="text-gray-500 group-hover:text-foreground group-hover:translate-x-1 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
