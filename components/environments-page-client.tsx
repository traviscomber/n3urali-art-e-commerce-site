'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
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
  const [heritageCategoryIndex, setHeritageCategoryIndex] = useState(0)
  const [artCategoryIndex, setArtCategoryIndex] = useState(0)
  const [selectedNatureCategory, setSelectedNatureCategory] = useState<string | null>(null)
  const [natureCategoryIndex, setNatureCategoryIndex] = useState(0)
  const [selectedCultureCategory, setSelectedCultureCategory] = useState<string | null>(null)

  const natureCategories = [
    { name: 'Oceans', id: 'oceans' },
    { name: 'Volcanoes', id: 'volcanoes' },
    { name: 'Underwater Life', id: 'underwater-life' },
    { name: 'Ice and Snow', id: 'ice-and-snow' },
  ]

  const natureCategoryImages: Record<string, { title: string; url: string }[]> = {
    'oceans': [
      { title: 'Luminous Mandalas', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater1-32cco29YdW82Sg3nv1RIWp43PKLSYN.png' },
      { title: 'Octopus Dream', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater2-ccZcog7a7Xvp1dPmhcpf8USyi2CFdY.png' },
      { title: 'Coral Abyss', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater3-3EBmdD7j5Z1ynv5nsqOqaHXsm9X9zn.png' },
      { title: 'Jellyfish Symphony', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater4-EgBszqfBqzfVUvFGQPNqqFQAfIjrg2.png' },
      { title: 'Deep Sea Sanctum', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater5.png-h6C4tFhELpOzMwuGcKeqiyPa2uWQHs.jpeg' },
    ],
    'volcanoes': [
      { title: 'Molten Flows', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater3-3EBmdD7j5Z1ynv5nsqOqaHXsm9X9zn.png' },
      { title: 'Crater Core', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater4-EgBszqfBqzfVUvFGQPNqqFQAfIjrg2.png' },
      { title: 'Eruption Peak', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater5.png-h6C4tFhELpOzMwuGcKeqiyPa2uWQHs.jpeg' },
      { title: 'Lava Cascade', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater1-32cco29YdW82Sg3nv1RIWp43PKLSYN.png' },
      { title: 'Fire Ring', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater2-ccZcog7a7Xvp1dPmhcpf8USyi2CFdY.png' },
    ],
    'underwater-life': [
      { title: 'Luminous Mandalas', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater1-32cco29YdW82Sg3nv1RIWp43PKLSYN.png' },
      { title: 'Octopus Dream', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater2-ccZcog7a7Xvp1dPmhcpf8USyi2CFdY.png' },
      { title: 'Coral Abyss', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater3-3EBmdD7j5Z1ynv5nsqOqaHXsm9X9zn.png' },
      { title: 'Jellyfish Symphony', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater4-EgBszqfBqzfVUvFGQPNqqFQAfIjrg2.png' },
      { title: 'Deep Sea Sanctum', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater5.png-h6C4tFhELpOzMwuGcKeqiyPa2uWQHs.jpeg' },
    ],
    'ice-and-snow': [
      { title: 'Frozen Peaks', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater2-ccZcog7a7Xvp1dPmhcpf8USyi2CFdY.png' },
      { title: 'Glacier Dreams', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater3-3EBmdD7j5Z1ynv5nsqOqaHXsm9X9zn.png' },
      { title: 'Snow Cascade', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater4-EgBszqfBqzfVUvFGQPNqqFQAfIjrg2.png' },
      { title: 'Crystal Palace', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater5.png-h6C4tFhELpOzMwuGcKeqiyPa2uWQHs.jpeg' },
      { title: 'Arctic Aurora', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatUnderwater1-32cco29YdW82Sg3nv1RIWp43PKLSYN.png' },
    ],
  }

  const cultureCategories = [
    { name: 'Thailand', id: 'thailand' },
    { name: 'Vietnam', id: 'vietnam' },
    { name: 'Singapore', id: 'singapore' },
    { name: 'Indonesia', id: 'indonesia' },
  ]

  const cultureCategoryImages: Record<string, { title: string; url: string }[]> = {
    'thailand': [
      { title: 'Golden Thai Temple', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia1-HRCxh5YlcdmtLkVDWr3DjBnWrUEXGq.png' },
      { title: 'Asian City Dome', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia2-eRyAR2PLEdPL6WSub9G1UpDX3lPwCT.png' },
      { title: 'Neon Urban Spirit', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia3-6jpN6hPeYB8wpJuuI3cZOhufpqF9fe.png' },
      { title: 'Spiral Architecture', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia4-hLfAl6AzAoQyiH3Xq3yEoUO7jMQwQP.png' },
      { title: 'Beach Temple Gateway', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia5-XPLQobSduUD7q5Xk8Wi8m2GqBpWNZV.png' },
    ],
    'vietnam': [
      { title: 'Asian City Dome', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia2-eRyAR2PLEdPL6WSub9G1UpDX3lPwCT.png' },
      { title: 'Neon Urban Spirit', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia3-6jpN6hPeYB8wpJuuI3cZOhufpqF9fe.png' },
      { title: 'Spiral Architecture', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia4-hLfAl6AzAoQyiH3Xq3yEoUO7jMQwQP.png' },
      { title: 'Beach Temple Gateway', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia5-XPLQobSduUD7q5Xk8Wi8m2GqBpWNZV.png' },
      { title: 'Golden Thai Temple', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia1-HRCxh5YlcdmtLkVDWr3DjBnWrUEXGq.png' },
    ],
    'singapore': [
      { title: 'Neon Urban Spirit', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia3-6jpN6hPeYB8wpJuuI3cZOhufpqF9fe.png' },
      { title: 'Spiral Architecture', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia4-hLfAl6AzAoQyiH3Xq3yEoUO7jMQwQP.png' },
      { title: 'Beach Temple Gateway', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia5-XPLQobSduUD7q5Xk8Wi8m2GqBpWNZV.png' },
      { title: 'Golden Thai Temple', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia1-HRCxh5YlcdmtLkVDWr3DjBnWrUEXGq.png' },
      { title: 'Asian City Dome', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia2-eRyAR2PLEdPL6WSub9G1UpDX3lPwCT.png' },
    ],
    'indonesia': [
      { title: 'Spiral Architecture', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia4-hLfAl6AzAoQyiH3Xq3yEoUO7jMQwQP.png' },
      { title: 'Beach Temple Gateway', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia5-XPLQobSduUD7q5Xk8Wi8m2GqBpWNZV.png' },
      { title: 'Golden Thai Temple', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia1-HRCxh5YlcdmtLkVDWr3DjBnWrUEXGq.png' },
      { title: 'Asian City Dome', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia2-eRyAR2PLEdPL6WSub9G1UpDX3lPwCT.png' },
      { title: 'Neon Urban Spirit', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsCultAsia3-6jpN6hPeYB8wpJuuI3cZOhufpqF9fe.png' },
    ],
  }

  const heritageCategories = [
    { name: 'North America', id: 'north-america' },
    { name: 'South America', id: 'south-america' },
    { name: 'Asia', id: 'asia' },
    { name: 'More', id: 'more' },
  ]

  const artCategories = [
    { name: 'Architecture', id: 'architecture' },
    { name: 'Landscapes', id: 'landscapes' },
    { name: 'Geometry', id: 'geometry' },
    { name: 'Cosmic', id: 'cosmic' },
    { name: 'Abstract', id: 'abstract' },
  ]

  const mythicBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMythBackg%20%282%29-UZZUeitXszDkixpZBAL3mYzMq9rEq1.png'

  const mythicImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth1-H84nMKGLtexvnnGTyJQiMR35z0ne2Q.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth2-5zeFMllXp1WFWUyJgvnpY8plIxwQts.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth3-mZG3PGuOFqePUhTm63gOYOXUhfDN6d.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth4-W0eVn7cqin99zRFZN90EDL8J39HY9V.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsMyth5-HHbnx40rB7gy6IkODw4wqBQWJcPzhY.png',
  ]

  const mythicLabels = [
    'El Tayukú Presence',
    'Halloween in Lego City',
    'Vibrant Ritual of New Caledonia',
    'Hages of Blue Ocean',
    'Angry Wind Spirit',
  ]

  const mythicCategories = [
    { name: 'Asian', id: 'asian' },
    { name: 'Mesoamerican', id: 'mesoamerican' },
    { name: 'Greek', id: 'greek' },
    { name: 'Egyptian', id: 'egyptian' },
  ]

  const artBannerUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArtBackg-MIwtTMvWE0TRmQidtELMbTop8VeRAE.png'
  
  const artImages = [
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt1-m4KYdc6BQcLkasgP33aW3ZFJ2nj3Fx.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt2-NPhNLdPp3q4K28r5Yv4uey9UtpHgAt.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt3-RdYjhjx4UGKt8ZAUJqVZsPYA5w4IWz.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt4-8WvAaJvzCMxtmtIkNB52e627HkLHfR.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsArt5-mWhVHfCKypAjRS2FHFuBjbQlGO97dV.png',
  ]

  const artLabels = [
    'Origami Jungle',
    'Cyber Tree',
    'Emerald Mandala',
    'Sky with Diamonds',
    'Prismatic Sky',
  ]

  const handleNextHeritageCategory = () => {
    setHeritageCategoryIndex((prev) => (prev + 1) % heritageCategories.length)
  }

  const handleNextArtCategory = () => {
    setArtCategoryIndex((prev) => (prev + 1) % artCategories.length)
  }

  return (
    <div className="w-full bg-black">
      {/* Show detail view if category selected, otherwise show full page */}
      {!selectedNatureCategory && (
        <>
          {/* Intro Section */}
          <section className="w-full py-16 px-8 lg:px-12 border-b border-slate-700">
            <div className="max-w-2xl">
              <h1 className="text-6xl lg:text-7xl font-light text-slate-400 leading-tight mb-4">
                Environments
              </h1>
              <p className="text-slate-500 text-base font-light mb-6">
                Seamless dome loops designed to charm.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Endless themed nights without rebuilding your show</span>
                </li>
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Clean, seamless material ready to layer and mix</span>
                </li>
                <li className="flex gap-3 items-start text-slate-400 text-sm">
                  <span className="text-cyan-400 flex-shrink-0 mt-1">•</span>
                  <span>Ambient premium visuals that elevate any space</span>
                </li>
              </ul>
            </div>
          </section>
        </>
      )}

      {/* Nature Section - Always visible with banner and nav */}
      <section className="w-full border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-80 overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EnvsNatBackg%20%281%29-TLXUR5xYkTXrK8r7ahb8ZseNFWVg53.png"
            alt="Nature"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-6xl font-light text-slate-100 leading-tight">
                Nature
              </h2>
              <p className="text-slate-200 text-base leading-relaxed max-w-md">
                Explore real world with dreamlike immersive dome interpretations. Travel between UNESCO Sites in seconds or discover diversity of real life reimagined with <span className="text-red-400">immersive</span> creativity.
              </p>
            </div>
          </div>
        </div>

        {/* Asia Header */}
        <div className="relative w-full px-12 py-6 border-b border-slate-700">
          <h3 className="text-slate-200 text-base font-light">Southeast Asia</h3>
        </div>

        {/* Region Navigation Tabs */}
        <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
          <button className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => setSelectedCultureCategory('thailand')}
            className={`font-light transition-colors ${selectedCultureCategory === 'thailand' ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-400'}`}
          >
            Thailand
          </button>
          <button 
            onClick={() => setSelectedCultureCategory('vietnam')}
            className={`font-light transition-colors ${selectedCultureCategory === 'vietnam' ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
          >
            Vietnam
          </button>
          <button 
            onClick={() => setSelectedCultureCategory('singapore')}
            className={`font-light transition-colors ${selectedCultureCategory === 'singapore' ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
          >
            Singapore
          </button>
          <button 
            onClick={() => setSelectedCultureCategory('indonesia')}
            className={`font-light transition-colors ${selectedCultureCategory === 'indonesia' ? 'text-cyan-400' : 'text-slate-400 hover:text-cyan-400'}`}
          >
            Indonesia
          </button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Conditional Content: Show detail view or grid */}
        {selectedCultureCategory ? (
          // Detail View Modal
          <div className="w-full px-12 py-12">
            {/* Back Button */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setSelectedCultureCategory(null)}
                className="text-slate-400 hover:text-cyan-400 transition-colors text-base font-light"
              >
                Back
              </button>
              <span className="text-slate-400">|</span>
              <h2 className="text-slate-200 text-base font-light">
                {cultureCategories.find(cat => cat.id === selectedCultureCategory)?.name || selectedCultureCategory}
              </h2>
            </div>

            {/* Image Grid - 5 images only */}
            <div className="grid grid-cols-3 gap-[4.5rem]">
              {cultureCategoryImages[selectedCultureCategory]?.slice(0, 5).map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => console.log('Image clicked:', image.title)}
                  className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group cursor-pointer text-left"
                >
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                    <p className="text-white text-base font-light">{image.title}</p>
                  </div>
                </button>
              ))}

              {/* Load More - spans the third column */}
              <button 
                onClick={() => console.log('Load More clicked')}
                className="flex items-center justify-center cursor-pointer"
              >
                <span className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-sm">
                  Load More
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Showcase Grid - 3 columns
          <div className="w-full px-12 py-12">
            <div className="grid grid-cols-3 gap-[4.5rem]">
              {/* Culture showcase cards placeholder */}
            </div>
          </div>
        )}
      </section>

      {/* Mythic Section */}
      <section className="w-full border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-80 overflow-hidden">
          <Image
            src={mythicBannerUrl}
            alt="Mythic"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-6xl font-light text-slate-100 leading-tight">
                Mythic
              </h2>
              <p className="text-slate-200 text-base leading-relaxed max-w-md">
                The Mythical Universe series transforms <span className="text-cyan-400">symbolic and dreamlike cosmology</span> into immersive dome experiences. Pure atmosphere and emotional immersion.
              </p>
            </div>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
          <button className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light">Asian</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Mesoamerican</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Greek</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Egyptian</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Showcase Grid - 3 columns */}
        <div className="w-full px-12 py-12">
          <div className="grid grid-cols-3 gap-[4.5rem]">
            {mythicImages.slice(0, 5).map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={mythicLabels[idx]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                  <p className="text-white text-base font-light">{mythicLabels[idx]}</p>
                </div>
              </div>
            ))}

            {/* Load More - spans the third column */}
            <div className="flex items-center justify-center">
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Art Environments Section */}
      <section className="w-full border-b border-slate-700">
        {/* Full-width Banner with Overlay Text */}
        <div className="relative w-full h-80 overflow-hidden">
          <Image
            src={artBannerUrl}
            alt="Art"
            fill
            className="object-cover"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-6xl font-light text-slate-100 leading-tight">
                Art
              </h2>
              <p className="text-slate-200 text-base leading-relaxed max-w-md">
                Performance-Ready Visual Architecture. Bold, cinematic <span className="text-cyan-400">dome worlds</span> created for live performance and immersive stages.
              </p>
            </div>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="relative w-full flex items-center gap-8 px-12 py-8 border-b border-slate-700">
          <button className="text-slate-400 hover:text-cyan-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button className="text-slate-300 hover:text-cyan-400 transition-colors font-light">Architecture</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Landscapes</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Geometry</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Cosmic</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors font-light">Abstract</button>
          <button className="text-slate-400 hover:text-cyan-400 transition-colors ml-auto">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Showcase Grid - 3 columns */}
        <div className="w-full px-12 py-12">
          <div className="grid grid-cols-3 gap-[4.5rem]">
            {artImages.slice(0, 5).map((url, idx) => (
              <div key={idx} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-800 group">
                <Image
                  src={url}
                  alt={artLabels[idx]}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                  <p className="text-white text-base font-light">{artLabels[idx]}</p>
                </div>
              </div>
            ))}

            {/* Load More - spans the third column */}
            <div className="flex items-center justify-center">
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-light text-sm">
                Load More
              </button>
            </div>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  )
}
