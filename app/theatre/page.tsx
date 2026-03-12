'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/contexts/language-context'

// Category cards data
const CATEGORIES = [
  {
    id: 'nature',
    title: 'Nature',
    description: 'Immersive scenic landscapes, forests, oceans, mountains, and planetary environments.',
    color: 'from-emerald-900/40'
  },
  {
    id: 'mythic',
    title: 'Mythic',
    description: 'Otherworldly dimensions drawn from mythology and speculative imagination.',
    color: 'from-purple-900/40'
  },
  {
    id: 'culture',
    title: 'Culture',
    description: 'Historical architecture, cities and cultural landscapes across civilizations.',
    color: 'from-amber-900/40'
  },
  {
    id: 'art',
    title: 'Art',
    description: 'Curated art galleries, surreal geometry, light and sacred structures.',
    color: 'from-rose-900/40'
  }
]

const ACCESS_MODES = [
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'Explore the collection freely. Perfect for casual browsing and discovery of new immersive worlds.',
    icon: '🔍'
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Advanced navigation controls for design professionals seeking reference imagery or inspiration.',
    icon: '⚙️'
  },
  {
    id: 'venue',
    title: 'Venue',
    description: 'Installation mode designed for museums, galleries, and immersive venues.',
    icon: '🎭'
  }
]

export default function TheatrePage() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <main className="min-h-screen w-full bg-black text-white">
      {/* Hero Header */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-32 max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-light mb-4 text-amber-50">Theatre</h1>
        <p className="text-xl md:text-2xl font-light text-gray-400 mb-12">A Curated Gallery of Immersive Worlds</p>
        
        <div className="space-y-6 text-gray-300 max-w-3xl">
          <p className="leading-relaxed">
            The N3urali Theatre presents a collection of visual environments designed to be experienced as living, breathing spaces. Each panoramic image is an equirectangular capture that serves as a world generation process and represents the visual foundation of future immersive productions.
          </p>
          <p className="leading-relaxed">
            The gallery can exist as a visual installation, experiencing spaces such as museums, galleries, and creative studios. Through a series of navigation modes and interactive features, visitors encounter visual environments.
          </p>
          <p className="leading-relaxed">
            The Theatre is organized into four environment domains. Each domain contains curated collections that span part of the N3urali visual universe.
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`group relative p-8 bg-gradient-to-br ${category.color} to-gray-900/20 border border-gray-700 hover:border-gray-500 rounded-lg transition-all duration-300 text-left hover:scale-105 cursor-pointer`}
            >
              <h3 className="text-3xl font-light mb-2 group-hover:text-amber-100 transition-colors">{category.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{category.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Access to the Gallery */}
      <section className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-light mb-4 text-amber-50">Access to the Gallery</h2>
        <p className="text-gray-400 mb-12 max-w-2xl">
          The Theatre architecture can be delivered in several implementations, depending on how the gallery is used.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {ACCESS_MODES.map(mode => (
            <div key={mode.id} className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg hover:border-gray-600 transition-colors">
              <div className="text-4xl mb-4">{mode.icon}</div>
              <h3 className="text-xl font-light mb-3">{mode.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{mode.description}</p>
              <Link href={`#${mode.id}`} className="inline-block mt-6 px-6 py-2 border border-gray-600 hover:border-amber-400 rounded text-sm transition-colors hover:text-amber-100">
                {mode.id === 'discovery' && 'Discovery Portal'}
                {mode.id === 'professional' && 'Professional Tools'}
                {mode.id === 'venue' && 'Venue Access'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Showcases */}
      <section className="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto">
        <div className="bg-gray-800/30 border border-gray-700 p-12 rounded-lg">
          <h2 className="text-3xl font-light mb-4 text-amber-50">Showcases</h2>
          <p className="text-gray-300 leading-relaxed">
            Collections can be presented on large displays, immersive domes, or architectural screens, allowing viewers to explore and analyze the visual environments through interactive viewing modes.
          </p>
          <div className="mt-8 space-y-2 text-gray-400 text-sm">
            <p>• Gallery Mode</p>
            <p>• Sequence Display</p>
            <p>• Collection and Galleries</p>
            <p>• Custom Presentations</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-light mb-12 text-amber-50">Gallery</h2>
        
        {/* Featured Image */}
        <div className="relative w-full h-96 md:h-screen/2 bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden mb-20 border border-gray-700 group">
          <div className="w-full h-full bg-cover bg-center" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1400&q=80)',
            backgroundPosition: 'center'
          }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
            <button className="w-20 h-20 rounded-full border-2 border-cyan-400 hover:border-cyan-300 flex items-center justify-center transition-all hover:scale-125 hover:bg-cyan-400/20 hover:shadow-lg hover:shadow-cyan-400/50">
              <span className="text-cyan-400 text-3xl font-light">GO</span>
            </button>
          </div>
        </div>

        {/* From Image to Environment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h3 className="text-3xl font-light mb-4 text-amber-50">From Image to Environment</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Many of the worlds presented in the Theatre began as static imagery and have been processed through innovative diffusion refinement techniques that evolve the scenes into sophisticated, immersive environments.
            </p>
            <p className="text-gray-400 text-sm">
              The Theatre transforms functioning as both a gallery and a creative laboratory.
            </p>
          </div>
          <div className="h-64 md:h-96 rounded-lg overflow-hidden border border-gray-700">
            <div className="w-full h-full bg-cover bg-center" style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1578321272176-e69f6e9ff59e?w=800&q=80)'
            }} />
          </div>
        </div>

        {/* Studio Collaboration */}
        <div className="bg-gray-900/50 border border-gray-700 p-12 md:p-16 rounded-lg">
          <h3 className="text-3xl font-light mb-6 text-amber-50">Studio Collaboration</h3>
          <p className="text-gray-300 leading-relaxed mb-8">
            Studios collaborates with artists, cultural institutions, and creative partners to transform these environments into curated experiences. Custom visualizations can be developed for specific brands, themes, or environments.
          </p>
          <Link href="#contact" className="inline-block px-8 py-3 border border-gray-600 hover:border-amber-400 rounded text-amber-100 hover:bg-amber-400/10 transition-all">
            Contact Now
          </Link>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="h-20" />
    </main>
  )
}
