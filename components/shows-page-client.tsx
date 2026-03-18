'use client'

import { useState } from 'react'
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

  // Hero image
  const heroImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth1-H84nMKGLtexvnnGTyJQiMR35z0ne2Q.png'

  // Project thumbnails
  const projects = teaserImages.slice(0, 4).map((img) => ({
    id: img.id,
    title: img.title,
    image: img.thumbnail_medium_url || img.original_url || '',
  }))

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
    <div className="w-full bg-black text-white">
      {/* Hero Section with Background Image */}
      <section className="relative w-full overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Shows hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-12 md:px-16 lg:px-24 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light mb-3 text-gray-100">
              {t('showsPage.pageTitle')}
            </h1>
            <p className="text-gray-400 text-sm md:text-base mb-6 font-light">
              {t('showsPage.pageSubtitle')}
            </p>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl">
              {getTranslatedDescription(currentShow.description || currentShow.synopsis)}
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="w-full px-6 sm:px-12 md:px-16 lg:px-24 py-20 md:py-28 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-gray-100 mb-8">
            Projects:
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-12 leading-relaxed">
            {t('showsPage.projectsDesc') || 'The following productions are currently in development.'}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Thumbnails - Left side grid */}
            <div className="col-span-1 flex flex-col gap-4">
              {projectsData.slice(0, 3).map((project, idx) => (
                <div
                  key={project.id}
                  onClick={() => setProjectIndex(idx)}
                  className={`relative cursor-pointer overflow-hidden aspect-square transition-all duration-300 ${
                    idx === projectIndex ? 'ring-2 ring-cyan-500' : 'opacity-70 hover:opacity-100'
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

            {/* Featured image - Right side */}
            <div className="col-span-1 lg:col-span-3">
              <div className="relative bg-gray-900 overflow-hidden aspect-square lg:aspect-auto lg:h-full min-h-80">
                <Image
                  src={projectsData[projectIndex].image}
                  alt={projectsData[projectIndex].title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production Section */}
      <section className="w-full px-6 sm:px-12 md:px-16 lg:px-24 py-20 md:py-28 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-gray-100 mb-8">
            Production
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-16 leading-relaxed max-w-3xl">
            {t('showsPage.productionDesc') || 'Multiple production stages and departments contribute to creating immersive experiences.'}
          </p>

          <div className="space-y-12">
            {productionSections.map((section, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 md:gap-12 items-start">
                {/* Image - Left */}
                <div className="relative bg-gray-900 overflow-hidden aspect-square h-80">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content - Right */}
                <div className="flex flex-col justify-start pt-4">
                  <h3 className="text-2xl md:text-3xl font-light text-gray-100 mb-4">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="w-full px-6 sm:px-12 md:px-16 lg:px-24 py-20 md:py-28 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-gray-100 mb-8">
            Collaboration
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl mb-12">
            {t('showsPage.collaborationDesc') || 'We are always open to collaborations on fresh and innovative projects. Get in touch to discuss the development of your creative vision.'}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-3 border border-cyan-500 text-cyan-500 text-sm font-light hover:bg-cyan-500/10 transition-colors duration-200">
              {t('showsPage.contactNow') || 'Contact Now'}
            </button>
            <button className="px-8 py-3 border border-cyan-500 text-cyan-500 text-sm font-light hover:bg-cyan-500/10 transition-colors duration-200">
              {t('showsPage.environments') || 'Environments'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
