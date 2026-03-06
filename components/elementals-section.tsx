'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

interface ElementalCard {
  title: string
  subtitle: string
  description: string
  imageUrl: string
  accentColor: string
  link: string
}

const elementals: ElementalCard[] = [
  {
    title: 'Nature',
    subtitle: 'Elemental Forces',
    description: 'Oceans, Volcanoes, Ice & Snow, Underwater Life',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater1-32cco29YdW82Sg3nv1RIWp43PKLSYN.png',
    accentColor: 'cyan',
    link: '/environments?category=nature',
  },
  {
    title: 'Culture',
    subtitle: 'Heritage & Stories',
    description: 'Regions, Traditions, Architecture, Heritage Sites',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CultureShowcase-LhCKvvJvT3FsT7c2mQ0k9V5yI9XvE8.png',
    accentColor: 'yellow',
    link: '/environments?category=culture',
  },
  {
    title: 'Mythic',
    subtitle: 'Legendary Worlds',
    description: 'Fantasy, Mythology, Ancient Realms, Cosmic',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MythicShowcase-PqR7wXyZ2a3bC4dE5fG6hI7jK8lM9nO.png',
    accentColor: 'purple',
    link: '/environments?category=mythic',
  },
  {
    title: 'Art',
    subtitle: 'Creative Expression',
    description: 'Abstract, Sculptures, Digital Art, Installations',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ArtShowcase-9oP8nM7lK6jI5hG4fE3dC2bA1zYxW.png',
    accentColor: 'orange',
    link: '/environments?category=art',
  },
]

const accentColorMap: Record<string, string> = {
  cyan: 'text-cyan-400 border-cyan-400/40 hover:border-cyan-400 hover:text-cyan-400',
  yellow: 'text-yellow-400 border-yellow-400/40 hover:border-yellow-400 hover:text-yellow-400',
  purple: 'text-purple-400 border-purple-400/40 hover:border-purple-400 hover:text-purple-400',
  orange: 'text-orange-400 border-orange-400/40 hover:border-orange-400 hover:text-orange-400',
}

export function ElementalsSection() {
  return (
    <section className="w-full bg-black py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {elementals.map((elemental) => (
            <Link
              key={elemental.title}
              href={elemental.link}
              className="group relative h-96 rounded-lg overflow-hidden bg-slate-800 shadow-lg border border-slate-700/40 hover:border-slate-600/60 transition-all duration-300 transform hover:scale-105"
            >
              {/* Background Image */}
              <Image
                src={elemental.imageUrl}
                alt={elemental.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Dark Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/80 group-hover:via-black/30 group-hover:to-black/10 transition-all duration-300" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-5xl sm:text-6xl font-light text-white tracking-tight mb-2">
                      {elemental.title}
                    </h3>
                    <p className={`text-xs sm:text-sm font-light tracking-widest uppercase ${accentColorMap[elemental.accentColor]?.split(' ')[0]}`}>
                      {elemental.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-slate-300 font-light leading-relaxed max-w-xs">
                    {elemental.description}
                  </p>

                  <div className="inline-flex items-center gap-2 pt-2">
                    <span className={`text-sm font-light transition-all group-hover:gap-3 ${accentColorMap[elemental.accentColor]}`}>
                      Explore
                    </span>
                    <ChevronRight className={`w-4 h-4 transform group-hover:translate-x-1 transition-transform ${accentColorMap[elemental.accentColor]?.split(' ')[0]}`} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
