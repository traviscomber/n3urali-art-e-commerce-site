'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface Collection {
  id: string
  title: string
  work_title?: string
  description?: string
  synopsis?: string
  code?: string
}

interface EnvironmentImage {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
  tags?: string[]
  content_category?: string
}

interface EnvironmentsPageClientProps {
  collections: Collection[]
  environmentImages: EnvironmentImage[]
}

export function EnvironmentsPageClient({ collections, environmentImages }: EnvironmentsPageClientProps) {
  const [selectedNatureCategory, setSelectedNatureCategory] = useState<string | null>(null)

  // Banner URLs for each section
  const natureBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg-r9Ek7rI7yF3q0P5N2K8mL1J4v6X9w0.png'
  const cultureBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultBackg-L4p2M9k7v5R1N8X3w6J2Y9q4b8c0d5.png'
  const mythicBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMythBackg%20%282%29-UZZUeitXszDkixpZBAL3mYzMq9rEq1.png'
  const artBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArtBackg-MIwtTMvWE0TRmQidtELMbTop8VeRAE.png'

  // Nature section images
  const natureImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatOceans1-jbOpQIT9umn9y7vmiWYSkJd1wAVeZL.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatOceans2-aock6r4YqMybpqlHh9JVv7zqD3NsP3.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatOceans3-aMSmzBJ5q8CrYxLbnDeVWdWsuOTeUe.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatOceans4-4h11mltwVxcRoklFqCDuxcE6OEvYLW.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatOceans5-zkNiswQ1jsZasGcNk2fStyxfNQBDIw.png',
  ]

  const cultureImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult1-kL9n2X5v8R1p3Y6m4w7J9q0b2c5d8e1.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult2-m2P7q9R4v8X1w3Y5k8L1n4p6r9s2t5.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult3-n3Q8r0S5w9Y2x4Z6l9M2o5q7s0t3u6.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult4-o4R9s1T6x0Z3y5a7m0N3p6q8r1u4v7.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCult5-p5S0t2U7y1a4z6b8n1O4q7r9s2v5w8.png',
  ]

  const mythicImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth1-H84nMKGLtexvnnGTyJQiMR35z0ne2Q.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth2-5zeFMllXp1WFWUyJgvnpY8plIxwQts.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth3-mZG3PGuOFqePUhTm63gOYOXUhfDN6d.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth4-W0eVn7cqin99zRFZN90EDL8J39HY9V.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth5-HHbnx40rB7gy6IkODw4wqBQWJcPzhY.png',
  ]

  const artImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt1-kL9n2X5v8R1p3Y6m4w7J9q0b2c5d8e1.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt2-m2P7q9R4v8X1w3Y5k8L1n4p6r9s2t5.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt3-n3Q8r0S5w9Y2x4Z6l9M2o5q7s0t3u6.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt4-o4R9s1T6x0Z3y5a7m0N3p6q8r1u4v7.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt5-p5S0t2U7y1a4z6b8n1O4q7r9s2v5w8.png',
  ]

  const natureLabels = ['Cosmic Ocean Vortex', 'Majestic Coastal Cliffs', 'Epic Coastal Storm', 'Tropical Island Paradise', 'Fractal Ocean Beauty']
  const cultureLabels = ['Sacred Heritage', 'Cultural Legacy', 'Ancient Wisdom', 'Traditional Harmony', 'Eternal Traditions']
  const mythicLabels = ['Volcano Cloud Formation', 'Molten Planet', 'Eruption Energy', 'Lava Tunnel', 'Cosmic Volcano']
  const artLabels = ['Architecture Dreams', 'Geometric Landscape', 'Abstract Cosmos', 'Minimalist Vision', 'Surreal Realm']

  return (
    <div className="w-full max-w-full overflow-hidden bg-black">
      {/* Nature Section */}
      <section id="nature" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={natureBannerUrl}
            alt="Nature"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">
                Nature
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                Natural environments showcase Earth's beauty. Oceans, volcanoes, and ice formations create immersive worlds.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {natureImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={url}
                  alt={natureLabels[idx]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                  <p className="text-slate-100 text-xs sm:text-sm font-light line-clamp-2">{natureLabels[idx]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section id="culture" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={cultureBannerUrl}
            alt="Culture"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">
                Culture
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                Heritage environments celebrate world cultures through immersive dome experiences.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {cultureImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={url}
                  alt={cultureLabels[idx]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                  <p className="text-slate-100 text-xs sm:text-sm font-light line-clamp-2">{cultureLabels[idx]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mythic Section */}
      <section className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={mythicBannerUrl}
            alt="Mythic"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">
                Mythic
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                Mythic worlds blend symbolism and dreamlike cosmology into immersive dome experiences.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {mythicImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={url}
                  alt={mythicLabels[idx]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                  <p className="text-slate-100 text-xs sm:text-sm font-light line-clamp-2">{mythicLabels[idx]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Art Section */}
      <section className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={artBannerUrl}
            alt="Art"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-12 bg-black/40">
            <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl font-light text-slate-100 leading-tight">
                Art
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
                Bold cinematic dome worlds created for live performance and immersive stages.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {artImages.map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={url}
                  alt={artLabels[idx]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                  <p className="text-slate-100 text-xs sm:text-sm font-light line-clamp-2">{artLabels[idx]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
