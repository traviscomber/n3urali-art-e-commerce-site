'use client'

import Image from 'next/image'

interface CategoryHeroBlockProps {
  category: 'studio' | 'environments' | 'shows' | 'theatre' | 'realities'
  title: string
  subtitle: string
  description: string
  features: string[]
  featuredImage?: {
    url: string
    alt: string
  }
}

const categoryConfig = {
  studio: {
    textColor: 'text-blue-400',
  },
  environments: {
    textColor: 'text-green-400',
  },
  shows: {
    textColor: 'text-purple-400',
  },
  theatre: {
    textColor: 'text-orange-400',
  },
  realities: {
    textColor: 'text-cyan-400',
  },
}

export function CategoryHeroBlock({
  category,
  title,
  subtitle,
  description,
  features,
  featuredImage,
}: CategoryHeroBlockProps) {
  const config = categoryConfig[category]

  return (
    <section className="w-full min-h-screen bg-black py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-center">
          {/* Left Column: Title, Subtitle, Description */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className={`text-5xl md:text-6xl font-bold ${config.textColor} mb-2`}>
                {title}
              </h1>
              <p className="text-lg md:text-xl text-gray-400 font-light">
                {subtitle}
              </p>
            </div>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-sm">
              {description}
            </p>
          </div>

          {/* Center Column: Featured Image */}
          {featuredImage && (
            <div className="flex justify-center">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image
                  src={featuredImage.url}
                  alt={featuredImage.alt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Right Column: Features List */}
          <div className="flex flex-col gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-3 items-start">
                <span className="text-gray-500 text-sm flex-shrink-0 mt-1">•</span>
                <p className="text-sm md:text-base text-gray-300">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
