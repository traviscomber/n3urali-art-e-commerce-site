"use client"

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Play, Zap, Users, Palette, LayoutGrid } from "lucide-react"
import { useLanguage } from "@/lib/contexts/language-context"
import { Footer } from "@/components/footer"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface FeaturedImage {
  id: string
  title: string
  file_path: string
  original_url: string | null
  upscaled_url: string | null
  price: number
  image_format: string
  thumbnail_small_url?: string
  thumbnail_medium_url?: string
  thumbnail_large_url?: string
  description?: string
}

interface ClientWrapperProps {
  imageOfTheDay: FeaturedImage | null
  collectionImages: FeaturedImage[]
  auctionImages: FeaturedImage[]
  dailyImages: FeaturedImage[]
}

export const ClientWrapper = memo(
  function ClientWrapper({ imageOfTheDay, auctionImages, collectionImages, dailyImages }: ClientWrapperProps) {
    const { t } = useLanguage()
    const isMounted = useRef(true)

    useEffect(() => {
      isMounted.current = true
      return () => {
        isMounted.current = false
      }
    }, [])

    // Core product sections
    const productSections = [
      {
        id: "realities",
        title: "R3alities",
        subtitle: "Cinematic Dome Stories",
        description: "Seamless immersive loops designed for full-dome cinema, festivals, and branded experiences.",
        icon: Play,
        color: "from-cyan-500/20 to-blue-500/20",
        href: "/realities",
      },
      {
        id: "environments",
        title: "Environments",
        subtitle: "Living Immersive Catalog",
        description: "Continuous atmospheric loops optimized for dome perception and flexible integration.",
        icon: LayoutGrid,
        color: "from-emerald-500/20 to-teal-500/20",
        href: "/environments",
      },
      {
        id: "theatre",
        title: "Theatre",
        subtitle: "Full-Dome VR Ready",
        description: "Fisheye environments, seamless editions, and VR-ready productions for immersive venues.",
        icon: Palette,
        color: "from-purple-500/20 to-pink-500/20",
        href: "/theatre",
      },
      {
        id: "studio",
        title: "Studio",
        subtitle: "Custom Productions",
        description: "Full dome environments with AI-enhanced motion design. Custom immersive works on demand.",
        icon: Zap,
        color: "from-orange-500/20 to-red-500/20",
        href: "/studio",
      },
      {
        id: "tools",
        title: "Tools",
        subtitle: "AI-Powered Creation",
        description: "Public and proprietary AI tools built for dome creators. Launch your immersive vision.",
        icon: Users,
        color: "from-indigo-500/20 to-blue-500/20",
        href: "/tools",
      },
    ]

    return (
      <div className="min-h-screen bg-background">
        <main>
          {/* Hero Section - "Full-Dome Worlds Built to Perform" */}
          <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
            {/* Atmospheric background */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-3xl" />
              <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-radial from-emerald-500/5 via-transparent to-transparent blur-3xl" />
            </div>

            <div className="relative container mx-auto px-4 z-10 max-w-6xl">
              <div className="text-center space-y-8">
                {/* Main tagline */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] text-balance text-white">
                    Full-Dome Worlds
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400">
                      Built to Perform
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                    Cinematic dome stories, seamless immersive loops, and VR-ready environments — crafted for dome operators, immersive events, and live performance.
                  </p>
                  <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto">
                    Projection-ready. Dome-correct. Built to impress.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <Link href="/realities">
                    <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      Explore Worlds
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-slate-200 hover:bg-slate-800/50"
                  >
                    Open Theatre Mode
                  </Button>
                </div>

                {/* Key features */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Full-Dome Fisheye
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    Seamless Loops
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                    VR Ready
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Studio Section */}
          <section className="py-24 px-4 bg-gradient-to-b from-slate-900/50 to-background">
            <div className="container mx-auto max-w-6xl">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                    A New Studio.
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      Built on 20+ Years of Experience.
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed">
                    N3uralia360 is a content creation studio combining advanced AI worldbuilding with human art direction and real production tools.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white mb-4">We create:</h3>
                    <ul className="space-y-3 text-slate-300">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Full-dome cinematic stories</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Seamless dome environments & loops</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span>VR-ready immersive worlds</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Educational & cultural series</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Custom immersive productions</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-3">We design for one thing first:</h3>
                      <p className="text-lg text-emerald-300 font-semibold">How it feels inside the dome.</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-300 leading-relaxed">
                        Every project is guided by understanding the immersive experience from the audience's perspective. We don't just create content — we craft presence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Sections Grid */}
          <section className="py-24 px-4 bg-gradient-to-b from-background via-slate-900/30 to-background">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16 space-y-3">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Our Immersive Platform</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Choose Your Experience: From curated content to custom productions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <Link key={section.id} href={section.href}>
                      <Card className="group relative h-full overflow-hidden bg-slate-800/40 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-slate-700/20 cursor-pointer">
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                        <div className="relative p-8 h-full flex flex-col">
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-slate-600/50 transition-colors mb-4">
                            <Icon className="w-6 h-6 text-cyan-400" />
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-1">{section.title}</h3>
                            <p className="text-sm text-cyan-400 font-semibold mb-3">{section.subtitle}</p>
                            <p className="text-slate-300 text-sm leading-relaxed">{section.description}</p>
                          </div>

                          {/* Arrow indicator */}
                          <div className="flex items-center gap-2 mt-6 text-cyan-400 group-hover:translate-x-1 transition-transform">
                            <span className="text-sm font-semibold">Explore</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Featured Content Showcase */}
          {collectionImages && collectionImages.length > 0 && (
            <section className="py-24 px-4 bg-background">
              <div className="container mx-auto max-w-6xl">
                <div className="mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Featured Collections</h2>
                  <p className="text-slate-400 text-lg">Discover our curated immersive experiences</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collectionImages
                    .filter(image => image.upscaled_url || image.original_url || image.file_path)
                    .slice(0, 6)
                    .map((image) => {
                      const imageSrc = image.upscaled_url || image.original_url || image.file_path
                      if (!imageSrc) return null
                      
                      return (
                        <Link key={image.id} href={`/photo/${image.id}`}>
                          <div className="group relative h-64 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                            <Image
                              src={imageSrc}
                              alt={image.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white font-bold text-lg mb-1">{image.title}</h3>
                              <p className="text-cyan-300 text-sm">{image.image_format}</p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                </div>

                <div className="text-center mt-12">
                  <Link href="/gallery">
                    <Button
                      size="lg"
                      className="bg-slate-700 hover:bg-slate-600 text-white border-0"
                    >
                      View All Collections
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* CTA Section - Request Special Offer */}
          <section className="py-24 px-4 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-background">
            <div className="container mx-auto max-w-4xl">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Need Custom Immersive Content?</h2>
                <p className="text-slate-300 text-lg">
                  Work with our studio for bespoke dome environments, VR experiences, and seamless loop productions.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Request Special Offer
                  </Button>
                  <Link href="/studio">
                    <Button size="lg" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800/50">
                      Learn About Studio
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    )
  }
)
