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
          {/* Hero Section - "Endless Immersive Backdrops" */}
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
                    Endless Immersive
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400">
                      Backdrops
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
                    Full-dome cinema, VR environments, and seamless performance loops. Crafted for immersive venues,
                    festivals, and branded experiences.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <Link href="/realities">
                    <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      Explore R3alities
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-slate-200 hover:bg-slate-800/50"
                  >
                    Get Those Loops!
                  </Button>
                </div>

                {/* Key features */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Full-Dome Ready
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    VR Compatible
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                    Seamless Loops
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
                  {collectionImages.slice(0, 6).map((image) => (
                    <Link key={image.id} href={`/photo/${image.id}`}>
                      <div className="group relative h-64 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                        <Image
                          src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
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
                  ))}
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

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-bold">{t("comparison.ourPro2")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Equirectangular for VR, Dome for planetariums - all formats included.
                    </p>
                  </Card>

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-bold">{t("comparison.ourPro3")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Professional 4K+ resolution perfect for any project scale.
                    </p>
                  </Card>

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-bold">{t("comparison.ourPro4")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Curated collections designed by professionals, not random AI outputs.
                    </p>
                  </Card>

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">✓</span>
                    </div>
                    <h3 className="text-lg font-bold">{t("comparison.ourPro5")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Use in games, films, VR experiences - full commercial rights included.
                    </p>
                  </Card>

                  <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 bg-card">
                    <div className="w-12 h-12 bg-primary/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="text-lg font-bold">Instant Download</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      No waiting, no processing. Download and use immediately in your workflow.
                    </p>
                  </Card>
                </div>

                <div className="mt-8 p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-2xl border-2 border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{t("comparison.legalTitle")}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{t("comparison.legalDesc")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Image
                src="/placeholder.svg?height=600&width=1920"
                alt="Immersive 360° Experience"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-32 text-center">
              <div className="max-w-4xl mx-auto space-y-8">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] text-balance leading-tight">
                  Elevate Your
                  <span className="text-primary block mt-2">Creative Projects</span>
                </h2>

                <p className="text-xl md:text-2xl text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] max-w-2xl mx-auto text-pretty font-medium">
                  Transform your vision with premium 360° panoramic environments. Ready to use, commercially licensed,
                  instantly downloadable.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
                  <Link href="/collection">
                    <Button
                      size="lg"
                      className="text-xl md:text-2xl px-10 md:px-14 py-8 md:py-10 h-auto font-black shadow-2xl shadow-primary/70 hover:shadow-[0_0_80px_rgba(139,92,246,0.9)] transition-all duration-500 hover:scale-110 bg-primary hover:bg-primary/90"
                    >
                      Browse Collections
                      <ArrowRight className="w-7 h-7 ml-2" />
                    </Button>
                  </Link>

                  <Link href="/gallery">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-xl md:text-2xl px-10 md:px-14 py-8 md:py-10 h-auto font-black shadow-2xl bg-white/10 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white/20 hover:border-white transition-all duration-500 hover:scale-110"
                    >
                      Explore Gallery
                      <ArrowRight className="w-7 h-7 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 pt-12">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      132+
                    </div>
                    <div className="text-sm md:text-base text-white/90 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] mt-1">
                      Premium Assets
                    </div>
                  </div>

                  <div className="w-px h-12 bg-white/30" />

                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      4K+
                    </div>
                    <div className="text-sm md:text-base text-white/90 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] mt-1">
                      Resolution
                    </div>
                  </div>

                  <div className="w-px h-12 bg-white/30" />

                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      100%
                    </div>
                    <div className="text-sm md:text-base text-white/90 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] mt-1">
                      Commercial Use
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />
          </section> */}

          <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
            <div className="absolute inset-0 z-0">
              {imageOfTheDay ? (
                <>
                  <Image
                    src={
                      imageOfTheDay.upscaled_url ||
                      imageOfTheDay.original_url ||
                      imageOfTheDay.file_path ||
                      "/placeholder.svg?height=1080&width=1920&query=immersive 360 panoramic futuristic landscape" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                     || "/placeholder.svg"}
                    alt="Premium 360° Assets Background"
                    fill
                    className="object-cover opacity-40 animate-kenBurnsAuction"
                    sizes="100vw"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-pulse" />
            </div>

            <div className="relative container mx-auto px-4 py-24 z-10">
              <div className="max-w-5xl mx-auto text-center space-y-12">
                <div className="inline-flex items-center gap-2.5 bg-primary/30 border-2 border-primary/50 rounded-full px-8 py-4 backdrop-blur-lg shadow-2xl">
                  <Grid3x3 className="w-6 h-6 text-primary" />
                  <span className="text-base font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {t("cta.startExploring")}
                  </span>
                </div>

                <ParticleTitle className="min-h-[250px] flex items-center justify-center">
                  <h2 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight text-balance leading-[1.1]">
                    <span className="text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                      {t("cta.readyToTransform")}
                    </span>
                    <br />
                    <span className="text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">{t("cta.creativeVision")}</span>
                  </h2>
                </ParticleTitle>

                <p className="text-xl md:text-2xl lg:text-3xl text-white max-w-3xl mx-auto leading-relaxed text-pretty drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] font-medium">
                  {t("cta.joinThousands")}
                </p>

                <div className="pt-10 flex flex-wrap items-center justify-center gap-6">
                  <Link href="/collection">
                    <Button
                      size="lg"
                      className="text-2xl md:text-3xl px-12 md:px-16 py-10 md:py-12 h-auto font-black shadow-2xl shadow-primary/60 hover:shadow-[0_0_80px_rgba(139,92,246,0.8)] transition-all duration-500 hover:scale-110 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {t("collection.title").split(" ")[0]} {/* "Imagenes" or "Featured" */}
                        <ArrowRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-3 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                  </Link>

                  <Link href="/gallery">
                    <Button
                      size="lg"
                      className="text-2xl md:text-3xl px-12 md:px-16 py-10 md:py-12 h-auto font-black shadow-2xl shadow-primary/60 hover:shadow-[0_0_80px_rgba(139,92,246,0.8)] transition-all duration-500 hover:scale-110 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Gallery
                        <ArrowRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-3 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                  </Link>

                  <Link href="/collection/theatre">
                    <Button
                      size="lg"
                      className="text-2xl md:text-3xl px-12 md:px-16 py-10 md:py-12 h-auto font-black shadow-2xl shadow-primary/60 hover:shadow-[0_0_80px_rgba(139,92,246,0.8)] transition-all duration-500 hover:scale-110 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Theatre
                        <ArrowRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-3 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-10 text-base md:text-lg">
                  {/* <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  <span className="font-bold text-white">132+ {t("gallery.stats.assets")}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  <span className="font-bold text-white">{t("stats.instantNote")}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  <span className="font-bold text-white">{t("comparison.ourPro5").split(" ").slice(0, 2).join(" ")}</span>
                </div> */}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent z-[5]" />
          </section>
        </main>

        <Footer />
      </div>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.imageOfTheDay?.id === nextProps.imageOfTheDay?.id &&
      prevProps.collectionImages?.length === nextProps.collectionImages?.length &&
      prevProps.auctionImages?.length === nextProps.auctionImages?.length &&
      prevProps.dailyImages?.length === nextProps.dailyImages?.length
    )
  },
)
