'use client'

import Image from 'next/image'
import Link from 'next/link'

interface RelatedCategoriesBlockProps {
  currentCategory: 'studio' | 'environments' | 'realities' | 'theatre'
}

const categories = [
  {
    id: 'studio',
    name: 'Studio',
    description: 'Creative workspace and production',
    image: '/office-space-360-modern.png',
  },
  {
    id: 'environments',
    name: 'Environments',
    description: '360-degree immersive worlds',
    image: '/mountain-panorama-360-sunrise.png',
  },
  {
    id: 'realities',
    name: 'Realities',
    description: 'Digital narrative experiences',
    image: '/museum-gallery-360-art.png',
  },
  {
    id: 'theatre',
    name: 'Theatre',
    description: 'Performance and live experiences',
    image: '/concert-hall-fisheye-interior.png',
  },
]

export function RelatedCategoriesBlock({
  currentCategory,
}: RelatedCategoriesBlockProps) {
  const related = categories.filter((cat) => cat.id !== currentCategory)

  return (
    <>
      {/* Top Divider */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-border/40" />
          <div className="border-b border-border/20" />
        </div>
      </div>

      {/* Related Categories Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Section header */}
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Explore More
          </h2>

          {/* Categories grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((category) => (
              <Link
                key={category.id}
                href={`/${category.id}`}
                className="group relative overflow-hidden rounded-lg aspect-square bg-muted hover:shadow-xl transition-all duration-300"
              >
                {/* Background Image */}
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Divider */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-border/20" />
          <div className="border-b border-border/40" />
        </div>
      </div>
    </>
  )
}
