import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { SECTION_BACKGROUND_IMAGES, ENVIRONMENT_COLLECTIONS } from '@/lib/constants/image-urls'

export function EnvironmentsSection() {
  return (
    <section className="w-full bg-black py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60 relative overflow-hidden">
      {/* Background Image - Full coverage */}
      <div className="absolute inset-0 opacity-30">
        <Image
          src={SECTION_BACKGROUND_IMAGES.environments}
          alt="Forest background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Content overlay */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Environments Header - Hero Section */}
        <div className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-light text-green-400 mb-3 tracking-tight leading-none">
                Environments
              </h2>
              <p className="text-base md:text-lg text-slate-400 font-light tracking-wide">
                Endless Immersive Backdrops
              </p>
            </div>

            <div className="space-y-5">
              <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
                Environments are continuous immersive loops crafted using professional motion tuned specifically for dome perception.
              </p>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
                When you need atmosphere and flexibility
              </p>
            </div>
            
            <div className="flex gap-4 pt-2">
              <Link href="/environments" className="px-6 py-2.5 border border-green-500/50 text-green-400 hover:border-green-500 hover:bg-green-500/10 transition-all text-sm font-light">
                FREE Demo
              </Link>
              <Link href="/environments" className="px-6 py-2.5 border border-slate-600/50 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all text-sm font-light">
                View Catalogue
              </Link>
            </div>
          </div>

          {/* Right Column - Visual space for background (handled by background image) */}
          <div className="hidden lg:block" />
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-700/40 mb-24" />

        {/* Environment Collections Container */}
        <div className="space-y-24">
          {/* Collection 1: Heritage Environments */}
          <EnvironmentCollection
            {...ENVIRONMENT_COLLECTIONS.heritage}
          />

          {/* Collection 2: Mythical Universe */}
          <EnvironmentCollection
            {...ENVIRONMENT_COLLECTIONS.mythical}
          />

          {/* Collection 3: Art Spaces */}
          <EnvironmentCollection
            {...ENVIRONMENT_COLLECTIONS.art}
          />
        </div>
      </div>
    </section>
  )
}

interface EnvironmentCollectionProps {
  title: string
  subtitle: string
  images: Array<{ src: string; alt: string }>
  ctaText: string
  ctaLink: string
  highlightIndex?: number
}

function EnvironmentCollection({
  title,
  subtitle,
  images,
  ctaText,
  ctaLink,
  highlightIndex = 1,
}: EnvironmentCollectionProps) {
  return (
    <div className="space-y-12 pb-24 border-b border-slate-700/40">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-slate-400 text-sm font-light">
            {subtitle}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link href={ctaLink} className="inline-flex items-center gap-3 group px-6 py-2.5 border border-slate-600/50 hover:border-slate-500 rounded transition-all">
            <span className="text-slate-400 text-sm font-light group-hover:text-cyan-400 transition-colors">
              {ctaText}
            </span>
            <div className="w-5 h-5 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Image Grid - 3 Circular Images with Center Highlighted */}
      <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
{images
  .map((image, originalIndex) => ({ image, originalIndex }))
  .filter(({ image }) => image.src && image.src.trim() !== "")
  .map(({ image, originalIndex }) => {
    // Find if this should be the center image (originally at index 1)
    const isCenter = originalIndex === 1
    const size = isCenter ? 320 : 240

    return (
      <Link
        key={originalIndex}
        href={ctaLink}
        className={`relative rounded-full overflow-hidden transform transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer flex-shrink-0 block ${
          isCenter ? "ring-2 ring-cyan-400/40 hover:ring-cyan-400/70 shadow-xl" : ""
        }`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={size}
          height={size}
          className="object-cover rounded-full"
          priority={isCenter}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full" />
      </Link>
    )
  })}
      </div>
    </div>
  )
}
