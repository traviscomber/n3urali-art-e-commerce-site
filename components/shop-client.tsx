'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EnvironmentMarketplaceGrid } from '@/components/environment-marketplace-grid'
import { environmentProducts } from '@/lib/constants/marketplace-products'

export function ShopClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured')

  const categories = [
    { id: 'all', label: 'All Environments', color: 'text-white' },
    { id: 'elemental', label: 'Nature', color: 'text-cyan-400' },
    { id: 'culture', label: 'Culture', color: 'text-yellow-400' },
    { id: 'mythic', label: 'Mythic', color: 'text-purple-400' },
    { id: 'abstract', label: 'Art', color: 'text-orange-400' },
  ]

  const filteredProducts = selectedCategory === 'all'
    ? environmentProducts
    : environmentProducts.filter(product => product.category === selectedCategory)

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'newest':
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      case 'featured':
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    }
  })

  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-light text-white mb-4 tracking-tight">
            Shop
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light mb-8">
            Premium immersive environments for dome theaters, planetariums, and immersive displays
          </p>
          <p className="text-sm md:text-base text-slate-500 font-light max-w-2xl mx-auto">
            High-resolution, projection-ready content crafted for professional installations. Browse our collection of curated environments across Nature, Culture, Mythic, and Art categories.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="w-full py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60 bg-black/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-slate-400 text-sm font-light">Category:</span>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 text-sm font-light border rounded transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? `border-slate-400 ${cat.color} bg-slate-800/50`
                      : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort Filter */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-slate-400 text-sm font-light">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 text-sm font-light bg-slate-900/50 border border-slate-700/50 text-slate-300 rounded cursor-pointer hover:border-slate-600 transition-colors"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* Results Count */}
              <span className="text-slate-500 text-sm font-light ml-auto">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {sortedProducts.length > 0 ? (
            <EnvironmentMarketplaceGrid products={sortedProducts} />
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg font-light mb-4">No products found in this category</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-6 py-2 text-sm font-light border border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors rounded"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-700/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-xl font-light text-white mb-3">Professional Quality</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                All environments are professionally rendered and optimized for dome projection with full 4K resolution support.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-light text-white mb-3">Instant Delivery</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                Download immediately after purchase. No delays, no waiting. Get your content ready to deploy.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-light text-white mb-3">Full Support</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                Technical support included. We help ensure seamless integration with your dome theater systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-700/60 bg-slate-900/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">Need Custom Content?</h2>
          <p className="text-slate-400 text-lg font-light mb-8 max-w-2xl mx-auto">
            We create bespoke immersive environments tailored to your specific needs and venue requirements.
          </p>
          <Link href="/contact" className="inline-block px-8 py-3 border border-cyan-400/50 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/10 transition-all rounded font-light">
            Contact Our Team
          </Link>
        </div>
      </section>
    </>
  )
}
