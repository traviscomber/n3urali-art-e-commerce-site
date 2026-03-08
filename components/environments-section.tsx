import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { SECTION_BACKGROUND_IMAGES, ENVIRONMENT_COLLECTIONS } from '@/lib/constants/image-urls'
import { EnvironmentsSectionClient } from './environments-section-client'

export function EnvironmentsSection() {
  return (
    <EnvironmentsSectionClient />
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
    <div className="space-y-12 pb-24 /40">
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
