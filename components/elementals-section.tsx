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
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg%20%282%29-aQPuFI2fgsRop1jCuDnxWXhAMBjCVA.png',
    accentColor: 'cyan',
    link: '/environments?category=nature',
  },
  {
    title: 'Culture',
    subtitle: 'Heritage & Stories',
    description: 'Regions, Traditions, Architecture, Heritage Sites',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultBackg%20%281%29-XbBPuSBSiwRQaM2g09DVzXHzBbTfJF.png',
    accentColor: 'yellow',
    link: '/environments?category=culture',
  },
  {
    title: 'Mythic',
    subtitle: 'Legendary Worlds',
    description: 'Fantasy, Mythology, Ancient Realms, Cosmic',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMythBackg%20%282%29-TyglO2M7f4cLxT7fpr7RoIU1ZHwKtq.png',
    accentColor: 'purple',
    link: '/environments?category=mythic',
  },
  {
    title: 'Art',
    subtitle: 'Creative Expression',
    description: 'Abstract, Sculptures, Digital Art, Installations',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArtBackg%20%282%29-i2tI6hLUgCcC5qOAEPBzz1g91177C7.png',
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
    <section className="w-full bg-black border-b border-slate-700/60">
      <div className="space-y-8 p-4 md:p-8">
        {elementals.map((elemental, index) => (
          <Link
            key={elemental.title}
            href={elemental.link}
            className="group relative w-full h-screen md:h-96 overflow-hidden bg-slate-800 transition-all duration-300 hover:brightness-110 block rounded-lg"
          >
            {/* Background Image - Full Banner */}
            <Image
              src={elemental.imageUrl}
              alt={elemental.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
              priority={index === 0}
            />

            {/* Dark Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent group-hover:from-black/80 group-hover:via-black/60 transition-all duration-300 rounded-lg" />

            {/* Content - Left side aligned with logo */}
            <div className="absolute inset-0 flex flex-col justify-center items-start p-8 sm:p-12 lg:p-16 pl-20 sm:pl-32 lg:pl-48">
              <div className="space-y-6 max-w-2xl">
                <div className="text-left">
                  <h3 className="text-7xl sm:text-8xl lg:text-9xl font-light text-white tracking-tight mb-3 leading-none">
                    {elemental.title}
                  </h3>
                  <p className={`text-xs sm:text-sm font-light tracking-widest uppercase text-left ${accentColorMap[elemental.accentColor]?.split(' ')[0]}`}>
                    {elemental.subtitle}
                  </p>
                </div>

                <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed text-left">
                  {elemental.description}
                </p>

                <div className="inline-flex items-center gap-2 pt-4">
                  <span className={`text-sm md:text-base font-light transition-all group-hover:gap-3 ${accentColorMap[elemental.accentColor]}`}>
                    Explore
                  </span>
                  <ChevronRight className={`w-5 h-5 transform group-hover:translate-x-2 transition-transform ${accentColorMap[elemental.accentColor]?.split(' ')[0]}`} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
