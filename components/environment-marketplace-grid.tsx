'use client'

import Link from 'next/link'
import Image from 'next/image'
import { environmentProducts, EnvironmentProduct } from '@/lib/constants/marketplace-products'
import { ChevronRight } from 'lucide-react'

interface EnvironmentMarketplaceGridProps {
  category?: string
}

export function EnvironmentMarketplaceGrid({ category }: EnvironmentMarketplaceGridProps) {
  const products = category
    ? environmentProducts.filter((p) => p.category === category)
    : environmentProducts

  return (
    <section className="w-full bg-black py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface ProductCardProps {
  product: EnvironmentProduct
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={product.link}>
      <div className="group relative rounded-lg overflow-hidden bg-slate-900 border border-slate-700/40 hover:border-slate-600 transition-all duration-300 cursor-pointer hover:shadow-2xl">
        {/* Product Image */}
        <div className="relative w-full h-56 overflow-hidden bg-slate-800">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Details */}
        <div className="p-6 space-y-4">
          {/* Category Badge */}
          <div className="inline-flex items-center">
            <span className="text-xs font-light tracking-widest uppercase text-cyan-400">
              {product.category}
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-light text-white group-hover:text-cyan-400 transition-colors mb-2">
              {product.title}
            </h3>
            <p className="text-sm text-slate-400 font-light line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Specs */}
          <div className="space-y-1 text-xs text-slate-500 font-light">
            <div>Resolution: {product.resolution}</div>
            <div>Format: {product.format}</div>
            <div>Duration: {product.duration}</div>
          </div>

          {/* Footer - Price and CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/40">
            <span className="text-lg font-light text-white">
              {product.price}
            </span>
            <div className="inline-flex items-center gap-2 text-cyan-400 group-hover:gap-3 transition-all">
              <span className="text-sm font-light">Preview</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
