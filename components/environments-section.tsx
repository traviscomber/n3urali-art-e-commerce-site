import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function EnvironmentsSection() {
  return (
    <section className="w-full bg-black py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto">
        {/* Main Environments Header */}
        <div className="mb-20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
            <div className="flex-1">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-cyan-400 mb-4 tracking-tight">
                Environments
              </h2>
              <p className="text-lg md:text-xl text-gray-400 font-light mb-6">
                Endless Immersive Backdrops
              </p>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg font-light mb-6">
                Environments are continuous immersive loops crafted using professional motion tuned specifically for dome perception.
              </p>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg font-light">
                When you need atmosphere and flexibility
              </p>
            </div>
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <Link href="/environments" className="inline-flex items-center gap-4 group">
                <span className="text-gray-400 text-sm font-light group-hover:text-cyan-400 transition-colors">
                  Choose environment
                </span>
                <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
          <div className="h-px bg-gray-600/60" />
        </div>

        {/* Environment Collections Container */}
        <div className="space-y-20">
          {/* Collection 1: Heritage Environments */}
          <EnvironmentCollection
            title="Heritage Environments"
            subtitle="Travel like never before!"
            images={[
              { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EH1-Dqv4I3pSMeCK9NxLTaFxtb1VANTGwj.png', alt: 'Modern City Dome' },
              { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EH2-4IhImlQqz5kKqrpXG4E82X3st6cOxq.png', alt: 'Heritage Temple' },
              { src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EH3-wOIyeBtXJHkwkfy0iotkQWUkSQ5Ibg.png', alt: 'Urban Architecture' },
            ]}
            ctaText="Choose environment"
            ctaLink="/environments/heritage"
          />

          {/* Collection 2: Mythical Universe */}
          <EnvironmentCollection
            title="Mythical Universe"
            subtitle="Find yourself inside the legends"
            images={[
              { src: '', alt: 'Mythical 1' },
              { src: '', alt: 'Mythical 2' },
              { src: '', alt: 'Mythical 3' },
            ]}
            ctaText="Get Those Loops!"
            ctaLink="/environments/mythical"
          />

          {/* Collection 3: Art Spaces */}
          <EnvironmentCollection
            title="Art Spaces"
            subtitle="Dreams you can choose"
            images={[
              { src: '', alt: 'Art 1' },
              { src: '', alt: 'Art 2' },
              { src: '', alt: 'Art 3' },
            ]}
            ctaText="Choose environment"
            ctaLink="/environments/art"
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
}

function EnvironmentCollection({
  title,
  subtitle,
  images,
  ctaText,
  ctaLink,
}: EnvironmentCollectionProps) {
  return (
    <div className="space-y-8 pb-12 border-b border-gray-600/60">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-4xl md:text-5xl font-light text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-400 text-sm font-light">
            {subtitle}
          </p>
        </div>
        <div className="mt-6 md:mt-0">
          <Link href={ctaLink} className="inline-flex items-center gap-3 group">
            <span className="text-gray-400 text-sm font-light group-hover:text-cyan-400 transition-colors">
              {ctaText}
            </span>
            <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Image Grid - 3 Circular Images with Center Highlighted */}
      <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
        {images.map((image, index) => {
          const isCenter = index === 1
          const sizeClass = isCenter ? 'w-64 h-64 md:w-80 md:h-80' : 'w-48 h-48 md:w-56 md:h-56'
          
          return (
            <button
              key={index}
              onClick={() => window.location.href = ctaLink}
              className={`relative rounded-full overflow-hidden transform transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer flex-shrink-0 ${sizeClass} ${
                isCenter ? 'ring-2 ring-cyan-400/30 hover:ring-cyan-400/60' : ''
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={isCenter}
                sizes={isCenter ? "(max-width: 768px) 256px, 320px" : "(max-width: 768px) 192px, 224px"}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
