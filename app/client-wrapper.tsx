"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, HelpCircle, Sparkles, Grid3x3, User } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import LandingGalleryTabs from "@/components/landing-gallery-tabs"
import AuctionCarousel from "@/components/auction-carousel"
import { useLanguage } from "@/lib/contexts/language-context"
import { useState, useEffect } from "react"
import { ParticleTitle } from "@/components/particle-title"

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
}

interface ClientWrapperProps {
  imageOfTheDay: FeaturedImage | null
  collectionImages: FeaturedImage[]
  auctionImages: FeaturedImage[]
  dailyImages: FeaturedImage[]
}

export function ClientWrapper({ imageOfTheDay, collectionImages, auctionImages, dailyImages }: ClientWrapperProps) {
  const { t } = useLanguage()
  const [auctionTimeLeft, setAuctionTimeLeft] = useState({ minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const secondsLeft = 59 - now.getSeconds()
      return { minutes: 0, seconds: secondsLeft }
    }

    setAuctionTimeLeft(calculateTimeLeft())
    const interval = setInterval(() => {
      setAuctionTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  console.log('[v0] ClientWrapper rendering, imageOfTheDay exists:', !!imageOfTheDay)
  console.log('[v0] Translation key test - cta.readyToTransform:', t("cta.readyToTransform"))

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          >
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WebBackdrop360-ZzzGJhNrvLJpQ71ipTgLfyRV3xYdB4.mov" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] z-[1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        </div>

        <div className="relative container mx-auto px-4 py-20 z-10">
          <div className="max-w-7xl mx-auto">
            {/* Hero content */}
            <div className="text-center space-y-10 mb-20">
              {/* Subtle badge */}
              <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-5 py-2.5 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t("hero.badge")}</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-[0.95] text-balance text-white drop-shadow-2xl">
                {t("hero.title")}
                <br />
                <span className="text-primary drop-shadow-[0_0_40px_rgba(139,92,246,0.8)]">{t("hero.titleHighlight")}</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed text-pretty font-light drop-shadow-lg">
                {t("hero.subtitle")}
                <span className="block mt-2 text-lg text-white/80">
                  {t("hero.description")}
                </span>
              </p>

              {/* 
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link href="/gallery">
                  <Button size="lg" className="text-lg px-10 py-7 h-auto shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                    {t("hero.cta.explore")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#use-cases">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 h-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 hover:border-white/40">
                    {t("hero.cta.demo")}
                  </Button>
                </Link>
              </div>
              */}

              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-white/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="font-medium">{t("comparison.ourPro5").split(" ")[0]} {t("comparison.ourPro5").split(" ")[1]}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="font-medium">{t("gallery.stats.resolution")} {t("stats.resolutionNote")}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="font-medium">{t("stats.instantNote")}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="font-medium">{t("stats.vrNote")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2 text-white/60 animate-bounce">
            <div className="w-6 h-10 border-2 border-current rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-current rounded-full animate-scroll" />
            </div>
          </div>
        </div>
      </section>
      {/* End of refined hero section */}

      {imageOfTheDay && (
        <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

          <div className="relative container mx-auto px-4">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-6">
                <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-4 py-2">
                  {t("hero.imageOfDay")}
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                  {t("hero.title")} <span className="text-primary">{t("hero.titleHighlight")}</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                  {t("hero.subtitle")}
                </p>
              </div>

              <div className="relative group">
                <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                  <Image
                    src={
                      imageOfTheDay.upscaled_url ||
                      imageOfTheDay.original_url ||
                      imageOfTheDay.file_path ||
                      "/placeholder.svg"
                     || "/placeholder.svg"}
                    alt={imageOfTheDay.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1400px) 100vw, 1400px"
                    priority
                  />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white/20 text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider transform -rotate-12 select-none">
                      n3uralia360.art
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                      <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold">{imageOfTheDay.title}</h2>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                            {imageOfTheDay.image_format}
                          </Badge>
                          <span className="text-white/80">{t("stats.resolutionNote")}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black font-bold text-lg px-4 py-2 border-0 animate-pulse">
                          20{t("hero.offToday")}
                        </Badge>
                        <Link href={`/photo/${imageOfTheDay.id}`}>
                          <Button size="lg" className="bg-primary hover:bg-primary/90 w-full mt-2">
                            {t("hero.viewDetails")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* End of change */}
                </div>

                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
            </div>
          </div>
        </section>
      )}

      {collectionImages && collectionImages.length > 0 && (
        <section className="py-16 bg-background overflow-hidden">
          <div className="container mx-auto px-4 mb-8">
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {t("collection.badge")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">
                {t("collection.title")} <span className="text-primary">{t("collection.titleHighlight")}</span>
              </h2>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="flex gap-6 animate-infinite-scroll hover:pause-animation">
              {collectionImages.map((image) => (
                <Link
                  key={`first-${image.id}`}
                  href={`/photo/${image.id}`}
                  className="group flex-shrink-0 w-[500px] h-80 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Image
                    src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="500px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{image.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        {image.image_format}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black text-xs font-bold border-0">
                        15{t("collection.off")}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}

              {collectionImages.map((image) => (
                <Link
                  key={`second-${image.id}`}
                  href={`/photo/${image.id}`}
                  className="group flex-shrink-0 w-[500px] h-80 relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Image
                    src={image.upscaled_url || image.original_url || image.file_path || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="500px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{image.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        {image.image_format}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-yellow-400/40 to-orange-500/40 text-black text-xs font-bold border-0">
                        15{t("collection.off")}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/collection">
              <Button size="lg" variant="outline" className="group bg-transparent">
                {t("collection.viewComplete")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {auctionImages && auctionImages.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-yellow-500/5 pointer-events-none" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-5xl mx-auto">
              <div className="text-center space-y-8 mb-16">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    {t("auction.title")} <span className="text-primary">{t("auction.titleHighlight")}</span>
                  </h2>

                  <div className="flex justify-center mt-8">
                    <div className="text-center">
                      <div
                        className="text-6xl md:text-7xl lg:text-8xl font-thin tabular-nums"
                        style={{ color: "#392A48" }}
                      >
                        {auctionTimeLeft.seconds.toString().padStart(2, "0")}
                      </div>
                      <div
                        className="text-xs md:text-sm uppercase tracking-widest font-light mt-2"
                        style={{ color: "#392A48" }}
                      >
                        {t("seconds")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-3">
                        {t("untilPricesReset")}
                      </div>
                    </div>
                  </div>

                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
                    {t("auction.subtitle")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <AuctionCarousel images={auctionImages} />
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground bg-muted/50 inline-block px-6 py-3 rounded-full backdrop-blur-sm border border-border/50">
              {t("auction.tip")}
            </p>
          </div>
        </section>
      )}

      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {imageOfTheDay ? (
            <>
              <Image
                src={
                  imageOfTheDay.upscaled_url ||
                  imageOfTheDay.original_url ||
                  imageOfTheDay.file_path ||
                  "/placeholder.svg?height=1080&width=1920&query=immersive 360 panoramic futuristic landscape"
                 || "/placeholder.svg"}
                alt="Explore Gallery Background"
                fill
                className="object-cover opacity-40"
                sizes="100vw"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          )}
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-24 z-10">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-primary/30 border-2 border-primary/50 rounded-full px-8 py-4 backdrop-blur-lg shadow-2xl">
              <Grid3x3 className="w-6 h-6 text-primary" />
              <span className="text-base font-bold text-white">Ready to Create?</span>
            </div>

            <ParticleTitle className="min-h-[250px] flex items-center justify-center">
              <h2 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight text-white drop-shadow-2xl text-balance leading-[1.1]">
                Ready to Transform
                <br />
                <span className="text-primary drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                  Your Creative Vision?
                </span>
              </h2>
            </ParticleTitle>

            {/* Description */}
            <p className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed text-pretty drop-shadow-xl font-medium">
              Join thousands of creators who trust n3uralia360.art for their immersive projects
            </p>

            {/* MASSIVE CTA Button */}
            <div className="pt-10">
              <Link href="/gallery">
                <Button 
                  size="lg" 
                  className="text-3xl md:text-4xl px-20 md:px-28 py-12 md:py-16 h-auto font-black shadow-2xl shadow-primary/60 hover:shadow-[0_0_80px_rgba(139,92,246,0.8)] transition-all duration-500 hover:scale-110 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    Explore Gallery Now
                    <ArrowRight className="w-10 h-10 md:w-12 md:h-12 group-hover:translate-x-3 transition-transform duration-300" />
                  </span>
                  
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
              </Link>
            </div>

            {/* Stats/Features with better visibility */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-10 text-base md:text-lg">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                <span className="font-bold text-white">132+ Premium Assets</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                <span className="font-bold text-white">Instant Download</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                <span className="font-bold text-white">Commercial License</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent z-[5]" />
      </section>
      {/* End of enhanced CTA section */}

      <section id="use-cases" className="py-24 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="secondary" className="mb-2">
                {t("useCases.badge")}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-balance">
                {t("useCases.title")}
                <span className="text-primary block mt-1">{t("useCases.titleHighlight")}</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
                {t("useCases.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎮</span>
                </div>
                <h3 className="text-xl font-semibold">{t("useCases.gameDev")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("useCases.gameDevDesc")}
                </p>
              </Card>

              <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎬</span>
                </div>
                <h3 className="text-xl font-semibold">{t("useCases.virtualProd")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("useCases.virtualProdDesc")}
                </p>
              </Card>

              <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏗️</span>
                </div>
                <h3 className="text-xl font-semibold">{t("useCases.archViz")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("useCases.archVizDesc")}
                </p>
              </Card>

              <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="text-xl font-semibold">{t("useCases.metaverse")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("useCases.metaverseDesc")}
                </p>
              </Card>

              <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold">{t("useCases.digitalArt")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("useCases.digitalArtDesc")}
                </p>
              </Card>

              <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="text-xl font-semibold">{t("useCases.education")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("useCases.educationDesc")}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="default" className="mb-2">
                {t("comparison.ourPlatform")}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-balance">
                {t("comparison.title")}
                <span className="text-primary block mt-1">{t("comparison.titleHighlight")}</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 space-y-6 border-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl">❌</span>
                    </div>
                    <h3 className="text-xl font-bold">{t("comparison.genTools")}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground italic">{t("comparison.genToolsNote")}</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{t("comparison.genToolCon1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{t("comparison.genToolCon2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{t("comparison.genToolCon3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{t("comparison.genToolCon4")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{t("comparison.genToolCon5")}</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 space-y-6 border-2 border-primary/50 bg-primary/5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-xl">✓</span>
                    </div>
                    <h3 className="text-xl font-bold">{t("comparison.ourPlatform")}</h3>
                  </div>
                  <p className="text-sm text-primary font-medium">{t("comparison.ourPlatformNote")}</p>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="font-medium">{t("comparison.ourPro1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="font-medium">{t("comparison.ourPro2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="font-medium">{t("comparison.ourPro3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="font-medium">{t("comparison.ourPro4")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="font-medium">{t("comparison.ourPro5")}</span>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🛡️</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{t("comparison.legalTitle")}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t("comparison.legalDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
