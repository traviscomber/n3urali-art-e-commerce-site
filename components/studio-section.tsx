'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export function StudioSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const services = [
    'Full-dome cinematic stories',
    'Seamless dome environments & loops',
    'VR-ready immersive worlds',
    'Educational content series',
    'Custom immersive productions',
  ]

  const teamMembers = [
    {
      name: 'Travis',
      role: 'AI-developing',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TravisCircle-4E8xK3pQ9L2mN5vB8xY7zC6dA9eF1gH2.png',
    },
    {
      name: 'Irina',
      role: 'Art-curation',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IrinaCircle-5F9yL4qR0M3nO6wC9yZ8aD7eB0fG2hI3.png',
    },
  ]

  const gallerySlides = [
    {
      title: 'photo gallery',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StudioGallery1-1A2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU.png',
    },
    {
      title: 'Behind the scenes',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StudioGallery2-2B3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV.png',
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % gallerySlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + gallerySlides.length) % gallerySlides.length)
  }

  return (
    <section className="w-full bg-black py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-600/60">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="flex flex-col">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-cyan-400 mb-8 tracking-tight">
              Studio
            </h2>

            <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light mb-6">
              N3uralia360 is a content creation studio combining advanced proprietary AI tools with human art direction and real production.
            </p>

            <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light mb-6">
              We create:
            </p>

            <ul className="space-y-3 mb-8">
              {services.map((service, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <span className="text-blue-400 text-sm flex-shrink-0 mt-1">•</span>
                  <span className="text-sm md:text-base text-gray-400 font-light">
                    {service}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/studio"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group w-fit"
            >
              <span className="text-sm md:text-base font-light">Explore Studio</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* Right Column - Image */}
          <div className="relative h-96 lg:h-auto">
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StudioDomeProjector-3C4dE5fG6hI7jK8lM9nO0pQ1rS2tU3vW.png"
                alt="N3uralia360 Studio Dome Projection"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden group">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StudioVideoBackground-4D5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX.png"
            alt="Video Player Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-5xl md:text-6xl font-light text-white text-balance">
                Video player
              </h3>
              <p className="text-gray-300 text-sm mt-4 font-light">
                Click to play studio showcase
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-600/60" />

        {/* Team Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text */}
          <div className="flex flex-col">
            <h3 className="text-4xl md:text-5xl font-light text-gray-500 mb-6 tracking-tight">
              Team
            </h3>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
              Introducing our crew
            </p>
          </div>

          {/* Right Column - Team Members */}
          <div className="flex justify-center lg:justify-end gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 ring-2 ring-gray-700 hover:ring-blue-400/50 transition-all">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="text-lg font-light text-white text-center mb-1">
                  {member.name}
                </h4>
                <p className="text-sm text-gray-400 font-light text-center">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-600/60" />

        {/* Life/Production Section */}
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-4xl md:text-5xl font-light text-gray-500 mb-4 tracking-tight">
                Life
              </h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
                Production process
              </p>
            </div>
            
            {/* Navigation Arrows */}
            <div className="flex gap-4">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition-colors text-gray-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition-colors text-gray-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gallery Carousel */}
          <div className="relative w-full h-96 lg:h-[500px] rounded-lg overflow-hidden">
            <Image
              src={gallerySlides[currentSlide].image}
              alt={gallerySlides[currentSlide].title}
              fill
              className="object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h4 className="text-5xl md:text-6xl font-light text-white text-center text-balance">
                {gallerySlides[currentSlide].title}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
