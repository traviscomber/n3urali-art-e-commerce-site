'use client'

import { useState } from 'react'
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

  // Filter images by category
  const getNatureImages = () => environmentImages.filter((img) => img.content_category === 'nature') || []
  const getCultureImages = () => environmentImages.filter((img) => img.content_category === 'culture') || []
  const getMythicImages = () => environmentImages.filter((img) => img.content_category === 'mythic') || []
  const getArtImages = () => environmentImages.filter((img) => img.content_category === 'art') || []

  const natureImages = getNatureImages()
  const cultureImages = getCultureImages()
  const artImages = getArtImages()

  return (
    <div className="w-full max-w-full overflow-hidden bg-black">
      {/* Nature Section */}
      <section id="nature" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg%20%282%29-aQPuFI2fgsRop1jCuDnxWXhAMBjCVA.png"
            alt="Nature - Elemental Forces"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-300 mb-2">Nature</h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8">Oceans, Volcanoes, Ice & Snow, Underwater Life</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {natureImages.map((img) => (
              <div key={img.id} className="relative aspect-video rounded overflow-hidden bg-slate-900 group cursor-pointer">
                {img.thumbnail_medium_url && (
                  <Image
                    src={img.thumbnail_medium_url}
                    alt={img.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute inset-0 flex items-end p-4">
                  <p className="text-slate-100 text-sm font-light">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section id="culture" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultBackg%20%281%29-XbBPuSBSiwRQaM2g09DVzXHzBbTfJF.png"
            alt="Culture - Heritage & Stories"
            fill
            className="object-cover"
          />
        </div>
        <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-300 mb-2">Culture</h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8">Regions, Traditions, Architecture, Heritage Sites</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cultureImages.map((img) => (
              <div key={img.id} className="relative aspect-video rounded overflow-hidden bg-slate-900 group cursor-pointer">
                {img.thumbnail_medium_url && (
                  <Image
                    src={img.thumbnail_medium_url}
                    alt={img.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute inset-0 flex items-end p-4">
                  <p className="text-slate-100 text-sm font-light">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mythic Section - HIDDEN */}
      <section id="mythic" className="hidden w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMythBackg%20%282%29-TyglO2M7f4cLxT7fpr7RoIU1ZHwKtq.png"
            alt="Mythic - Legendary Worlds"
            fill
            className="object-cover"
          />
        </div>
        <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-300 mb-2">Mythic</h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8">Fantasy, Mythology, Ancient Realms, Cosmic</p>
        </div>
      </section>

      {/* Art Section */}
      <section id="art" className="w-full max-w-full overflow-hidden border-b border-slate-700">
        <div className="relative w-full h-48 sm:h-64 md:h-80">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArtBackg%20%282%29-i2tI6hLUgCcC5qOAEPBzz1g91177C7.png"
            alt="Art - Creative Expression"
            fill
            className="object-cover"
          />
        </div>
        <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-slate-300 mb-2">Art</h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8">Abstract, Sculptures, Digital Art, Installations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {artImages.map((img) => (
              <div key={img.id} className="relative aspect-video rounded overflow-hidden bg-slate-900 group cursor-pointer">
                {img.thumbnail_medium_url && (
                  <Image
                    src={img.thumbnail_medium_url}
                    alt={img.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute inset-0 flex items-end p-4">
                  <p className="text-slate-100 text-sm font-light">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
