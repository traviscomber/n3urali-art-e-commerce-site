'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/lib/contexts/language-context'

interface Collection {
  id: string
  title: string
  work_title?: string
  description?: string
  synopsis?: string
  code?: string
}

interface TeaserImage {
  id: string
  title: string
  thumbnail_medium_url?: string
  original_url?: string
  upscaled_url?: string
  tags?: string[]
  content_category?: string
}

interface ShowsPageClientProps {
  collections: Collection[]
  teaserImages: TeaserImage[]
}

export function ShowsPageClient({ collections, teaserImages }: ShowsPageClientProps) {
  const { t } = useLanguage()
  const [projectIndex, setProjectIndex] = useState(0)

  const getTranslatedDescription = (description: string | undefined): string => {
    if (!description) return t('showsPage.descriptionDefault')
    if (description.includes('Chile') && description.includes('Atacama')) {
      return t('shows.description.chile')
    }
    return description
  }

  const currentShow = collections.length > 0 ? collections[0] : {
    id: '1',
    title: t('shows.sampleShowTitle'),
    description: t('shows.sampleShowDescription'),
    code: 'mosey',
  }

  // Featured still image
  const featuredImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth1-H84nMKGLtexvnnGTyJQiMR35z0ne2Q.png'

  // Project thumbnails (using teaserImages or fallback)
  const projects = teaserImages.slice(0, 4).map((img) => ({
    id: img.id,
    title: img.title,
    image: img.thumbnail_medium_url || img.original_url || '',
  }))

  // Fallback projects if no images
  const projectsData = projects.length > 0 ? projects : [
    { id: '1', title: 'Project 1', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth1-H84nMKGLtexvnnGTyJQiMR35z0ne2Q.png' },
    { id: '2', title: 'Project 2', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth2-5zeFMllXp1WFWUyJgvnpY8plIxwQts.png' },
    { id: '3', title: 'Project 3', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth3-mZG3PGuOFqePUhTm63gOYOXUhfDN6d.png' },
    { id: '4', title: 'Project 4', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth4-W0eVn7cqin99zRFZN90EDL8J39HY9V.png' },
  ]

  const productionSections = [
    {
      title: t('showsPage.worldBuilding'),
      description: t('showsPage.worldBuildingDesc'),
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth1-H84nMKGLtexvnnGTyJQiMR35z0ne2Q.png',
    },
    {
      title: t('showsPage.characters'),
      description: t('showsPage.charactersDesc'),
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth2-5zeFMllXp1WFWUyJgvnpY8plIxwQts.png',
    },
    {
      title: t('showsPage.story'),
      description: t('showsPage.storyDesc'),
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth3-mZG3PGuOFqePUhTm63gOYOXUhfDN6d.png',
    },
    {
      title: t('showsPage.soundNarration'),
      description: t('showsPage.soundNarrationDesc'),
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth4-W0eVn7cqin99zRFZN90EDL8J39HY9V.png',
    },
    {
      title: t('showsPage.mastering'),
      description: t('showsPage.masteringDesc'),
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth5-HHbnx40rB7gy6IkODw4wqBQWJcPzhY.png',
    },
  ]

  return (
    <div className="w-full max-w-full overflow-hidden bg-black">
      {/* Hero Section */}
      <section className="w-full py-12 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-slate-100 mb-2">
            {t('showsPage.pageTitle')}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mb-6">
            {t('showsPage.pageSubtitle')}
          </p>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-4">
            {getTranslatedDescription(currentShow.description || currentShow.synopsis)}
          </p>
        </div>
      </section>

      {/* Featured Still Image Section */}
      <section className="w-full py-12 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video sm:aspect-auto sm:h-96 md:h-[28rem]">
            <Image
              src={featuredImage}
              alt="Featured still image"
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded text-slate-300 text-xs font-light">
              Still Image
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="w-full py-12 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 lg:px-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-100 mb-8">
            Projects:
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-12">
            {/* Left: Thumbnails */}
            <div className="flex flex-col gap-3">
              {projectsData.map((project, idx) => (
                <div
                  key={project.id}
                  onClick={() => setProjectIndex(idx)}
                  className={`relative cursor-pointer rounded overflow-hidden aspect-square transition-all ${
                    idx === projectIndex ? 'ring-2 ring-cyan-400' : 'opacity-60 hover:opacity-80'
                  }`}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Right: Main Display */}
            <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video sm:aspect-auto sm:h-96 md:h-full flex items-center justify-center">
              <Image
                src={projectsData[projectIndex].image}
                alt={projectsData[projectIndex].title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded text-slate-300 text-xs font-light">
                Video player
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production Section */}
      <section className="w-full py-12 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 lg:px-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-100 mb-4">
            Production
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mb-12 leading-relaxed">
            {t('showsPage.productionDesc')}
          </p>

          <div className="space-y-8 md:space-y-12">
            {productionSections.map((section, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 md:gap-12 items-center">
                {/* Image */}
                <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-square md:aspect-auto md:h-80">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl sm:text-3xl font-light text-slate-100">
                    {section.title}
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="w-full py-12 sm:py-16 md:py-20 px-6 sm:px-12 md:px-16 lg:px-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-100 mb-4">
            Collaboration
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl mb-8">
            {t('showsPage.collaborationDesc')}
          </p>
          <button className="px-6 py-2 border border-cyan-400 text-cyan-400 text-sm font-light hover:bg-cyan-400/10 transition-colors rounded">
            {t('showsPage.contactNow')}
          </button>
        </div>
      </section>
    </div>
  )
}
