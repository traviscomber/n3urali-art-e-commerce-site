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
    description: 'Oceans, Volcanoes, Ice & Snow, Forest',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg%20%282%29-aQPuFI2fgsRop1jCuDnxWXhAMBjCVA.png',
    accentColor: 'cyan',
    link: '/environments#nature',
  },
  {
    title: 'Culture',
    subtitle: 'Heritage & Stories',
    description: 'Regions, Traditions, Architecture, Heritage Sites',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultBackg%20%281%29-XbBPuSBSiwRQaM2g09DVzXHzBbTfJF.png',
    accentColor: 'yellow',
    link: '/environments#culture',
  },
  {
    title: 'Mythic',
    subtitle: 'Legendary Worlds',
    description: 'Fantasy, Mythology, Ancient Realms, Cosmic',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMythBackg%20%282%29-TyglO2M7f4cLxT7fpr7RoIU1ZHwKtq.png',
    accentColor: 'purple',
    link: '/environments#mythic',
  },
  {
    title: 'Art',
    subtitle: 'Creative Expression',
    description: 'Abstract, Sculptures, Digital Art, Installations',
    imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArtBackg%20%282%29-i2tI6hLUgCcC5qOAEPBzz1g91177C7.png',
    accentColor: 'orange',
    link: '/environments#art',
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
    <section className="w-full max-w-full overflow-hidden bg-black py-12 sm:py-16 md:py-24 lg:py-32 space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-12">
      <div className="space-y-3 sm:space-y-4 px-4 sm:px-6 lg:px-8 hidden">
        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-light text-white tracking-tight">
          Elementals
        </h2>
        <p className="text-sm sm:text-base text-slate-400 font-light">Immersive loops that set the tone</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        {elementals.map((elemental, index) => (
          <Link
            key={elemental.title}
            href={elemental.link}
            className="group relative w-full h-80 sm:h-96 md:h-96 lg:h-screen overflow-hidden bg-slate-800 transition-all duration-300 hover:brightness-110 block rounded-lg"
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
            <div className="absolute inset-0 flex flex-col justify-center items-start p-4 sm:p-8 md:p-12 lg:p-16 pl-4 sm:pl-8 md:pl-32 lg:pl-96">
              <div className="space-y-4 sm:space-y-6 max-w-2xl">
                <div className="text-left">
                  <h3 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-light text-white tracking-tight mb-2 sm:mb-3 leading-none">
                    {elemental.title}
                  </h3>
                  <p className={`text-xs sm:text-sm font-light tracking-widest uppercase text-left ${accentColorMap[elemental.accentColor]?.split(' ')[0]}`}>
                    {elemental.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm md:text-base text-slate-300 font-light leading-relaxed text-left">
                  {elemental.description}
                </p>

                <div className="inline-flex items-center gap-2 pt-2 sm:pt-4">
                  <span className={`text-xs sm:text-sm md:text-base font-light transition-all group-hover:gap-3 ${accentColorMap[elemental.accentColor]}`}>
                    Explore
                  </span>
                  <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-2 transition-transform ${accentColorMap[elemental.accentColor]?.split(' ')[0]}`} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
