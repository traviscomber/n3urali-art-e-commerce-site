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

// Play button overlay for video thumbnails
const PlayButton = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors duration-300">
    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
      <svg className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  </div>
)

// Video player for main display
const VideoPlayer = ({ src, poster, title }: { src: string; poster?: string; title: string }) => (
  <video
    key={src}
    src={src}
    poster={poster}
    className="w-full h-full object-cover"
    autoPlay
    loop
    muted
    playsInline
  >
    <source src={src} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
)

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

  // Project videos with thumbnail images and video URLs
  const videoProjects = [
    {
      videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/SurrealShows.mov',
      thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SurrealShowsIcn-FrWPb5ADa9osWM6AP695tFrWsXhDe0.png',
    },
    {
      videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/El+Trauko.mov',
      thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth2-5zeFMllXp1WFWUyJgvnpY8plIxwQts.png',
    },
    {
      videoUrl: 'https://f005.backblazeb2.com/file/Neuraliart/VIDEOS/MossyShows.mov',
      thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MossyShowsIcn-cKLYi9YhEAWt9e6O7pBOj0EDnHctbj.png',
    },
  ]

  const projects = teaserImages.slice(0, 4).map((img, idx) => ({
    id: img.id,
    title: img.title,
    thumbnail: idx < 3 ? videoProjects[idx].thumbnail : (img.thumbnail_medium_url || img.original_url || ''),
    videoUrl: idx < 3 ? videoProjects[idx].videoUrl : null,
    isVideo: idx < 3,
  }))

  const projectsData = projects.length > 0 ? projects : [
    { id: '1', title: 'Project 1', thumbnail: videoProjects[0].thumbnail, videoUrl: videoProjects[0].videoUrl, isVideo: true },
    { id: '2', title: 'Project 2', thumbnail: videoProjects[1].thumbnail, videoUrl: videoProjects[1].videoUrl, isVideo: true },
    { id: '3', title: 'Project 3', thumbnail: videoProjects[2].thumbnail, videoUrl: videoProjects[2].videoUrl, isVideo: true },
    { id: '4', title: 'Project 4', thumbnail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth4-W0eVn7cqin99zRFZN90EDL8J39HY9V.png', videoUrl: null, isVideo: false },
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
      {/* Hero Section with Background Video */}
      <section className="relative w-full overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          >
            <source src="https://f005.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z98ffc2d7197217df97910c16_f1106b5a21d7a0c35_d20260318_m210234_c005_v0501039_t0038_u01773867754314" type="video/mp4" />
          </video>
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-12 md:px-16 lg:px-24 py-24 md:py-40 min-h-[600px] flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light mb-3 text-cyan-300">
              {t('showsPage.pageTitle')}
            </h1>
            <p className="text-gray-400 text-sm md:text-base mb-8 font-light tracking-wide">
              {t('showsPage.pageSubtitle')}
            </p>
            <div className="space-y-4 max-w-2xl">
              {t('showsPage.descriptionDefault')?.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="w-full px-6 sm:px-12 md:px-16 lg:px-24 py-20 md:py-28 border-t border-gray-800 bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-light text-gray-100 mb-12">
            Projects:
          </h2>
          <div className="flex flex-col gap-12 mb-8">
            {/* Text content first on all screens - properly formatted with bullets and line breaks */}
            <div className="w-full max-w-4xl space-y-8">
              {/* Introduction paragraphs */}
              <div className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line text-left">
                <p className="mb-6">A selection of developed and in-progress worlds.</p>
                <p>Each project represents a different type of environment, from natural systems to abstract spatial compositions and narrative-driven worlds.</p>
              </div>

              {/* Shows presentation types - Clean card style matching Production section */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 md:p-10 transition-all duration-300">
                <h3 className="text-lg md:text-xl font-light text-white mb-6 flex items-center gap-3">
                  <span className="inline-block w-1 h-6 bg-teal-400 rounded"></span>
                  Shows can be presented as:
                </h3>
                <div className="space-y-3">
                  {['Fulldome Experiences', 'Immersive Installations', 'Educational Environments', 'Custom Spatial Productions'].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-5 h-5 rounded-sm bg-teal-500/30 border border-teal-500/40 flex items-center justify-center mt-0.5 group-hover:bg-teal-500/50 transition-all duration-300">
                        <span className="text-teal-300 text-xs font-semibold">•</span>
                      </div>
                      <span className="text-white text-sm md:text-base font-light group-hover:text-teal-200 transition-colors duration-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Images section - below text on mobile, grid on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
              {/* Thumbnails - Left side grid on desktop */}
              <div className="col-span-1 flex flex-col gap-6">
                {projectsData.slice(0, 3).map((project, idx) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-3"
                  >
                    <div
                      onClick={() => setProjectIndex(idx)}
                      className={`relative cursor-pointer overflow-hidden aspect-square transition-all duration-300 rounded-lg group ${
                        idx === projectIndex 
                          ? 'ring-2 ring-gray-600 shadow-2xl shadow-gray-600/40 scale-105' 
                          : 'opacity-70 hover:opacity-100 hover:ring-1 hover:ring-gray-500'
                      }`}
                    >
                      <Image
                        src={project.thumbnail}
                        alt={project.title}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-500"
                      />
                      {/* Play button overlay for videos */}
                      {project.isVideo && <PlayButton />}
                    </div>
                    {/* Project name banner */}
                    <div className={`text-center transition-all duration-300 ${
                      idx === projectIndex ? 'text-white font-semibold' : 'text-gray-400 font-light'
                    }`}>
                      <p className="text-xs md:text-sm truncate">{project.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Featured image/video - Right side with enhanced styling */}
              <div className="col-span-1 lg:col-span-4">
                <div className="relative bg-gradient-to-br from-gray-900 to-black overflow-hidden aspect-video lg:aspect-auto lg:h-full min-h-80 rounded-xl shadow-2xl border border-gray-700">
                  {projectsData[projectIndex].isVideo && projectsData[projectIndex].videoUrl ? (
                    <VideoPlayer
                      src={projectsData[projectIndex].videoUrl}
                      poster={projectsData[projectIndex].thumbnail}
                      title={projectsData[projectIndex].title}
                    />
                  ) : (
                    <Image
                      src={projectsData[projectIndex].thumbnail}
                      alt={projectsData[projectIndex].title}
                      fill
                      className="object-cover"
                    />
                  )}
                  
                  {/* Featured project name banner - bottom overlay (only for images) */}
                  {!projectsData[projectIndex].isVideo && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-6 px-6 pointer-events-none">
                      <h3 className="text-2xl md:text-3xl font-light text-white">
                        {projectsData[projectIndex].title}
                      </h3>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production Section */}
      <section className="w-full px-6 sm:px-12 md:px-16 lg:px-24 py-20 md:py-28 border-t border-gray-800">
        <div className="max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-light text-gray-100 mb-6">
            Production
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-16 leading-relaxed max-w-3xl text-left">
            {t('showsPage.productionDesc') || 'Multiple production stages and departments contribute to creating immersive experiences.'}
          </p>

          <div className="space-y-8">
            {productionSections.map((section, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
                {/* Content - shows first on mobile naturally due to flex-col */}
                <div className="flex-1 bg-gray-900/50 border border-gray-800 p-8 md:p-10 flex flex-col justify-center md:order-2 rounded-lg">
                  <h3 className="text-2xl md:text-3xl font-light text-gray-100 mb-4">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed text-left">
                    {section.description}
                  </p>
                </div>

                {/* Image - below text on mobile, left on desktop */}
                <div className="md:w-64 md:h-64 flex-shrink-0 md:order-1">
                  <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-700 overflow-hidden aspect-square md:aspect-auto rounded-lg shadow-lg">
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="w-full px-6 sm:px-12 md:px-16 lg:px-24 py-20 md:py-28 border-t border-gray-800">
        <div className="max-w-7xl">
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
